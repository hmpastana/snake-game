import type { Position } from "./board";

export interface Direction {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}

export function createInitialSnake(rows: number, cols: number): Position[] {
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);

  return [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];
}

export function cloneSnake(snake: Position[]): Position[] {
  return snake.map((segment) => ({ ...segment }));
}

export function getNextHead(head: Position, direction: Direction): Position {
  return {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };
}

export function isOppositeDirection(current: Direction, next: Direction): boolean {
  return current.x === -next.x && current.y === -next.y;
}
