const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendReminderEmail = async ({ to, subject, text }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "AI Reminder <onboarding@resend.dev>",
      to,
      subject,
      text
    });

    if (error) {
      return {
        success: false,
        error: error.message || JSON.stringify(error)
      };
    }

    return {
      success: true,
      info: data
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