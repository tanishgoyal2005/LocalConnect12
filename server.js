require('dotenv').config(); // MUST BE AT THE VERY TOP

var express = require("express");
var cors = require("cors");
var { doMongooseConnection } = require("./config/mongooseConnect");
var fileuploader = require("express-fileupload");

var VendorRouter = require("./routers/routerVendor");
var CitizenRouter = require("./routers/routerCitizen");
var EventServiceRouter = require("./routers/routerEventServices");
var Favs = require("./routers/routerFavs");
var UserRouter = require("./routers/routerUser");
var AdminRouter=require("./routers/routerAdmin");
let app = express();



const allowedOrigins = [
    "http://localhost:5173",
    "https://evenue-seven.vercel.app",
    
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Fixed express.urlencoded syntax
app.use(fileuploader());

doMongooseConnection();

app.use("/vendor", VendorRouter);
app.use("/citizen", CitizenRouter);
app.use("/eventss", EventServiceRouter);
app.use("/favrs", Favs);
app.use("/user", UserRouter);
app.use("/admin",AdminRouter);
app.listen(process.env.PORT_NO, function() {
  console.log("Server Started ");
});


