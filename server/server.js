require("dotenv").config();

const app = require("./server/src/app");
const connectDB = require("./server/src/config/db");
const startReminderCron = require("./server/src/jobs/reminderCron");
const startPriorityCron = require("./server/src/jobs/priorityCron");

connectDB();

startReminderCron();
startPriorityCron();

const PORT = process.env.PORT || 3600;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});