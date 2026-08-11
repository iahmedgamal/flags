import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "@/lib/socket";
import { usePlayer } from "@/hooks/usePlayer";
import { FlagEmoji } from "@/components/FlagEmoji";
import { LeaveGameModal } from "@/components/LeaveGameModal";
import { GameTopNav } from "@/components/GameTopNav";

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
  const [showLeave, setShowLeave] = useState(false);
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
          className="text-xl text-[#8a8580]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Waiting for game...
        </motion.p>
      </div>
    );
  }

  const timerColor =
    timer > 4 ? "text-teal-400" : timer > 2 ? "text-amber-400" : "text-red-400";
  const timerBg =
    timer > 4 ? "bg-teal-500" : timer > 2 ? "bg-amber-500" : "bg-red-500";

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  const handleLeave = () => {
    if (room) {
      socket.emit("leave-room", { code: room.code, playerId: player?.id });
    }
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AnimatePresence>
        {showLeave && (
          <LeaveGameModal
            onResume={() => setShowLeave(false)}
            onLeave={handleLeave}
          />
        )}
      </AnimatePresence>

      <GameTopNav
        onSecondaryAction={() => setShowLeave(true)}
        secondaryLabel="Leave"
        secondaryVariant="leave"
      />

      <div className="mt-14 flex flex-1 flex-col lg:flex-row">
        {/* Scoreboard — top on mobile, sidebar on desktop */}
        <div className="flex flex-row gap-2 overflow-x-auto border-b border-white/5 p-3 lg:w-64 lg:flex-col lg:overflow-x-visible lg:border-b-0 lg:border-r lg:p-4">
          <p className="label-caps hidden lg:block">SCOREBOARD</p>
          {sortedPlayers.map((p, i) => (
            <motion.div
              key={p.id}
              className={`card-glass flex shrink-0 items-center gap-2 rounded-xl p-2 lg:p-3 ${
                p.id === player?.id ? "border-teal-500/40 bg-teal-500/10" : ""
              }`}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <span className="text-xs font-bold text-[#8a8580]">{i + 1}</span>
              <span className="text-lg">{p.avatar}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#f5f0eb]">{p.displayName}</p>
                <p className="text-xs font-semibold text-amber-200/80">{p.score} pts</p>
              </div>
              {p.streak > 1 && (
                <motion.span
                  className="ml-auto text-xs font-bold text-orange-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {p.streak}x
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Game area */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
          <div className="card-glass flex w-full max-w-lg items-center justify-between rounded-xl px-5 py-3">
            <span className="label-caps">
              {question.index + 1} / {question.total}
            </span>
            <motion.span
              className={`text-2xl font-bold tabular-nums ${timerColor}`}
              key={timer}
              initial={{ scale: 1.4, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {timer}s
            </motion.span>
          </div>

          <div className="h-1 w-full max-w-lg overflow-hidden rounded-full bg-white/5">
            <motion.div
              className={`h-full ${timerBg}`}
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
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <FlagEmoji emoji={question.flag} countryName={question.countryName} />
              <p className="text-center text-lg text-[#8a8580]">
                {question.prompt}
              </p>

              <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
                {question.options.map((option) => {
                  let classes = "card-glass hover:border-amber-500/30 hover:bg-white/5";
                  if (correctAnswer) {
                    if (option === correctAnswer) {
                      classes = "border border-teal-500/60 bg-teal-500/15 text-teal-200";
                    } else if (option === selected) {
                      classes = "border border-red-500/60 bg-red-500/15 text-red-200";
                    } else {
                      classes = "card-glass opacity-30";
                    }
                  } else if (selected === option) {
                    classes = "border border-amber-500/60 bg-amber-500/15 text-amber-200";
                  }

                  return (
                    <motion.button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`rounded-xl px-6 py-4 text-left font-semibold transition-all ${classes}`}
                      whileHover={!selected ? { scale: 1.02 } : undefined}
                      whileTap={!selected ? { scale: 0.97 } : undefined}
                      animate={
                        correctAnswer &&
                        option === selected &&
                        option !== correctAnswer
                          ? { x: [0, -8, 8, -8, 8, 0] }
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
    </div>
  );
}
