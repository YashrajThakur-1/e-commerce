const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Restaurant = require("../model/RestuarantSchema");

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

const upload = multer({ storage: storage }).array("image", 5); // '5' is the max count of images
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

      console.log("Uploaded files:", req.files); // Log uploaded files
      console.log("Images array:", images); // Log image file names

      // Create a new Restaurant instance
      const newRestaurant = new Restaurant({
        images,
        available,
        location,
        rating,
        deliveryType,
        time,
      });

      console.log("New restaurant:", newRestaurant); // Log new restaurant object

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

router.get("/get-restaurantItem", async (req, res) => {
  try {
    const data = await Restaurant.find();
    res.status(200).json({ data: data, success: true });
  } catch {
    console.error("Error adding Restaurant:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
module.exports = router;
