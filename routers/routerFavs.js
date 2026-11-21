var express=require("express");
var {dofetchFavoriteVendors,doremoveFavoriteVendor,dorateVendor}=require("../controllers/controllerFavs");
let app=express.Router();

app.post("/fetchWishlist",dofetchFavoriteVendors);
app.post("/RemoveFavs",doremoveFavoriteVendor);
app.post("/rating",dorateVendor);
module.exports=app;
