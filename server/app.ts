import express from "express";
import ServerRoute from "./routes.js";

import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

const app = express();
app.use(express.json());

app.use("/server", ServerRoute);

app.listen(3000, () => console.log("listening on http://localhost:3000"));
