const express = require('express');
const connectDB = require('./config/db');
const cors = require("cors"); 

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

connectDB();

const app = express();

app.use(cors({
  origin: "http://127.0.0.1:5500"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Task Reminder API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reminders", reminderRoutes);

module.exports = app;