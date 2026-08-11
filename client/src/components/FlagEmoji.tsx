import { useState } from "react";

/**
 * Converts a flag emoji (regional indicator pair) to its Twemoji CDN URL.
 * Windows doesn't render country flag emojis, so we use Twemoji images instead.
 */
function flagToTwemojiUrl(flag: string): string {
  const codePoints = [...flag]
    .map((char) => char.codePointAt(0)!.toString(16))
    .join("-");
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${codePoints}.svg`;
}

interface FlagEmojiProps {
  emoji: string;
  className?: string;
}

export function FlagEmoji({ emoji, className = "" }: FlagEmojiProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className={className}>{emoji}</span>;
  }

  return (
    <img
      src={flagToTwemojiUrl(emoji)}
      alt={emoji}
      className={`inline-block ${className}`}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
