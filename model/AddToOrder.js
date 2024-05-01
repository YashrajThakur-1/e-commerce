const mongoose = require("mongoose");

// Define the schema for a single item in the order
const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  quantity: { type: Number, required: true },
});

// Define the schema for the order
const orderSchema = new mongoose.Schema({
  items: [orderItemSchema], // Array of order items
  total: { type: String, required: true },
});

// Create the Order model
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
