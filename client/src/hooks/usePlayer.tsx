import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Player } from "@flags/shared";

const PLAYER_ID_KEY = "flags_player_id";

interface PlayerContextValue {
  player: Player | null;
  loading: boolean;
  createPlayer: (displayName: string, avatar: string) => Promise<Player>;
  logout: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlayer = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/players/${id}`);
      if (!res.ok) {
        localStorage.removeItem(PLAYER_ID_KEY);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPlayer(data);
    } catch {
      localStorage.removeItem(PLAYER_ID_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check localStorage on mount
  useState(() => {
    const savedId = localStorage.getItem(PLAYER_ID_KEY);
    if (savedId) {
      fetchPlayer(savedId);
    } else {
      setLoading(false);
    }
  });

  const createPlayer = useCallback(
    async (displayName: string, avatar: string): Promise<Player> => {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, avatar }),
      });
      if (!res.ok) throw new Error("Failed to create player");
      const data = await res.json();
      localStorage.setItem(PLAYER_ID_KEY, data.id);
      setPlayer(data);
      return data;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(PLAYER_ID_KEY);
    setPlayer(null);
  }, []);

  return (
    <PlayerContext.Provider value={{ player, loading, createPlayer, logout }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
