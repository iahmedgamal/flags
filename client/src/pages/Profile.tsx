import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatTime } from "@/lib/game";
import type { Player, LeaderboardEntry } from "@flags/shared";
import { usePlayer } from "@/hooks/usePlayer";

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
        <p className="text-2xl text-gray-400">Loading...</p>
      </div>
    );
  }

  const totalGames = games.length;
  const bestScore = totalGames > 0 ? Math.max(...games.map((g) => g.score)) : 0;
  const bestStreak = totalGames > 0 ? Math.max(...games.map((g) => g.streak)) : 0;
  const totalCorrect = games.reduce((sum, g) => sum + g.correctAnswers, 0);
  const totalQuestions = games.reduce((sum, g) => sum + g.totalQuestions, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 p-4 pt-16">
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-7xl">{player.avatar}</span>
        <h1 className="text-3xl font-bold">{player.displayName}</h1>
        <p className="text-sm text-gray-500">
          Joined {new Date(player.createdAt).toLocaleDateString()}
        </p>
      </motion.div>

      <motion.div
        className="grid w-full max-w-lg grid-cols-2 gap-4 sm:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="rounded-xl bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{totalGames}</p>
          <p className="text-xs text-gray-400">Games</p>
        </div>
        <div className="rounded-xl bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{bestScore}</p>
          <p className="text-xs text-gray-400">Best Score</p>
        </div>
        <div className="rounded-xl bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{bestStreak}</p>
          <p className="text-xs text-gray-400">Best Streak</p>
        </div>
        <div className="rounded-xl bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{accuracy}%</p>
          <p className="text-xs text-gray-400">Accuracy</p>
        </div>
      </motion.div>

      {totalGames > 0 && (
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="mb-3 text-lg font-semibold text-gray-300">
            Recent Games
          </h2>
          <div className="flex flex-col gap-2">
            {games.slice(0, 10).map((game, i) => (
              <motion.div
                key={game.id}
                className="flex items-center justify-between rounded-xl bg-gray-800 p-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <div>
                  <p className="text-sm font-semibold">{game.gameMode}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-emerald-400">{game.score} pts</span>
                  <span className="text-blue-400">
                    {game.correctAnswers}/{game.totalQuestions}
                  </span>
                  <span className="text-gray-500">
                    {formatTime(game.timeSeconds)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
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
        {isOwn && (
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="rounded-xl bg-gray-800 px-6 py-3 font-semibold text-red-400 transition-colors hover:bg-gray-700"
          >
            Logout
          </button>
        )}
      </motion.div>
    </div>
  );
}
