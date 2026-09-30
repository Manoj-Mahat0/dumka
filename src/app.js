const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./docs/swagger");
const connectDatabase = require("./config/database");

const authRoutes = require("./routes/auth.routes");
const bannerRoutes = require("./routes/banner.routes");
const broadcastRoutes = require("./routes/broadcast.routes");
const notificationRoutes = require("./routes/notification.routes");
const cropRoutes = require("./routes/crop.routes");
const aiRoutes = require("./routes/ai.routes");
const diseaseRoutes = require("./routes/disease.routes");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

// Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Health
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "KhetiX Smart Farming API is running"
  });
});

// Auth
app.use("/api/auth", authRoutes);

// Admin
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/admin/broadcasts", broadcastRoutes);

// Farmer
app.use("/api/notifications", notificationRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/disease", diseaseRoutes);

module.exports = app;