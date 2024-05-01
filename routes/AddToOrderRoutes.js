const express = require("express");
const router = express.Router();
const Order = require("../model/AddToOrder");
const FoodType = require("../model/FoodtypeSchema");

// POST request to add a new order
router.post("/add-order", async (req, res) => {
  try {
    // Extract order details from the request body
    const { id, quantity } = req.body;
    console.log(quantity);
    // Fetch food type details based on the id
    const foodType = await FoodType.findById(id);
    if (!foodType) {
      return res.status(404).json({ message: "Food type not found" });
    }

    // Ensure that quantity is provided
    if (!quantity || isNaN(quantity)) {
      return res
        .status(400)
        .json({ message: "Quantity must be provided and must be a number" });
    }

    // Calculate total price based on quantity and food type price
    const totalPrice = foodType.price * quantity;

    // Create a new order item
    const orderItem = {
      name: foodType.name,
      description: foodType.description,
      price: foodType.price,
      quantity: quantity,
    };

    // Create a new order instance
    const newOrder = new Order({
      items: [orderItem],
      total: totalPrice,
    });

    // Save the order to the database
    await newOrder.save();

    res
      .status(201)
      .json({ message: "Order added successfully", order: newOrder });
  } catch (error) {
    // Handle errors
    console.error("Error adding order:", error);
    res.status(500).json({ message: "Failed to add order" });
  }
});

router.get("/get-order", async (req, res) => {
  try {
    const data = await Order.find();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error Getting on Order :", error);
    res.status(500).json({ message: "Internal Error" });
  }
});
module.exports = router;
