const { chatWithGroq } = require("../services/groq.service");

const chat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const result = await chatWithGroq({
      message,
      history
    });

    res.json({
      success: true,
      message: "AI response generated",
      data: result
    });
  } catch (error) {
    const status = error.message.includes("GROQ_API_KEY") ? 503 : 500;

    res.status(status).json({
      success: false,
      message: "Failed to get AI response",
      error: error.message
    });
  }
};

module.exports = {
  chat
};
