// Live Countdown Timer - setInterval দিয়ে প্রতি সেকেন্ডে আপডেট হয়, সময় শেষ হলে onTimeUp() কল করে
import { useEffect, useRef, useState } from "react";

export default function Timer({ startedAt, durationMinutes, onTimeUp }) {
  // মোট কত সেকেন্ড বাকি আছে হিসাব করা হচ্ছে (server এর startedAt থেকে, ক্লায়েন্টের ভরসায় না রেখে)
  const calcRemaining = () => {
    const endTime = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
    return Math.max(0, Math.floor((endTime - Date.now()) / 1000));
  };

  const [remaining, setRemaining] = useState(calcRemaining());
  const hasFiredRef = useRef(false);

  useEffect(() => {
    // প্রতি সেকেন্ডে টাইমার আপডেট করার interval
    const interval = setInterval(() => {
      const secondsLeft = calcRemaining();
      setRemaining(secondsLeft);

      if (secondsLeft <= 0 && !hasFiredRef.current) {
        hasFiredRef.current = true; // দুইবার Auto Submit কল হওয়া আটকানো হচ্ছে
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, durationMinutes]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining <= 60; // শেষ ১ মিনিটে লাল রঙ দেখাবে

  return (
    <div
      className={`font-mono text-lg font-bold px-4 py-2 rounded-lg ${
        isLow
          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 animate-pulse"
          : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
      }`}
    >
      ⏱️ {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
