const Farm = require("../models/farm.model");

const createFarm = async (req, res) => {
  try {
    const { name, location, crop, area, farmer } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Farm name is required"
      });
    }

    const farm = await Farm.create({
      name: String(name).trim(),
      location: location || "",
      crop: crop || "",
      area: area === "" || area == null ? 0 : Number(area),
      farmer: farmer || null,
      createdBy: req.user.id
    });

    const populated = await farm.populate("farmer", "name email");

    res.status(201).json({
      success: true,
      message: "Farm created successfully",
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create farm",
      error: error.message
    });
  }
};

const getFarms = async (req, res) => {
  try {
    const farms = await Farm.find()
      .populate("farmer", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: farms.length,
      data: farms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch farms"
    });
  }
};

const deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findByIdAndDelete(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found"
      });
    }

    res.json({
      success: true,
      message: "Farm deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete farm"
    });
  }
};

module.exports = {
  createFarm,
  getFarms,
  deleteFarm
};
