// নতুন Exam তৈরি করার পেজ - PDF আপলোড + নাম + সময় সেট করে Exam তৈরি হয়
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function CreateExam() {
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // সফল হলে তৈরি হওয়া লিংক এখানে দেখানো হবে
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("অনুগ্রহ করে একটি PDF ফাইল সিলেক্ট করুন");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("durationMinutes", durationMinutes);
    formData.append("pdf", file);

    setLoading(true);
    try {
      const { data } = await api.post("/exams", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Exam তৈরি করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(result.shareableLink);
  };

  if (result) {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold mb-2">Exam সফলভাবে তৈরি হয়েছে!</h2>
        <p className="text-gray-500 mb-4">{result.message}</p>

        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm break-all mb-4">
          {result.shareableLink}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={copyLink}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium"
          >
            🔗 লিংক কপি করুন
          </button>
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="bg-gray-100 dark:bg-gray-700 px-5 py-2.5 rounded-lg font-medium"
          >
            ড্যাশবোর্ডে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6">নতুন Exam তৈরি করুন</h2>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">পরীক্ষার নাম</label>
          <input
            required
            placeholder="যেমন: HSC ইংরেজি Tense পরীক্ষা"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">সময় (মিনিট)</label>
          <input
            type="number"
            required
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">প্রশ্নের PDF আপলোড করুন</label>
          <input
            type="file"
            accept="application/pdf"
            required
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900/40 file:text-primary file:font-medium"
          />
          <p className="text-xs text-gray-400 mt-1">
            ফরম্যাট: "1. প্রশ্ন? A. .. B. .. C. .. D. .. Answer: C"
          </p>
        </div>

        <button
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-medium disabled:opacity-60"
        >
          {loading ? "PDF পার্স করে Exam তৈরি হচ্ছে..." : "Exam তৈরি করুন"}
        </button>
      </form>
    </div>
  );
}
