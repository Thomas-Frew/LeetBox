import type { Question } from "@prisma/client";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/db.js";

export async function listQuestions(
  req: Request,
  res: Response<Question[]>,
  next: NextFunction,
) {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { id: "asc" },
    });
    return res.json(questions);
  } catch (error) {
    return next(error);
  }
}
