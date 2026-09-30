const Broadcast = require("../models/broadcast.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");

const deliverBroadcast = async (broadcast) => {
  let users = [];

  if (broadcast.targetType === "all") {
    users = await User.find({
      role: "farmer",
      isActive: true
    }).select("_id");
  } else {
    users = await User.find({
      _id: { $in: broadcast.targetUsers },
      role: "farmer",
      isActive: true
    }).select("_id");
  }

  if (users.length === 0) {
    return {
      ok: false,
      message: "No active farmers found"
    };
  }

  const notifications = users.map((user) => ({
    userId: user._id,
    broadcastId: broadcast._id,
    title: broadcast.title,
    message: broadcast.message,
    image: broadcast.image,
    priority: broadcast.priority
  }));

  await Notification.insertMany(notifications);

  broadcast.status = "sent";
  broadcast.sentAt = new Date();
  await broadcast.save();

  return {
    ok: true,
    recipients: users.length,
    broadcast
  };
};

// CREATE BROADCAST
const createBroadcast = async (req, res) => {
  try {
    const {
      title,
      message,
      image,
      priority,
      targetType,
      targetUsers,
      scheduledAt,
      sendNow
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    const broadcast = await Broadcast.create({
      title,
      message,
      image,
      priority: priority || "normal",
      targetType: targetType || "all",
      targetUsers: targetUsers || [],
      scheduledAt,
      status: scheduledAt ? "scheduled" : "draft",
      createdBy: req.user.id
    });

    if (sendNow) {
      const result = await deliverBroadcast(broadcast);

      if (!result.ok) {
        return res.status(400).json({
          success: false,
          message: result.message,
          data: broadcast
        });
      }

      return res.status(201).json({
        success: true,
        message: "Notification sent to all farmers",
        recipients: result.recipients,
        data: result.broadcast
      });
    }

    res.status(201).json({
      success: true,
      message: "Broadcast created successfully",
      data: broadcast
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create broadcast",
      error: error.message
    });
  }
};

// GET BROADCASTS
const getBroadcasts = async (req, res) => {
  try {
    const broadcasts = await Broadcast.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    res.json({
      success: true,
      count: broadcasts.length,
      data: broadcasts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch broadcasts"
    });
  }
};

// SEND BROADCAST
const sendBroadcast = async (req, res) => {
  try {
    const broadcast = await Broadcast.findById(
      req.params.id
    );

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Broadcast not found"
      });
    }

    if (broadcast.status === "sent") {
      return res.status(400).json({
        success: false,
        message: "Broadcast already sent"
      });
    }

    const result = await deliverBroadcast(broadcast);

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: "Broadcast sent successfully",
      recipients: result.recipients,
      data: result.broadcast
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send broadcast",
      error: error.message
    });
  }
};

// DELETE
const deleteBroadcast = async (req, res) => {
  try {
    const broadcast = await Broadcast.findByIdAndDelete(
      req.params.id
    );

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Broadcast not found"
      });
    }

    await Notification.deleteMany({
      broadcastId: broadcast._id
    });

    res.json({
      success: true,
      message: "Broadcast deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete broadcast"
    });
  }
};

module.exports = {
  createBroadcast,
  getBroadcasts,
  sendBroadcast,
  deleteBroadcast
};