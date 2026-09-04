require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userroutes = require("./routes/userroutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.send("MERN Backend is running!");
});

app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userroutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

module.exports = app;