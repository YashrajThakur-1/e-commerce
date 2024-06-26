const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foodtypeSchem = new Schema({
  image: String,
  name: String,
  description: String,
  foodtype: String,
  price: Number,
  isFeature: {
    type: Boolean,
    default: false,
  },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
  },
});

const foodtypeSchema = mongoose.model("Food", foodtypeSchem);
module.exports = foodtypeSchema;
