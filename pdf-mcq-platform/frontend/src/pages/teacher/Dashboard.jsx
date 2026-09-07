// Teacher Dashboard - নিজের সব Exam এর লিস্ট, প্রতিটার শেয়ারেবল লিংক ও Leaderboard এ যাওয়ার বাটন
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function Dashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data } = await api.get("/exams");
      setExams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (exam) => {
    const link = `${window.location.origin}/exam/${exam.examLink}`;
    navigator.clipboard.writeText(link);
    setCopiedId(exam._id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">আমার পরীক্ষাসমূহ</h2>
        <Link
          to="/teacher/create-exam"
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + নতুন Exam তৈরি করুন
        </Link>
      </div>

      {loading && <p className="text-gray-500">লোড হচ্ছে...</p>}

      {!loading && exams.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
          <p className="text-gray-500 mb-4">এখনো কোনো Exam তৈরি করা হয়নি</p>
          <Link to="/teacher/create-exam" className="text-primary font-medium underline">
            প্রথম Exam তৈরি করুন
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <h3 className="font-semibold text-lg">{exam.title}</h3>
              <p className="text-sm text-gray-500">
                {exam.questions?.length || 0} টি প্রশ্ন · {exam.durationMinutes} মিনিট
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => copyLink(exam)}
                className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg font-medium"
              >
                {copiedId === exam._id ? "✅ কপি হয়েছে" : "🔗 লিংক কপি করুন"}
              </button>
              <Link
                to={`/teacher/exam/${exam._id}`}
                className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-primary dark:text-indigo-300 px-3 py-1.5 rounded-lg font-medium"
              >
                📊 Leaderboard
              </Link>
              <a
                href={`${window.location.origin}/exam/${exam.examLink}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg font-medium"
              >
                ▶️ প্রিভিউ
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
