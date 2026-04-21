const axios = require("axios");

const getTomorrowAtHour = (hour = 9, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const getDateAfterDays = (days, hour = 9, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const detectCategory = (message) => {
  const text = message.toLowerCase();

  if (
    text.includes("study") ||
    text.includes("exam") ||
    text.includes("revision") ||
    text.includes("assignment") ||
    text.includes("dbms") ||
    text.includes("ai") ||
    text.includes("os") ||
    text.includes("java")
  ) {
    return "study";
  }

  if (
    text.includes("meeting") ||
    text.includes("office") ||
    text.includes("project") ||
    text.includes("work")
  ) {
    return "work";
  }

  if (
    text.includes("gym") ||
    text.includes("health") ||
    text.includes("medicine") ||
    text.includes("walk")
  ) {
    return "health";
  }

  return "other";
};

const extractTime12Hour = (message) => {
  const text = message.toLowerCase();
  const match = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);

  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const meridian = match[3];

  if (meridian === "pm" && hour !== 12) hour += 12;
  if (meridian === "am" && hour === 12) hour = 0;

  return { hour, minute };
};

const extractTime24Hour = (message) => {
  const match = message.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (!match) return null;

  return {
    hour: parseInt(match[1], 10),
    minute: parseInt(match[2], 10)
  };
};

const extractDate = (message) => {
  const lower = message.toLowerCase();

  const fullDateMatch = message.match(/\b(\d{2})-(\d{2})-(\d{4})\b/);
  if (fullDateMatch) {
    const day = parseInt(fullDateMatch[1], 10);
    const month = parseInt(fullDateMatch[2], 10) - 1;
    const year = parseInt(fullDateMatch[3], 10);

    return new Date(year, month, day);
  }

  if (lower.includes("tomorrow")) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }

  if (lower.includes("today")) {
    return new Date();
  }

  const afterDaysMatch = lower.match(/after\s+(\d+)\s+days?/);
  if (afterDaysMatch) {
    const days = parseInt(afterDaysMatch[1], 10);
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  return null;
};

const extractTaskTitle = (message) => {
  const forMatch = message.match(/\bfor\s+(.+)/i);
  if (forMatch && forMatch[1]) {
    return forMatch[1].trim();
  }

  const remindMatch = message.match(/remind me(?: to)? (.+)/i);
  if (remindMatch && remindMatch[1]) {
    return remindMatch[1].trim();
  }

  return "General Reminder";
};

const buildExactReminderDate = (message) => {
  const baseDate = extractDate(message) || new Date();
  const time24 = extractTime24Hour(message);
  const time12 = extractTime12Hour(message);
  const time = time24 || time12 || { hour: 9, minute: 0 };

  baseDate.setHours(time.hour, time.minute, 0, 0);
  return baseDate;
};

const createSingleReminderTask = (message) => {
  const dueDate = buildExactReminderDate(message);
  const title = extractTaskTitle(message);

  return [
    {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      description: message,
      dueDate,
      category: detectCategory(message),
      reminderChannels: ["email", "browser"],
      aiGenerated: true
    }
  ];
};

const createStudyPlanTasks = (message) => {
  const lower = message.toLowerCase();
  const time24 = extractTime24Hour(message);
  const time12 = extractTime12Hour(message);
  const time = time24 || time12 || { hour: 9, minute: 0 };

  let days = 3;
  const dayMatch = lower.match(/(\d+)\s*day/);
  if (dayMatch) {
    days = parseInt(dayMatch[1], 10);
  }

  let topic = "Study Plan";
  if (lower.includes("ai")) topic = "AI";
  else if (lower.includes("dbms")) topic = "DBMS";
  else if (lower.includes("os")) topic = "Operating System";
  else if (lower.includes("java")) topic = "Java";
  else if (lower.includes("math")) topic = "Mathematics";

  const tasks = [];

  for (let i = 1; i <= days; i++) {
    tasks.push({
      title: `${topic} - Day ${i} Study Session`,
      description: `AI-generated ${days}-day study plan for ${topic}`,
      dueDate: getDateAfterDays(i, time.hour, time.minute),
      category: "study",
      reminderChannels: ["email", "browser"],
      aiGenerated: true
    });
  }

  return tasks;
};

const askOpenRouter = async (message) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant for a task reminder and task management app. Give short, clear and useful answers."
          },
          {
            role: "user",
            content: message
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.log("OpenRouter Error:", error.response?.data || error.message);
    throw new Error("Failed to get AI response");
  }
};

const processAIMessage = async (message) => {
  const lower = message.toLowerCase();

  if (lower.includes("plan")) {
    const tasks = createStudyPlanTasks(message);
    return {
      type: "plan",
      reply: `I created a study plan with ${tasks.length} task(s) for you.`,
      tasks
    };
  }

  if (
    lower.includes("remind") ||
    lower.includes("reminder") ||
    lower.includes("set a reminder") ||
    lower.includes("set reminder")
  ) {
    const tasks = createSingleReminderTask(message);
    return {
      type: "reminder",
      reply:
        "I created your reminder task and it will be sent to your registered email at the scheduled time.",
      tasks
    };
  }

  const aiReply = await askOpenRouter(message);

  return {
    type: "general",
    reply: aiReply,
    tasks: []
  };
};

module.exports = {
  processAIMessage,
  askOpenRouter
};