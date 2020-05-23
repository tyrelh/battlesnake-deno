import { Cell } from "./types.ts";
import { UP, DOWN, LEFT, RIGHT } from "./keys.ts";
import { Y_DIRECTION } from "./params.ts";
// import { KEYS as K } from "./keys.ts";
// import { API_VERSION }


/**
 * Create a new Cell
 * @param x 
 * @param y 
 */
export const newCell = (x: number, y: number): Cell => {
    return { x: x, y: y };
}


export const applyMoveToCell = (move: number, cell: Cell): Cell => {
    switch (move) {
        case UP:
            return newCell(cell.x, cell.y + (Y_DIRECTION === UP ? -1 : 1));
        case DOWN:
            return newCell(cell.x, cell.y = (Y_DIRECTION === UP ? 1 : -1));
        case LEFT:
            return newCell(cell.x - 1, cell.y);
        case RIGHT:
            return newCell(cell.x + 1, cell.y);
        default:
            return cell;
    }
}


/**
 * Combines two Cells coordinates to create a new Cell
 * @param offset 
 * @param cell 
 */
export const applyOffsetToCell = (offset: Cell, cell: Cell): Cell => {
    return { x: offset.x + cell.x, y: offset.y + cell.y };
}


/**
 * String representation of Cell
 * @param cell 
 */
export const cellToString = (cell: Cell) => {
    return `{ x: ${cell.x}, y: ${cell.y} }`;
}