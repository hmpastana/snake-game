import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "GithubSnake",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "github-snake.js" : "github-snake.cjs"),
    },
  },
});
