const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    dueDate: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      enum: ["study", "personal", "work", "health", "other"],
      default: "other"
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending"
    },
    aiPriority: {
      level: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low"
      },
      score: {
        type: Number,
        default: 0
      },
      reason: {
        type: String,
        default: ""
      }
    },
    reminderChannels: {
      type: [String],
      enum: ["email", "browser"],
      default: []
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    aiGenerated: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);