// Leaderboard দেখা এবং PDF ডাউনলোড করার রুট
const express = require("express");
const Exam = require("../models/Exam");
const Attempt = require("../models/Attempt");
const { protectTeacher } = require("../middleware/auth");
const { generateLeaderboardPdf, generateResultPdf } = require("../utils/pdfGenerator");

const router = express.Router();

// Attempt গুলোকে Rank (Score বেশি -> Time কম) অনুযায়ী সাজানোর হেল্পার
async function getSortedAttempts(examId) {
  return Attempt.find({ exam: examId, isSubmitted: true })
    .sort({ score: -1, timeTakenSeconds: 1 })
    .select("studentName studentMobile score timeTakenSeconds");
}

// @route  GET /api/leaderboard/:examLink
// @desc   Public Leaderboard - Submit করার পর যে কেউ দেখতে পারবে (লিংক দিয়ে)
router.get("/:examLink", async (req, res) => {
  const exam = await Exam.findOne({ examLink: req.params.examLink });
  if (!exam) return res.status(404).json({ message: "Exam পাওয়া যায়নি" });

  const attempts = await getSortedAttempts(exam._id);
  const leaderboard = attempts.map((a, idx) => ({
    rank: idx + 1,
    name: a.studentName,
    mobile: a.studentMobile,
    score: a.score,
    timeTakenSeconds: a.timeTakenSeconds,
  }));

  res.json({ examTitle: exam.title, leaderboard });
});

// @route  GET /api/leaderboard/:examLink/pdf
// @desc   Leaderboard PDF আকারে ডাউনলোড (Public - সবাই ডাউনলোড করতে পারবে)
router.get("/:examLink/pdf", async (req, res) => {
  const exam = await Exam.findOne({ examLink: req.params.examLink });
  if (!exam) return res.status(404).json({ message: "Exam পাওয়া যায়নি" });

  const attempts = await getSortedAttempts(exam._id);
  generateLeaderboardPdf(res, exam.title, attempts);
});

// @route  GET /api/leaderboard/manage/:examId/pdf
// @desc   Teacher Dashboard থেকে Leaderboard PDF ডাউনলোড (Protected)
router.get("/manage/:examId/pdf", protectTeacher, async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.examId, teacher: req.teacher._id });
  if (!exam) return res.status(404).json({ message: "Exam পাওয়া যায়নি" });

  const attempts = await getSortedAttempts(exam._id);
  generateLeaderboardPdf(res, exam.title, attempts);
});

// @route  GET /api/leaderboard/result-pdf/:attemptId
// @desc   Student এর নিজের Result + Answer Key PDF ডাউনলোড (সাবমিট করার পর)
router.get("/result-pdf/:attemptId", async (req, res) => {
  const attempt = await Attempt.findById(req.params.attemptId);
  if (!attempt || !attempt.isSubmitted) {
    return res.status(403).json({ message: "সাবমিট করার আগে Result PDF ডাউনলোড করা যাবে না" });
  }
  const exam = await Exam.findById(attempt.exam);
  generateResultPdf(res, exam, attempt);
});

module.exports = router;
