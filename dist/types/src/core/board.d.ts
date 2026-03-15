export interface Position {
    x: number;
    y: number;
}
export declare function createContributionGrid(rows: number, cols: number): number[][];
export declare function cloneContributionGrid(grid: number[][]): number[][];
export declare function createBoardKey(position: Position): string;
export declare function isWithinBoard(position: Position, rows: number, cols: number): boolean;
