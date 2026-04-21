const ChatHistory = require("../models/chathistory");
const Task = require("../models/task");
const { processAIMessage } = require("../services/aiService");

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
    "viva",
    "study"
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

const isGreetingMessage = (message) => {
  const text = message.trim().toLowerCase();
  return [
    "hi",
    "hello",
    "hey",
    "hii",
    "helo",
    "hy",
    "good morning",
    "good evening",
    "good afternoon"
  ].includes(text);
};

const isCreatorQuestion = (message) => {
  const text = message.trim().toLowerCase();
  return (
    text.includes("who created you") ||
    text.includes("who made you") ||
    text.includes("who built you") ||
    text.includes("who is your creator") ||
    text.includes("who developed you")
  );
};

const sendMessageToAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    let aiReply = "";
    let createdTasks = [];

    if (isGreetingMessage(message)) {
      aiReply = `Hey ${req.user.name} 👋 Welcome back! I'm here to help you create tasks, reminders, and study plans more easily. You can say things like "set a reminder 20-04-2026 time 23:58 for AI study" or "make a 3 day study plan for DBMS".`;
    } else if (isCreatorQuestion(message)) {
      aiReply = `Hey ${req.user.name} 😊 I was created by Sohail Ansari and Hanuman Yadav 🚀 They built me to help users create tasks, reminders, and study plans more easily. Let’s make your work smarter and easier 💡`;
    } else {
      const result = await processAIMessage(message);

      for (const taskData of result.tasks) {
        const aiPriority = calculateAIPriority({
          ...taskData,
          status: "pending"
        });

        const taskPayload = {
          userId: req.user._id,
          title: taskData.title,
          description: taskData.description || "",
          dueDate: taskData.dueDate,
          category: taskData.category || "other",
          reminderChannels:
            Array.isArray(taskData.reminderChannels) &&
            taskData.reminderChannels.length
              ? taskData.reminderChannels
              : ["email"],
          aiGenerated: true,
          status: "pending",
          reminderSent: false,
          aiPriority
        };

        const task = await Task.create(taskPayload);
        createdTasks.push(task);
      }

      aiReply = result.reply;

      if (createdTasks.length > 0) {
        aiReply += " Reminder email will be sent to your registered email address.";
      }
    }

    const chat = await ChatHistory.create({
      userId: req.user._id,
      message,
      response: aiReply
    });

    res.status(200).json({
      success: true,
      message: "AI response generated successfully",
      aiReply,
      chat,
      createdTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process AI message",
      error: error.message
    });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const chats = await ChatHistory.find({ userId: req.user._id }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error.message
    });
  }
};

const clearChatHistory = async (req, res) => {
  try {
    await ChatHistory.deleteMany({ userId: req.user._id });

    res.status(200).json({
      success: true,
      message: "Chat history cleared successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear chat history",
      error: error.message
    });
  }
};

module.exports = {
  sendMessageToAI,
  getChatHistory,
  clearChatHistory
};