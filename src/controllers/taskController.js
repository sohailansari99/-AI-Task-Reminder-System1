const Task = require("../models/task");

const calculateAIPriority = (task) => {
  const now = new Date();
  const due = new Date(task.dueDate);
  const hoursLeft = (due - now) / (1000 * 60 * 60);

  let score = 0;
  const reason = [];

  if (hoursLeft <= 24) {
    score += 50;
    reason.push("Deadline is within 24 hours");
  } else if (hoursLeft <= 72) {
    score += 35;
    reason.push("Deadline is within 3 days");
  } else if (hoursLeft <= 168) {
    score += 20;
    reason.push("Deadline is within 7 days");
  }

  const text = `${task.title} ${task.description || ""}`.toLowerCase();

  const importantKeywords = [
    "exam",
    "assignment",
    "project",
    "submission",
    "submit",
    "meeting",
    "interview",
    "fee",
    "deadline",
    "viva"
  ];

  if (importantKeywords.some((word) => text.includes(word))) {
    score += 20;
    reason.push("Important keyword found");
  }

  if (task.category === "study" || task.category === "work") {
    score += 10;
    reason.push("Important category");
  }

  if (hoursLeft < 0 && task.status !== "completed") {
    score += 40;
    reason.push("Task is overdue");
  }

  let level = "low";
  if (score >= 70) level = "high";
  else if (score >= 40) level = "medium";

  return {
    level,
    score,
    reason: reason.join(", ")
  };
};

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      category,
      reminderChannels,
      aiGenerated
    } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Title and dueDate are required"
      });
    }

    const aiPriority = calculateAIPriority({
      title,
      description,
      dueDate,
      category,
      status: "pending"
    });

    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      dueDate,
      category,
      reminderChannels,
      aiGenerated,
      aiPriority
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch task",
      error: error.message
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const updatedFields = {
      title: req.body.title ?? task.title,
      description: req.body.description ?? task.description,
      dueDate: req.body.dueDate ?? task.dueDate,
      category: req.body.category ?? task.category,
      reminderChannels: req.body.reminderChannels ?? task.reminderChannels,
      status: req.body.status ?? task.status
    };

    const aiPriority = calculateAIPriority(updatedFields);

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...updatedFields,
        aiPriority
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["pending", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required"
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    task.status = status;
    task.aiPriority = calculateAIPriority(task);

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update task status",
      error: error.message
    });
  }
};

const getTaskHistory = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      history: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch task history",
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskHistory
};