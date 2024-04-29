const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foodtypeSchema = new Schema({
  image: String,
  name: String,
  description: String,
  foodtype: String,
  price: String,
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
  },
});

module.exports = mongoose.model("Food", foodtypeSchema);
