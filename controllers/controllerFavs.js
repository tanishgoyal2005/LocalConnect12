const FavsColRef = require("../models/ModelFavs");
const VendorColRef = require("../models/ModelVendor");
const RatingColRef = require("../models/ModelRating");

// ----------------------------------------------------
// 1. FETCH CITIZEN WISHLIST (With Saved Stars)
// ----------------------------------------------------
async function dofetchFavoriteVendors(req, resp) {
  try {
    const citizenEmail = req.body.citizenEmail;
    if (!citizenEmail) {
      return resp.json({ status: false, msg: "citizenEmail is required" });
    }

    // 1. Citizen ka wishlist document dhundo
    const favDoc = await FavsColRef.findOne({ citizenEmail: citizenEmail });
    if (!favDoc || !favDoc.vendorEmails || favDoc.vendorEmails.length === 0) {
      return resp.json({ status: true, msg: [] });
    }

    // 2. Wishlist wale saare vendors ka data nikalo
    const vendors = await VendorColRef.find({
      emailid: { $in: favDoc.vendorEmails },
    }).lean(); // .lean() plain JavaScript object deta hai taaki rating jod sakein

    // 3. Database se check karo is citizen ne kis vendor ko kya rating di thi
    const myRatings = await RatingColRef.find({ citizenEmail: citizenEmail });

    // 4. Har vendor ke saath citizen ki di hui rating chipka do
    for (let i = 0; i < vendors.length; i++) {
      let match = myRatings.find((r) => r.vendorEmail === vendors[i].emailid);
      if (match) {
        vendors[i].myGivenRating = match.rating; // e.g. 1, 2, 3, 4, ya 5
      } else {
        vendors[i].myGivenRating = 0; // Abhi tak rating nahi di
      }
    }

    // 5. Frontend ko list bhej do
    return resp.json({ status: true, msg: vendors });
  } catch (error) {
    return resp.json({ status: false, msg: error.message });
  }
}

// ----------------------------------------------------
// 2. REMOVE VENDOR FROM WISHLIST
// ----------------------------------------------------
async function doremoveFavoriteVendor(req, resp) {
  try {
    const citizenEmail = req.body.citizenEmail;
    const vendorEmail = req.body.vendorEmail;

    await FavsColRef.updateOne(
      { citizenEmail: citizenEmail },
      { $pull: { vendorEmails: vendorEmail } }
    );

    return resp.json({ status: true, msg: "Removed successfully" });
  } catch (error) {
    return resp.json({ status: false, msg: error.message });
  }
}

// ----------------------------------------------------
// 3. RATE VENDOR (1 Citizen = 1 Rating, Can edit anytime)
// ----------------------------------------------------
async function dorateVendor(req, resp) {
  try {
    const citizenEmail = req.body.citizenEmail;
    const vendorEmail = req.body.vendorEmail;
    const newRating = Number(req.body.rating);

    // 1. Vendor dhundo database me
    const vendor = await VendorColRef.findOne({ emailid: vendorEmail });
    if (!vendor) {
      return resp.json({ status: false, msg: "Vendor nahi mila!" });
    }

    let count = vendor.ratingCount || 0;
    let overall = vendor.overallRating || 0;

    // 2. Check karo: Kya is citizen ne is vendor ko pehle rating di thi?
    const existingReview = await RatingColRef.findOne({
      citizenEmail: citizenEmail,
      vendorEmail: vendorEmail,
    });

    if (!existingReview) {
      // 🟢 PEHLI BAAR RATING DI (Count 1 badhega):
      count = count + 1;
      overall = (overall * (count - 1) + newRating) / count;

      // Nayi rating database me save karo
      await RatingColRef.create({
        citizenEmail: citizenEmail,
        vendorEmail: vendorEmail,
        rating: newRating,
      });
    } else {
      // 🟡 DUBARA RATING CHANGE KI (Count wahi rahega, purani minus, nayi plus):
      let oldRating = existingReview.rating;
      let totalPoints = overall * count - oldRating + newRating;
      overall = totalPoints / count;

      // Rating database me update karo
      existingReview.rating = newRating;
      await existingReview.save();
    }

    // 1 decimal place me round karo (e.g. 4.3)
    overall = Number(overall.toFixed(1));

    // Vendor table me save karo
    vendor.ratingCount = count;
    vendor.overallRating = overall;
    await vendor.save();

    return resp.json({
      status: true,
      msg: "Rating successfully saved!",
      overallRating: overall,
      ratingCount: count,
    });
  } catch (error) {
    return resp.json({ status: false, msg: error.message });
  }
}

module.exports = {
  dofetchFavoriteVendors,
  doremoveFavoriteVendor,
  dorateVendor,
};