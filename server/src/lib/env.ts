import dotenv from "dotenv";
import { expand } from "dotenv-expand";

expand(dotenv.config({ path: new URL("../../../.env", import.meta.url) }));

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const DATABASE_URL = required("DATABASE_URL");
export const PORT = Number(process.env.PORT ?? 3000);
