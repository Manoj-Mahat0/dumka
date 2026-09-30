const { predictCrop, loadFeatures } = require("../services/cropPrediction.service");

const recommendCrop = async (req, res) => {
  try {
    const result = await predictCrop(req.body);

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: "Crop recommendation generated",
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to recommend crop",
      error: error.message
    });
  }
};

const getCropFeatures = (req, res) => {
  try {
    const features = loadFeatures();

    res.json({
      success: true,
      data: {
        columns: features.columns,
        fieldInfo: features.field_info || {},
        crops: features.class_labels
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load crop model metadata"
    });
  }
};

module.exports = {
  recommendCrop,
  getCropFeatures
};
