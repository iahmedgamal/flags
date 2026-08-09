import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { generateQuestions } from "@/lib/game";
import type { Country, Question, QuestionResult } from "@/lib/game";
import { usePlayer } from "@/hooks/usePlayer";

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

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((countries: Country[]) => {
        setQuestions(generateQuestions(countries, "flag-to-capital", TOTAL_QUESTIONS));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || selected) return;

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
  }, [current, loading, selected]);

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
          className="text-2xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Loading...
        </motion.p>
      </div>
    );
  }

  const question = questions[current];
  const timerColor = timer > 4 ? "text-emerald-400" : timer > 2 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <div className="flex w-full max-w-lg items-center justify-between text-sm text-gray-400">
        <span>
          {current + 1} / {questions.length}
        </span>
        <motion.span
          className={`text-2xl font-bold ${timerColor}`}
          key={timer}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
        >
          {timer}s
        </motion.span>
        <span>Score: {score}</span>
        {streak > 1 && (
          <motion.span
            className="text-orange-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            🔥 {streak}
          </motion.span>
        )}
      </div>

      <div className="h-2 w-full max-w-lg overflow-hidden rounded-full bg-gray-800">
        <motion.div
          className="h-full bg-emerald-500"
          animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
          transition={{ type: "spring" }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <span className="text-8xl">{question.flag}</span>

          <p className="text-center text-xl text-gray-300">What's the capital?</p>

          <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              let bg = "bg-gray-800 hover:bg-gray-700";
              if (selected) {
                if (option === question.correctAnswer) {
                  bg = "bg-emerald-600";
                } else if (option === selected) {
                  bg = "bg-red-600";
                } else {
                  bg = "bg-gray-800 opacity-50";
                }
              }

              return (
                <motion.button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={`rounded-xl px-6 py-4 text-left font-semibold transition-colors ${bg}`}
                  whileHover={!selected ? { scale: 1.02 } : undefined}
                  whileTap={!selected ? { scale: 0.98 } : undefined}
                  animate={
                    selected && option === selected && !correct
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
  );
}
