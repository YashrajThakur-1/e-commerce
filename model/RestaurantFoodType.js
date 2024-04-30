const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const schema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  popular: { type: Boolean, default: false },
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
  },
});

const FoodType = mongoose.model("foodtype", schema);

module.exports = FoodType;
