require("dotenv").config();
const express = require("express");
const db = require("./database/db");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path"); // Import path module

const port = process.env.PORT || 9000; // Use port from environment variables or default to 9000

const userRoutes = require("./routes/userRoutes");
const featureRoutes = require("./routes/FeaturesRoutes.js");
const restaurantRoutes = require("./routes/RestaurantRoutes.js");
const foodroutes = require("./routes/FoodTypeRoutes.js");
const locationRoutes = require("./routes/LocationRoutes.js");
const foodTypeRoutes = require("./routes/RestaurantFoodTypeRoutes.js");
const orderRoutes = require("./routes/AddToOrderRoutes");
// Middleware to parse JSON Bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS policy setup to allow requests from any origin
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET", "PATCH", "PUT", "DELETE"],
  })
);

// Define the directory for serving static files (such as images)
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/user", userRoutes);
app.use("/auth", featureRoutes);
app.use("/res/api", restaurantRoutes);
app.use("/v1/api", foodroutes);
app.use("/v2/api", locationRoutes);
app.use("/v3/api", foodTypeRoutes);
app.use("/v4/api", orderRoutes);

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
