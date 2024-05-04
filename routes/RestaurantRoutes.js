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

// Route for adding a new restaurant
// Route for adding a new restaurant
router.post("/add-RestaurantPartner", upload, async (req, res) => {
  try {
    const {
      available,
      location,
      rating,
      deliveryType,
      time,
      foodtype,
      restaurantPartnerName,
    } = req.body;
    console.log("req.body", req.body);
    console.log("req.files", req.files);
    // Get the filenames of the uploaded images
    const images = req.files.map((file) => file.filename);
    console.log("first", images);
    // Create a new Restaurant instance
    const newRestaurant = new Restaurant({
      images: images, // Ensure to pass the correct field name here
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
    res.status(200).json({
      message: "Restaurant Item added Successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error adding Restaurant:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

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

module.exports = router;
// const express = require("express");
// const router = express.Router();
// // const Restaurant = require("../model/restaurant");
// const multer = require("multer");
// const path = require("path");
// const Restaurant = require("../model/RestuarantSchema");

// // Set up Multer storage configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public"); // Save images in the "public/images" directory
//   },
//   filename: function (req, file, cb) {
//     // Generate a unique filename by appending current timestamp and original extension
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

// // Create Multer instance with the configured storage
// const upload = multer({ storage: storage });

// // Route for adding a restaurant partner
// router.post(
//   "/add-RestaurantPartner",
//   upload.array("images", 5),
//   async (req, res) => {
//     try {
//       // Extract form data from the request body
//       const {
//         available,
//         location,
//         rating,
//         deliveryType,
//         time,
//         restaurantPartnerName,
//         foodtype,
//       } = req.body;

//       // Get the filenames of the uploaded images
//       const images = req.files.map((file) => file.filename);

//       // Create new menu items with image filenames
//       const menuItems = foodtype.map((item) => {
//         return {
//           name: item.name,
//           description: item.description,
//           price: item.price,
//           imageUrl: item.imageUrl ? item.imageUrl : images.shift(), // Use provided imageUrl or uploaded image
//         };
//       });

//       // Create a new Restaurant instance with form data and menu items
//       const newRestaurant = new Restaurant({
//         images,
//         available,
//         location,
//         rating,
//         deliveryType,
//         time,
//         restaurantPartnerName,
//         foodtype: menuItems,
//       });

//       // Save the new Restaurant to the database
//       await newRestaurant.save();

//       // Return success response
//       res.status(200).json({
//         message: "Restaurant Item added Successfully",
//         success: true,
//       });
//     } catch (error) {
//       console.error("Error adding Restaurant:", error);
//       res.status(500).json({ msg: "Internal Server Error" });
//     }
//   }
// );

// module.exports = router;
