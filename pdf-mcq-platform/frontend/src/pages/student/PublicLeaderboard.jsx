// Submit করার পর যে কেউ দেখতে পারা Public Leaderboard
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

export default function PublicLeaderboard() {
  const { examLink } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get(`/leaderboard/${examLink}`);
        setData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Leaderboard পাওয়া যায়নি");
      }
    };
    fetchLeaderboard();
  }, [examLink]);

  const downloadPdf = async () => {
    const res = await api.get(`/leaderboard/${examLink}/pdf`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "leaderboard.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!data) return <p className="text-center py-20 text-gray-500">লোড হচ্ছে...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">🏆 {data.examTitle} — Leaderboard</h2>
        <button
          onClick={downloadPdf}
          className="text-sm bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium"
        >
          ⬇️ PDF
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
            {data.leaderboard.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  এখনো কেউ সাবমিট করেনি
                </td>
              </tr>
            )}
            {data.leaderboard.map((row) => (
              <tr key={row.mobile} className="border-t border-gray-100 dark:border-gray-700">
                <td className="p-3 font-semibold">
                  {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : `#${row.rank}`}
                </td>
                <td className="p-3">{row.name}</td>
                <td className="p-3">{row.mobile}</td>
                <td className="p-3">{row.score}</td>
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
