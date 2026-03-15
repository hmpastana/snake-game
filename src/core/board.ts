export interface Position {
  x: number;
  y: number;
}

export function createContributionGrid(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function cloneContributionGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

export function createBoardKey(position: Position): string {
  return `${position.x},${position.y}`;
}

export function isWithinBoard(position: Position, rows: number, cols: number): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x < cols &&
    position.y < rows
  );
}
