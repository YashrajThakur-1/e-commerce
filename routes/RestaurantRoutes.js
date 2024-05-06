const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Restaurant = require("../model/RestuarantSchema");
const { jsonAuthMiddleware } = require("../authorization/auth");

// Create Multer instances for 'images' and 'imageUrl' fields
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname === "images" || file.fieldname === "imageUrl") {
        cb(null, "public");
      } else {
        cb(new Error("Unexpected field"));
      }
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  }),
});

// Middleware function to handle image uploads for 'images' and 'imageUrl' fields
const handleUploads = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error("Multer error:", err);
      return res.status(500).json({ error: "Upload failed" });
    } else if (err) {
      // An unknown error occurred
      console.error("Unknown error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Upload successful");
    next();
  });
};

router.post(
  "/add-RestaurantPartner",
  handleUploads,
  jsonAuthMiddleware,
  async (req, res) => {
    try {
      console.log("Request body:", req.body);

      // Extract form data from the request body
      const {
        available,
        location,
        rating,
        deliveryType,
        time,
        restaurantPartnerName,
        foodItems, // Assuming the array of food items contains objects with 'name' and 'imageUrl'
      } = req.body;

      // Check if foodItems is an array
      if (!Array.isArray(foodItems)) {
        throw new Error("foodItems should be an array");
      }

      // Get the filenames of the uploaded images for imageUrl
      const imageUrls = req.files
        .filter((file) => file.fieldname === "imageUrl")
        .map((file) => file.filename);
      console.log("Image URL filenames:", imageUrls);

      // Create new menu items with image filenames
      const menuItems = foodItems.map((item, index) => ({
        name: item.name,
        imageUrl: imageUrls[index], // Use corresponding imageUrl for each item
      }));
      console.log("menuItems", menuItems);

      // Get the filenames of the uploaded images for images field
      const images = req.files
        .filter((file) => file.fieldname === "images")
        .map((file) => file.filename);
      console.log("Images filenames:", images);

      // Create a new Restaurant instance with form data and menu items
      const newRestaurant = new Restaurant({
        images,
        available,
        location,
        rating,
        deliveryType,
        time,
        restaurantPartnerName,
        foodtype: menuItems,
      });

      // Save the new Restaurant to the database
      await newRestaurant.save();

      // Return success response
      res.status(200).json({
        message: "Restaurant Item added Successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error adding Restaurant:", error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);
router.post("/get-restaurantItem", jsonAuthMiddleware, async (req, res) => {
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
          { location: regex },
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

router.get("/detail-restaurant/:id", jsonAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Restaurant.findById(id);
    if (!data) {
      return res.status(404).json({ msg: "Restaurant not found" });
    }
    res.status(200).json({ data, success: true });
  } catch (error) {
    console.error("Error retrieving Feature:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
module.exports = router;
