const express = require("express");

const {
  createDevice,
  getDevices,
  toggleDeviceStatus,
  deleteDevice
} = require("../controllers/device.controller");

const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, authorize("admin"), getDevices);
router.post("/", authenticate, authorize("admin"), createDevice);

router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  toggleDeviceStatus
);

router.delete("/:id", authenticate, authorize("admin"), deleteDevice);

module.exports = router;
