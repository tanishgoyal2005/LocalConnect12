var mongoose=require("mongoose");                    
let colDesign = {
    emailid: { type: String, required: true, index: true, unique: true },
    name: String,
    contact: String,
    business: String,
    area: String,
    address: String,
    city: String,
    estd: String,
    selcate: String,
    website: String,
    insta: String,
    shoppicurl: String,
    certpicurl: String,

     ratingCount: {
        type: Number,
        default: 0
    },

    overallRating: {
        type: Number,
        default: 0
    }
    
}
var ver = {
    versionKey: false, // to avoid __v field in table come by default
};
let ScheemaClass = mongoose.Schema;
let collectionObj = new ScheemaClass(colDesign, ver);
let VendorColRef = mongoose.model("Vendor", collectionObj);
module.exports=VendorColRef;


