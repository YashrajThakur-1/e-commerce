const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Restaurant = require("../model/RestuarantSchema");

// Serve static files from the "public" directory
router.use(express.static("public"));

// Multer storage configuration
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

const upload = multer({ storage: storage }).array("image", 5); // '5' is the max count of images

// Route for adding a new restaurant
router.post("/add-RestaurantPartner", async (req, res) => {
  try {
    // Handle multiple image uploads
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: "Error uploading files" });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Extract data from request body
      const { available, location, rating, deliveryType, time } = req.body;

      // Get the filenames of the uploaded images
      const images = req.files.map((file) => file.filename);

      // Create a new Restaurant instance
      const newRestaurant = new Restaurant({
        images,
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
        .json({ message: "Restaurant Item added Successfully", success: true });
    });
  } catch (error) {
    console.error("Error adding Restaurant:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// Route for retrieving all restaurant items
router.post("/get-restaurantItem", async (req, res) => {
  try {
    const { page, limit } = req.body;
    const parsedPage = parseInt(page) || 1; // Default to page 1 if not provided
    const parsedLimit = parseInt(limit) || 10; // Default to limit of 10 if not provided

    const startIndex = (parsedPage - 1) * parsedLimit;
    console.log("Start Index:", startIndex);
    console.log("Limit:", parsedLimit);

    const data = await Restaurant.find()
      .limit(parsedLimit)
      .skip(startIndex)
      .exec();

    const totalCount = await Restaurant.countDocuments(); // Get total count of documents

    const pagination = {};

    if (startIndex + parsedLimit < totalCount) {
      pagination.next = {
        page: parsedPage + 1,
        limit: parsedLimit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: parsedPage - 1,
        limit: parsedLimit,
      };
    }

    res.status(200).json({ data: data, totalCount: totalCount });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route for retrieving details of a specific restaurant item
router.get("/detail-restaurantItem/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ msg: "Restaurant not found" });
    }
    res.status(200).json({ data: restaurant, success: true });
  } catch (error) {
    console.error("Error retrieving Restaurant:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
