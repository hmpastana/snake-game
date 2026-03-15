import { type Position } from "./board";
export declare function hasWallCollision(position: Position, rows: number, cols: number): boolean;
export declare function hasSelfCollision(position: Position, snake: Position[], includeTail: boolean): boolean;
