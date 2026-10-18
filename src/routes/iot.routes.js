const express = require("express");

const {
  requireDeviceKey,
  postReading,
  getPump,
  getStatus,
  setPump
} = require("../controllers/iot.controller");

const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/reading", requireDeviceKey, postReading);
router.get("/pump", requireDeviceKey, getPump);

router.get(
  "/status",
  authenticate,
  authorize("farmer", "admin"),
  getStatus
);

router.post(
  "/pump",
  authenticate,
  authorize("farmer", "admin"),
  setPump
);

module.exports = router;
