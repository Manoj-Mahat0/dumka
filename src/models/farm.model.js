const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      default: "",
      trim: true
    },

    crop: {
      type: String,
      default: "",
      trim: true
    },

    area: {
      type: Number,
      default: 0
    },

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
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

module.exports = mongoose.model("Farm", farmSchema);
