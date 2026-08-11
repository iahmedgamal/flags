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

  const stats = [
    { label: "Score", value: String(score), color: "text-amber-400" },
    { label: "Correct", value: `${correct}/${total}`, color: "text-teal-400" },
    { label: "Best Streak", value: `${streak}x`, color: "text-orange-400" },
    { label: "Time", value: formatTime(timeSeconds), color: "text-sky-400" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <motion.span
        className="text-7xl"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        {getResultEmoji(percentage)}
      </motion.span>

      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-display text-3xl font-bold italic text-amber-100">
          {getResultMessage(percentage)}
        </h2>
        <div className="divider-gold w-32" />
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {stats.map((s) => (
          <div key={s.label} className="card-glass rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>
              {s.value}
            </p>
            <p className="label-caps mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Continent breakdown */}
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="mb-4 text-center text-lg font-semibold text-[#8a8580]">
          How well do you know each continent?
        </p>
        <div className="flex flex-col gap-2">
          {breakdown.map((b, i) => (
            <motion.div
              key={b.continent}
              className="card-glass rounded-xl p-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.08 }}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-semibold">
                  {CONTINENT_EMOJI[b.continent] || "🌐"} {b.continent}
                </span>
                <span
                  className={`font-bold tabular-nums ${
                    b.percentage >= 70
                      ? "text-teal-400"
                      : b.percentage >= 40
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  {b.percentage}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className={`h-full ${
                    b.percentage >= 70
                      ? "bg-teal-500"
                      : b.percentage >= 40
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${b.percentage}%` }}
                  transition={{ delay: 0.8 + i * 0.08, duration: 0.5 }}
                />
              </div>
              <p className="mt-1 text-xs text-[#666]">
                {b.correct}/{b.total} correct
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <button
          onClick={() => navigate("/play")}
          className="rounded-xl bg-amber-500 px-8 py-4 font-bold text-[#0a0e1a] transition-colors hover:bg-amber-400"
        >
          Play Again
        </button>
        <button
          onClick={() => navigate("/leaderboard")}
          className="card-glass rounded-xl px-8 py-4 font-semibold transition-all hover:border-amber-500/30"
        >
          Leaderboard
        </button>
        <button
          onClick={() => navigate("/")}
          className="card-glass rounded-xl px-8 py-4 font-semibold transition-all hover:border-amber-500/30"
        >
          Home
        </button>
      </motion.div>
    </div>
  );
}
