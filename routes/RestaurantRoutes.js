const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Restaurant = require("../model/RestuarantSchema");
// const RestaurantValidationSchema = require("../validate/validation");
// Serve static files from the "public" directory
router.use(express.static("public"));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage }).single("image");
router.post("/add-RestaurantPartner", upload, async (req, res) => {
  try {
    // Validate request body

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Extract data from request body
    const { available, location, rating, deliveryType, time } = req.body;

    // Get the filename of the uploaded image
    const image = req.file.filename;

    // Create a new Restaurant instance
    const newRestaurant = new Restaurant({
      image,
      available,
      location,
      rating,
      deliveryType,
      time,
    });

    // Save the new Restaurant to the database
    const addRestaurant = await newRestaurant.save();

    // Return success response with the added Restaurant data
    res
      .status(200)
      .json({ message: "Restaurant Item added Succesfully", success: true });
  } catch (error) {
    console.error("Error adding Restaurant:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
