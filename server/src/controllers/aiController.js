const { processAIMessage } = require("../services/aiService");

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const result = await processAIMessage(message);

    return res.status(200).json({
      success: true,
      type: result.type,
      reply: result.reply,
      tasks: result.tasks
    });
  } catch (error) {
    console.log("AI Controller Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { chatWithAI };