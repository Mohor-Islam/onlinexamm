// Teacher Register ও Login এর রুট (Email + Password + JWT)
const express = require("express");
const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");

const router = express.Router();

// টোকেন জেনারেট করার হেল্পার ফাংশন
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @route  POST /api/auth/register
// @desc   নতুন Teacher একাউন্ট তৈরি
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "নাম, ইমেইল ও পাসওয়ার্ড দেওয়া বাধ্যতামূলক" });
    }

    const existing = await Teacher.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "এই ইমেইল দিয়ে আগেই একাউন্ট আছে" });
    }

    const teacher = await Teacher.create({ name, email, password });

    res.status(201).json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      token: generateToken(teacher._id),
    });
  } catch (error) {
    res.status(500).json({ message: "সার্ভার এরর: " + error.message });
  }
});

// @route  POST /api/auth/login
// @desc   Teacher লগইন
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });

    if (teacher && (await teacher.matchPassword(password))) {
      return res.json({
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        token: generateToken(teacher._id),
      });
    }

    res.status(401).json({ message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়" });
  } catch (error) {
    res.status(500).json({ message: "সার্ভার এরর: " + error.message });
  }
});

module.exports = router;
