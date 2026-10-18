const IotState = require("../models/iotState.model");

const DEFAULT_DEVICE_ID = "khetix-esp01";
const ONLINE_WINDOW_MS = 20000;

const deviceIdFrom = (value) => {
  const id = String(value || DEFAULT_DEVICE_ID).trim();
  return id || DEFAULT_DEVICE_ID;
};

const gasLevel = (gas) => {
  if (gas == null || Number.isNaN(Number(gas))) return "unknown";
  if (gas < 300) return "low";
  if (gas < 700) return "medium";
  return "high";
};

const isOnline = (state) => {
  if (!state?.lastSeen) return false;
  return Date.now() - new Date(state.lastSeen).getTime() < ONLINE_WINDOW_MS;
};

const present = (state) => ({
  deviceId: state?.deviceId || DEFAULT_DEVICE_ID,
  online: isOnline(state),
  temperature: state?.temperature ?? null,
  humidity: state?.humidity ?? null,
  gas: state?.gas ?? null,
  gasLevel: gasLevel(state?.gas),
  pumpOn: Boolean(state?.pumpOn),
  lastSeen: state?.lastSeen || null
});

const requireDeviceKey = (req, res, next) => {
  const expected = process.env.IOT_DEVICE_KEY || "khetix-iot-key";
  const received = req.headers["x-device-key"];

  if (!received || received !== expected) {
    return res.status(401).json({
      success: false,
      message: "Invalid device key"
    });
  }

  next();
};

const postReading = async (req, res) => {
  try {
    const deviceId = deviceIdFrom(req.body.deviceId);
    const temperature = Number(req.body.temperature);
    const humidity = Number(req.body.humidity);
    const gas = Number(req.body.gas);

    const update = {
      lastSeen: new Date()
    };

    if (Number.isFinite(temperature)) update.temperature = temperature;
    if (Number.isFinite(humidity)) update.humidity = humidity;
    if (Number.isFinite(gas)) update.gas = gas;

    const state = await IotState.findOneAndUpdate(
      { deviceId },
      {
        $set: update,
        $setOnInsert: { deviceId, pumpOn: false }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Reading saved",
      data: present(state)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save reading"
    });
  }
};

const getPump = async (req, res) => {
  try {
    const deviceId = deviceIdFrom(req.query.deviceId);
    const state = await IotState.findOneAndUpdate(
      { deviceId },
      {
        $set: { lastSeen: new Date() },
        $setOnInsert: { deviceId, pumpOn: false }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      deviceId,
      pumpOn: Boolean(state.pumpOn)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to read pump command"
    });
  }
};

const getStatus = async (req, res) => {
  try {
    const deviceId = deviceIdFrom(req.query.deviceId);
    const state = await IotState.findOne({ deviceId });

    res.json({
      success: true,
      data: present(state)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch device status"
    });
  }
};

const setPump = async (req, res) => {
  try {
    const deviceId = deviceIdFrom(req.body.deviceId);
    const pumpOn = req.body.pumpOn === true || req.body.pumpOn === "true";

    const state = await IotState.findOneAndUpdate(
      { deviceId },
      {
        $set: { pumpOn, deviceId },
        $setOnInsert: { temperature: null, humidity: null, gas: null }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: pumpOn ? "Pump turned on" : "Pump turned off",
      data: present(state)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update pump"
    });
  }
};

module.exports = {
  requireDeviceKey,
  postReading,
  getPump,
  getStatus,
  setPump
};
