const mongoose = require("mongoose");
const fetaureSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  partnerName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    requied: true,
  },
  rating: {
    type: String,
    required: true,
  },
  deliveryType: {
    type: String,
    enum: ["express", "free"],

    required: true,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  foodtype: {
    type: [String], // Use array of strings
    enum: [
      "Chinese",
      "Italian",
      "Mexican",
      "Indian",
      "Japanese",
      "SouthIndian",
    ],
    required: true,
  },
});

const Feature = mongoose.model("featurePartner", fetaureSchema);

module.exports = Feature;
