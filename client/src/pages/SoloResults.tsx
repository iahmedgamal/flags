import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getResultEmoji, getResultMessage } from "@/lib/game";

export function SoloResults() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const score = Number(params.get("score") || 0);
  const total = Number(params.get("total") || 0);
  const correct = Number(params.get("correct") || 0);
  const streak = Number(params.get("streak") || 0);
  const time = params.get("time") || "0";
  const mode = params.get("mode") || "flag-to-country";

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

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
          <p className="text-3xl font-bold text-purple-400">{time}s</p>
          <p className="text-sm text-gray-400">Time</p>
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col gap-3 sm:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={() => navigate(`/solo/play?mode=${mode}&count=${total}`)}
          className="rounded-xl bg-emerald-600 px-8 py-4 font-semibold transition-colors hover:bg-emerald-500"
        >
          Play Again
        </button>
        <button
          onClick={() => navigate("/solo")}
          className="rounded-xl bg-gray-700 px-8 py-4 font-semibold transition-colors hover:bg-gray-600"
        >
          Change Mode
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
