import { useState } from "react";
import { motion } from "framer-motion";
import { usePlayer } from "@/hooks/usePlayer";

const AVATARS = [
  "😎", "🦁", "🐯", "🦊", "🐸", "🦅", "🐙", "🦋",
  "🔥", "⚡", "🌟", "💎", "🎯", "🚀", "🎸", "🏆",
];

export function PlayerSetup() {
  const { createPlayer } = usePlayer();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("😎");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError("");
    try {
      await createPlayer(trimmed, avatar);
    } catch {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <motion.h1
        className="text-5xl font-bold"
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
        transition={{ delay: 0.2 }}
      >
        Pick a name and avatar to get started
      </motion.p>

      <motion.form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-semibold text-gray-400">
            Display Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-400">Avatar</span>
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatar(emoji)}
                className={`rounded-xl p-2 text-2xl transition-colors ${
                  avatar === emoji
                    ? "bg-emerald-600 ring-2 ring-emerald-400"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-4xl">
          <span>{avatar}</span>
          <span className="text-xl font-bold text-gray-300">
            {name.trim() || "Your Name"}
          </span>
        </div>

        {error && <p className="text-center text-sm text-red-400">{error}</p>}

        <motion.button
          type="submit"
          disabled={!name.trim() || submitting}
          className="rounded-xl bg-emerald-600 px-8 py-4 text-xl font-bold transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {submitting ? "Creating..." : "Let's Go!"}
        </motion.button>
      </motion.form>
    </div>
  );
}
