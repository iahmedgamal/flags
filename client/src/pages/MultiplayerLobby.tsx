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
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-400">Room Code</h2>
          <p className="text-5xl font-bold tracking-widest text-emerald-400">
            {room.code}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-700"
            >
              {copied === "code" ? "Copied!" : "Copy Code"}
            </button>
            <button
              onClick={handleCopyLink}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold transition-colors hover:bg-emerald-500"
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
          <p className="mb-3 text-center text-sm font-semibold text-gray-400">
            Players ({room.players.length})
          </p>
          <div className="flex flex-col gap-2">
            {room.players.map((p, i) => (
              <motion.div
                key={p.id}
                className="flex items-center gap-3 rounded-xl bg-gray-800 p-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="text-2xl">{p.avatar}</span>
                <span className="font-semibold">{p.displayName}</span>
                {p.id === room.hostId && (
                  <span className="ml-auto rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold">
                    HOST
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {room.players.length < 2 && (
          <motion.p
            className="text-sm text-yellow-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Waiting for more players...
          </motion.p>
        )}

        <div className="flex gap-3">
          {isHost && room.players.length >= 2 && (
            <motion.button
              onClick={handleStart}
              className="rounded-xl bg-emerald-600 px-8 py-4 text-lg font-bold transition-colors hover:bg-emerald-500"
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
            className="rounded-xl bg-gray-800 px-6 py-4 font-semibold text-red-400 transition-colors hover:bg-gray-700"
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
      <motion.h1
        className="text-4xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Multiplayer
      </motion.h1>

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
            className="rounded-xl bg-emerald-600 px-12 py-5 text-xl font-bold transition-colors hover:bg-emerald-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Room
          </motion.button>
          <motion.button
            onClick={() => setMode("join")}
            className="rounded-xl bg-gray-800 px-12 py-5 text-xl font-bold transition-colors hover:bg-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join Room
          </motion.button>
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-gray-300"
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
            className="rounded-xl bg-gray-800 px-6 py-4 text-center text-2xl font-bold tracking-widest text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3">
            <motion.button
              onClick={handleJoin}
              disabled={roomCode.length < 6}
              className="rounded-xl bg-emerald-600 px-8 py-4 font-bold transition-colors hover:bg-emerald-500 disabled:opacity-50"
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
              className="rounded-xl bg-gray-800 px-6 py-4 font-semibold transition-colors hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
