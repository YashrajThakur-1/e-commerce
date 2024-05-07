const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    // Defining the properties of the location schema
    location: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
      required: true,
    },
    // Add other properties if needed
  },
  { timestamps: true }
); // Adding timestamps for createdAt and updatedAt

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
