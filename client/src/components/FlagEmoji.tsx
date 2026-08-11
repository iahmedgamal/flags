import { useState } from "react";
import { motion } from "framer-motion";

function flagToTwemojiUrl(flag: string): string {
  const codePoints = [...flag]
    .map((char) => char.codePointAt(0)!.toString(16))
    .join("-");
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${codePoints}.svg`;
}

interface FlagEmojiProps {
  emoji: string;
  countryName?: string;
  className?: string;
}

export function FlagEmoji({ emoji, countryName, className = "" }: FlagEmojiProps) {
  const [failed, setFailed] = useState(false);

  return (
    <motion.div
      className={`relative flex flex-col items-center ${className}`}
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Card */}
      <div className="relative rounded-2xl border border-amber-500/20 bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
        {/* Inner bezel */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gray-900/80 p-8 sm:p-12">
          {/* Corner accents */}
          <div className="pointer-events-none absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-amber-500/30 rounded-tl-xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-amber-500/30 rounded-tr-xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-amber-500/30 rounded-bl-xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-amber-500/30 rounded-br-xl" />

          {/* Flag image with subtle inner shadow */}
          <div className="relative">
            {failed ? (
              <span className="block text-center text-[14rem] leading-none sm:text-[18rem]">{emoji}</span>
            ) : (
              <img
                src={flagToTwemojiUrl(emoji)}
                alt={emoji}
                className="mx-auto block h-64 w-64 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] sm:h-80 sm:w-80"
                draggable={false}
                onError={() => setFailed(true)}
              />
            )}
          </div>

          {/* Country name plaque */}
          {countryName && (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/60">
                {countryName}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
