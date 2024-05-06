const express = require("express");

const router = express.Router();
const path = require("path");
const multer = require("multer");

const { jsonAuthMiddleware } = require("../authorization/auth");
const Food = require("../model/FoodtypeSchema");
const Restaurant = require("../model/RestuarantSchema");
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

router.post("/add-fooditem/:id", upload, async (req, res) => {
  try {
    const { id } = req.body;
    // Validate request body
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Extract data from request body
    const { name, description, foodtype, price } = req.body;

    // Get the filename of the uploaded image
    const image = req.file.filename;

    // Create a new feature instance
    const newFeature = new Food({
      image,
      name,
      description,
      foodtype,
      price,
      restaurant: id, // Add restaurant ID to the food item
    });

    // Save the new feature to the database
    await newFeature.save();

    // Return success response with the added feature data
    res
      .status(200)
      .json({ message: "Food Partner added Successfully", success: true });
  } catch (error) {
    console.error("Error adding Feature:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.get("/get-foodtype-data", async (req, res) => {
  try {
    const data = await Food.find();
    res.status(200).json({ data: data, success: true });
  } catch (error) {
    console.error("Error adding Feature:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
router.get("/detail-Food-list/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Food.findById(id);
    if (!restaurant) {
      return res.status(404).json({ msg: "Restaurant not found" });
    }
    res.status(200).json({ data: restaurant, success: true });
  } catch (error) {
    console.error("Error retrieving Restaurant:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
router.get(
  "/get-food-by-restaurant/:restaurantId/:foodtype",
  async (req, res) => {
    try {
      const restaurantId = req.params.restaurantId;
      const foodtype = req.params.foodtype; // Get the foodtype parameter from the request

      const response = await Food.find({
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
router.get("/filterByPrice", async (req, res) => {
  try {
    const { price } = req.body; // Retrieve price from query parameters
    // const numericPrice = parseFloat(price); // Convert price to a number

    const data = await Food.find({ price: { $lte: price } }); // Fetch items with prices greater than the provided price
    console.log(price);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error retrieving Food:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
router.get("/filterByFoodName", async (req, res) => {
  try {
    const { foodName } = req.query; // Retrieve foodName from query parameters

    // Use a regular expression to perform a case-insensitive search for foodName
    const data = await Food.find({
      foodName: { $regex: new RegExp(foodName, "i") },
    });
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error retrieving Food:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
router.put("/update-fooditem/:id", upload, async (req, res) => {
  try {
    const { id } = req.params;
    // Extract updated data from request body
    const { name, description, foodtype, price, restaurantId } = req.body;

    // Check if file is uploaded
    const image = req.file ? req.file.filename : undefined;

    // Find the food item by ID and update its data
    await Food.findByIdAndUpdate(id, {
      ...(image && { image }), // If image is uploaded, update image
      ...(name && { name }),
      ...(description && { description }),
      ...(foodtype && { foodtype }),
      ...(price && { price }),
      ...(restaurantId && { restaurant: restaurantId }),
    });

    // Return success response
    res
      .status(200)
      .json({ message: "Food item updated successfully", success: true });
  } catch (error) {
    console.error("Error updating food item:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// Delete Food Item
router.delete("/delete-fooditem/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the food item by ID and delete it
    await Food.findByIdAndDelete(id);

    // Return success response
    res
      .status(200)
      .json({ message: "Food item deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting food item:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
module.exports = router;
