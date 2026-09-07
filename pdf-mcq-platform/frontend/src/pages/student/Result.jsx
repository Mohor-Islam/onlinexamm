// Submit করার পর Result দেখানো - স্কোর, প্রতিটা প্রশ্নের সঠিক/ভুল উত্তর, PDF ডাউনলোড, Leaderboard এ যাওয়ার লিংক
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function Result() {
  const { examLink, attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await api.get(`/attempts/${attemptId}/result`);
        setResult(data);
      } catch (err) {
        setError(err.response?.data?.message || "Result পাওয়া যায়নি");
      }
    };
    fetchResult();
  }, [attemptId]);

  const downloadPdf = async () => {
    const res = await api.get(`/leaderboard/result-pdf/${attemptId}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `result-${result.studentName}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!result) return <p className="text-center py-20 text-gray-500">লোড হচ্ছে...</p>;

  const percentage = Math.round((result.score / result.totalQuestions) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm mb-6">
        <p className="text-gray-500">{result.examTitle}</p>
        <h2 className="text-3xl font-extrabold my-2">
          {result.score} / {result.totalQuestions}
        </h2>
        <p className="text-lg text-primary font-semibold">{percentage}% স্কোর</p>
        <p className="text-sm text-gray-400 mt-1">
          অভিনন্দন, {result.studentName}! সময় লেগেছে {Math.floor(result.timeTakenSeconds / 60)}m{" "}
          {result.timeTakenSeconds % 60}s
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button
            onClick={downloadPdf}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium"
          >
            ⬇️ Result + Answer PDF ডাউনলোড
          </button>
          <Link
            to={`/exam/${examLink}/leaderboard`}
            className="bg-gray-100 dark:bg-gray-700 px-5 py-2.5 rounded-lg font-medium"
          >
            🏆 Leaderboard দেখুন
          </Link>
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-3">উত্তরপত্র</h3>
      <div className="space-y-3">
        {result.questions.map((q) => {
          const given = result.answers.find((a) => a.questionNo === q.questionNo);
          const selected = given?.selectedOption;
          const isCorrect = selected === q.correctAnswer;
          return (
            <div key={q.questionNo} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <p className="font-medium mb-2">
                {q.questionNo}. {q.questionText}
              </p>
              <p className="text-sm">
                তোমার উত্তর:{" "}
                <span className={isCorrect ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
                  {selected || "দাওনি"}
                </span>{" "}
                {!isCorrect && (
                  <>
                    | সঠিক উত্তর: <span className="text-green-600 font-semibold">{q.correctAnswer}</span>
                  </>
                )}{" "}
                {isCorrect ? "✅" : "❌"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
