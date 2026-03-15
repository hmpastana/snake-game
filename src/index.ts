import "./styles/base.css";

import { resolveConfig, resolveThemeColors, type GithubSnakeColors, type GithubSnakeOptions, type GithubSnakeThemeName } from "./core/config";
import { GithubSnakeCore } from "./core/game";
import type { Direction } from "./core/snake";
import { DomRenderer } from "./renderers/domRenderer";

export type { GithubSnakeOptions, GithubSnakeColors, GithubSnakeThemeName } from "./core/config";

export interface GithubSnakeInstance {
  start(): void;
  pause(): void;
  restart(): void;
  destroy(): void;
  setTheme(theme: GithubSnakeThemeName, customColors?: Partial<GithubSnakeColors>): void;
  setSpeed(speed: number): void;
}

export function createGithubSnake(options: GithubSnakeOptions): GithubSnakeInstance {
  const config = resolveConfig(options);
  let lastBestScore = readBestScore(config.storageKey);
  const core = new GithubSnakeCore({
    rows: config.rows,
    cols: config.cols,
    baseSpeed: config.speed,
    bestScore: lastBestScore,
    difficulty: config.difficulty,
  });
  const renderer = new DomRenderer(config);
  let previousScore = 0;
  let previousStatus = core.getSnapshot().status;

  renderer.bindControls({
    onStart: () => core.start(),
    onPause: () => core.pause(),
    onRestart: () => core.restart(),
  });

  const unsubscribe = core.subscribe((snapshot) => {
    renderer.render(snapshot);

    if (snapshot.bestScore !== lastBestScore) {
      writeBestScore(config.storageKey, snapshot.bestScore);
      lastBestScore = snapshot.bestScore;
    }

    if (snapshot.score !== previousScore) {
      config.onScoreChange?.(snapshot.score, snapshot.bestScore, snapshot.totalCommits);
      previousScore = snapshot.score;
    }

    if (previousStatus !== "over" && snapshot.status === "over") {
      config.onGameOver?.(snapshot.score, snapshot.totalCommits);
    }

    previousStatus = snapshot.status;
  });

  const onKeyDown = (event: KeyboardEvent): void => {
    const direction = keyToDirection(event.key);
    if (!direction) {
      return;
    }

    event.preventDefault();
    core.setDirection(direction);
    if (core.getSnapshot().status !== "running") {
      core.start();
    }
  };

  document.addEventListener("keydown", onKeyDown);

  if (config.autoplay) {
    core.start();
  }

  return {
    start: () => core.start(),
    pause: () => core.pause(),
    restart: () => core.restart(),
    destroy: () => {
      unsubscribe();
      document.removeEventListener("keydown", onKeyDown);
      core.destroy();
      renderer.destroy();
    },
    setTheme: (theme, customColors) => {
      renderer.setTheme(resolveThemeColors(theme, customColors), theme);
    },
    setSpeed: (speed) => {
      core.setSpeed(speed);
    },
  };
}

function keyToDirection(key: string): Direction | null {
  const map: Record<string, Direction> = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    W: { x: 0, y: -1 },
    S: { x: 0, y: 1 },
    A: { x: -1, y: 0 },
    D: { x: 1, y: 0 },
  };

  return map[key] ?? null;
}

function readBestScore(storageKey: string): number {
  try {
    return Number(window.localStorage.getItem(storageKey) || 0);
  } catch {
    return 0;
  }
}

function writeBestScore(storageKey: string, bestScore: number): void {
  try {
    window.localStorage.setItem(storageKey, String(bestScore));
  } catch {
    // Ignore storage failures to keep the library embeddable in constrained environments.
  }
}
