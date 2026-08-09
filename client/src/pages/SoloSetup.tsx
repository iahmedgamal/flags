import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { GameMode } from "@flags/shared";

const MODES: { value: GameMode; label: string; emoji: string }[] = [
  { value: "flag-to-country", label: "Flag → Country", emoji: "🏳️" },
  { value: "flag-to-capital", label: "Flag → Capital", emoji: "🏛️" },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

export function SoloSetup() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<GameMode>("flag-to-country");
  const [count, setCount] = useState(10);

  function handleStart() {
    navigate(`/solo/play?mode=${mode}&count=${count}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <motion.h2
        className="text-4xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Solo Play
      </motion.h2>

      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-center text-gray-400">Game Mode</p>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`rounded-xl px-6 py-4 text-left font-semibold transition-all ${
                mode === m.value
                  ? "bg-emerald-600 ring-2 ring-emerald-400"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              <span className="mr-2">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-center text-gray-400">Questions</p>
        <div className="flex gap-3">
          {QUESTION_COUNTS.map((c) => (
            <button
              key={c}
              onClick={() => setCount(c)}
              className={`rounded-xl px-5 py-3 font-semibold transition-all ${
                count === c
                  ? "bg-emerald-600 ring-2 ring-emerald-400"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.button
        onClick={handleStart}
        className="rounded-xl bg-emerald-600 px-12 py-4 text-xl font-bold transition-colors hover:bg-emerald-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Start Game
      </motion.button>

      <button
        onClick={() => navigate("/")}
        className="text-gray-500 hover:text-gray-300"
      >
        ← Back
      </button>
    </div>
  );
}
