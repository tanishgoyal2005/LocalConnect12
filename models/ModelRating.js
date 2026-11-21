
const mongoose = require("mongoose");

const ratingDesign = {
  citizenEmail: { type: String, required: true },
  vendorEmail: { type: String, required: true },
  rating: { type: Number, required: true }, // e.g. 1 to 5
};

const ratingSchema = new mongoose.Schema(ratingDesign, { versionKey: false });
const RatingColRef = mongoose.model("Rating", ratingSchema);

module.exports = RatingColRef;
