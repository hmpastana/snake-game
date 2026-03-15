import type { GameSnapshot } from "../core/game";
import type { GithubSnakeColors, ResolvedGithubSnakeConfig } from "../core/config";
interface RendererControls {
    onStart: () => void;
    onPause: () => void;
    onRestart: () => void;
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
    private readonly cells;
    constructor(config: ResolvedGithubSnakeConfig);
    bindControls(controls: RendererControls): void;
    render(snapshot: GameSnapshot): void;
    setTheme(colors: GithubSnakeColors, themeName: string): void;
    destroy(): void;
    private createCells;
    private updateOverlay;
    private applyTheme;
    private template;
    private requireElement;
}
export {};
