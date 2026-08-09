import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import type { GameMode } from "@flags/shared";
import { db } from "./db";

interface Player {
  id: string;
  displayName: string;
  avatar: string;
  score: number;
  streak: number;
  answered: boolean;
}

interface Question {
  prompt: string;
  flag: string;
  correctAnswer: string;
  options: string[];
  continent: string;
}

interface Room {
  code: string;
  hostId: string;
  players: Player[];
  gameMode: GameMode;
  questions: Question[];
  currentQuestion: number;
  totalQuestions: number;
  status: "waiting" | "playing" | "finished";
  timer: ReturnType<typeof setTimeout> | null;
}

interface CreateRoomPayload {
  player: { id: string; displayName: string; avatar: string };
  gameMode: GameMode;
  totalQuestions?: number;
}

interface JoinRoomPayload {
  code: string;
  player: { id: string; displayName: string; avatar: string };
}

const rooms = new Map<string, Room>();
const SECONDS_PER_QUESTION = 10;

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface CountryRow {
  id: string;
  name: string;
  capital: string;
  flag_url: string;
  continent: string;
}

function generateQuestions(
  countries: CountryRow[],
  mode: GameMode,
  count: number
): Question[] {
  const african = countries.filter((c) => c.continent === "Africa");
  const others = countries.filter((c) => c.continent !== "Africa");
  const weighted = shuffle([...african, ...african, ...african, ...others]);

  const seen = new Set<string>();
  const selected: CountryRow[] = [];
  for (const c of weighted) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    selected.push(c);
    if (selected.length >= count) break;
  }

  return selected.map((country) => {
    const pool = countries.filter((c) => c.id !== country.id);
    const distractors = shuffle(pool).slice(0, 3);

    if (mode === "flag-to-country" || mode === "africa-only") {
      return {
        prompt: "Which country does this flag belong to?",
        flag: country.flag_url,
        correctAnswer: country.name,
        options: shuffle([country.name, ...distractors.map((c) => c.name)]),
        continent: country.continent,
      };
    }

    if (mode === "country-to-capital") {
      return {
        prompt: `What is the capital of ${country.name}?`,
        flag: country.flag_url,
        correctAnswer: country.capital,
        options: shuffle([country.capital, ...distractors.map((c) => c.capital)]),
        continent: country.continent,
      };
    }

    // flag-to-capital
    return {
      prompt: "What is the capital of this country?",
      flag: country.flag_url,
      correctAnswer: country.capital,
      options: shuffle([country.capital, ...distractors.map((c) => c.capital)]),
      continent: country.continent,
    };
  });
}

function getRoomState(room: Room) {
  return {
    code: room.code,
    hostId: room.hostId,
    players: room.players.map(({ id, displayName, avatar, score, streak }) => ({
      id,
      displayName,
      avatar,
      score,
      streak,
    })),
    gameMode: room.gameMode,
    currentQuestion: room.currentQuestion,
    totalQuestions: room.totalQuestions,
    status: room.status,
  };
}

function getQuestionForClient(room: Room) {
  const q = room.questions[room.currentQuestion];
  if (!q) return null;
  return {
    prompt: q.prompt,
    flag: q.flag,
    options: q.options,
    index: room.currentQuestion,
    total: room.totalQuestions,
    secondsPerQuestion: SECONDS_PER_QUESTION,
  };
}

function advanceQuestion(io: Server, room: Room) {
  if (room.timer) clearTimeout(room.timer);

  // Reveal correct answer
  const q = room.questions[room.currentQuestion];
  io.to(room.code).emit("answer-reveal", { correctAnswer: q.correctAnswer });

  setTimeout(() => {
    room.currentQuestion += 1;
    room.players.forEach((p) => (p.answered = false));

    if (room.currentQuestion >= room.totalQuestions) {
      room.status = "finished";
      if (room.timer) clearTimeout(room.timer);
      io.to(room.code).emit("game-finished", getRoomState(room));
      return;
    }

    io.to(room.code).emit("next-question", {
      room: getRoomState(room),
      question: getQuestionForClient(room),
    });

    // Auto-advance after timeout
    room.timer = setTimeout(() => {
      advanceQuestion(io, room);
    }, SECONDS_PER_QUESTION * 1000);
  }, 2000);
}

