const express = require("express");

const {
  recommendCrop,
  getCropFeatures
} = require("../controllers/crop.controller");

const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/crops/features:
 *   get:
 *     summary: Get crop model input fields and supported crops
 *     tags:
 *       - Crop Recommendation
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/features",
  authenticate,
  authorize("farmer", "admin"),
  getCropFeatures
);

/**
 * @swagger
 * /api/crops/recommend:
 *   post:
 *     summary: Recommend a crop from soil and weather values
 *     tags:
 *       - Crop Recommendation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - N
 *               - P
 *               - K
 *               - temperature
 *               - humidity
 *               - ph
 *               - rainfall
 *             properties:
 *               N:
 *                 type: number
 *                 example: 90
 *               P:
 *                 type: number
 *                 example: 42
 *               K:
 *                 type: number
 *                 example: 43
 *               temperature:
 *                 type: number
 *                 example: 25
 *               humidity:
 *                 type: number
 *                 example: 86
 *               ph:
 *                 type: number
 *                 example: 6.5
 *               rainfall:
 *                 type: number
 *                 example: 220
 */
router.post(
  "/recommend",
  authenticate,
  authorize("farmer", "admin"),
  recommendCrop
);

module.exports = router;
