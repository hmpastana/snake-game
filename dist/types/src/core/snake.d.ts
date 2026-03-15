import type { Position } from "./board";
export interface Direction {
    x: -1 | 0 | 1;
    y: -1 | 0 | 1;
}
export declare function createInitialSnake(rows: number, cols: number): Position[];
export declare function cloneSnake(snake: Position[]): Position[];
export declare function getNextHead(head: Position, direction: Direction): Position;
export declare function isOppositeDirection(current: Direction, next: Direction): boolean;
