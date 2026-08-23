import { Router } from "express";
import { listQuestions } from "./questions.handlers.js";

export const questionsRouter = Router();
questionsRouter.get("/", listQuestions);
