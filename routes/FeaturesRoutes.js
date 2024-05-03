const express = require("express");
const Joi = require("joi");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Feature = require("../model/featuresPartnerSchema");
const { jsonAuthMiddleware } = require("../authorization/auth");
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
  partnerName: Joi.string().required(),
  location: Joi.string().required(),
  rating: Joi.number().required(),
  deliveryType: Joi.string().required(),
  foodtype: Joi.string().required(),
  time: Joi.string().optional(), // Marking 'time' as optional
});

router.post("/add-featurePartner", upload, async (req, res) => {
  try {
    // Validate request body
    const { error } = featureValidationSchema.validate(req.body);
    // console.log("First", req.body);
    if (error) {
      console.log(error);
      console.log(" error.details", error.details[0]);
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if file is uploaded

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
    const { offset, limit, search } = req.body; // Change 'page' to 'offset'
    const parsedOffset = parseInt(offset) || 0; // Default offset to 0 if not provided
    const parsedLimit = parseInt(limit) || 10; // Default to limit of 10 if not provided
    let searchQuery = {};
    if (search) {
      const regex = new RegExp(search, "i"); // Case-insensitive search
      searchQuery = {
        $or: [
          { FeaturePartnerName: regex },
          { deliveryType: regex },
          { foodtype: regex },
        ],
      };
    }

    console.log("Offset:", parsedOffset);
    console.log("Limit:", parsedLimit);

    const data = await Feature.find(searchQuery)
      .limit(parsedLimit)
      .skip(parsedOffset) // Use offset instead of startIndex
      .exec();

    const totalCount = await Feature.countDocuments(searchQuery);

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

router.get("/detail-Feature/:id", jsonAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const Feature = await Feature.findById(id);
    if (!Feature) {
      return res.status(404).json({ msg: "Feature not found" });
    }
    res.status(200).json({ data: Feature, success: true });
  } catch (error) {
    console.error("Error retrieving Feature:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.get("/get-featurePartner/:foodtype", async (req, res) => {
  try {
    const validFoodTypes = [
      "Chinese",
      "Italian",
      "SouthIndian",
      "Japanese",
      "Indian",
      "Mexican",
    ];
    const foodtype = req.params.foodtype;

    if (validFoodTypes.includes(foodtype)) {
      const response = await Feature.find({ foodtype: foodtype });
      res.status(200).json(response);
    } else {
      res.status(404).json({ error: `Invalid foodtype : ${foodtype}` });
    }
  } catch (error) {
    console.error("Error on fetching foodtype items", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
