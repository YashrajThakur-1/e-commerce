const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Restaurant = require("../model/RestuarantSchema");
const { jsonAuthMiddleware } = require("../authorization/auth");

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
const uploadCategoryImage = multer({ storage: storage }).single(
  "categoryImage"
);

// Route for adding a new restaurant
// Route for adding a new restaurant
router.post(
  "/add-RestaurantPartner",
  upload,
  // uploadCategoryImage,
  async (req, res) => {
    try {
      // Extract data from request body
      const {
        available,
        location,
        rating,
        deliveryType,
        time,
        restaurantPartnerName,
        foodtype,
      } = req.body;
      // Ensure foodtype data is present and properly formatted

      // console.log(Foodtype);
      // Create an array of foodtype objects

      // Get the filenames of the uploaded images for restaurant
      const images = req.files.map((file) => file.filename);

      // Create a new Restaurant instance
      const newRestaurant = new Restaurant({
        images,
        available,
        location,
        rating,
        deliveryType,
        time,
        foodtype,
        restaurantPartnerName,
      });

      // Save the new Restaurant to the database
      const addRestaurant = await newRestaurant.save();

      // Return success response with the added Restaurant data
      res
        .status(200)
        .json({ message: "Restaurant item added successfully", success: true });
    } catch (error) {
      console.error("Error adding Restaurant:", error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

// Route for retrieving all restaurant items
router.post("/get-restaurantItem", async (req, res) => {
  try {
    const { offset, limit, search } = req.body; // Change 'page' to 'offset'
    const parsedOffset = parseInt(offset) || 0; // Default offset to 0 if not provided
    const parsedLimit = parseInt(limit) || 10; // Default to limit of 10 if not provided
    let searchQuery = {};
    if (search) {
      const regex = new RegExp(search, "i"); // Case-insensitive search
      searchQuery = {
        $or: [
          { restaurantPartnerName: regex },
          { deliveryType: regex },
          { foodtype: regex },
        ],
      };
    }

    console.log("Offset:", parsedOffset);
    console.log("Limit:", parsedLimit);

    const data = await Restaurant.find(searchQuery)
      .limit(parsedLimit)
      .skip(parsedOffset) // Use offset instead of startIndex
      .exec();

    const totalCount = await Restaurant.countDocuments(searchQuery);

    const pagination = {};

    if (parsedOffset + parsedLimit < totalCount) {
      pagination.next = {
        offset: parsedOffset + parsedLimit, // Update offset for next page
        limit: parsedLimit,
      };
    }

    if (parsedOffset > 0) {
      pagination.prev = {
        offset: Math.max(parsedOffset - parsedLimit, 0), // Ensure offset doesn't go negative
        limit: parsedLimit,
      };
    }

    res.status(200).json({ data: data, totalCount: totalCount });
  } catch (error) {
    console.log(error);
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

// router.get("/get-foodType/:id/:foodtype", async (req, res) => {
//   try {
//     const validFoodTypes = [
//       "Chinese",
//       "Italian",
//       "SouthIndian",
//       "Japanese",
//       "Indian",
//       "Mexican",
//     ];
//     const { foodtype, id } = req.params;

//     if (validFoodTypes.includes(foodtype)) {
//       const response = await Restaurant.findById(id);
//       res.status(200).json(response);
//     } else {
//       res.status(404).json({ error: `Invalid Taste Type: ${foodtype}` });
//     }
//   } catch (error) {
//     console.error("Error on fetching menu items", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

module.exports = router;
