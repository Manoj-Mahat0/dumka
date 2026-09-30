const express = require("express");
const multer = require("multer");

const {
  health,
  predict
} = require("../controllers/disease.controller");

const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

/**
 * @swagger
 * /api/disease/health:
 *   get:
 *     summary: Check potato disease model status
 *     tags:
 *       - Disease Detection
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/health",
  authenticate,
  authorize("farmer", "admin"),
  health
);

/**
 * @swagger
 * /api/disease/predict:
 *   post:
 *     summary: Predict potato leaf disease from image
 *     tags:
 *       - Disease Detection
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/predict",
  authenticate,
  authorize("farmer", "admin"),
  upload.single("image"),
  predict
);

module.exports = router;
