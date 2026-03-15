import { createGithubSnake } from "../src";

const game = createGithubSnake({
  target: "#demo-app",
  rows: 7,
  cols: 53,
  theme: "github-dark",
  speed: 170,
  showLegend: true,
  showMonthLabels: true,
  showWeekdayLabels: true,
});

game.start();
