const express = require("express");
const locationModel = require("../model/locationSchema");
const Restaurant = require("../model/RestuarantSchema");
const { jsonAuthMiddleware } = require("../authorization/auth");
const router = express.Router();

// Route to add a location for the current user
router.post("/addlocation", jsonAuthMiddleware, async (req, res) => {
  try {
    // Get the location data from the request body
    const { location } = req.body;

    // Get the user ID from the request object
    const userId = req.user.userData._id; // Assuming req.user contains the user object with _id field

    // Create a new location instance with the user ID
    const newLocation = new locationModel({
      location,
      userId,
    });

    // Save the location data to the database
    await newLocation.save();

    // Send a success response
    res.status(200).json({ message: "Location added successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error on adding location", error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
});

// Route to get all locations of the current user
router.get("/getlocations", jsonAuthMiddleware, async (req, res) => {
  try {
    // Get the user ID from the request object
    const userId = req.user.userData._id; // Assuming req.user contains the user object with _id field

    // Find all locations associated with the user
    const userLocations = await locationModel.find({ userId });

    // Send the locations as a response
    res.status(200).json({ data: userLocations, success: true });
  } catch (error) {
    // Handle errors
    console.error("Error on getting locations", error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
});

// Route to get restaurants matching the location of the current user
router.get(
  "/match-location-get-restaurant",
  jsonAuthMiddleware,
  async (req, res) => {
    try {
      // Get the user ID from the request object
      const userId = req.user._id; // Assuming req.user contains the user object with _id field

      // Find all locations associated with the user
      const userLocations = await locationModel.find({ userId });

      // Fetch all restaurants
      const restaurants = await Restaurant.find();

      // Array to store matched restaurants
      const matchedRestaurants = [];

      // Loop through each location of the user
      for (const location of userLocations) {
        // Loop through each restaurant
        for (const restaurant of restaurants) {
          // Check if the restaurant's location matches the user's location
          if (restaurant.location === location.location) {
            // If a match is found, add the restaurant to the result
            matchedRestaurants.push(restaurant);
          }
        }
      }

      // Send the matched restaurants as a response
      res.status(200).json({ data: matchedRestaurants, success: true });
    } catch (error) {
      // Handle errors
      console.error("Error on matching restaurant locations", error);
      res.status(500).json({ error: "Internal Server Error", status: false });
    }
  }
);

module.exports = router;
