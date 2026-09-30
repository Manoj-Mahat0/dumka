const {
  predictDisease,
  getModelStatus,
  loadSession
} = require("../services/potatoDisease.service");

const health = async (_req, res) => {
  try {
    const status = getModelStatus();

    if (status.modelAvailable && !status.modelLoaded) {
      await loadSession();
      status.modelLoaded = true;
    }

    res.json({
      success: true,
      message: "Potato disease API is ready",
      data: getModelStatus()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Potato disease model is not ready",
      data: getModelStatus(),
      error: error.message
    });
  }
};

const predict = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Upload an image as form field 'image'"
      });
    }

    const result = await predictDisease(req.file.buffer);

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: "Disease prediction completed",
      data: result.data
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 503 : 500;

    res.status(status).json({
      success: false,
      message: "Prediction failed",
      error: error.message
    });
  }
};

module.exports = {
  health,
  predict
};
