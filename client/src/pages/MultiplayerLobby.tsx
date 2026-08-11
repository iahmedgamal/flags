import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { socket } from "@/lib/socket";
import { usePlayer } from "@/hooks/usePlayer";

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

export function MultiplayerLobby() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { player } = usePlayer();
  const [roomCode, setRoomCode] = useState(searchParams.get("code") || "");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const shareLink = room
    ? `${window.location.origin}/multiplayer?code=${room.code}`
    : "";

  const handleCopyCode = useCallback(async () => {
    if (!room) return;
    await navigator.clipboard.writeText(room.code);
    setCopied("code");
    setTimeout(() => setCopied(null), 2000);
  }, [room]);

  const handleCopyLink = useCallback(async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied("link");
    setTimeout(() => setCopied(null), 2000);
  }, [shareLink]);

  useEffect(() => {
    if (!player) return;
    socket.connect();

    socket.on("room-created", (roomState: RoomState) => {
      setRoom(roomState);
      setError("");
    });

    socket.on("room-updated", (roomState: RoomState) => {
      setRoom(roomState);
    });

    socket.on("game-started", ({ room: roomState }: { room: RoomState }) => {
      navigate(`/multiplayer/play?code=${roomState.code}`);
    });

    socket.on("error", ({ message }: { message: string }) => {
      setError(message);
    });

    // Auto-join if code in URL
    const code = searchParams.get("code");
    if (code) {
      setMode("join");
      setRoomCode(code);
      socket.emit("join-room", {
        code,
        player: { id: player.id, displayName: player.displayName, avatar: player.avatar },
      });
    }

    return () => {
      socket.off("room-created");
      socket.off("room-updated");
      socket.off("game-started");
      socket.off("error");
    };
  }, [player, navigate, searchParams]);

  if (!player) return null;

  const isHost = room?.hostId === player.id;

  function emitWhenConnected(event: string, data: unknown) {
    if (socket.connected) {
      socket.emit(event, data);
    } else {
      socket.once("connect", () => socket.emit(event, data));
      if (!socket.connected) socket.connect();
    }
  }

  function handleCreate() {
    emitWhenConnected("create-room", {
      player: { id: player!.id, displayName: player!.displayName, avatar: player!.avatar },
      gameMode: "flag-to-capital",
      totalQuestions: 15,
    });
  }

  function handleJoin() {
    if (!roomCode.trim()) return;
    setError("");
    emitWhenConnected("join-room", {
      code: roomCode.trim().toUpperCase(),
      player: { id: player!.id, displayName: player!.displayName, avatar: player!.avatar },
    });
  }

  function handleStart() {
    if (!room) return;
    socket.emit("start-game", { code: room.code });
  }

  function handleLeave() {
    if (room) {
      socket.emit("leave-room", { code: room.code, playerId: player!.id });
    }
    socket.disconnect();
    setRoom(null);
    setMode("menu");
    setError("");
  }

  // In a room — show lobby
  if (room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="label-caps">Room Code</p>
          <p className="text-5xl font-bold tracking-widest text-amber-300">
            {room.code}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="card-glass rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:border-amber-500/30"
            >
              {copied === "code" ? "Copied!" : "Copy Code"}
            </button>
            <button
              onClick={handleCopyLink}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-[#0a0e1a] transition-colors hover:bg-amber-400"
            >
              {copied === "link" ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </motion.div>

        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="label-caps mb-3 text-center">
            Players ({room.players.length})
          </p>
          <div className="flex flex-col gap-2">
            {room.players.map((p, i) => (
              <motion.div
                key={p.id}
                className="card-glass flex items-center gap-3 rounded-xl p-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="text-2xl">{p.avatar}</span>
                <span className="font-semibold text-[#f5f0eb]">{p.displayName}</span>
                {p.id === room.hostId && (
                  <span className="ml-auto rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
                    HOST
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {room.players.length < 2 && (
          <motion.p
            className="text-sm text-amber-400/80"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Waiting for more players...
          </motion.p>
        )}

        <div className="flex gap-3">
          {isHost && room.players.length >= 2 && (
            <motion.button
              onClick={handleStart}
              className="rounded-xl bg-amber-500 px-8 py-4 text-lg font-bold text-[#0a0e1a] transition-colors hover:bg-amber-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Start Game
            </motion.button>
          )}
          <button
            onClick={handleLeave}
            className="card-glass rounded-xl px-6 py-4 font-semibold text-red-400 transition-colors hover:bg-red-500/10"
          >
            Leave
          </button>
        </div>
      </div>
    );
  }

  // Menu — create or join
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-5xl">🎮</span>
        <h1 className="text-4xl font-bold text-amber-100">Multiplayer</h1>
        <div className="divider-gold w-32" />
      </motion.div>

      {mode === "menu" && (
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => {
              setMode("create");
              handleCreate();
            }}
            className="rounded-xl bg-amber-500 px-12 py-5 text-xl font-bold text-[#0a0e1a] transition-colors hover:bg-amber-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Room
          </motion.button>
          <motion.button
            onClick={() => setMode("join")}
            className="card-glass rounded-xl px-12 py-5 text-xl font-bold transition-all hover:border-amber-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join Room
          </motion.button>
          <button
            onClick={() => navigate("/")}
            className="text-[#8a8580] transition-colors hover:text-[#f5f0eb]"
          >
            ← Back
          </button>
        </motion.div>
      )}

      {mode === "join" && (
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            maxLength={6}
            className="card-glass rounded-xl px-6 py-4 text-center text-2xl font-bold tracking-widest text-[#f5f0eb] placeholder-[#8a8580]/50 outline-none focus:ring-2 focus:ring-amber-500/50"
            autoFocus
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3">
            <motion.button
              onClick={handleJoin}
              disabled={roomCode.length < 6}
              className="rounded-xl bg-amber-500 px-8 py-4 font-bold text-[#0a0e1a] transition-colors hover:bg-amber-400 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Join
            </motion.button>
            <button
              onClick={() => {
                setMode("menu");
                setError("");
              }}
              className="card-glass rounded-xl px-6 py-4 font-semibold transition-colors hover:border-amber-500/30"
            >
              Back
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
