import { useEffect, useState } from "react";

export default function ScoreBar({ score = 0 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;

    const interval = setInterval(() => {
      start += 2;
      if (start >= score) {
        start = score;
        clearInterval(interval);
      }
      setAnimatedScore(start);
    }, 10);

    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
      <div
        className="h-4 bg-gradient-to-r from-green-400 to-blue-500 transition-all"
        style={{ width: `${animatedScore}%` }}
      />
    </div>
  );
}
