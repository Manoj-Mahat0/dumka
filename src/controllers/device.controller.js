const Device = require("../models/device.model");

const allowedTypes = [
  "temperature",
  "soil_moisture",
  "humidity",
  "water_level",
  "pump"
];

const createDevice = async (req, res) => {
  try {
    const { name, type, farm, lastReading, status } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Device name is required"
      });
    }

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid device type"
      });
    }

    const device = await Device.create({
      name: String(name).trim(),
      type,
      farm: farm || null,
      lastReading: lastReading || "",
      status: status === "online" ? "online" : "offline",
      createdBy: req.user.id
    });

    const populated = await device.populate("farm", "name location");

    res.status(201).json({
      success: true,
      message: "Device added successfully",
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add device",
      error: error.message
    });
  }
};

const getDevices = async (req, res) => {
  try {
    const devices = await Device.find()
      .populate("farm", "name location")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: devices.length,
      data: devices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch devices"
    });
  }
};

const toggleDeviceStatus = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    device.status = device.status === "online" ? "offline" : "online";
    await device.save();
    await device.populate("farm", "name location");

    res.json({
      success: true,
      message: `Device is now ${device.status}`,
      data: device
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update device"
    });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    res.json({
      success: true,
      message: "Device deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete device"
    });
  }
};

module.exports = {
  createDevice,
  getDevices,
  toggleDeviceStatus,
  deleteDevice
};
