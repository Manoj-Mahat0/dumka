require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("======================================");
    console.log("       KhetiX Smart Farming API       ");
    console.log("======================================");
    console.log(`Server  : http://localhost:${PORT}`);
    console.log(`Network : http://192.168.1.6:${PORT}`);
    console.log(`Swagger : http://192.168.1.6:${PORT}/api-docs`);
    console.log("======================================");
    console.log("");
  });
};

startServer();