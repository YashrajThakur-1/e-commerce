const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Feature = require("../model/featuresPartnerSchema");

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

// Route to add a new feature partner
router.post("/add-featurePartner", upload, async (req, res) => {
  try {
    const { partnerName, location, rating, deliveryType, foodtype } = req.body;

    // Assuming you have saved the image file path in req.file.filename
    const image = req.file.filename;

    const newFeature = new Feature({
      image,
      partnerName,
      location,
      rating,
      deliveryType,
      time: Date.now(),
      foodtype,
    });

    const addFeature = await newFeature.save();
    res.status(200).json({ data: addFeature });
  } catch (error) {
    console.error("Error adding Feature:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// Route to retrieve all feature partners
router.get("/get-featurepartner", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 3; // Default to limit of 10 if not provided

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const data = await Feature.find().limit(limit).skip(startIndex).exec();

    const totalCount = await Feature.countDocuments(); // Get total count of documents

    const pagination = {};

    if (endIndex < totalCount) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: limit,
      };
    }

    res.status(200).json({ data: data, pagination: pagination });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
