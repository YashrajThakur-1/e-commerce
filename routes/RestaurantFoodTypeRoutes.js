const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const { jsonAuthMiddleware } = require("../authorization/auth");
const FoodType = require("../model/RestaurantFoodType");

// const featureValidationSchema = require("../validate/validation");

// Serve static files from the "public" directory
router.use(express.static("public"));

// Multer configuration for file upload
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

router.post("/add-foodtype", jsonAuthMiddleware, upload, async (req, res) => {
  try {
    // Validate request body
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Extract data from request body
    const { name, popular, restaurantId } = req.body;

    // Get the filename of the uploaded image
    const image = req.file.filename;

    // Create a new feature instance
    const newFeature = new FoodType({
      image,
      name,
      popular,
      restaurant: restaurantId, // Add restaurant ID to the food item
    });

    // Save the new feature to the database
    const addFeature = await newFeature.save();

    // Return success response with the added feature data
    res
      .status(200)
      .json({ message: "Food Type added Successfully", success: true });
  } catch (error) {
    console.error("Error adding Feature:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.get("/get-foodtype", jsonAuthMiddleware, async (req, res) => {
  try {
    const data = await FoodType.find();
    res.status(200).json({ data: data, success: true });
  } catch (error) {
    console.error("Error adding Feature:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
router.get(
  "/detail-Foodtype/:restaurantId",
  jsonAuthMiddleware,
  async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const foodTypes = await FoodType.find({ restaurant: restaurantId });
      if (!foodTypes || foodTypes.length === 0) {
        return res
          .status(404)
          .json({ msg: "Food types not found for this restaurant" });
      }
      res.status(200).json({ data: foodTypes, success: true });
    } catch (error) {
      console.error("Error retrieving food types:", error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);
router.get(
  "/get-food-type-by-restaurant/:restaurantId/:foodtype",
  async (req, res) => {
    try {
      const restaurantId = req.params.restaurantId;
      const foodtype = req.params.foodtype; // Get the foodtype parameter from the request

      const response = await FoodType.find({
        restaurant: restaurantId,
        foodtype: foodtype,
      }); // Modify the query to include the foodtype filter

      if (response.length > 0) {
        res.status(200).json(response);
      } else {
        res.status(404).json({
          error: `No menu items found for Restaurant ID: ${restaurantId} and food type: ${foodtype}`,
        });
      }
    } catch (error) {
      console.error("Error fetching menu items", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
