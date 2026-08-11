import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "@/lib/socket";
import { usePlayer } from "@/hooks/usePlayer";
import { FlagEmoji } from "@/components/FlagEmoji";

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

interface QuestionData {
  prompt: string;
  flag: string;
  countryName: string;
  options: string[];
  index: number;
  total: number;
  secondsPerQuestion: number;
}

export function MultiplayerGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") || "";
  const { player } = usePlayer();

  const [room, setRoom] = useState<RoomState | null>(null);
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(seconds);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (!player || !code) {
      navigate("/multiplayer");
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("game-started", ({ room: r, question: q }: { room: RoomState; question: QuestionData }) => {
      setRoom(r);
      setQuestion(q);
      setSelected(null);
      setCorrectAnswer(null);
      startTimer(q.secondsPerQuestion);
    });

    socket.on("next-question", ({ room: r, question: q }: { room: RoomState; question: QuestionData }) => {
      setRoom(r);
      setQuestion(q);
      setSelected(null);
      setCorrectAnswer(null);
      startTimer(q.secondsPerQuestion);
    });

    socket.on("player-answered", ({ room: r }: { room: RoomState }) => {
      setRoom(r);
    });

    socket.on("answer-reveal", ({ correctAnswer: answer }: { correctAnswer: string }) => {
      setCorrectAnswer(answer);
      if (timerRef.current) clearInterval(timerRef.current);
    });

    socket.on("room-updated", (r: RoomState) => {
      setRoom(r);
    });

    socket.on("game-finished", (r: RoomState) => {
      setRoom(r);
      if (timerRef.current) clearInterval(timerRef.current);
      navigate("/multiplayer/results", {
        state: { room: r },
      });
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      socket.off("game-started");
      socket.off("next-question");
      socket.off("player-answered");
      socket.off("answer-reveal");
      socket.off("room-updated");
      socket.off("game-finished");
    };
  }, [player, code, navigate, startTimer]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (selected || !room || !player) return;
      setSelected(answer);
      socket.emit("submit-answer", {
        code: room.code,
        playerId: player.id,
        answer,
      });
    },
    [selected, room, player]
  );

  if (!question || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.p
          className="text-2xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Waiting for game...
        </motion.p>
      </div>
    );
  }

  const timerColor =
    timer > 6 ? "text-emerald-400" : timer > 3 ? "text-yellow-400" : "text-red-400";

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Scoreboard */}
      <div className="order-2 flex flex-row gap-2 overflow-x-auto p-3 lg:order-1 lg:w-64 lg:flex-col lg:overflow-x-visible lg:border-r lg:border-gray-800 lg:p-4">
        <p className="hidden text-xs font-semibold text-gray-500 lg:block">
          SCOREBOARD
        </p>
        {sortedPlayers.map((p, i) => (
          <motion.div
            key={p.id}
            className={`flex shrink-0 items-center gap-2 rounded-xl p-2 lg:p-3 ${
              p.id === player?.id
                ? "bg-emerald-900/30 ring-1 ring-emerald-500/50"
                : "bg-gray-800"
            }`}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <span className="text-xs font-bold text-gray-500">{i + 1}</span>
            <span className="text-lg">{p.avatar}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{p.displayName}</p>
              <p className="text-xs text-emerald-400">{p.score} pts</p>
            </div>
            {p.streak > 1 && (
              <span className="ml-auto text-xs text-orange-400">
                🔥{p.streak}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Game area */}
      <div className="order-1 flex flex-1 flex-col items-center justify-center gap-6 p-4 lg:order-2">
        <div className="flex w-full max-w-lg items-center justify-between text-sm text-gray-400">
          <span>
            {question.index + 1} / {question.total}
          </span>
          <motion.span
            className={`text-2xl font-bold ${timerColor}`}
            key={timer}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
          >
            {timer}s
          </motion.span>
        </div>

        <div className="h-2 w-full max-w-lg overflow-hidden rounded-full bg-gray-800">
          <motion.div
            className="h-full bg-emerald-500"
            animate={{
              width: `${((question.index + 1) / question.total) * 100}%`,
            }}
            transition={{ type: "spring" }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.index}
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="flex flex-col items-center gap-1">
              <FlagEmoji emoji={question.flag} className="h-24 w-24" />
              <span className="text-xs text-gray-500">{question.countryName}</span>
            </div>
            <p className="text-center text-xl text-gray-300">
              {question.prompt}
            </p>

            <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
              {question.options.map((option) => {
                let bg = "bg-gray-800 hover:bg-gray-700";
                if (correctAnswer) {
                  if (option === correctAnswer) {
                    bg = "bg-emerald-600";
                  } else if (option === selected) {
                    bg = "bg-red-600";
                  } else {
                    bg = "bg-gray-800 opacity-50";
                  }
                } else if (selected === option) {
                  bg = "bg-blue-600";
                }

                return (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`rounded-xl px-6 py-4 text-left font-semibold transition-colors ${bg}`}
                    whileHover={!selected ? { scale: 1.02 } : undefined}
                    whileTap={!selected ? { scale: 0.98 } : undefined}
                    animate={
                      correctAnswer &&
                      option === selected &&
                      option !== correctAnswer
                        ? { x: [0, -10, 10, -10, 10, 0] }
                        : undefined
                    }
                    transition={{ duration: 0.4 }}
                    disabled={!!selected}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
