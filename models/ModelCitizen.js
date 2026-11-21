var mongoose=require("mongoose");                    
let colDesign = {
    emailid: { type: String, required: true, index: true, unique: true },
    acardno: String,
    name: String,
    dob: String,
    gender: String,
    address: String,
    city: String,
    contact: String,
}
var ver = {
    versionKey: false, // to avoid __v field in table come by default
};
let ScheemaClass = mongoose.Schema;
let collectionObj = new ScheemaClass(colDesign, ver);
let CitizenColRef = mongoose.model("Citizen", collectionObj);
module.exports=CitizenColRef;
