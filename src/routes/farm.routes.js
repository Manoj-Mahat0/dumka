const express = require("express");

const {
  createFarm,
  getFarms,
  deleteFarm
} = require("../controllers/farm.controller");

const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, authorize("admin"), getFarms);
router.post("/", authenticate, authorize("admin"), createFarm);
router.delete("/:id", authenticate, authorize("admin"), deleteFarm);

module.exports = router;
