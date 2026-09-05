require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userroutes = require("./routes/userroutes");

require("./models/Cars");
require("./models/User");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected successfully");
};


app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("MERN Backend is running!");
});

app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userroutes);

module.exports = app;