const express = require("express");
const router = express.Router();
const Order = require("../model/AddToOrder");
const FoodType = require("../model/FoodtypeSchema");
const { jsonAuthMiddleware } = require("../authorization/auth");

router.post("/add-order", jsonAuthMiddleware, async (req, res) => {
  try {
    // Extract user ID from the request (assuming it's included in the JWT payload)
    const userId = req.user.userData._id; // Assuming user ID is stored in req.user.id
    console.log(userId);
    console.log("req.user", req.user);

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
      image: foodType.image,
      foodtype: foodType.foodtype,
      description: foodType.description,
      price: foodType.price,
      quantity: quantity,
    };

    // Create a new order instance and associate it with the user
    const newOrder = new Order({
      user: userId, // Associate the order with the user
      items: [orderItem],
      total: totalPrice,
    });
    console.log("newOrder", newOrder);
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

// GET request to retrieve orders for the logged-in user
router.get("/get-order", jsonAuthMiddleware, async (req, res) => {
  try {
    console.log("req.user", req.user);
    console.log("req.user.userdata", req.user.userData);
    console.log("req.user.userdata._id", req.user.userData._id);
    // Check if req.user exists and contains userdata
    if (!req.user || !req.user.userData || !req.user.userData._id) {
      return res
        .status(401)
        .json({ message: "User data not found in request" });
    }

    const userId = req.user.userData._id; // Assuming user ID is stored in req.user.userdata.id
    console.log(userId);

    // Retrieve orders associated with the logged-in user
    const userOrders = await Order.find({ user: userId });

    res.status(200).json(userOrders);
  } catch (error) {
    console.error("Error getting user orders:", error);
    res.status(500).json({ message: "Internal Error" });
  }
});

// GET request to retrieve all orders
// router.get("/get-order", jsonAuthMiddleware, async (req, res) => {
//   try {
//     const data = await Order.find();
//     res.status(200).json(data);
//   } catch (error) {
//     console.error("Error Getting on Order :", error);
//     res.status(500).json({ message: "Internal Error" });
//   }
// });

// PUT request to update an order by ID
router.put("/update-order/:orderId", jsonAuthMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { quantity } = req.body;

    // Ensure that quantity is provided and is a number
    if (!quantity || isNaN(quantity)) {
      return res
        .status(400)
        .json({ message: "Quantity must be provided and must be a number" });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the quantity of the order item
    order.items[0].quantity = quantity;

    // Update the total price
    order.total = order.items[0].price * quantity;

    // Save the updated order to the database
    await order.save();

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
});

// DELETE request to cancel an order by ID
router.delete(
  "/cancel-order/:orderId",
  jsonAuthMiddleware,
  async (req, res) => {
    try {
      const { orderId } = req.params;

      // Find the order by ID and delete it
      const deletedOrder = await Order.findByIdAndDelete(orderId);
      if (!deletedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res
        .status(200)
        .json({ message: "Order canceled successfully", order: deletedOrder });
    } catch (error) {
      console.error("Error canceling order:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  }
);

module.exports = router;
