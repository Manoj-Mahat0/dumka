const User = require("../models/user.model");

const getFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: "farmer" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: farmers.length,
      data: farmers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch farmers"
    });
  }
};

const toggleFarmerStatus = async (req, res) => {
  try {
    const farmer = await User.findOne({
      _id: req.params.id,
      role: "farmer"
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found"
      });
    }

    farmer.isActive = !farmer.isActive;
    await farmer.save();

    res.json({
      success: true,
      message: `Farmer ${farmer.isActive ? "enabled" : "disabled"} successfully`,
      data: farmer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update farmer"
    });
  }
};

module.exports = {
  getFarmers,
  toggleFarmerStatus
};
