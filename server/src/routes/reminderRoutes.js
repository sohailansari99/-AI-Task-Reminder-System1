const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  setReminder,
  getDueReminders,
  getReminderLogs
} = require("../controllers/reminderController");

router.post("/set", authMiddleware, setReminder);
router.get("/due", authMiddleware, getDueReminders);
router.get("/logs", authMiddleware, getReminderLogs);

module.exports = router;