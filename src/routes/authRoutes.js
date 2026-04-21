const express = require("express");
const router = express.Router();

const {
  signupUser,
  loginUser,
  getMe
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);

module.exports = router;