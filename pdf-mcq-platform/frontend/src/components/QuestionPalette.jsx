// পরীক্ষার সময় প্রশ্ন নাম্বার গুলো দেখানোর Palette - কোনটা answered, কোনটা current বোঝাবে
export default function QuestionPalette({ questions, answers, currentIndex, onJump }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold mb-3 text-sm text-gray-600 dark:text-gray-300">
        প্রশ্নসমূহ
      </h3>
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
        {questions.map((q, idx) => {
          const isAnswered = !!answers[q.questionNo];
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.questionNo}
              onClick={() => onJump(idx)}
              className={`h-9 w-9 rounded-lg text-sm font-medium border transition
                ${isCurrent ? "ring-2 ring-primary" : ""}
                ${
                  isAnswered
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                }`}
            >
              {q.questionNo}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500 inline-block" /> উত্তর দেওয়া
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600 inline-block" /> বাকি আছে
        </span>
      </div>
    </div>
  );
}
