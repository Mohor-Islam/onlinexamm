// হোম পেজ - Teacher ও Student দুইজনের জন্যই এন্ট্রি পয়েন্ট
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">
        📄 PDF আপলোড করুন, সাথে সাথে Live MCQ পরীক্ষা তৈরি করুন
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-10">
        Teacher হলে লগইন করে PDF আপলোড করুন এবং শেয়ারেবল লিংক তৈরি করুন। শিক্ষার্থী হলে
        আপনার Teacher এর দেওয়া লিংকে ক্লিক করে সরাসরি পরীক্ষায় জয়েন করুন।
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/teacher/login"
          className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl"
        >
          👩‍🏫 আমি একজন Teacher
        </Link>
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium px-6 py-3 rounded-xl">
          🎓 Student হলে আপনার পরীক্ষার লিংকে সরাসরি যান
        </div>
      </div>
    </div>
  );
}
