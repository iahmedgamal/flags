import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePlayer } from "@/hooks/usePlayer";

export function Home() {
  const navigate = useNavigate();
  const { player } = usePlayer();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      {player && (
        <motion.button
          onClick={() => navigate(`/profile/${player.id}`)}
          className="absolute right-4 top-4 flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 transition-colors hover:bg-gray-700"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="text-xl">{player.avatar}</span>
          <span className="font-semibold">{player.displayName}</span>
        </motion.button>
      )}

      <motion.h1
        className="text-6xl font-bold"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        🌍 Flags
      </motion.h1>

      <motion.p
        className="text-xl text-gray-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        40 flags. 7 seconds each. What's the capital?
      </motion.p>

      <motion.div
        className="flex flex-col gap-4 sm:flex-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => navigate("/play")}
          className="rounded-xl bg-emerald-600 px-12 py-5 text-xl font-bold transition-colors hover:bg-emerald-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Solo Play
        </motion.button>
        <motion.button
          onClick={() => navigate("/multiplayer")}
          className="rounded-xl bg-blue-600 px-12 py-5 text-xl font-bold transition-colors hover:bg-blue-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Multiplayer
        </motion.button>
        <motion.button
          onClick={() => navigate("/leaderboard")}
          className="rounded-xl bg-gray-800 px-12 py-5 text-xl font-bold transition-colors hover:bg-gray-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏆 Leaderboard
        </motion.button>
      </motion.div>
    </div>
  );
}
