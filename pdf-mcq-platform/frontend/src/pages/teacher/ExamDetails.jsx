// Teacher একটা নির্দিষ্ট Exam এর Leaderboard দেখবে এবং PDF ডাউনলোড করতে পারবে
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

export default function ExamDetails() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const examRes = await api.get(`/exams/manage/${id}`);
        setExam(examRes.data);

        const lbRes = await api.get(`/leaderboard/${examRes.data.examLink}`);
        setLeaderboard(lbRes.data.leaderboard);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const downloadLeaderboardPdf = async () => {
    const res = await api.get(`/leaderboard/manage/${id}/pdf`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `leaderboard-${exam.title}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <p className="text-center py-16 text-gray-500">লোড হচ্ছে...</p>;
  if (!exam) return <p className="text-center py-16 text-gray-500">Exam পাওয়া যায়নি</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-1">{exam.title}</h2>
      <p className="text-gray-500 mb-6">
        {exam.questions.length} টি প্রশ্ন · {exam.durationMinutes} মিনিট
      </p>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">🏆 Leaderboard</h3>
        <button
          onClick={downloadLeaderboardPdf}
          className="text-sm bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium"
        >
          ⬇️ PDF ডাউনলোড করুন
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-left">
            <tr>
              <th className="p-3">Rank</th>
              <th className="p-3">Name</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Score</th>
              <th className="p-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  এখনো কেউ পরীক্ষা সাবমিট করেনি
                </td>
              </tr>
            )}
            {leaderboard.map((row) => (
              <tr key={row.mobile} className="border-t border-gray-100 dark:border-gray-700">
                <td className="p-3 font-semibold">#{row.rank}</td>
                <td className="p-3">{row.name}</td>
                <td className="p-3">{row.mobile}</td>
                <td className="p-3">{row.score} / {exam.questions.length}</td>
                <td className="p-3">
                  {Math.floor(row.timeTakenSeconds / 60)}m {row.timeTakenSeconds % 60}s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
