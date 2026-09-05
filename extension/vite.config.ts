import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { crx } from "@crxjs/vite-plugin";
import base from "./manifest.base.json";
import chrome from "./manifest.chrome.json";
import firefox from "./manifest.firefox.json";

const target = process.env.TARGET ?? "chrome";
const manifest = { ...base, ...(target === "firefox" ? firefox : chrome) };

export default defineConfig(({ command }) =>
  command === "serve"
    ? { root: "src", plugins: [preact(), tailwindcss()] }
    : {
        plugins: [
          preact(),
          tailwindcss(),
          crx({ manifest, browser: target as "chrome" | "firefox" }),
        ],
        build: { outDir: `dist/${target}` },
      },
);
