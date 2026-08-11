import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatTime } from "@/lib/game";
import { usePlayer } from "@/hooks/usePlayer";
import type { LeaderboardEntry } from "@flags/shared";

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
          className="text-lg text-[#8a8580]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Loading rankings...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 p-4 pt-12">
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-display text-4xl font-bold italic text-amber-100">
          Leaderboard
        </h1>
        <div className="divider-gold w-32" />
      </motion.div>

      {entries.length === 0 ? (
        <motion.div
          className="flex flex-col items-center gap-4 pt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-6xl">🦗</span>
          <p className="text-lg text-[#8a8580]">No scores yet. Be the first!</p>
          <button
            onClick={() => navigate("/play")}
            className="rounded-xl bg-amber-500 px-8 py-4 font-bold text-[#0a0e1a] transition-colors hover:bg-amber-400"
          >
            Play Now
          </button>
        </motion.div>
      ) : (
        <div className="flex w-full max-w-lg flex-col gap-2">
          {entries.map((entry, i) => {
            const rank = i + 1;
            const isMe = player?.id === entry.playerId;

            return (
              <motion.div
                key={entry.id}
                className={`card-glass rounded-xl p-4 ${
                  isMe ? "border-amber-500/30 bg-amber-500/5" : ""
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {/* Top row: rank + player + score */}
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center text-lg font-bold text-[#666]">
                    {RANK_BADGES[rank] || rank}
                  </span>

                  <button
                    onClick={() => navigate(`/profile/${entry.playerId}`)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left hover:opacity-80"
                  >
                    <span className="text-xl">{entry.avatar}</span>
                    <span className="truncate font-semibold">
                      {entry.playerName}
                      {isMe && (
                        <span className="ml-1 text-xs text-amber-400">(you)</span>
                      )}
                    </span>
                  </button>

                  <span className="text-lg font-bold tabular-nums text-amber-400">
                    {entry.score}
                  </span>
                </div>

                {/* Bottom row: stats */}
                <div className="mt-2 flex items-center gap-4 pl-11 text-xs">
                  <span className="text-teal-400/80">
                    {entry.correctAnswers}/{entry.totalQuestions} correct
                  </span>
                  <span className="text-orange-400/80">
                    {entry.streak}x streak
                  </span>
                  <span className="ml-auto tabular-nums text-[#555]">
                    {formatTime(entry.timeSeconds)}
                  </span>
                </div>
              </motion.div>
            );
          })}
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
          className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-[#0a0e1a] transition-colors hover:bg-amber-400"
        >
          Play
        </button>
        <button
          onClick={() => navigate("/")}
          className="card-glass rounded-xl px-6 py-3 font-semibold transition-all hover:border-amber-500/30"
        >
          Home
        </button>
      </motion.div>
    </div>
  );
}
