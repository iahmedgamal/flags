import { Router } from "express";
import { db } from "../db";

const router = Router();

/**
 * @openapi
 * /countries:
 *   get:
 *     summary: Get all countries
 *     tags: [Countries]
 *     parameters:
 *       - in: query
 *         name: continent
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of countries
 */
router.get("/", async (req, res) => {
  const { continent } = req.query;
  let query = db("countries").orderBy("name");
  if (continent) {
    query = query.where("continent", continent);
  }
  const countries = await query;
  res.json(countries);
});

/**
 * @openapi
 * /countries/{id}:
 *   get:
 *     summary: Get a country by ID
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Country found
 *       404:
 *         description: Country not found
 */
router.get("/:id", async (req, res) => {
  const country = await db("countries").where("id", req.params.id).first();
  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }
  res.json(country);
});

export default router;
