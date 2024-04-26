const { required } = require("joi");
const mongoose = require("mongoose");
const { modelName } = require("./FoodtypeSchema");

const schema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
});

const locationModel = mongoose.model("Location", schema);

module.exports = locationModel;
