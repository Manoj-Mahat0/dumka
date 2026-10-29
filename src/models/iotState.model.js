const mongoose = require("mongoose");

const iotStateSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    temperature: {
      type: Number,
      default: null
    },

    humidity: {
      type: Number,
      default: null
    },

    gas: {
      type: Number,
      default: null
    },

    soilDry: {
      type: Boolean,
      default: null
    },

    fireDetected: {
      type: Boolean,
      default: null
    },

    irDetected: {
      type: Boolean,
      default: null
    },

    pumpOn: {
      type: Boolean,
      default: false
    },

    lastSeen: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("IotState", iotStateSchema);
