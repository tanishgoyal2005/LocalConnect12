var mongoose=require("mongoose")
                   
let colDesign = {
    citizenEmail: { type: String, required: true, index: true, unique: true },
    vendorEmails: [String]
}
var ver = {
    versionKey: false, // to avoid __v field in table come by default
};
let ScheemaClass = mongoose.Schema; //schema is a class
let collectionObj = new ScheemaClass(colDesign, ver);  //instanation of SchemaClass

let FavsColRef = mongoose.model("Favrs", collectionObj);
 module.exports=FavsColRef;