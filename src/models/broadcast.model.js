const mongoose = require("mongoose");

const broadcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true
    },

    image: {
      type: String,
      default: null
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal"
    },

    targetType: {
      type: String,
      enum: ["all", "selected"],
      default: "all"
    },

    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    scheduledAt: {
      type: Date,
      default: null
    },

    sentAt: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["draft", "scheduled", "sent"],
      default: "draft"
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

module.exports = mongoose.model("Broadcast", broadcastSchema);