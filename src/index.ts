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
  let activeTheme = resolveInitialTheme(options);
  const config = resolveConfig({
    ...options,
    theme: activeTheme,
  });
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
    onThemeChange: (theme) => {
      activeTheme = theme;
      applyTheme(renderer, theme);
      writeThemePreference(config.storageKey, theme);
      dispatchThemeChange(config.target, theme);
    },
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

  dispatchThemeChange(config.target, activeTheme);

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
      activeTheme = theme;
      renderer.setTheme(resolveThemeColors(theme, customColors), theme);
      writeThemePreference(config.storageKey, theme);
      dispatchThemeChange(config.target, theme);
    },
    setSpeed: (speed) => {
      core.setSpeed(speed);
    },
  };
}

function resolveInitialTheme(options: GithubSnakeOptions): GithubSnakeThemeName {
  if (options.theme) {
    return options.theme;
  }

  const hostTheme = detectHostTheme(options.target);
  if (hostTheme) {
    return hostTheme;
  }

  const themeStorageKey = getThemeStorageKey(options.storageKey);
  try {
    const savedTheme = window.localStorage.getItem(themeStorageKey);
    if (savedTheme === "github-light" || savedTheme === "github-dark") {
      return savedTheme;
    }
  } catch {
    // Ignore storage errors and continue to OS preference.
  }

  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "github-light"
    : "github-dark";
}

function detectHostTheme(target: GithubSnakeOptions["target"]): GithubSnakeThemeName | null {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const resolvedTarget = typeof target === "string"
    ? document.querySelector<HTMLElement>(target)
    : target;

  const candidates: Array<Element | null> = [
    resolvedTarget,
    resolvedTarget?.closest("[data-theme]") ?? null,
    document.documentElement,
    document.body,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const datasetTheme = candidate.getAttribute("data-theme");
    if (datasetTheme === "light") {
      return "github-light";
    }

    if (datasetTheme === "dark") {
      return "github-dark";
    }

    const classList = Array.from(candidate.classList);
    if (classList.includes("light")) {
      return "github-light";
    }

    if (classList.includes("dark")) {
      return "github-dark";
    }
  }

  const colorScheme = getComputedStyle(document.documentElement).colorScheme;
  if (colorScheme.includes("light")) {
    return "github-light";
  }

  if (colorScheme.includes("dark")) {
    return "github-dark";
  }

  return null;
}

function getThemeStorageKey(storageKey?: string): string {
  return `${storageKey ?? "github-snake-best-score"}-theme`;
}

function writeThemePreference(storageKey: string, theme: GithubSnakeThemeName): void {
  try {
    window.localStorage.setItem(getThemeStorageKey(storageKey), theme);
  } catch {
    // Ignore storage failures for embeddable use.
  }
}

function applyTheme(renderer: DomRenderer, theme: GithubSnakeThemeName): void {
  renderer.setTheme(resolveThemeColors(theme), theme);
}

function dispatchThemeChange(target: HTMLElement, theme: GithubSnakeThemeName): void {
  target.dispatchEvent(
    new CustomEvent("github-snake:themechange", {
      detail: { theme },
      bubbles: true,
    }),
  );
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
