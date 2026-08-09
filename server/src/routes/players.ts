import { Router } from "express";
import { db } from "../db";
import { insertPlayerSchema } from "@flags/shared";

interface PlayerRow {
  id: string;
  display_name: string;
  avatar: string;
  email: string | null;
  email_verified: boolean;
  email_opted_in_at: string | null;
  created_at: string;
  updated_at: string;
}

function toPlayerResponse(row: PlayerRow) {
  return {
    id: row.id,
    displayName: row.display_name,
    avatar: row.avatar,
    email: row.email,
    emailVerified: row.email_verified,
    emailOptedInAt: row.email_opted_in_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const router = Router();

/**
 * @openapi
 * /players:
 *   post:
 *     summary: Create a new player
 *     tags: [Players]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [displayName, avatar]
 *             properties:
 *               displayName:
 *                 type: string
 *               avatar:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Player created
 */
router.post("/", async (req, res) => {
  const parsed = insertPlayerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [player] = await db("players")
    .insert({
      display_name: parsed.data.displayName,
      avatar: parsed.data.avatar,
      email: parsed.data.email ?? null,
      email_verified: parsed.data.emailVerified ?? false,
    })
    .returning("*");
  res.status(201).json(toPlayerResponse(player));
});

/**
 * @openapi
 * /players/{id}:
 *   get:
 *     summary: Get a player by ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Player found
 *       404:
 *         description: Player not found
 */
router.get("/:id", async (req, res) => {
  const player = await db("players").where("id", req.params.id).first();
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }
  res.json(toPlayerResponse(player));
});

/**
 * @openapi
 * /players/{id}/email:
 *   patch:
 *     summary: Add email to existing player
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email added
 */
router.patch("/:id/email", async (req, res) => {
  const { email } = req.body;
  const [player] = await db("players")
    .where("id", req.params.id)
    .update({
      email,
      email_opted_in_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .returning("*");
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }
  res.json(toPlayerResponse(player));
});

export default router;
