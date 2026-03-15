import type { GithubSnakeDifficultyConfig } from "./config";
import { hasSelfCollision, hasWallCollision } from "./collision";
import { createBoardKey, createContributionGrid, cloneContributionGrid, type Position } from "./board";
import { spawnFood } from "./food";
import { cloneSnake, createInitialSnake, getNextHead, isOppositeDirection, type Direction } from "./snake";

export type GameStatus = "idle" | "running" | "paused" | "over";

export interface GithubSnakeCoreOptions {
  rows: number;
  cols: number;
  baseSpeed: number;
  bestScore?: number;
  difficulty: GithubSnakeDifficultyConfig;
}

export interface GameSnapshot {
  rows: number;
  cols: number;
  status: GameStatus;
  snake: Position[];
  previousSnake: Position[];
  food: Position | null;
  contributions: number[][];
  score: number;
  bestScore: number;
  totalCommits: number;
  flashKeys: Set<string>;
  speed: number;
  streak: number;
  difficultyLevel: number;
  statusMessage: string | null;
}

type Listener = (snapshot: GameSnapshot) => void;

export class GithubSnakeCore {
  private readonly rows: number;
  private readonly cols: number;
  private readonly difficulty: GithubSnakeDifficultyConfig;
  private listeners = new Set<Listener>();
  private animationFrameId = 0;
  private lastTimestamp = 0;
  private accumulatedTime = 0;
  private flashes = new Map<string, number>();
  private baseSpeed: number;
  private speed: number;
  private status: GameStatus = "idle";
  private score = 0;
  private bestScore = 0;
  private totalCommits = 0;
  private streak = 0;
  private difficultyLevel = 0;
  private snake: Position[] = [];
  private previousSnake: Position[] = [];
  private food: Position | null = null;
  private contributions: number[][] = [];
  private direction: Direction = { x: 1, y: 0 };
  private queuedDirection: Direction = { x: 1, y: 0 };
  private statusMessage: string | null = null;
  private statusMessageTimeRemaining = 0;

  constructor(options: GithubSnakeCoreOptions) {
    this.rows = options.rows;
    this.cols = options.cols;
    this.difficulty = options.difficulty;
    this.baseSpeed = options.baseSpeed;
    this.speed = options.baseSpeed;
    this.bestScore = options.bestScore ?? 0;
    this.resetState();
    this.emit();
    this.animationFrameId = window.requestAnimationFrame(this.frame);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  start(): void {
    if (this.status === "over") {
      this.restart();
      return;
    }

    this.status = "running";
    this.emit();
  }

  pause(): void {
    if (this.status !== "running") {
      return;
    }

    this.status = "paused";
    this.emit();
  }

  restart(): void {
    this.resetState();
    this.status = "running";
    this.emit();
  }

  destroy(): void {
    window.cancelAnimationFrame(this.animationFrameId);
    this.listeners.clear();
  }

  setSpeed(speed: number): void {
    this.baseSpeed = Math.max(40, Math.floor(speed));
    this.speed = this.calculateSpeed();
    this.emit();
  }

  setDirection(direction: Direction): void {
    if (this.snake.length > 1 && isOppositeDirection(this.direction, direction)) {
      return;
    }

    this.queuedDirection = direction;
  }

  setBestScore(bestScore: number): void {
    this.bestScore = bestScore;
    this.emit();
  }

  getSnapshot(): GameSnapshot {
    return this.snapshot();
  }

  private resetState(): void {
    this.snake = createInitialSnake(this.rows, this.cols);
    this.previousSnake = cloneSnake(this.snake);
    this.direction = { x: 1, y: 0 };
    this.queuedDirection = { x: 1, y: 0 };
    this.food = spawnFood(this.rows, this.cols, this.snake);
    this.score = 0;
    this.totalCommits = 0;
    this.streak = 0;
    this.difficultyLevel = 0;
    this.accumulatedTime = 0;
    this.lastTimestamp = 0;
    this.speed = this.baseSpeed;
    this.status = "idle";
    this.contributions = createContributionGrid(this.rows, this.cols);
    this.flashes.clear();
    this.statusMessage = null;
    this.statusMessageTimeRemaining = 0;
  }

  private readonly frame = (timestamp: number): void => {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }

    const delta = Math.min(32, timestamp - this.lastTimestamp);
    this.lastTimestamp = timestamp;

    if (this.status === "running") {
      this.accumulatedTime += delta;

      while (this.accumulatedTime >= this.speed) {
        this.accumulatedTime -= this.speed;
        this.step();
        if (this.status !== "running") {
          this.accumulatedTime = 0;
          break;
        }
      }
    }

    this.updateEffects(delta);
    this.emit();
    this.animationFrameId = window.requestAnimationFrame(this.frame);
  };

