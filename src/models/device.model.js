const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: [
        "temperature",
        "soil_moisture",
        "humidity",
        "water_level",
        "pump"
      ],
      required: true
    },

    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      default: null
    },

    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline"
    },

    lastReading: {
      type: String,
      default: ""
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Device", deviceSchema);
