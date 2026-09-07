// Attempt (একজন Student এর একটা Exam attempt) এর Schema
// এখানেই students, attempts, results তিনটা concept একসাথে রাখা হয়েছে (embedded)
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionNo: { type: Number, required: true },
    selectedOption: { type: String, enum: ["A", "B", "C", "D", null], default: null },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    studentName: { type: String, required: true, trim: true },
    studentMobile: { type: String, required: true, trim: true }, // Anti-cheat key
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    timeTakenSeconds: { type: Number },
    isSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔒 Anti-cheat: একই Exam এ একই মোবাইল নাম্বার দিয়ে দ্বিতীয়বার Attempt করা যাবে না
attemptSchema.index({ exam: 1, studentMobile: 1 }, { unique: true });

module.exports = mongoose.model("Attempt", attemptSchema);
