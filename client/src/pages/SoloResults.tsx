import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getResultEmoji,
  getResultMessage,
  formatTime,
  getContinentBreakdown,
} from "@/lib/game";
import type { QuestionResult } from "@/lib/game";

interface ResultsState {
  score: number;
  total: number;
  correct: number;
  streak: number;
  timeSeconds: number;
  results: QuestionResult[];
}

const CONTINENT_EMOJI: Record<string, string> = {
  Africa: "🌍",
  Europe: "🏰",
  Asia: "🏯",
  "North America": "🗽",
  "South America": "💃",
  Oceania: "🏝️",
};

export function SoloResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultsState | null;

  if (!state) {
    navigate("/");
    return null;
  }

  const { score, total, correct, streak, timeSeconds, results } = state;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const breakdown = getContinentBreakdown(results);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <motion.span
        className="text-8xl"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        {getResultEmoji(percentage)}
      </motion.span>

      <motion.h2
        className="text-3xl font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {getResultMessage(percentage)}
      </motion.h2>

      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="rounded-xl bg-gray-800 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{score}</p>
          <p className="text-sm text-gray-400">Score</p>
        </div>
        <div className="rounded-xl bg-gray-800 p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">
            {correct}/{total}
          </p>
          <p className="text-sm text-gray-400">Correct</p>
        </div>
        <div className="rounded-xl bg-gray-800 p-4 text-center">
          <p className="text-3xl font-bold text-orange-400">🔥 {streak}</p>
          <p className="text-sm text-gray-400">Best Streak</p>
        </div>
        <div className="rounded-xl bg-gray-800 p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">
            {formatTime(timeSeconds)}
          </p>
          <p className="text-sm text-gray-400">Time</p>
        </div>
      </motion.div>

      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="mb-3 text-center text-lg font-semibold text-gray-300">
          How well do you know each continent?
        </p>
        <div className="flex flex-col gap-2">
          {breakdown.map((b, i) => (
            <motion.div
              key={b.continent}
              className="rounded-xl bg-gray-800 p-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-semibold">
                  {CONTINENT_EMOJI[b.continent] || "🌐"} {b.continent}
                </span>
                <span
                  className={`font-bold ${
                    b.percentage >= 70
                      ? "text-emerald-400"
                      : b.percentage >= 40
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  {b.percentage}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                <motion.div
                  className={`h-full ${
                    b.percentage >= 70
                      ? "bg-emerald-500"
                      : b.percentage >= 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${b.percentage}%` }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {b.correct}/{b.total} correct
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col gap-3 sm:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <button
          onClick={() => navigate("/play")}
          className="rounded-xl bg-emerald-600 px-8 py-4 font-semibold transition-colors hover:bg-emerald-500"
        >
          Play Again
        </button>
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-gray-800 px-8 py-4 font-semibold transition-colors hover:bg-gray-700"
        >
          Home
        </button>
      </motion.div>
    </div>
  );
}
