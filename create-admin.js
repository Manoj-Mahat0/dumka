require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/models/user.model");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await User.findOne({
      email: "admin@khetix.com"
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123456",
      12
    );

    const admin = await User.create({
      name: "KhetiX Admin",
      email: "admin@khetix.com",
      password: hashedPassword,
      role: "admin",
      isActive: true
    });

    console.log("=================================");
    console.log("KhetiX Admin Created");
    console.log("=================================");
    console.log("Email    :", admin.email);
    console.log("Password : Admin@123456");
    console.log("Role     :", admin.role);
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
};

createAdmin();