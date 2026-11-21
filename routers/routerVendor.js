var express=require("express");
var {doSaveVendorDeatils,doFetchVendor,doUpdateVendorDetails}=require("../controllers/controllerVendor");
var {validateToken}=require("../config/jwtValidater");
let app=express.Router();

app.post("/vendorSave",validateToken,doSaveVendorDeatils);
app.post("/vendorFetch",validateToken,doFetchVendor);
app.post("/vendorUpdate",validateToken,doUpdateVendorDetails);


module.exports=app;
