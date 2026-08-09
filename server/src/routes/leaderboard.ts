import { Router } from "express";
import { db } from "../db";
import { gameResultSchema } from "@flags/shared";

interface LeaderboardRow {
  id: string;
  player_id: string;
  player_name: string;
  avatar: string;
  game_mode: string;
  score: number;
  streak: number;
  total_questions: number;
  correct_answers: number;
  time_seconds: number;
  created_at: string;
}

function toLeaderboardResponse(row: LeaderboardRow) {
  return {
    id: row.id,
    playerId: row.player_id,
    playerName: row.player_name,
    avatar: row.avatar,
    gameMode: row.game_mode,
    score: row.score,
    streak: row.streak,
    totalQuestions: row.total_questions,
    correctAnswers: row.correct_answers,
    timeSeconds: row.time_seconds,
    createdAt: row.created_at,
  };
}

const router = Router();

/**
 * @openapi
 * /leaderboard:
 *   get:
 *     summary: Get top scores
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [flag-to-country, country-to-capital, flag-to-capital, africa-only]
 *       - in: query
 *         name: playerId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Top scores
 */
router.get("/", async (req, res) => {
  const { mode, playerId, limit = 20 } = req.query;
  let query = db("leaderboard").orderBy("score", "desc").limit(Number(limit));
  if (mode) {
    query = query.where("game_mode", mode);
  }
  if (playerId) {
    query = query.where("player_id", playerId);
  }
  const entries = await query;
  res.json(entries.map(toLeaderboardResponse));
});

/**
 * @openapi
 * /leaderboard:
 *   post:
 *     summary: Submit a game result
 *     tags: [Leaderboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Score submitted
 */
router.post("/", async (req, res) => {
  const parsed = gameResultSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [entry] = await db("leaderboard")
    .insert({
      player_id: parsed.data.playerId,
      player_name: parsed.data.playerName,
      avatar: parsed.data.avatar,
      game_mode: parsed.data.gameMode,
      score: parsed.data.score,
      streak: parsed.data.streak,
      total_questions: parsed.data.totalQuestions,
      correct_answers: parsed.data.correctAnswers,
      time_seconds: parsed.data.timeSeconds,
    })
    .returning("*");
  res.status(201).json(toLeaderboardResponse(entry));
});

export default router;
