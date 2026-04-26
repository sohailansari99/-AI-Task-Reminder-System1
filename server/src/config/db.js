const mongoose = require("mongoose");

async function connectDB() {
  try {
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
    console.log("MONGO_URI preview:", process.env.MONGO_URI?.replace(/:\/\/(.*?):(.*?)@/, "://$1:****@"));

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DataBase");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
