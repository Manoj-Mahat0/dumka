const express = require("express");

const {
  registerFarmer,
  login,
  getMe
} = require("../controllers/auth.controller");

const {
  authenticate
} = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new farmer
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       201:
 *         description: Farmer registered successfully
 */
router.post("/register", registerFarmer);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login admin or farmer
 *     description: Login using email and password. Works for both admin and farmer accounts.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: farmer@test.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account is disabled
 *       500:
 *         description: Login failed
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     description: Returns the currently authenticated admin or farmer.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 *       401:
 *         description: Authentication token required or invalid token
 */
router.get("/me", authenticate, getMe);

module.exports = router;