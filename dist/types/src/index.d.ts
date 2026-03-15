import "./styles/base.css";
import { type GithubSnakeColors, type GithubSnakeOptions, type GithubSnakeThemeName } from "./core/config";
export type { GithubSnakeOptions, GithubSnakeColors, GithubSnakeThemeName } from "./core/config";
export interface GithubSnakeInstance {
    start(): void;
    pause(): void;
    restart(): void;
    destroy(): void;
    setTheme(theme: GithubSnakeThemeName, customColors?: Partial<GithubSnakeColors>): void;
    setSpeed(speed: number): void;
}
export declare function createGithubSnake(options: GithubSnakeOptions): GithubSnakeInstance;
