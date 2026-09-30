const express = require("express");

const {
  createBroadcast,
  getBroadcasts,
  sendBroadcast,
  deleteBroadcast
} = require("../controllers/broadcast.controller");

const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/admin/broadcasts:
 *   post:
 *     summary: Create broadcast
 *     tags:
 *       - Admin Broadcast
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  createBroadcast
);

/**
 * @swagger
 * /api/admin/broadcasts:
 *   get:
 *     summary: Get broadcast history
 *     tags:
 *       - Admin Broadcast
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/",
  authenticate,
  authorize("admin"),
  getBroadcasts
);

/**
 * @swagger
 * /api/admin/broadcasts/{id}/send:
 *   post:
 *     summary: Send broadcast to farmers
 *     tags:
 *       - Admin Broadcast
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/:id/send",
  authenticate,
  authorize("admin"),
  sendBroadcast
);

/**
 * @swagger
 * /api/admin/broadcasts/{id}:
 *   delete:
 *     summary: Delete broadcast
 *     tags:
 *       - Admin Broadcast
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteBroadcast
);

module.exports = router;