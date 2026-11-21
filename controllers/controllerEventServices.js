var EventColRef = require("../models/ModelEventServices");
var VendorColRef = require("../models/ModelVendor");
var FavsColRef=require("../models/ModelFavs");
function doGiveServices(req, resp) {
      let events = req.body.eventOptions;

    if (!events) {
        return resp.json({ status: false, msg: "Event name is required" });
    }

    EventColRef.findOne({ event: events })
        .then((result) => {
            if (result != null) {
                // IMPORTANT: Poora result bhejne ke bajaye sirf result.services bhejein
                resp.json({ status: true, msg: result.services });
            } else {
                resp.json({ status: false, msg: "Invalid Event" });
            }
        })
        .catch((err) => {
            resp.json({ status: false, msg: err.message });
        });
}

function doFetchCities(req, resp) {
    // Unique cities find karega
    VendorColRef.distinct("city")
        .then((cities) => {
            if (cities && cities.length > 0) {
                resp.json({ status: true, msg: cities });
            } else {
                resp.json({ status: false, msg: "No cities found" });
            }
        })
        .catch((err) => {
            resp.json({ status: false, msg: err.message });
        });
}

function doGiveVendorDetails(req, resp) {
    const { city, services } = req.body || {};

    if (!city || !services || (Array.isArray(services) && services.length === 0)) {
        return resp.json({ status: false, msg: "City and Services are required" });
    }

    const servicesList = Array.isArray(services) ? services : [services];

    // Regex special characters escape karo (e.g. "DJ (Music)" ya "Tent + Decor")
    const escapeRegex = (str) => str.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchPattern = servicesList.map(escapeRegex).join("|");

    VendorColRef.find({
        city: city,
        selcate: { $regex: searchPattern, $options: "i" },
    })
        .then((result) => {
            resp.json({ status: true, msg: result || [] });
        })
        .catch((err) => {
            resp.json({ status: false, msg: err.message });
        });
}

async function dosaveFavoriteVendor(req, resp) {
    try {
        const { citizenEmail, vendorEmail } = req.body;
        if (!citizenEmail || !vendorEmail) {
            return resp.status(400).json({
                status: false,
                msg: "Both citizenEmail and vendorEmail are required.",
            });
        }
        // Check if the vendor is already saved by this citizen
        const existing = await FavsColRef.findOne({
            citizenEmail: citizenEmail.trim(),
            vendorEmails: vendorEmail.trim(),
        });
        if (existing) {
            // Already exists -> REMOVE IT ($pull)
            await FavsColRef.updateOne(
                { citizenEmail: citizenEmail.trim() },
                { $pull: { vendorEmails: vendorEmail.trim() } }
            );
            return resp.json({
                status: true,
                action: "removed",
                msg: "Vendor removed from favorites successfully.",
            });
        } else {
            // New -> ADD IT ($addToSet)
            await FavsColRef.updateOne(
                { citizenEmail: citizenEmail.trim() },
                { $addToSet: { vendorEmails: vendorEmail.trim() } },
                { upsert: true }
            );
            return resp.json({
                status: true,
                action: "saved",
                msg: "Vendor saved to favorites successfully.",
            });
        }
    } catch (error) {
        console.error("Error in saveFavoriteVendor:", error);
        return resp.status(500).json({
            status: false,
            msg: "Internal server error: " + error.message,
        });
    }
}
// ----------------- 👈 FETCH CITIZEN WISHLIST -----------------
async function dofetchFavoriteVendors(req, resp) {
    try {
        const { citizenEmail } = req.body;
        if (!citizenEmail) {
            return resp.status(400).json({
                status: false,
                msg: "citizenEmail is required",
            });
        }
        const favDoc = await FavsColRef.findOne({ citizenEmail: citizenEmail.trim() });
        return resp.json({
            status: true,
            msg: favDoc ? favDoc.vendorEmails : [],
        });
    } catch (error) {
        console.error("Error in fetchFavoriteVendors:", error);
        return resp.status(500).json({
            status: false,
            msg: "Internal server error: " + error.message,
        });
    }
}

module.exports = { doGiveServices,doFetchCities,doGiveVendorDetails,dosaveFavoriteVendor,dofetchFavoriteVendors };