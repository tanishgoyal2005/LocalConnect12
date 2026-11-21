var express=require("express");
var {doSignup,doLogin,doCheckEmail,doForgotPassword,doResetPassword}=require("../controllers/controllerUser");

let app=express.Router();

app.post("/signup",doSignup);
app.post("/login",doLogin);
app.post("/checkEmail",doCheckEmail);
app.post("/forgot-password", doForgotPassword);
app.post("/reset-password", doResetPassword);
module.exports=app;
