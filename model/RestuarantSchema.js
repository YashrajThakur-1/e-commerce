const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  images: [
    {
      // Modified property name to plural form
      type: String,
      required: true,
    },
  ],
  available: {
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
});

const Restaurant = mongoose.model("restaurant", restaurantSchema);

module.exports = Restaurant;
