import { createGithubSnake } from "../src";

const demoApp = document.getElementById("demo-app");

if (!demoApp) {
  throw new Error("GitHub Snake demo mount element not found.");
}

const game = createGithubSnake({
  target: demoApp,
  rows: 7,
  cols: 53,
  theme: "github-dark",
  speed: 170,
  showLegend: true,
  showMonthLabels: true,
  showWeekdayLabels: true,
});

applyPageTheme("github-dark");

demoApp.addEventListener("github-snake:themechange", (event) => {
  const customEvent = event as CustomEvent<{ theme: "github-dark" | "github-light" }>;
  applyPageTheme(customEvent.detail.theme);
});

game.start();

function applyPageTheme(theme: "github-dark" | "github-light"): void {
  const isLight = theme === "github-light";
  document.documentElement.style.colorScheme = isLight ? "light" : "dark";
  document.body.style.background = isLight ? "#FFFFFF" : "#0D1117";
  document.body.style.color = isLight ? "#24292F" : "#C9D1D9";
}
