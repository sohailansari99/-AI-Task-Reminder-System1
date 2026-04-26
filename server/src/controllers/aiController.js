const { processAIMessage } = require("../services/aiService");

//chatWithAI function to handle incoming messages from the user, process them using the AI service, and return the appropriate response. It checks if the message is valid, calls the processAIMessage function, and sends back the AI's reply along with any tasks that were created. If there's an error during processing, it catches it and returns a 500 status with the error message.

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