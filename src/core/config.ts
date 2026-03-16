export type GithubSnakeThemeName = "github-dark" | "github-light";

const DEFAULT_DESKTOP_ROWS = 7;
const DEFAULT_DESKTOP_COLS = 53;
const DEFAULT_MOBILE_ROWS = 20;
const DEFAULT_MOBILE_COLS = 20;

export interface GithubSnakeColors {
  pageBackground: string;
  chartBackground: string;
  border: string;
  text: string;
  mutedText: string;
  buttonBackground: string;
  buttonHover: string;
  buttonPrimary: string;
  buttonPrimaryHover: string;
  cellEmpty: string;
  cellLow: string;
  cellMedium: string;
  cellHigh: string;
  cellHighest: string;
  snake: string;
  snakeTail: string;
  food: string;
  foodCore: string;
  overlayBackground: string;
}

export interface GithubSnakeCallbacks {
  onScoreChange?: (score: number, bestScore: number, totalCommits: number) => void;
  onGameOver?: (score: number, totalCommits: number) => void;
}

export interface GithubSnakeDifficultyConfig {
  thresholds: number[];
  speedStep: number;
  maxSpeed: number;
  streakBonusEnabled: boolean;
  streakBonusEvery: number;
  streakBonusAmount: number;
  statusMessageDuration: number;
}

export interface GithubSnakeOptions extends GithubSnakeCallbacks {
  target: string | HTMLElement;
  rows?: number;
  cols?: number;
  cellSize?: number;
  gapSize?: number;
  theme?: GithubSnakeThemeName;
  customColors?: Partial<GithubSnakeColors>;
  speed?: number;
  showLegend?: boolean;
  showMonthLabels?: boolean;
  showWeekdayLabels?: boolean;
  showControls?: boolean;
  autoplay?: boolean;
  months?: string[];
  weekdays?: string[];
  storageKey?: string;
  difficulty?: Partial<GithubSnakeDifficultyConfig>;
}

export interface ResolvedGithubSnakeConfig extends GithubSnakeCallbacks {
  target: HTMLElement;
  rows: number;
  cols: number;
  cellSize: number;
  gapSize: number;
  theme: GithubSnakeThemeName;
  colors: GithubSnakeColors;
  speed: number;
  showLegend: boolean;
  showMonthLabels: boolean;
  showWeekdayLabels: boolean;
  showControls: boolean;
  autoplay: boolean;
  months: string[];
  weekdays: string[];
  storageKey: string;
  difficulty: GithubSnakeDifficultyConfig;
}

export const BUILT_IN_THEMES: Record<GithubSnakeThemeName, GithubSnakeColors> = {
  "github-dark": {
    pageBackground: "#0D1117",
    chartBackground: "#161B22",
    border: "#30363D",
    text: "#C9D1D9",
    mutedText: "#8B949E",
    buttonBackground: "#21262D",
    buttonHover: "#30363D",
    buttonPrimary: "#238636",
    buttonPrimaryHover: "#2EA043",
    cellEmpty: "#21262D",
    cellLow: "#0E4429",
    cellMedium: "#006D32",
    cellHigh: "#26A641",
    cellHighest: "#39D353",
    snake: "#39D353",
    snakeTail: "#26A641",
    food: "#8CFF85",
    foodCore: "#39D353",
    overlayBackground: "rgba(13, 17, 23, 0.86)",
  },
  "github-light": {
    pageBackground: "#FFFFFF",
    chartBackground: "#F6F8FA",
    border: "#D0D7DE",
    text: "#24292F",
    mutedText: "#57606A",
    buttonBackground: "#F6F8FA",
    buttonHover: "#EAECEF",
    buttonPrimary: "#1F883D",
    buttonPrimaryHover: "#1A7F37",
    cellEmpty: "#EBEDF0",
    cellLow: "#9BE9A8",
    cellMedium: "#40C463",
    cellHigh: "#30A14E",
    cellHighest: "#216E39",
    snake: "#30A14E",
    snakeTail: "#40C463",
    food: "#9BE9A8",
    foodCore: "#216E39",
    overlayBackground: "rgba(255, 255, 255, 0.92)",
  },
};

