const express = require("express");

const {
  getUsers,
  getUserById,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getProfile,
} = require("../controllers/usercontroller");

const protect = require("../middleware/authMiddleWare");

const router = express.Router();

router.get("/", getUsers);

router.post("/", createUser);
router.post("/login", loginUser);


router.get("/profile", protect, getProfile);


router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;