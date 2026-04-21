const mongoose = require("mongoose");

const reminderLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },

    channel: {
      type: String,
      enum: ["email", "browser"],
      required: true
    },

    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent"
    },

    message: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReminderLog", reminderLogSchema);