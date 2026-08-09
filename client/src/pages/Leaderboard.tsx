import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatTime } from "@/lib/game";
import { usePlayer } from "@/hooks/usePlayer";
import type { LeaderboardEntry } from "@flags/shared";

const RANK_STYLES: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-gray-300",
  3: "text-amber-600",
};

const RANK_BADGES: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function Leaderboard() {
  const navigate = useNavigate();
  const { player } = usePlayer();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=50")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.p
          className="text-2xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Loading...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 p-4 pt-12">
      <motion.h1
        className="text-4xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🏆 Leaderboard
      </motion.h1>

      {entries.length === 0 ? (
        <motion.div
          className="flex flex-col items-center gap-4 pt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-6xl">🦗</span>
          <p className="text-xl text-gray-400">No scores yet. Be the first!</p>
          <button
            onClick={() => navigate("/play")}
            className="rounded-xl bg-emerald-600 px-8 py-4 font-semibold transition-colors hover:bg-emerald-500"
          >
            Play Now
          </button>
        </motion.div>
      ) : (
        <div className="w-full max-w-2xl">
          <div className="mb-2 grid grid-cols-[3rem_1fr_4rem_4rem_4rem_4rem] items-center gap-2 px-3 text-xs font-semibold text-gray-500 sm:grid-cols-[3rem_1fr_5rem_5rem_5rem_5rem]">
            <span>#</span>
            <span>Player</span>
            <span className="text-right">Score</span>
            <span className="text-right">Correct</span>
            <span className="text-right">Streak</span>
            <span className="text-right">Time</span>
          </div>

          <div className="flex flex-col gap-1">
            {entries.map((entry, i) => {
              const rank = i + 1;
              const isMe = player?.id === entry.playerId;

              return (
                <motion.div
                  key={entry.id}
                  className={`grid grid-cols-[3rem_1fr_4rem_4rem_4rem_4rem] items-center gap-2 rounded-xl p-3 sm:grid-cols-[3rem_1fr_5rem_5rem_5rem_5rem] ${
                    isMe
                      ? "bg-emerald-900/30 ring-1 ring-emerald-500/50"
                      : "bg-gray-800"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <span
                    className={`text-lg font-bold ${RANK_STYLES[rank] || "text-gray-500"}`}
                  >
                    {RANK_BADGES[rank] || rank}
                  </span>

                  <button
                    onClick={() => navigate(`/profile/${entry.playerId}`)}
                    className="flex items-center gap-2 text-left hover:underline"
                  >
                    <span className="text-xl">{entry.avatar}</span>
                    <span className="truncate font-semibold">
                      {entry.playerName}
                      {isMe && (
                        <span className="ml-1 text-xs text-emerald-400">
                          (you)
                        </span>
                      )}
                    </span>
                  </button>

                  <span className="text-right font-bold text-emerald-400">
                    {entry.score}
                  </span>
                  <span className="text-right text-sm text-blue-400">
                    {entry.correctAnswers}/{entry.totalQuestions}
                  </span>
                  <span className="text-right text-sm text-orange-400">
                    🔥{entry.streak}
                  </span>
                  <span className="text-right text-sm text-gray-500">
                    {formatTime(entry.timeSeconds)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <motion.div
        className="flex gap-3 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={() => navigate("/play")}
          className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold transition-colors hover:bg-emerald-500"
        >
          Play
        </button>
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-gray-800 px-6 py-3 font-semibold transition-colors hover:bg-gray-700"
        >
          Home
        </button>
      </motion.div>
    </div>
  );
}
