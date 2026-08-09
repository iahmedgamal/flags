import { describe, it, expect } from "vitest";
import {
  shuffle,
  calculateScore,
  getResultEmoji,
  getResultMessage,
  generateQuestions,
} from "./game";
import type { Country } from "./game";

const MOCK_COUNTRIES: Country[] = [
  { id: "1", name: "Nigeria", capital: "Abuja", flag_url: "🇳🇬", continent: "Africa" },
  { id: "2", name: "Kenya", capital: "Nairobi", flag_url: "🇰🇪", continent: "Africa" },
  { id: "3", name: "Ghana", capital: "Accra", flag_url: "🇬🇭", continent: "Africa" },
  { id: "4", name: "Egypt", capital: "Cairo", flag_url: "🇪🇬", continent: "Africa" },
  { id: "5", name: "France", capital: "Paris", flag_url: "🇫🇷", continent: "Europe" },
  { id: "6", name: "Germany", capital: "Berlin", flag_url: "🇩🇪", continent: "Europe" },
];

describe("shuffle", () => {
  it("should return array with same length", () => {
    // Arrange
    const input = [1, 2, 3, 4, 5];

    // When
    const result = shuffle(input);

    // Assert
    expect(result).toHaveLength(input.length);
  });

  it("should contain all original elements", () => {
    // Arrange
    const input = [1, 2, 3, 4, 5];

    // When
    const result = shuffle(input);

    // Assert
    expect(result.sort()).toEqual(input.sort());
  });

  it("should not mutate the original array", () => {
    // Arrange
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];

    // When
    shuffle(input);

    // Assert
    expect(input).toEqual(copy);
  });
});

describe("calculateScore", () => {
  it("should return 12 for streak of 1", () => {
    // When
    const result = calculateScore(1);

    // Assert
    expect(result).toBe(12);
  });

  it("should return 10 for streak of 0", () => {
    // When
    const result = calculateScore(0);

    // Assert
    expect(result).toBe(10);
  });

  it("should return 20 for streak of 5", () => {
    // When
    const result = calculateScore(5);

    // Assert
    expect(result).toBe(20);
  });
});

describe("getResultEmoji", () => {
  it("should return trophy for 100%", () => {
    expect(getResultEmoji(100)).toBe("🏆");
  });

  it("should return star for 80-99%", () => {
    expect(getResultEmoji(80)).toBe("🌟");
    expect(getResultEmoji(99)).toBe("🌟");
  });

  it("should return thumbs up for 60-79%", () => {
    expect(getResultEmoji(60)).toBe("👍");
    expect(getResultEmoji(79)).toBe("👍");
  });

  it("should return thinking for 40-59%", () => {
    expect(getResultEmoji(40)).toBe("🤔");
    expect(getResultEmoji(59)).toBe("🤔");
  });

  it("should return book for below 40%", () => {
    expect(getResultEmoji(39)).toBe("📚");
    expect(getResultEmoji(0)).toBe("📚");
  });
});

describe("getResultMessage", () => {
  it("should return perfect message for 100%", () => {
    expect(getResultMessage(100)).toContain("Perfect");
  });

  it("should return encouraging message for low scores", () => {
    expect(getResultMessage(20)).toContain("exploring");
  });
});

describe("generateQuestions", () => {
  it("should generate the requested number of questions", () => {
    // When
    const questions = generateQuestions(MOCK_COUNTRIES, "flag-to-country", 3);

    // Assert
    expect(questions).toHaveLength(3);
  });

  it("should have 4 options per question", () => {
    // When
    const questions = generateQuestions(MOCK_COUNTRIES, "flag-to-country", 3);

    // Assert
    questions.forEach((q) => {
      expect(q.options).toHaveLength(4);
    });
  });

  it("should include correct answer in options", () => {
    // When
    const questions = generateQuestions(MOCK_COUNTRIES, "flag-to-country", 3);

    // Assert
    questions.forEach((q) => {
      expect(q.options).toContain(q.correctAnswer);
    });
  });

  it("should filter to Africa-only for africa-only mode", () => {
    // When
    const questions = generateQuestions(MOCK_COUNTRIES, "africa-only", 3);

    // Assert — correct answers should all be African countries
    const africanNames = MOCK_COUNTRIES
      .filter((c) => c.continent === "Africa")
      .map((c) => c.name);

    questions.forEach((q) => {
      expect(africanNames).toContain(q.correctAnswer);
    });
  });

  it("should ask about capitals in country-to-capital mode", () => {
    // When
    const questions = generateQuestions(MOCK_COUNTRIES, "country-to-capital", 3);

    // Assert
    const allCapitals = MOCK_COUNTRIES.map((c) => c.capital);
    questions.forEach((q) => {
      expect(allCapitals).toContain(q.correctAnswer);
      expect(q.prompt).toContain("capital");
    });
  });

  it("should ask about capitals in flag-to-capital mode", () => {
    // When
    const questions = generateQuestions(MOCK_COUNTRIES, "flag-to-capital", 2);

    // Assert
    const allCapitals = MOCK_COUNTRIES.map((c) => c.capital);
    questions.forEach((q) => {
      expect(allCapitals).toContain(q.correctAnswer);
    });
  });

  it("should not exceed available countries", () => {
    // When — requesting more than available
    const questions = generateQuestions(MOCK_COUNTRIES, "flag-to-country", 100);

    // Assert
    expect(questions).toHaveLength(MOCK_COUNTRIES.length);
  });
});
