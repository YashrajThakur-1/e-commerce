const express = require("express");
const Joi = require("joi");

const router = express.Router();
const path = require("path");
const multer = require("multer");
const Feature = require("../model/featuresPartnerSchema");
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

const featureValidationSchema = Joi.object({
  partnerName: Joi.string().required("Name is required"),
  location: Joi.string().required("location is required"),
  rating: Joi.number().required("rating is required"),
  deliveryType: Joi.string().required("deliveryType is required"),
  foodtype: Joi.string().required("foodtype is required"),
  time: Joi.string().required("time is required"),
});
router.post("/add-featurePartner", upload, async (req, res) => {
  try {
    // Validate request body
    const { error } = featureValidationSchema.validate(req.body);
    if (error) {
      console.log(error);

      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Extract data from request body
    const { partnerName, location, rating, deliveryType, foodtype, time } =
      req.body;

    // Get the filename of the uploaded image
    const image = req.file.filename;

    // Create a new feature instance
    const newFeature = new Feature({
      image,
      partnerName,
      location,
      rating,
      deliveryType,
      time, // Assuming 'time' field is required in your model
      foodtype,
    });

    // Save the new feature to the database
    const addFeature = await newFeature.save();

    // Return success response with the added feature data
    res
      .status(200)
      .json({ message: "Feature Partner added Succesfully", success: true });
  } catch (error) {
    console.error("Error adding Feature:", error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// Route to retrieve all feature partners
router.post("/get-featurepartner", async (req, res) => {
  try {
    const { page, limit } = req.body;
    const parsedPage = parseInt(page) || 1; // Default to page 1 if not provided
    const parsedLimit = parseInt(limit) || 10; // Default to limit of 10 if not provided

    const startIndex = (parsedPage - 1) * parsedLimit;
    console.log("Start Index:", startIndex);
    console.log("Limit:", parsedLimit);

    const data = await Feature.find()
      .limit(parsedLimit)
      .skip(startIndex)
      .exec();

    const totalCount = await Feature.countDocuments(); // Get total count of documents

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

    res
      .status(200)
      .json({ data: data, pagination: pagination, totalCount: totalCount });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/remove-featurepartner/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(404).jsom({ msg: "feature id Invalid" });
    }
    const data = await Feature.findByIdAndDelete(userId);
    if (!data) {
      return res.status(404).json({ error: "Feature partner not found" });
    }

    res.status(200).json({
      message: "Feature partner deleted successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/updated-Feature/:id", upload, async (req, res) => {
  try {
    const FeatureId = req.params.id;
    const updatedFeatureData = req.body;

    console.log(req.file);

    // Check if file was uploaded and add its path to updatedFeatureData
    if (req.file) {
      updatedFeatureData.image = req.file.filename;
    }
    const response = await Feature.findByIdAndUpdate(
      FeatureId,
      updatedFeatureData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!response) {
      return res
        .status(404)
        .json({ success: false, error: "Feature Not Found" });
    }

    res.status(200).json({
      success: true,
      data: response,
      message: "Feature updated successfully",
    });
  } catch (error) {
    console.error("Error updating Feature:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
module.exports = router;
