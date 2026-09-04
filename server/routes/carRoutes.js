const express = require("express");

const {
  getCars,
  getCarById,
  getMyCars,
  createCar,
  updateCar,
  deleteCar,
} = require("../controllers/carController");

const protect = require("../middleware/authMiddleWare");

const router = express.Router();

router.get("/", getCars);
router.get("/:id", getCarById);


router.get("/my-cars", protect, getMyCars);

router.post("/", protect, createCar);
router.put("/:id", protect, updateCar);
router.delete("/:id", protect, deleteCar);

module.exports = router;