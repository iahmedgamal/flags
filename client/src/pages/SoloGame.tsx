import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { generateQuestions } from "@/lib/game";
import type { Country, Question, QuestionResult } from "@/lib/game";
import { usePlayer } from "@/hooks/usePlayer";
import { FlagEmoji } from "@/components/FlagEmoji";
import { LeaveGameModal } from "@/components/LeaveGameModal";
import { GameTopNav } from "@/components/GameTopNav";

const TOTAL_QUESTIONS = 40;
const SECONDS_PER_QUESTION = 7;

export function SoloGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transitionMs = searchParams.get("fast") ? 100 : 1000;
  const { player } = usePlayer();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [timer, setTimer] = useState(SECONDS_PER_QUESTION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultsRef = useRef<QuestionResult[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((countries: Country[]) => {
        setQuestions(generateQuestions(countries, "flag-to-capital", TOTAL_QUESTIONS));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || selected || paused) return;

    setTimer(SECONDS_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [current, loading, selected, paused]);

  useEffect(() => {
    if (timer === 0 && !selected && questions.length > 0) {
      handleAnswer(null);
    }
  }, [timer]);

  const handleAnswer = useCallback(
    (answer: string | null) => {
      if (selected) return;
      if (timerRef.current) clearInterval(timerRef.current);

      setSelected(answer || "__timeout__");
      const isCorrect = answer === questions[current].correctAnswer;
      setCorrect(isCorrect);

      resultsRef.current.push({
        correct: isCorrect,
        continent: questions[current].continent,
      });

      const newStreak = isCorrect ? streak + 1 : 0;
      const newScore = isCorrect ? score + 10 + (newStreak > 1 ? newStreak * 2 : 0) : score;
      const newBestStreak = Math.max(bestStreak, newStreak);

      setStreak(newStreak);
      setBestStreak(newBestStreak);
      setScore(newScore);

      setTimeout(() => {
        if (current + 1 >= questions.length) {
          const timeSeconds = (Date.now() - startTime) / 1000;
          const correctCount = resultsRef.current.filter((r) => r.correct).length;

          if (player) {
            fetch("/api/leaderboard", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                playerId: player.id,
                playerName: player.displayName,
                avatar: player.avatar,
                gameMode: "flag-to-capital",
                score: newScore,
                streak: newBestStreak,
                totalQuestions: questions.length,
                correctAnswers: correctCount,
                timeSeconds,
              }),
            }).catch(() => {});
          }

          navigate("/results", {
            state: {
              score: newScore,
              total: questions.length,
              correct: correctCount,
              streak: newBestStreak,
              timeSeconds,
              results: resultsRef.current,
            },
          });
        } else {
          setCurrent((prev) => prev + 1);
          setSelected(null);
          setCorrect(null);
        }
      }, transitionMs);
    },
    [selected, questions, current, streak, bestStreak, score, startTime, navigate, transitionMs, player]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.p
          className="text-xl text-[#8a8580]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Preparing your challenge...
        </motion.p>
      </div>
    );
  }

  const question = questions[current];
  const timerColor =
    timer > 4 ? "text-teal-400" : timer > 2 ? "text-amber-400" : "text-red-400";
  const timerBg =
    timer > 4 ? "bg-teal-500" : timer > 2 ? "bg-amber-500" : "bg-red-500";

  const handlePause = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPaused(true);
  };

  const handleResume = () => {
    setPaused(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <AnimatePresence>
        {paused && (
          <LeaveGameModal
            isPausable
            onResume={handleResume}
            onLeave={() => navigate("/")}
          />
        )}
      </AnimatePresence>

      <GameTopNav onSecondaryAction={handlePause} secondaryLabel="Pause" />

      {/* Header bar */}
      <div className="card-glass mt-12 flex w-full max-w-lg items-center justify-between rounded-xl px-5 py-3">
        <span className="label-caps">
          {current + 1} / {questions.length}
        </span>
        <motion.span
          className={`text-2xl font-bold tabular-nums ${timerColor}`}
          key={timer}
          initial={{ scale: 1.4, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {timer}s
        </motion.span>
        <span className="text-sm font-semibold text-amber-200/80">
          {score} <span className="label-caps">pts</span>
        </span>
        {streak > 1 && (
          <motion.span
            className="text-sm font-bold text-orange-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {streak}x
          </motion.span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full max-w-lg overflow-hidden rounded-full bg-white/5">
        <motion.div
          className={`h-full ${timerBg}`}
          animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
          transition={{ type: "spring" }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <FlagEmoji emoji={question.flag} countryName={question.countryName} />

          <p className="text-center text-lg text-[#8a8580]">
            What's the capital?
          </p>

          <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              let classes = "card-glass hover:border-amber-500/30 hover:bg-white/5";
              if (selected) {
                if (option === question.correctAnswer) {
                  classes = "border border-teal-500/60 bg-teal-500/15 text-teal-200";
                } else if (option === selected) {
                  classes = "border border-red-500/60 bg-red-500/15 text-red-200";
                } else {
                  classes = "card-glass opacity-30";
                }
              }

              return (
                <motion.button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={`rounded-xl px-6 py-4 text-left font-semibold transition-all ${classes}`}
                  whileHover={!selected ? { scale: 1.02 } : undefined}
                  whileTap={!selected ? { scale: 0.97 } : undefined}
                  animate={
                    selected && option === selected && !correct
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
  );
}
