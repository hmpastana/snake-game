import type { GameSnapshot } from "../core/game";
import type { GithubSnakeColors, GithubSnakeThemeName, ResolvedGithubSnakeConfig } from "../core/config";
interface RendererControls {
    onStart: () => void;
    onPause: () => void;
    onRestart: () => void;
    onThemeChange: (theme: GithubSnakeThemeName) => void;
}
export declare class DomRenderer {
    private readonly config;
    private readonly root;
    private readonly scoreValue;
    private readonly bestScoreValue;
    private readonly totalCommitsValue;
    private readonly boardElement;
    private readonly overlay;
    private readonly overlayTitle;
    private readonly overlayText;
    private readonly statusBadge;
    private readonly primaryButton;
    private readonly restartButton;
    private readonly lightThemeButton;
    private readonly darkThemeButton;
    private readonly cells;
    private currentTheme;
    constructor(config: ResolvedGithubSnakeConfig);
    bindControls(controls: RendererControls): void;
    render(snapshot: GameSnapshot): void;
    setTheme(colors: GithubSnakeColors, themeName: GithubSnakeThemeName): void;
    destroy(): void;
    setHostAppearance(appearance: {
        textColor?: string;
        mutedTextColor?: string;
        fontFamily?: string;
    }): void;
    private createCells;
    private updateOverlay;
    private applyTheme;
    private template;
    private requireElement;
    private updateThemeButtons;
}
export {};
