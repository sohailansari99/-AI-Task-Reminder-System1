const cron = require("node-cron");
const Task = require("../models/task");
const User = require("../models/users");
const ReminderLog = require("../models/reminderlogs");
const { sendReminderEmail } = require("../services/emailService");

const startReminderCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      console.log("Reminder cron running at:", now.toISOString());

      const dueTasks = await Task.find({
        dueDate: { $lte: now },
        status: "pending",
        reminderSent: false
      });

      console.log("Due tasks found:", dueTasks.length);

      for (const task of dueTasks) {
        console.log("Processing task:", task.title, task._id);

        // find the correct owner of the task
        const user = await User.findById(task.userId);

        if (!user) {
          console.log("User not found for task:", task._id);
          continue;
        }

        // send email to that user's own email
        if (task.reminderChannels.includes("email")) {
          const emailResult = await sendReminderEmail({
            to: user.email,
            subject: `Reminder: ${task.title}`,
            text: `Hello ${user.name},

This is your reminder for task: ${task.title}

Description: ${task.description}
Due Date: ${new Date(task.dueDate).toLocaleString()}

- AI Task Reminder`
          });

          console.log("Email result:", emailResult);

          await ReminderLog.create({
            userId: user._id,
            taskId: task._id,
            channel: "email",
            status: emailResult.success ? "sent" : "failed",
            message: emailResult.success
              ? "Reminder email sent successfully"
              : emailResult.error
          });
        }

        if (task.reminderChannels.includes("browser")) {
          await ReminderLog.create({
            userId: user._id,
            taskId: task._id,
            channel: "browser",
            status: "sent",
            message: "Browser reminder is ready to be fetched by frontend"
          });
        }

        task.reminderSent = true;
        await task.save();
        console.log("Task marked reminderSent=true:", task._id);
      }
    } catch (error) {
      console.log("Reminder cron error:", error.message);
    }
  });
};

module.exports = startReminderCron;