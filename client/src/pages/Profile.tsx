import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatTime } from "@/lib/game";
import type { Player, LeaderboardEntry } from "@flags/shared";
import { usePlayer } from "@/hooks/usePlayer";

const MODE_LABELS: Record<string, string> = {
  "flag-to-capital": "Flag → Capital",
  "flag-to-country": "Flag → Country",
  "country-to-capital": "Country → Capital",
  "africa-only": "Africa Only",
};

export function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { player: currentPlayer, logout } = usePlayer();
  const [player, setPlayer] = useState<Player | null>(null);
  const [games, setGames] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwn = currentPlayer?.id === id;

  useEffect(() => {
    async function load() {
      try {
        const [playerRes, gamesRes] = await Promise.all([
          fetch(`/api/players/${id}`),
          fetch(`/api/leaderboard?playerId=${id}`),
        ]);
        if (!playerRes.ok) {
          navigate("/");
          return;
        }
        setPlayer(await playerRes.json());
        if (gamesRes.ok) {
          setGames(await gamesRes.json());
        }
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  if (loading || !player) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.p
          className="text-lg text-[#8a8580]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Loading profile...
        </motion.p>
      </div>
    );
  }

  const totalGames = games.length;
  const bestScore = totalGames > 0 ? Math.max(...games.map((g) => g.score)) : 0;
  const bestStreak = totalGames > 0 ? Math.max(...games.map((g) => g.streak)) : 0;
  const totalCorrect = games.reduce((sum, g) => sum + g.correctAnswers, 0);
  const totalQuestions = games.reduce((sum, g) => sum + g.totalQuestions, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const stats = [
    { label: "Games", value: String(totalGames), color: "text-teal-400" },
    { label: "Best Score", value: String(bestScore), color: "text-amber-400" },
    { label: "Best Streak", value: `${bestStreak}x`, color: "text-orange-400" },
    { label: "Accuracy", value: `${accuracy}%`, color: "text-sky-400" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 p-4 pt-16">
      {/* Avatar & name */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="card-glass flex h-24 w-24 items-center justify-center rounded-full">
          <span className="text-5xl">{player.avatar}</span>
        </div>
        <h1 className="text-display text-3xl font-bold italic text-amber-100">
          {player.displayName}
        </h1>
        <div className="divider-gold w-24" />
        <p className="label-caps">
          Joined {new Date(player.createdAt).toLocaleDateString()}
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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

      {/* Recent games */}
      {totalGames > 0 && (
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="mb-3 text-center text-lg font-semibold text-[#8a8580]">
            Recent Games
          </p>
          <div className="flex flex-col gap-2">
            {games.slice(0, 10).map((game, i) => (
              <motion.div
                key={game.id}
                className="card-glass rounded-xl p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      {MODE_LABELS[game.gameMode] || game.gameMode}
                    </p>
                    <p className="text-xs text-[#555]">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-lg font-bold tabular-nums text-amber-400">
                    {game.score}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <span className="text-teal-400/80">
                    {game.correctAnswers}/{game.totalQuestions} correct
                  </span>
                  <span className="text-orange-400/80">
                    {game.streak}x streak
                  </span>
                  <span className="ml-auto tabular-nums text-[#555]">
                    {formatTime(game.timeSeconds)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        className="flex gap-3 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
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
        {isOwn && (
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="card-glass rounded-xl px-6 py-3 font-semibold text-red-400 transition-all hover:border-red-500/30"
          >
            Logout
          </button>
        )}
      </motion.div>
    </div>
  );
}
