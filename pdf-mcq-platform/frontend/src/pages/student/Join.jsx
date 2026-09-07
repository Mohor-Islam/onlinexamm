// Student এই পেজে নাম ও মোবাইল দিয়ে Exam এ Join করে (OTP ছাড়াই)
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function Join() {
  const { examLink } = useParams();
  const [examInfo, setExamInfo] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentMobile, setStudentMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const { data } = await api.get(`/exams/link/${examLink}`);
        setExamInfo(data);
      } catch (err) {
        setError(err.response?.data?.message || "Exam পাওয়া যায়নি");
      }
    };
    fetchExam();
  }, [examLink]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/attempts/join", {
        examLink,
        studentName,
        studentMobile,
      });
      // Attempt এর তথ্য পরের পেজে (Exam Room) দরকার হবে - localStorage এ রাখা হচ্ছে
      localStorage.setItem(
        `attempt-${examLink}`,
        JSON.stringify({ ...data, examLink })
      );
      navigate(`/exam/${examLink}/room`);
    } catch (err) {
      setError(err.response?.data?.message || "জয়েন করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  if (error && !examInfo) {
    return <p className="text-center py-20 text-red-500">{error}</p>;
  }

  if (!examInfo) {
    return <p className="text-center py-20 text-gray-500">লোড হচ্ছে...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold text-center mb-1">{examInfo.title}</h2>
      <p className="text-center text-gray-500 mb-6">
        {examInfo.questions.length} টি প্রশ্ন · সময়: {examInfo.durationMinutes} মিনিট
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleJoin} className="space-y-4">
        <input
          required
          placeholder="তোমার নাম"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
        />
        <input
          required
          placeholder="মোবাইল নাম্বার"
          value={studentMobile}
          onChange={(e) => setStudentMobile(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
        />
        <button
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-medium disabled:opacity-60"
        >
          {loading ? "জয়েন হচ্ছে..." : "পরীক্ষা শুরু করুন ▶️"}
        </button>
      </form>

      <p className="text-xs text-center text-gray-400 mt-4">
        ⚠️ একবার সাবমিট করলে এই মোবাইল নাম্বার দিয়ে আর জয়েন করা যাবে না।
      </p>
    </div>
  );
}
