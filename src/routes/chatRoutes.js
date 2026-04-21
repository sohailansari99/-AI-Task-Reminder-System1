const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  sendMessageToAI,
  getChatHistory,
  clearChatHistory
} = require("../controllers/chatController");

router.post("/message", authMiddleware, sendMessageToAI);
router.get("/history", authMiddleware, getChatHistory);
router.delete("/history", authMiddleware, clearChatHistory);

module.exports = router;