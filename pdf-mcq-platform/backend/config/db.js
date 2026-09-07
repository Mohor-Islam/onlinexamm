// MongoDB এর সাথে কানেকশন তৈরি করার ফাইল
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // .env থেকে MONGO_URI নিয়ে কানেক্ট করছি
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // কানেকশন ফেইল করলে সার্ভার বন্ধ করে দিচ্ছি
  }
};

module.exports = connectDB;
