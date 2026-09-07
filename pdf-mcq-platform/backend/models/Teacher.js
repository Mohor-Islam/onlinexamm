// Teacher (শিক্ষক) এর Schema - Email + Password দিয়ে লগইন করবে
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // hashed থাকবে
  },
  { timestamps: true }
);

// Save করার আগে পাসওয়ার্ড হ্যাশ করে ফেলছি (bcrypt দিয়ে)
teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// লগইনের সময় পাসওয়ার্ড মিলছে কিনা চেক করার মেথড
teacherSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Teacher", teacherSchema);
