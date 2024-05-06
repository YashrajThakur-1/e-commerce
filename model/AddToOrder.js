const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    // required: true,
  },
  items: [
    {
      name: String,
      image: String,
      foodtype: String,
      description: String,
      price: Number,
      quantity: Number,
    },
  ],
  total: Number,
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
