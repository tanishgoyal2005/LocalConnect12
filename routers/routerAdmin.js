const express = require("express");
const {
  doFetchAllUsers,
  doUpdateStatus,
  doDeleteUser,
} = require("../controllers/controllerAdmin");

const app = express.Router();

app.post("/fetchallusers", doFetchAllUsers);
app.post("/updatestatus", doUpdateStatus);
app.post("/deleteuser", doDeleteUser);

module.exports = app;