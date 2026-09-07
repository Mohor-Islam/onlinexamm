// Exam তৈরি (PDF আপলোড সহ), Exam লিস্ট দেখা, এবং লিংক দিয়ে Exam বের করার রুট
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { nanoid } = require("nanoid");
const Exam = require("../models/Exam");
const { protectTeacher } = require("../middleware/auth");
const { parsePdfToQuestions } = require("../utils/pdfParser");

const router = express.Router();

// PDF ফাইল রাখার ফোল্ডার তৈরি (না থাকলে)
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer কনফিগ - শুধু PDF ফাইল আপলোড হবে, মেমোরিতে রাখা হবে (parse করার জন্য) + ডিস্কেও সেভ হবে
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("শুধুমাত্র PDF ফাইল আপলোড করা যাবে"));
    }
    cb(null, true);
  },
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

// @route  POST /api/exams
// @desc   PDF আপলোড করে অটো-পার্স করে নতুন Exam তৈরি করা (Teacher only)
router.post("/", protectTeacher, upload.single("pdf"), async (req, res) => {
  try {
    const { title, durationMinutes } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "PDF ফাইল আপলোড করা বাধ্যতামূলক" });
    }
    if (!title || !durationMinutes) {
      return res.status(400).json({ message: "পরীক্ষার নাম ও সময় (মিনিট) দেওয়া বাধ্যতামূলক" });
    }

    // PDF ফাইল পড়ে buffer বানিয়ে parser এ পাঠানো হচ্ছে
    const fileBuffer = fs.readFileSync(req.file.path);
    const questions = await parsePdfToQuestions(fileBuffer);

    // ইউনিক শেয়ারেবল লিংক (slug) তৈরি
    const examLink = nanoid(8);

    const exam = await Exam.create({
      title,
      durationMinutes: Number(durationMinutes),
      teacher: req.teacher._id,
      questions,
      examLink,
      answerKeyPdfPath: `/uploads/${req.file.filename}`,
    });

    res.status(201).json({
      message: `PDF থেকে ${questions.length} টি প্রশ্ন সফলভাবে পার্স হয়েছে`,
      exam,
      shareableLink: `${process.env.CLIENT_URL}/exam/${examLink}`,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route  GET /api/exams
// @desc   লগইন করা Teacher এর সব Exam এর লিস্ট
router.get("/", protectTeacher, async (req, res) => {
  const exams = await Exam.find({ teacher: req.teacher._id })
    .select("-questions.correctAnswer") // লিস্ট ভিউতে উত্তর পাঠানোর দরকার নেই
    .sort({ createdAt: -1 });
  res.json(exams);
});

// @route  GET /api/exams/manage/:id
// @desc   Teacher নিজের একটা Exam এর পূর্ণ বিবরণ দেখবে (উত্তর সহ)
router.get("/manage/:id", protectTeacher, async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.id, teacher: req.teacher._id });
  if (!exam) return res.status(404).json({ message: "Exam পাওয়া যায়নি" });
  res.json(exam);
});

// @route  GET /api/exams/link/:examLink
// @desc   Student এর জন্য - লিংক দিয়ে Exam এর তথ্য বের করা (উত্তর ছাড়া!)
router.get("/link/:examLink", async (req, res) => {
  const exam = await Exam.findOne({ examLink: req.params.examLink, isActive: true }).select(
    "-questions.correctAnswer -answerKeyPdfPath"
  );

  if (!exam) {
    return res.status(404).json({ message: "এই লিংকে কোনো পরীক্ষা পাওয়া যায়নি বা বন্ধ করা হয়েছে" });
  }
  res.json(exam);
});

module.exports = router;
