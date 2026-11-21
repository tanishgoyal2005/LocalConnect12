var express=require("express");
var {doExtractCitizenAdhar,doSaveCitizenDetails,doFetchCitizen,doUpdateCitizenDetails}=require("../controllers/controllerCitizen");
var {validateToken}=require("../config/jwtValidater");
let app=express.Router();

// app.post("/citizenSave",doSaveCitizenDetails);
app.post("/citizenExtAdhar",validateToken,doExtractCitizenAdhar);
app.post("/citizenSave",validateToken,doSaveCitizenDetails);
app.post("/citizenFetch",validateToken,doFetchCitizen);
app.post("/citizenUpdate",validateToken,doUpdateCitizenDetails);

module.exports=app;
