const mongoose = require("mongoose");

let connecting;

const connectDatabase = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!connecting) {
    connecting = mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log("MongoDB Atlas connected successfully");
      })
      .catch((error) => {
        connecting = null;
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
      });
  }

  return connecting;
};

module.exports = connectDatabase;