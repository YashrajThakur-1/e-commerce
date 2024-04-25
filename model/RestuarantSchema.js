const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  images: [
    {
      type: String,
      required: true,
    },
  ],
  available: {
    type: String,
    required: true,
  },
  restaurantPartnerName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true, // Corrected typo in 'required'
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
    type: String,
    required: true,
  },
  foodtype: {
    type: [String], // Array of strings
    required: true,
  },
});

const Restaurant = mongoose.model("restaurant", restaurantSchema);

module.exports = Restaurant;
