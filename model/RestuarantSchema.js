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
    required: true,
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
  foodtype: [
    {
      name: {
        type: String,
        // required: true, // Name of the food type is required
      },
      categoryImage: {
        type: String,
        // required: true, // URL or path to the image is required
      },
    },
  ],
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