export function resolveConfig(options: GithubSnakeOptions): ResolvedGithubSnakeConfig {
  const target = resolveTarget(options.target);
  const theme = options.theme ?? "github-dark";
  const baseSpeed = clampNumber(options.speed, 170, 40);
  const isMobileViewport = shouldUseMobileBoard();
  const rows = resolveBoardRows(options.rows, isMobileViewport);
  const cols = resolveBoardCols(options.cols, isMobileViewport);
  const colors = {
    ...BUILT_IN_THEMES[theme],
    ...options.customColors,
  };

  return {
    target,
    rows,
    cols,
    cellSize: clampNumber(options.cellSize, 14, 8),
    gapSize: clampNumber(options.gapSize, 3, 1),
    theme,
    colors,
    speed: baseSpeed,
    showLegend: options.showLegend ?? true,
    showMonthLabels: options.showMonthLabels ?? true,
    showWeekdayLabels: options.showWeekdayLabels ?? true,
    showControls: options.showControls ?? true,
    autoplay: options.autoplay ?? false,
    months: options.months ?? ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    weekdays: options.weekdays ?? ["Mon", "Wed", "Fri"],
    storageKey: options.storageKey ?? "github-snake-best-score",
    onScoreChange: options.onScoreChange,
    onGameOver: options.onGameOver,
    difficulty: resolveDifficultyConfig(baseSpeed, options.difficulty),
  };
}

function resolveBoardRows(rows: number | undefined, isMobileViewport: boolean): number {
  if (isMobileViewport && (rows === undefined || rows === DEFAULT_DESKTOP_ROWS)) {
    return DEFAULT_MOBILE_ROWS;
  }

  return clampNumber(rows, DEFAULT_DESKTOP_ROWS, 4);
}

function resolveBoardCols(cols: number | undefined, isMobileViewport: boolean): number {
  if (isMobileViewport && (cols === undefined || cols === DEFAULT_DESKTOP_COLS)) {
    return DEFAULT_MOBILE_COLS;
  }

  return clampNumber(cols, DEFAULT_DESKTOP_COLS, 12);
}

function shouldUseMobileBoard(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(max-width: 720px)").matches;
}

export function resolveTarget(target: string | HTMLElement): HTMLElement {
  if (typeof target !== "string") {
    return target;
  }

  const element = document.querySelector<HTMLElement>(target);
  if (!element) {
    throw new Error(`GitHub Snake could not find target element: ${target}`);
  }

  return element;
}

export function resolveThemeColors(
  theme: GithubSnakeThemeName,
  customColors?: Partial<GithubSnakeColors>,
): GithubSnakeColors {
  return {
    ...BUILT_IN_THEMES[theme],
    ...customColors,
  };
}

function clampNumber(value: number | undefined, fallback: number, minimum: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.max(minimum, Math.floor(value));
}

function resolveDifficultyConfig(
  baseSpeed: number,
  difficulty?: Partial<GithubSnakeDifficultyConfig>,
): GithubSnakeDifficultyConfig {
  return {
    thresholds: difficulty?.thresholds ?? [10, 20, 35, 50],
    speedStep: difficulty?.speedStep ?? 16,
    maxSpeed: difficulty?.maxSpeed ?? Math.max(80, baseSpeed - 64),
    streakBonusEnabled: difficulty?.streakBonusEnabled ?? true,
    streakBonusEvery: difficulty?.streakBonusEvery ?? 5,
    streakBonusAmount: difficulty?.streakBonusAmount ?? 1,
    statusMessageDuration: difficulty?.statusMessageDuration ?? 1200,
  };
}
