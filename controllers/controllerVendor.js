var VendorColRef = require("../models/ModelVendor");
var { getCloudinaryObject } = require("../config/configCloud");
let cloudinary = getCloudinaryObject();
var path = require("path");

async function doSaveVendorDeatils(req, resp) {
    try {
        let ShopPic = "No_Pic.jpg";
        let CertificatePic = "No_Pic.jpg";

        if (req.files) {
            if (req.files.shoppic) {
                let fileNameofShop = req.files.shoppic.name;
                let fullPathofShop = path.join(__dirname, "..", "uploads", fileNameofShop);
                await req.files.shoppic.mv(fullPathofShop);

                const result1 = await cloudinary.uploader.upload(fullPathofShop);
                ShopPic = result1.secure_url || result1.url;
            }

            if (req.files.certpic) {
                let fileNameofCert = req.files.certpic.name;
                let fullPathofCert = path.join(__dirname, "..", "uploads", fileNameofCert);
                await req.files.certpic.mv(fullPathofCert);

                const result2 = await cloudinary.uploader.upload(fullPathofCert);
                CertificatePic = result2.secure_url || result2.url;
            }
        }

        req.body.shoppicurl = ShopPic;
        req.body.certpicurl = CertificatePic;

        let doc = new VendorColRef(req.body);

        doc.save()
            .then((res) => resp.json({ status: true, msg: "Vendor Registered Successfully in Evenue!" }))
            .catch((err) => resp.json({ status: false, msg: err.message }));

    } catch (err) {
        console.log(err);
        resp.json({ status: false, msg: err.message });
    }
}

function doFetchVendor(req, resp) {
    let eid = req.body.emailid || req.query.emailid;
    
    if (!eid) {
        return resp.json({ status: false, msg: "Email ID is required for fetching." });
    }

    VendorColRef.findOne({ emailid: eid.trim() }).then((result) => {
        if (result != null) {
            resp.json({ status: true, msg: result });
        } else {
            resp.json({ status: false, msg: "Invalid EmailId" });
        }
    }).catch((err) => {
        resp.json({ status: false, msg: err.message });
    });
}

async function doUpdateVendorDetails(req, resp) {
    try {
        let updateData = { ...req.body };

        if (req.files) {
            if (req.files.shoppic) {
                let fileNameofShop = req.files.shoppic.name;
                let fullPathofShop = path.join(__dirname, "..", "uploads", fileNameofShop);
                await req.files.shoppic.mv(fullPathofShop);

                const result1 = await cloudinary.uploader.upload(fullPathofShop);
                updateData.shoppicurl = result1.secure_url || result1.url;
            }

            if (req.files.certpic) {
                let fileNameofCert = req.files.certpic.name;
                let fullPathofCert = path.join(__dirname, "..", "uploads", fileNameofCert);
                await req.files.certpic.mv(fullPathofCert);

                const result2 = await cloudinary.uploader.upload(fullPathofCert);
                updateData.certpicurl = result2.secure_url || result2.url;
            }
        }

        VendorColRef.updateOne({ emailid: updateData.emailid }, { $set: updateData })
            .then((res) => resp.json({ status: true, msg: "Vendor Updated Successfully in Evenue!" }))
            .catch((err) => resp.json({ status: false, msg: err.message }));

    } catch (err) {
        console.log(err);
        resp.json({ status: false, msg: err.message });
    }
}

module.exports = { doSaveVendorDeatils, doFetchVendor, doUpdateVendorDetails };