export function setupSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
    },
  });

  io.on("connection", (socket) => {
    socket.on("create-room", async ({ player, gameMode, totalQuestions = 10 }: CreateRoomPayload) => {
      const code = generateRoomCode();
      const countries = await db("countries").select("*");
      const questions = generateQuestions(countries, gameMode, totalQuestions);

      const room: Room = {
        code,
        hostId: player.id,
        players: [{ ...player, score: 0, streak: 0, answered: false }],
        gameMode,
        questions,
        currentQuestion: 0,
        totalQuestions: Math.min(totalQuestions, questions.length),
        status: "waiting",
        timer: null,
      };
      rooms.set(code, room);
      socket.join(code);
      socket.emit("room-created", getRoomState(room));
    });

    socket.on("join-room", ({ code, player }: JoinRoomPayload) => {
      const room = rooms.get(code.toUpperCase());
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      if (room.status !== "waiting") {
        socket.emit("error", { message: "Game already started" });
        return;
      }
      if (room.players.some((p) => p.id === player.id)) {
        socket.emit("error", { message: "Already in room" });
        return;
      }
      room.players.push({ ...player, score: 0, streak: 0, answered: false });
      socket.join(room.code);
      io.to(room.code).emit("room-updated", getRoomState(room));
    });

    socket.on("start-game", ({ code }: { code: string }) => {
      const room = rooms.get(code);
      if (!room) return;
      if (room.players.length < 2) {
        socket.emit("error", { message: "Need at least 2 players" });
        return;
      }
      room.status = "playing";
      room.currentQuestion = 0;

      io.to(room.code).emit("game-started", {
        room: getRoomState(room),
        question: getQuestionForClient(room),
      });

      room.timer = setTimeout(() => {
        advanceQuestion(io, room);
      }, SECONDS_PER_QUESTION * 1000);
    });

    socket.on("submit-answer", ({ code, playerId, answer }: {
      code: string;
      playerId: string;
      answer: string;
    }) => {
      const room = rooms.get(code);
      if (!room || room.status !== "playing") return;

      const player = room.players.find((p) => p.id === playerId);
      if (!player || player.answered) return;
      player.answered = true;

      const q = room.questions[room.currentQuestion];
      const correct = answer === q.correctAnswer;

      if (correct) {
        player.streak += 1;
        player.score += 10 + (player.streak > 1 ? player.streak * 2 : 0);
      } else {
        player.streak = 0;
      }

      io.to(room.code).emit("player-answered", {
        playerId,
        correct,
        room: getRoomState(room),
      });

      // If all players answered, advance immediately
      if (room.players.every((p) => p.answered)) {
        advanceQuestion(io, room);
      }
    });

    socket.on("leave-room", ({ code, playerId }: { code: string; playerId: string }) => {
      const room = rooms.get(code);
      if (!room) return;
      room.players = room.players.filter((p) => p.id !== playerId);
      socket.leave(code);

      if (room.players.length === 0) {
        if (room.timer) clearTimeout(room.timer);
        rooms.delete(code);
        return;
      }

      // If host left, assign new host
      if (room.hostId === playerId) {
        room.hostId = room.players[0].id;
      }

      io.to(code).emit("room-updated", getRoomState(room));
    });

    socket.on("disconnect", () => {
      for (const [code, room] of rooms) {
        const socketRoom = io.sockets.adapter.rooms.get(code);
        if (!socketRoom || socketRoom.size === 0) {
          if (room.timer) clearTimeout(room.timer);
          rooms.delete(code);
        }
      }
    });
  });

  return io;
}
