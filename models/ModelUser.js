var mongoose=require("mongoose");                    
let colDesign = {
    emailid: { type: String, required: true, index: true, unique: true },
    password: String,
    utype: String,
    status: Boolean
   
}
var ver = {
    versionKey: false, // to avoid __v field in table come by default
};
let ScheemaClass = mongoose.Schema;
let collectionObj = new ScheemaClass(colDesign, ver);
let UserColRef = mongoose.model("User", collectionObj);
module.exports=UserColRef;
