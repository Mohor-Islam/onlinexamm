// আসল Exam Room - প্রশ্ন দেখানো, উত্তর সিলেক্ট করা, Timer, Question Palette, Submit
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import Timer from "../../components/Timer";
import QuestionPalette from "../../components/QuestionPalette";

export default function ExamRoom() {
  const { examLink } = useParams();
  const navigate = useNavigate();

  const [attemptData, setAttemptData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionNo: "A" }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`attempt-${examLink}`);
    if (!saved) {
      // সরাসরি এই পেজে চলে এলে (Join না করে) Join পেজে পাঠিয়ে দেওয়া হচ্ছে
      navigate(`/exam/${examLink}`);
      return;
    }
    const parsed = JSON.parse(saved);
    setAttemptData(parsed);

    const fetchQuestions = async () => {
      try {
        const { data } = await api.get(`/attempts/exam/${parsed.attemptId}/questions`);
        setQuestions(data.questions);
      } catch (err) {
        setError(err.response?.data?.message || "পরীক্ষা লোড করা যায়নি (হয়তো ইতিমধ্যে সাবমিট হয়ে গেছে)");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examLink]);

  const handleSelect = (questionNo, option) => {
    setAnswers((prev) => ({ ...prev, [questionNo]: option }));
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answerArray = Object.entries(answers).map(([questionNo, selectedOption]) => ({
        questionNo: Number(questionNo),
        selectedOption,
      }));

      const { data } = await api.post(`/attempts/${attemptData.attemptId}/submit`, {
        answers: answerArray,
      });

      localStorage.removeItem(`attempt-${examLink}`);
      navigate(`/exam/${examLink}/result/${data.attemptId}`);
    } catch (err) {
      setError(err.response?.data?.message || "সাবমিট করা যায়নি");
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, attemptData, examLink, submitting]);

  if (loading) return <p className="text-center py-20 text-gray-500">লোড হচ্ছে...</p>;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;

  const q = questions[currentIndex];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-lg">{attemptData?.examTitle}</h2>
        <Timer
          startedAt={attemptData.startedAt}
          durationMinutes={attemptData.durationMinutes}
          onTimeUp={handleSubmit}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* মূল প্রশ্ন এরিয়া */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-400 mb-2">
            প্রশ্ন {currentIndex + 1} / {questions.length}
          </p>
          <h3 className="text-lg font-semibold mb-5">
            {q.questionNo}. {q.questionText}
          </h3>

          <div className="space-y-3">
            {["A", "B", "C", "D"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(q.questionNo, opt)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition
                  ${
                    answers[q.questionNo] === opt
                      ? "bg-indigo-100 dark:bg-indigo-900/40 border-primary"
                      : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
              >
                <span className="font-semibold mr-2">{opt}.</span>
                {q.options[opt]}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-40"
            >
              ← আগের প্রশ্ন
            </button>
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="px-4 py-2 rounded-lg bg-primary text-white"
              >
                পরের প্রশ্ন →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-60"
              >
                {submitting ? "সাবমিট হচ্ছে..." : "✅ পরীক্ষা সাবমিট করুন"}
              </button>
            )}
          </div>
        </div>

        {/* Question Palette + Manual Submit বাটন */}
        <div className="space-y-4">
          <QuestionPalette
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onJump={setCurrentIndex}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-60"
          >
            {submitting ? "সাবমিট হচ্ছে..." : "এখনই সাবমিট করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}
