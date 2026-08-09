import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
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
        How well do you know the world?
      </motion.p>

      <motion.div
        className="flex flex-col gap-4 sm:flex-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={() => navigate("/solo")}
          className="rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold transition-colors hover:bg-emerald-500"
        >
          Solo Play
        </button>
        <button className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold transition-colors hover:bg-blue-500">
          Multiplayer
        </button>
        <button className="rounded-xl bg-amber-600 px-8 py-4 text-lg font-semibold transition-colors hover:bg-amber-500">
          Leaderboard
        </button>
      </motion.div>
    </div>
  );
}
