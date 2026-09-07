// শুধুমাত্র লগইন করা Teacher এই middleware পার হয়ে protected route এ যেতে পারবে
const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");

const protectTeacher = async (req, res, next) => {
  let token;

  // Header থেকে "Bearer <token>" ফরম্যাটে টোকেন নেওয়া হচ্ছে
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // পাসওয়ার্ড ছাড়া টিচার এর তথ্য req.teacher এ বসিয়ে দিচ্ছি
      req.teacher = await Teacher.findById(decoded.id).select("-password");

      if (!req.teacher) {
        return res.status(401).json({ message: "টিচার পাওয়া যায়নি, আবার লগইন করুন" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "টোকেন সঠিক নয় বা মেয়াদ শেষ, আবার লগইন করুন" });
    }
  }

  return res.status(401).json({ message: "লগইন প্রয়োজন (টোকেন পাওয়া যায়নি)" });
};

module.exports = { protectTeacher };
