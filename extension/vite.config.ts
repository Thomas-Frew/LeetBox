import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

export default defineConfig(({ command }) =>
  command === "serve"
    ? { root: "src", plugins: [preact()] }
    : { plugins: [preact(), crx({ manifest })] },
);
