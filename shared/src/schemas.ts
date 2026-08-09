import { z } from "zod";

export const playerSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1, "Display name is required"),
  avatar: z.string(),
  email: z.string().email().nullish(),
  emailVerified: z.boolean().default(false),
  emailOptedInAt: z.string().datetime().nullish(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertPlayerSchema = playerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const countrySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  capital: z.string(),
  flagUrl: z.string(),
  continent: z.string(),
  region: z.string().nullish(),
});

export const gameModeSchema = z.enum([
  "flag-to-country",
  "country-to-capital",
  "flag-to-capital",
  "africa-only",
]);

export const questionSchema = z.object({
  countryId: z.string().uuid(),
  prompt: z.string(),
  correctAnswer: z.string(),
  options: z.array(z.string()).length(4),
  mode: gameModeSchema,
});

export const gameResultSchema = z.object({
  playerId: z.string().uuid(),
  playerName: z.string(),
  avatar: z.string(),
  gameMode: gameModeSchema,
  score: z.number().int(),
  streak: z.number().int(),
  totalQuestions: z.number().int(),
  correctAnswers: z.number().int(),
  timeSeconds: z.number(),
});

export const leaderboardEntrySchema = gameResultSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const roomSchema = z.object({
  code: z.string().length(6),
  hostId: z.string().uuid(),
  players: z.array(
    z.object({
      id: z.string().uuid(),
      displayName: z.string(),
      avatar: z.string(),
      score: z.number().int().default(0),
      streak: z.number().int().default(0),
    })
  ),
  gameMode: gameModeSchema,
  currentQuestion: z.number().int().default(0),
  totalQuestions: z.number().int().default(10),
  status: z.enum(["waiting", "playing", "finished"]),
});

export type Player = z.infer<typeof playerSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Country = z.infer<typeof countrySchema>;
export type GameMode = z.infer<typeof gameModeSchema>;
export type Question = z.infer<typeof questionSchema>;
export type GameResult = z.infer<typeof gameResultSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type Room = z.infer<typeof roomSchema>;
