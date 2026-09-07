// Student এর Join, Submit এবং Result দেখার রুট
const express = require("express");
const Exam = require("../models/Exam");
const Attempt = require("../models/Attempt");

const router = express.Router();

// @route  POST /api/attempts/join
// @desc   Student নাম + মোবাইল দিয়ে Exam এ Join করবে (OTP লাগবে না)
router.post("/join", async (req, res) => {
  try {
    const { examLink, studentName, studentMobile } = req.body;

    if (!examLink || !studentName || !studentMobile) {
      return res.status(400).json({ message: "নাম, মোবাইল ও Exam লিংক দেওয়া বাধ্যতামূলক" });
    }

    const exam = await Exam.findOne({ examLink, isActive: true });
    if (!exam) {
      return res.status(404).json({ message: "এই পরীক্ষাটি খুঁজে পাওয়া যায়নি বা বন্ধ আছে" });
    }

    // 🔒 Anti-cheat: আগে থেকেই এই মোবাইল দিয়ে Attempt থাকলে চেক করা হচ্ছে
    const existing = await Attempt.findOne({ exam: exam._id, studentMobile });
    if (existing) {
      if (existing.isSubmitted) {
        return res.status(403).json({
          message: "এই মোবাইল নাম্বার দিয়ে আপনি ইতিমধ্যে পরীক্ষা সাবমিট করে ফেলেছেন। আর জয়েন করা যাবে না।",
        });
      }
      // আগেই শুরু করেছে কিন্তু সাবমিট করেনি (যেমন রিফ্রেশ দিয়েছে) - একই Attempt এ ফিরিয়ে দেওয়া হচ্ছে
      return res.json({
        attemptId: existing._id,
        startedAt: existing.startedAt,
        durationMinutes: exam.durationMinutes,
        examTitle: exam.title,
      });
    }

    const attempt = await Attempt.create({
      exam: exam._id,
      studentName,
      studentMobile,
      totalQuestions: exam.questions.length,
    });

    res.status(201).json({
      attemptId: attempt._id,
      startedAt: attempt.startedAt,
      durationMinutes: exam.durationMinutes,
      examTitle: exam.title,
    });
  } catch (error) {
    // Unique index (exam+mobile) ভায়োলেশন হলে এখানে ধরা পড়বে (race condition safety)
    if (error.code === 11000) {
      return res.status(403).json({ message: "এই মোবাইল নাম্বার দিয়ে ইতিমধ্যে এই পরীক্ষায় জয়েন করা হয়েছে" });
    }
    res.status(500).json({ message: "সার্ভার এরর: " + error.message });
  }
});

// @route  POST /api/attempts/:attemptId/submit
// @desc   Student এর উত্তর সাবমিট করে স্কোর হিসাব করা (Manual অথবা Timer শেষে Auto Submit)
router.post("/:attemptId/submit", async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionNo, selectedOption }]
    const attempt = await Attempt.findById(req.params.attemptId);

    if (!attempt) return res.status(404).json({ message: "Attempt পাওয়া যায়নি" });
    if (attempt.isSubmitted) {
      return res.status(400).json({ message: "এই পরীক্ষা আগেই সাবমিট করা হয়েছে" });
    }

    const exam = await Exam.findById(attempt.exam);
    if (!exam) return res.status(404).json({ message: "Exam পাওয়া যায়নি" });

    // স্কোর হিসাব করা হচ্ছে - সঠিক উত্তরের সাথে মিলিয়ে
    let score = 0;
    const answerMap = {};
    (answers || []).forEach((a) => (answerMap[a.questionNo] = a.selectedOption));

    exam.questions.forEach((q) => {
      if (answerMap[q.questionNo] === q.correctAnswer) score += 1;
    });

    attempt.answers = exam.questions.map((q) => ({
      questionNo: q.questionNo,
      selectedOption: answerMap[q.questionNo] || null,
    }));
    attempt.score = score;
    attempt.isSubmitted = true;
    attempt.submittedAt = new Date();
    attempt.timeTakenSeconds = Math.max(
      0,
      Math.floor((attempt.submittedAt - attempt.startedAt) / 1000)
    );

    await attempt.save();

    res.json({
      message: "সফলভাবে সাবমিট হয়েছে",
      score,
      totalQuestions: attempt.totalQuestions,
      attemptId: attempt._id,
    });
  } catch (error) {
    res.status(500).json({ message: "সার্ভার এরর: " + error.message });
  }
});

// @route  GET /api/attempts/:attemptId/result
// @desc   সাবমিট এর পর Result + সঠিক উত্তর সহ পুরো তথ্য দেখা (Answer Lock: submit না করলে দেখা যাবে না)
router.get("/:attemptId/result", async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt পাওয়া যায়নি" });

    if (!attempt.isSubmitted) {
      return res.status(403).json({ message: "সাবমিট করার আগে উত্তর/রেজাল্ট দেখা যাবে না" });
    }

    const exam = await Exam.findById(attempt.exam);

    res.json({
      examTitle: exam.title,
      studentName: attempt.studentName,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      timeTakenSeconds: attempt.timeTakenSeconds,
      questions: exam.questions, // এখন উত্তর সহ পাঠানো নিরাপদ, যেহেতু সাবমিট হয়ে গেছে
      answers: attempt.answers,
    });
  } catch (error) {
    res.status(500).json({ message: "সার্ভার এরর: " + error.message });
  }
});

// @route  GET /api/attempts/exam/:attemptId/questions
// @desc   পরীক্ষা চলাকালীন প্রশ্ন গুলো আনা (উত্তর ছাড়া) - Answer Lock নিশ্চিত করার জন্য
router.get("/exam/:attemptId/questions", async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt পাওয়া যায়নি" });
    if (attempt.isSubmitted) {
      return res.status(403).json({ message: "এই পরীক্ষা ইতিমধ্যে সাবমিট করা হয়ে গেছে" });
    }

    const exam = await Exam.findById(attempt.exam).select("-questions.correctAnswer");
    res.json({ examTitle: exam.title, questions: exam.questions, startedAt: attempt.startedAt });
  } catch (error) {
    res.status(500).json({ message: "সার্ভার এরর: " + error.message });
  }
});

module.exports = router;
