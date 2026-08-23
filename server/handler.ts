import { Request, Response } from "express";

export async function getProblems(
    req: Request,
    res: Response
) {
    res.json({ok: true});
}