const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },

  foodtype: {
    type: [String], // Array of strings
    required: true,
  },
});

const Food = mongoose.model("FoodType", schema);

module.exports = Food;
