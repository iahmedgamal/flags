import type { GameMode } from "@flags/shared";

export interface Country {
  id: string;
  name: string;
  capital: string;
  flag_url: string;
  continent: string;
}

export interface Question {
  prompt: string;
  correctAnswer: string;
  options: string[];
  flag: string;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function calculateScore(streak: number): number {
  return 10 + streak * 2;
}

export function getResultEmoji(percentage: number): string {
  if (percentage === 100) return "🏆";
  if (percentage >= 80) return "🌟";
  if (percentage >= 60) return "👍";
  if (percentage >= 40) return "🤔";
  return "📚";
}

export function getResultMessage(percentage: number): string {
  if (percentage === 100) return "Perfect! You're a geography genius!";
  if (percentage >= 80) return "Amazing! Almost perfect!";
  if (percentage >= 60) return "Great job! Keep learning!";
  if (percentage >= 40) return "Not bad! Practice makes perfect!";
  return "Keep exploring the world!";
}

export function generateQuestions(
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
      const options = shuffle([country.name, ...others.map((c) => c.name)]);
      return {
        prompt: "Which country does this flag belong to?",
        flag: country.flag_url,
        correctAnswer: country.name,
        options,
      };
    }

    if (mode === "country-to-capital") {
      const options = shuffle([country.capital, ...others.map((c) => c.capital)]);
      return {
        prompt: `What is the capital of ${country.name}?`,
        flag: country.flag_url,
        correctAnswer: country.capital,
        options,
      };
    }

    // flag-to-capital
    const options = shuffle([country.capital, ...others.map((c) => c.capital)]);
    return {
      prompt: "What is the capital of this country?",
      flag: country.flag_url,
      correctAnswer: country.capital,
      options,
    };
  });
}
