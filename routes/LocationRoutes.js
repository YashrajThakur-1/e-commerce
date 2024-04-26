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
router.get("/match-location-get-restaurant", async (req, res) => {
  try {
    // Fetch all restaurants
    const restaurants = await Restaurant.find();

    // Fetch all locations
    const locations = await locationModel.find();

    // Array to store matched restaurants
    const matchedRestaurants = [];

    // Loop through each restaurant
    for (const restaurant of restaurants) {
      // Check if there is a location in the location model that matches the restaurant's coordinates
      const matchedLocation = locations.find((location) => {
        return location.location === restaurant.location;
      });

      // If a match is found, add the restaurant along with the matched location data to the result
      if (matchedLocation) {
        matchedRestaurants.push({
          restaurant: restaurant,
          location: matchedLocation,
        });
      }
    }
    console.log("first", matchedRestaurants);
    res.status(200).json({ data: matchedRestaurants, success: true });
  } catch (error) {
    console.error("Error on matching restaurant locations", error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
});

module.exports = router;
