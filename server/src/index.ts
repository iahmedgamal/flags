import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import { setupSocket } from "./socket";
import playersRouter from "./routes/players";
import leaderboardRouter from "./routes/leaderboard";
import countriesRouter from "./routes/countries";

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/players", playersRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/countries", countriesRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

setupSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
});
