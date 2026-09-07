// মূল Express Server ফাইল
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

const app = express();

// ডাটাবেজ কানেক্ট করা হচ্ছে
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // Vercel এর frontend URL থেকে রিকোয়েস্ট এলাউ করার জন্য
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// আপলোড করা PDF ফাইল গুলো (Answer Key) স্ট্যাটিকভাবে সার্ভ করা হচ্ছে
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API রুট গুলো
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Health check (Render এ deploy status বোঝার জন্য কাজে লাগবে)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MCQ Platform API চলছে ✅" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "রুট খুঁজে পাওয়া যায়নি" });
});

// Global Error Handler (Multer এর error সহ)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "সার্ভারে একটি সমস্যা হয়েছে" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server চলছে http://localhost:${PORT} এ`);
});