  private step(): void {
    this.previousSnake = cloneSnake(this.snake);

    if (!isOppositeDirection(this.direction, this.queuedDirection)) {
      this.direction = { ...this.queuedDirection };
    }

    const nextHead = getNextHead(this.snake[0], this.direction);
    const willEatFood = Boolean(this.food) && nextHead.x === this.food!.x && nextHead.y === this.food!.y;

    if (hasWallCollision(nextHead, this.rows, this.cols) || hasSelfCollision(nextHead, this.snake, willEatFood)) {
      this.status = "over";
      return;
    }

    this.snake.unshift(nextHead);

    if (willEatFood) {
      this.collectFood(nextHead);
      return;
    }

    this.snake.pop();
    this.streak = 0;
  }

  private collectFood(head: Position): void {
    this.score += 1;
    this.totalCommits += 1;
    this.streak += 1;
    this.contributions[head.y][head.x] = Math.min(4, this.contributions[head.y][head.x] + 1);
    this.flashes.set(createBoardKey(head), 260);
    this.bestScore = Math.max(this.bestScore, this.score);
    const nextDifficultyLevel = this.getDifficultyLevel(this.score);
    if (nextDifficultyLevel > this.difficultyLevel) {
      this.difficultyLevel = nextDifficultyLevel;
      this.setStatusMessage(this.difficultyLevel === 1 ? "Velocity increased" : "Level up");
    }

    if (
      this.difficulty.streakBonusEnabled &&
      this.streak > 0 &&
      this.streak % this.difficulty.streakBonusEvery === 0
    ) {
      this.score += this.difficulty.streakBonusAmount;
      this.bestScore = Math.max(this.bestScore, this.score);
      this.setStatusMessage("Commit streak bonus");
    }

    this.speed = this.calculateSpeed();
    this.food = spawnFood(this.rows, this.cols, this.snake);

    if (!this.food) {
      this.status = "over";
    }
  }

  private calculateSpeed(): number {
    const level = this.getDifficultyLevel(this.score);
    return Math.max(this.difficulty.maxSpeed, this.baseSpeed - level * this.difficulty.speedStep);
  }

  private getDifficultyLevel(score: number): number {
    return this.difficulty.thresholds.reduce((level, threshold) => {
      return score >= threshold ? level + 1 : level;
    }, 0);
  }

  private setStatusMessage(message: string): void {
    this.statusMessage = message;
    this.statusMessageTimeRemaining = this.difficulty.statusMessageDuration;
  }

  private updateEffects(delta: number): void {
    for (const [key, value] of this.flashes.entries()) {
      const nextValue = value - delta;
      if (nextValue <= 0) {
        this.flashes.delete(key);
      } else {
        this.flashes.set(key, nextValue);
      }
    }

    if (this.statusMessageTimeRemaining > 0) {
      this.statusMessageTimeRemaining -= delta;
      if (this.statusMessageTimeRemaining <= 0) {
        this.statusMessageTimeRemaining = 0;
        this.statusMessage = null;
      }
    }
  }

  private emit(): void {
    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => {
      listener(snapshot);
    });
  }

  private snapshot(): GameSnapshot {
    return {
      rows: this.rows,
      cols: this.cols,
      status: this.status,
      snake: cloneSnake(this.snake),
      previousSnake: cloneSnake(this.previousSnake),
      food: this.food ? { ...this.food } : null,
      contributions: cloneContributionGrid(this.contributions),
      score: this.score,
      bestScore: this.bestScore,
      totalCommits: this.totalCommits,
      flashKeys: new Set(this.flashes.keys()),
      speed: this.speed,
      streak: this.streak,
      difficultyLevel: this.difficultyLevel,
      statusMessage: this.statusMessage,
    };
  }
}
