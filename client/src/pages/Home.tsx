import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePlayer } from "@/hooks/usePlayer";
import { Version } from "@/components/Version";

export function Home() {
  const navigate = useNavigate();
  const { player } = usePlayer();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-4">
      {player && (
        <motion.button
          onClick={() => navigate(`/profile/${player.id}`)}
          className="card-glass absolute right-4 top-4 flex items-center gap-2 rounded-full px-4 py-2 transition-colors hover:border-amber-500/20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="text-xl">{player.avatar}</span>
          <span className="text-sm font-medium">{player.displayName}</span>
        </motion.button>
      )}

      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <span className="text-7xl">🌍</span>
        <h1 className="text-display text-6xl font-bold italic tracking-tight text-amber-100 sm:text-7xl">
          Flags
        </h1>
        <div className="divider-gold w-48" />
        <p className="label-caps">Test your geography knowledge</p>
      </motion.div>

      <motion.p
        className="max-w-xs text-center text-lg text-[#8a8580]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        40 flags. 7 seconds each. Name the capital.
      </motion.p>

      <motion.div
        className="flex flex-col gap-3 sm:flex-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => navigate("/play")}
          className="rounded-xl bg-amber-500 px-12 py-4 text-lg font-bold text-[#0a0e1a] transition-colors hover:bg-amber-400"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Solo Play
        </motion.button>
        <motion.button
          onClick={() => navigate("/multiplayer")}
          className="card-glass rounded-xl px-12 py-4 text-lg font-bold transition-all hover:border-amber-500/30"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Multiplayer
        </motion.button>
        <motion.button
          onClick={() => navigate("/leaderboard")}
          className="card-glass rounded-xl px-12 py-4 text-lg font-bold transition-all hover:border-amber-500/30"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Leaderboard
        </motion.button>
      </motion.div>

      <div className="absolute bottom-4">
        <Version />
      </div>
    </div>
  );
}
