import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { socket } from "@/lib/socket";

interface RoomPlayer {
  id: string;
  displayName: string;
  avatar: string;
  score: number;
  streak: number;
}

interface RoomState {
  code: string;
  hostId: string;
  players: RoomPlayer[];
  gameMode: string;
  currentQuestion: number;
  totalQuestions: number;
  status: string;
}

const PODIUM_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];
const PODIUM_BADGES = ["🥇", "🥈", "🥉"];
const PODIUM_HEIGHTS = ["h-32", "h-24", "h-16"];

export function MultiplayerResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { room: RoomState } | null;

  if (!state) {
    navigate("/");
    return null;
  }

  const { room } = state;
  const ranked = [...room.players].sort((a, b) => b.score - a.score);
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  function handlePlayAgain() {
    socket.disconnect();
    navigate("/multiplayer");
  }

  function handleHome() {
    socket.disconnect();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 p-4 pt-12">
      <motion.h1
        className="text-4xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Game Over!
      </motion.h1>

      {/* Podium */}
      <motion.div
        className="flex items-end justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Reorder for podium: 2nd, 1st, 3rd */}
        {[top3[1], top3[0], top3[2]]
          .filter(Boolean)
          .map((p, displayIdx) => {
            const actualRank =
              displayIdx === 0 ? 1 : displayIdx === 1 ? 0 : 2;
            return (
              <motion.div
                key={p.id}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + actualRank * 0.2 }}
              >
                <span className="text-3xl">{PODIUM_BADGES[actualRank]}</span>
                <span className="text-4xl">{p.avatar}</span>
                <p
                  className={`text-lg font-bold ${PODIUM_COLORS[actualRank]}`}
                >
                  {p.displayName}
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {p.score}
                </p>
                <div
                  className={`w-24 rounded-t-xl ${PODIUM_HEIGHTS[actualRank]} ${
                    actualRank === 0
                      ? "bg-yellow-500/20"
                      : actualRank === 1
                        ? "bg-gray-500/20"
                        : "bg-amber-600/20"
                  }`}
                />
              </motion.div>
            );
          })}
      </motion.div>

      {/* Rest of players */}
      {rest.length > 0 && (
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex flex-col gap-2">
            {rest.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl bg-gray-800 p-3"
              >
                <span className="w-8 text-center text-sm font-bold text-gray-500">
                  {i + 4}
                </span>
                <span className="text-xl">{p.avatar}</span>
                <span className="font-semibold">{p.displayName}</span>
                <span className="ml-auto font-bold text-emerald-400">
                  {p.score}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <button
          onClick={handlePlayAgain}
          className="rounded-xl bg-emerald-600 px-8 py-4 font-semibold transition-colors hover:bg-emerald-500"
        >
          Play Again
        </button>
        <button
          onClick={handleHome}
          className="rounded-xl bg-gray-800 px-8 py-4 font-semibold transition-colors hover:bg-gray-700"
        >
          Home
        </button>
      </motion.div>
    </div>
  );
}
