import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { GameMode } from "@flags/shared";

interface Country {
  id: string;
  name: string;
  capital: string;
  flag_url: string;
  continent: string;
}

interface Question {
  prompt: string;
  correctAnswer: string;
  options: string[];
  flag: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(
  countries: Country[],
  mode: GameMode,
  count: number
): Question[] {
  let pool = countries;
  if (mode === "africa-only") {
    pool = countries.filter((c) => c.continent === "Africa");
  }

  const selected = shuffle(pool).slice(0, count);

  return selected.map((country) => {
    const others = shuffle(pool.filter((c) => c.id !== country.id)).slice(0, 3);

    if (mode === "flag-to-country" || mode === "africa-only") {
      const options = shuffle([
        country.name,
        ...others.map((c) => c.name),
      ]);
      return {
        prompt: "Which country does this flag belong to?",
        flag: country.flag_url,
        correctAnswer: country.name,
        options,
      };
    }

    if (mode === "country-to-capital") {
      const options = shuffle([
        country.capital,
        ...others.map((c) => c.capital),
      ]);
      return {
        prompt: `What is the capital of ${country.name}?`,
        flag: country.flag_url,
        correctAnswer: country.capital,
        options,
      };
    }

    // flag-to-capital
    const options = shuffle([
      country.capital,
      ...others.map((c) => c.capital),
    ]);
    return {
      prompt: "What is the capital of this country?",
      flag: country.flag_url,
      correctAnswer: country.capital,
      options,
    };
  });
}

export function SoloGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") || "flag-to-country") as GameMode;
  const count = Number(searchParams.get("count") || 10);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((countries: Country[]) => {
        setQuestions(generateQuestions(countries, mode, count));
        setLoading(false);
      });
  }, [mode, count]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (selected) return;
      setSelected(answer);
      const isCorrect = answer === questions[current].correctAnswer;
      setCorrect(isCorrect);

      const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
      const newScore = isCorrect ? score + 10 + (streak + 1) * 2 : score;
      const newStreak = isCorrect ? streak + 1 : 0;
      const newBestStreak = Math.max(bestStreak, newStreak);

      if (isCorrect) {
        setCorrectCount(newCorrectCount);
        setStreak(newStreak);
        setBestStreak(newBestStreak);
        setScore(newScore);
      } else {
        setStreak(0);
      }

      setTimeout(() => {
        if (current + 1 >= questions.length) {
          const timeSeconds = (Date.now() - startTime) / 1000;
          navigate(
            `/solo/results?score=${newScore}&total=${questions.length}&correct=${newCorrectCount}&streak=${newBestStreak}&time=${timeSeconds.toFixed(1)}&mode=${mode}`
          );
        } else {
          setCurrent((prev) => prev + 1);
          setSelected(null);
          setCorrect(null);
        }
      }, 1000);
    },
    [selected, questions, current, streak, bestStreak, score, correctCount, startTime, navigate, mode]
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <div className="flex w-full max-w-lg items-center justify-between text-sm text-gray-400">
        <span>
          {current + 1} / {questions.length}
        </span>
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

          <p className="text-center text-xl text-gray-300">{question.prompt}</p>

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
