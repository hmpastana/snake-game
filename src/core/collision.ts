import { createBoardKey, isWithinBoard, type Position } from "./board";

export function hasWallCollision(position: Position, rows: number, cols: number): boolean {
  return !isWithinBoard(position, rows, cols);
}

export function hasSelfCollision(position: Position, snake: Position[], includeTail: boolean): boolean {
  const body = includeTail ? snake : snake.slice(0, -1);
  const key = createBoardKey(position);
  return body.some((segment) => createBoardKey(segment) === key);
}
