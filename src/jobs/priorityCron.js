const cron = require("node-cron");
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

const startPriorityCron = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const pendingTasks = await Task.find({
        status: "pending"
      });

      for (const task of pendingTasks) {
        task.aiPriority = calculateAIPriority(task);
        await task.save();
      }

      console.log("Priority cron executed successfully");
    } catch (error) {
      console.log("Priority cron error:", error.message);
    }
  });
};

module.exports = startPriorityCron;