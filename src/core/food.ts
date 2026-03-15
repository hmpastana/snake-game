import { createBoardKey, type Position } from "./board";

export function spawnFood(rows: number, cols: number, snake: Position[]): Position | null {
  const occupied = new Set(snake.map(createBoardKey));
  const available: Position[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const candidate = { x, y };
      if (!occupied.has(createBoardKey(candidate))) {
        available.push(candidate);
      }
    }
  }

  if (available.length === 0) {
    return null;
  }

  return available[Math.floor(Math.random() * available.length)];
}
