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
  continent: string;
}

export interface QuestionResult {
  correct: boolean;
  continent: string;
}

export interface ContinentBreakdown {
  continent: string;
  total: number;
  correct: number;
  percentage: number;
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
  return 10 + (streak > 1 ? streak * 2 : 0);
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

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function getContinentBreakdown(results: QuestionResult[]): ContinentBreakdown[] {
  const map = new Map<string, { total: number; correct: number }>();

  for (const r of results) {
    const entry = map.get(r.continent) || { total: 0, correct: 0 };
    entry.total += 1;
    if (r.correct) entry.correct += 1;
    map.set(r.continent, entry);
  }

  return Array.from(map.entries())
    .map(([continent, { total, correct }]) => ({
      continent,
      total,
      correct,
      percentage: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.percentage - b.percentage);
}

export function generateQuestions(
  countries: Country[],
  mode: GameMode,
  count: number
): Question[] {
  const pool = countries;

  // Africa is the center of the world — weight African countries 3x
  const african = pool.filter((c) => c.continent === "Africa");
  const others = pool.filter((c) => c.continent !== "Africa");
  const weighted = shuffle([...african, ...african, ...african, ...others]);

  // Pick unique countries from the weighted pool
  const seen = new Set<string>();
  const selected: Country[] = [];
  for (const c of weighted) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    selected.push(c);
    if (selected.length >= count) break;
  }

  return selected.map((country) => {
    const others = shuffle(pool.filter((c) => c.id !== country.id)).slice(0, 3);

    if (mode === "flag-to-country" || mode === "africa-only") {
      const options = shuffle([country.name, ...others.map((c) => c.name)]);
      return {
        prompt: "Which country does this flag belong to?",
        flag: country.flag_url,
        correctAnswer: country.name,
        options,
        continent: country.continent,
      };
    }

    if (mode === "country-to-capital") {
      const options = shuffle([country.capital, ...others.map((c) => c.capital)]);
      return {
        prompt: `What is the capital of ${country.name}?`,
        flag: country.flag_url,
        correctAnswer: country.capital,
        options,
        continent: country.continent,
      };
    }

    // flag-to-capital
    const options = shuffle([country.capital, ...others.map((c) => c.capital)]);
    return {
      prompt: "What is the capital of this country?",
      flag: country.flag_url,
      correctAnswer: country.capital,
      options,
      continent: country.continent,
    };
  });
}
