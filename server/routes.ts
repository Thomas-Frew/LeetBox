import { Router } from "express";
import * as Handler from "./handler";

const router = Router();

router.get("/problems", Handler.getProblems);

export default router;