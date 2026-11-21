var express=require("express");
var {doGiveServices,doFetchCities,doGiveVendorDetails,dosaveFavoriteVendor,dofetchFavoriteVendors}=require("../controllers/controllerEventServices");
let app=express.Router();

app.post("/eventSerFetch",doGiveServices);
app.post("/eventCityFetch",doFetchCities);
app.post("/eventVendorDetails",doGiveVendorDetails);
app.post("/eventAddtoFav",dosaveFavoriteVendor);
app.post("/eventFetchFav",dofetchFavoriteVendors);
module.exports=app;
