// Exam (পরীক্ষা) এর Schema - প্রতিটি প্রশ্ন এখানে embedded document হিসেবে থাকবে
const mongoose = require("mongoose");

// একটা প্রশ্নের গঠন
const questionSchema = new mongoose.Schema(
  {
    questionNo: { type: Number, required: true },
    questionText: { type: String, required: true },
    options: {
      A: { type: String, required: true },
      B: { type: String, required: true },
      C: { type: String, required: true },
      D: { type: String, required: true },
    },
    // সঠিক উত্তর - এটা কখনোই student কে সরাসরি পাঠানো হবে না submit করার আগে
    correctAnswer: { type: String, enum: ["A", "B", "C", "D"], required: true },
  },
  { _id: false }
);

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // পরীক্ষার নাম
    durationMinutes: { type: Number, required: true, default: 20 }, // যেমন: ২০ মিনিট
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    questions: [questionSchema],
    // ইউনিক শেয়ারেবল লিংক এর জন্য slug (e.g. /exam/x7Yq2p)
    examLink: { type: String, required: true, unique: true },
    // Teacher এর আপলোড করা মূল PDF - Answer Key হিসেবে student রা ডাউনলোড করবে
    answerKeyPdfPath: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
