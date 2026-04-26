require("dotenv").config();

const path = require("path");
const app = require("./server/src/app");
const connectDB = require("./src/config/db");
const startReminderCron = require("./src/jobs/reminderCron");
const startPriorityCron = require("./src/jobs/priorityCron");

connectDB();

startReminderCron();
startPriorityCron();

const PORT = process.env.PORT || 3600;

app.listen(PORT, () => {
  console.log(`Server is runnig on ${PORT}`);
});