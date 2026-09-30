const express = require("express");

const {
  createBanner,
  getBanners,
  getActiveBanners,
  getBanner,
  updateBanner,
  toggleBannerStatus,
  deleteBanner
} = require("../controllers/banner.controller");

const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/admin/banners:
 *   post:
 *     summary: Create banner
 *     tags:
 *       - Admin Banners
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  createBanner
);

/**
 * @swagger
 * /api/admin/banners:
 *   get:
 *     summary: Get all banners
 *     tags:
 *       - Admin Banners
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/",
  authenticate,
  authorize("admin"),
  getBanners
);

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Get active banners for farmer
 *     tags:
 *       - Banners
 */
router.get(
  "/public",
  authenticate,
  getActiveBanners
);

/**
 * @swagger
 * /api/admin/banners/{id}:
 *   get:
 *     summary: Get banner by ID
 *     tags:
 *       - Admin Banners
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getBanner
);

/**
 * @swagger
 * /api/admin/banners/{id}:
 *   put:
 *     summary: Update banner
 *     tags:
 *       - Admin Banners
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateBanner
);

/**
 * @swagger
 * /api/admin/banners/{id}/status:
 *   patch:
 *     summary: Toggle banner status
 *     tags:
 *       - Admin Banners
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  toggleBannerStatus
);

/**
 * @swagger
 * /api/admin/banners/{id}:
 *   delete:
 *     summary: Delete banner
 *     tags:
 *       - Admin Banners
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteBanner
);

module.exports = router;