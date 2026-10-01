const express = require("express");

const {
  getFarmers,
  toggleFarmerStatus
} = require("../controllers/farmer.controller");

const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, authorize("admin"), getFarmers);

router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  toggleFarmerStatus
);

module.exports = router;
