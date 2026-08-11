import { motion } from "framer-motion";

interface LeaveGameModalProps {
  onResume: () => void;
  onLeave: () => void;
  isPausable?: boolean;
}

export function LeaveGameModal({ onResume, onLeave, isPausable = false }: LeaveGameModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="card-glass mx-4 flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl p-8"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <h2 className="text-xl font-bold text-[#f5f0eb]">
          {isPausable ? "Game Paused" : "Leave Game?"}
        </h2>
        <p className="text-center text-sm text-[#8a8580]">
          {isPausable
            ? "Take a break. Your progress is safe."
            : "Your progress will be lost if you leave now."}
        </p>
        <div className="flex w-full flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-500"
          >
            {isPausable ? "Resume" : "Stay"}
          </button>
          <button
            onClick={onLeave}
            className="w-full rounded-xl border border-red-500/30 px-6 py-3 font-semibold text-red-400 transition-colors hover:bg-red-500/10"
          >
            Leave Game
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
