var mongoose=require("mongoose");                    
let colDesign = {
    event: { type: String, required: true, index: true, unique: true },
    services: {
        type: [String],
        required: true
    }
}
var ver = {
    versionKey: false, // to avoid __v field in table come by default
};
let ScheemaClass = mongoose.Schema;
let collectionObj = new ScheemaClass(colDesign, ver);
let EventColRef = mongoose.model("event_services", collectionObj);
module.exports=EventColRef;
