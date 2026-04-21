const Task = require("../models/task");
const ReminderLog = require("../models/reminderlogs");

const setReminder = async (req, res) => {
  try {
    const { taskId, reminderChannels } = req.body;

    if (!taskId || !reminderChannels || !Array.isArray(reminderChannels)) {
      return res.status(400).json({
        success: false,
        message: "taskId and reminderChannels are required"
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    task.reminderChannels = reminderChannels;
    await task.save();

    res.status(200).json({
      success: true,
      message: "Reminder set successfully",
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to set reminder",
      error: error.message
    });
  }
};

const getDueReminders = async (req, res) => {
  try {
    const now = new Date();

    const dueTasks = await Task.find({
      userId: req.user._id,
      dueDate: { $lte: now },
      status: "pending",
      reminderSent: false
    }).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: dueTasks.length,
      reminders: dueTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch due reminders",
      error: error.message
    });
  }
};

const getReminderLogs = async (req, res) => {
  try {
    const logs = await ReminderLog.find({ userId: req.user._id }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reminder logs",
      error: error.message
    });
  }
};

module.exports = {
  setReminder,
  getDueReminders,
  getReminderLogs
};