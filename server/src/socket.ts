import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import type { GameMode, Room } from "@flags/shared";

interface CreateRoomPayload {
  player: { id: string; displayName: string; avatar: string };
  gameMode: GameMode;
  totalQuestions?: number;
}

interface JoinRoomPayload {
  code: string;
  player: { id: string; displayName: string; avatar: string };
}

interface SubmitAnswerPayload {
  code: string;
  playerId: string;
  correct: boolean;
}

const rooms = new Map<string, Room>();

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function setupSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("create-room", ({ player, gameMode, totalQuestions }: CreateRoomPayload) => {
      const code = generateRoomCode();
      const room: Room = {
        code,
        hostId: player.id,
        players: [{ ...player, score: 0, streak: 0 }],
        gameMode,
        currentQuestion: 0,
        totalQuestions: totalQuestions || 10,
        status: "waiting",
      };
      rooms.set(code, room);
      socket.join(code);
      socket.emit("room-created", room);
    });

    socket.on("join-room", ({ code, player }: JoinRoomPayload) => {
      const room = rooms.get(code);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      if (room.status !== "waiting") {
        socket.emit("error", { message: "Game already started" });
        return;
      }
      room.players.push({ ...player, score: 0, streak: 0 });
      socket.join(code);
      io.to(code).emit("room-updated", room);
    });

    socket.on("start-game", ({ code }: { code: string }) => {
      const room = rooms.get(code);
      if (!room) return;
      room.status = "playing";
      room.currentQuestion = 0;
      io.to(code).emit("game-started", room);
    });

    socket.on("submit-answer", ({ code, playerId, correct }: SubmitAnswerPayload) => {
      const room = rooms.get(code);
      if (!room) return;
      const player = room.players.find((p) => p.id === playerId);
      if (!player) return;

      if (correct) {
        player.streak += 1;
        player.score += 10 + player.streak * 2;
      } else {
        player.streak = 0;
      }

      io.to(code).emit("room-updated", room);
    });

    socket.on("next-question", ({ code }: { code: string }) => {
      const room = rooms.get(code);
      if (!room) return;
      room.currentQuestion += 1;
      if (room.currentQuestion >= room.totalQuestions) {
        room.status = "finished";
      }
      io.to(code).emit("room-updated", room);
    });

    socket.on("disconnect", () => {
      for (const [code] of rooms) {
        const socketRoom = io.sockets.adapter.rooms.get(code);
        if (!socketRoom || socketRoom.size === 0) {
          rooms.delete(code);
        }
      }
    });
  });

  return io;
}
