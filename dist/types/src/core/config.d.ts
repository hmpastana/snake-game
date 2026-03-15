export type GithubSnakeThemeName = "github-dark" | "github-light";
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
export declare const BUILT_IN_THEMES: Record<GithubSnakeThemeName, GithubSnakeColors>;
export declare function resolveConfig(options: GithubSnakeOptions): ResolvedGithubSnakeConfig;
export declare function resolveTarget(target: string | HTMLElement): HTMLElement;
export declare function resolveThemeColors(theme: GithubSnakeThemeName, customColors?: Partial<GithubSnakeColors>): GithubSnakeColors;
