const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reminders", reminderRoutes);

// serve frontend
app.use(express.static(path.join(__dirname, "../../client")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/index.html"));
});

module.exports = app;