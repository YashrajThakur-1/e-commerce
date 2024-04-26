const express = require("express");
const locationModel = require("../model/locationSchema");
const Restaurant = require("../model/RestuarantSchema");
const router = express.Router();
router.post("/addlocation", async (req, res) => {
  try {
    const data = req.body;
    const location = await locationModel(data);
    const savedata = await location.save();
    res.status(200).json({ message: "location added successfully" });
  } catch (error) {
    console.error("Error on login", error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
});
router.get("/getlocation", async (req, res) => {
  try {
    const data = await locationModel.find();
    res.status(200).json({ data: data, success: true });
  } catch (error) {
    console.error("Error on login", error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
});
router.get("/match-location-get-restaurant/:id", async (req, res) => {
  try {
    // Fetch the location with the specified ID
    const id = req.params.id;
    const location = await locationModel.findById(id);

    if (!location) {
      return res
        .status(404)
        .json({ error: "Location not found", status: false });
    }

    // Fetch all restaurants
    const restaurants = await Restaurant.find();

    // Array to store matched restaurants
    const matchedRestaurants = [];

    // Loop through each restaurant
    for (const restaurant of restaurants) {
      // Check if the restaurant's location matches the location's ID
      if (restaurant.location === location.location) {
        // If a match is found, add the restaurant along with the matched location data to the result
        matchedRestaurants.push({
          restaurant: restaurant,
          // location: location,
        });
      }
    }

    console.log("matchedRestaurants", matchedRestaurants);
    res.status(200).json({ data: matchedRestaurants, success: true });
  } catch (error) {
    console.error("Error on matching restaurant locations", error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
});

module.exports = router;
