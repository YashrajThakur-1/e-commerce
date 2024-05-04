const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  images: [
    {
      type: String,
      // required: true,
    },
  ],
  available: {
    type: String,
    // required: true,
  },
  restaurantPartnerName: {
    type: String,
    // required: true,
  },
  location: {
    type: String,
    // required: true,
  },
  rating: {
    type: String,
    // required: true,
  },
  deliveryType: {
    type: String,
    enum: ["express", "free"],
    // required: true,
  },
  time: {
    type: String,
    // required: true,
  },
  foodtype: {
    type: [String],
  },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
// const mongoose = require("mongoose");
// const menuItemSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   description: String,
//   price: {
//     type: Number,
//     required: true,
//   },
//   imageUrl: String,
// });
// const restaurantSchema = new mongoose.Schema({
//   images: [
//     {
//       type: String,
//       // required: true,
//     },
//   ],
//   available: {
//     type: String,
//     // required: true,
//   },
//   restaurantPartnerName: {
//     type: String,
//     // required: true,
//   },
//   location: {
//     type: String,
//     // required: true,
//   },
//   rating: {
//     type: String,
//     // required: true,
//   },
//   deliveryType: {
//     type: String,
//     enum: ["express", "free"],
//     // required: true,
//   },
//   time: {
//     type: String,
//     // required: true,
//   },
//   foodtype: [menuItemSchema],
// });

// const Restaurant = mongoose.model("Restaurant", restaurantSchema);

// module.exports = Restaurant;
