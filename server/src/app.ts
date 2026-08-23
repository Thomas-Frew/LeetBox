import express from "express";
import { questionsRouter } from "./api/questions/questions.routes.js";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/questions", questionsRouter);
