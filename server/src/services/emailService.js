// emailService.js for sending reminder emails to users when their tasks are due. It uses nodemailer to send emails through a Gmail account. The sendReminderEmail function takes an object with to, subject, and text properties and sends an email accordingly. It returns an object indicating whether the email was sent successfully or if there was an error.
const nodemailer = require("nodemailer");

// Create a transporter using Gmail service and authentication from environment variables

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

//send reminder email to the user when their task is due, with the task details in the email body

const sendReminderEmail = async ({ to, subject, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });

    return {
      success: true,
      info
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendReminderEmail
};