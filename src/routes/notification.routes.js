const express = require("express");

const Notification = require("../models/notification.model");

const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get farmer notifications
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/",
  authenticate,
  authorize("farmer"),
  async (req, res) => {
    try {
      const notifications = await Notification.find({
        userId: req.user.id
      })
        .sort({ createdAt: -1 })
        .populate("broadcastId");

      const unreadCount = await Notification.countDocuments({
        userId: req.user.id,
        isRead: false
      });

      res.json({
        success: true,
        unreadCount,
        count: notifications.length,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch notifications"
      });
    }
  }
);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/read-all",
  authenticate,
  authorize("farmer"),
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          userId: req.user.id,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      res.json({
        success: true,
        message: "All notifications marked as read"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update notifications"
      });
    }
  }
);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id/read",
  authenticate,
  authorize("farmer"),
  async (req, res) => {
    try {
      const notification =
        await Notification.findOneAndUpdate(
          {
            _id: req.params.id,
            userId: req.user.id
          },
          {
            isRead: true,
            readAt: new Date()
          },
          {
            new: true
          }
        );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found"
        });
      }

      res.json({
        success: true,
        message: "Notification marked as read",
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update notification"
      });
    }
  }
);

module.exports = router;