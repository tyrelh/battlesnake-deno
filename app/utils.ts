import { Cell } from "./types.ts"


/**
 * Create a new Cell
 * @param x 
 * @param y 
 */
export const newCell = (x: number, y: number): Cell => {
    return { x: x, y: y };
}


/**
 * Combines two Cells coordinates to create a new Cell
 * @param offset 
 * @param cell 
 */
export const applyOffsetToCell = (offset: Cell, cell: Cell): Cell => {
    return { x: offset.x + cell.x, y: offset.y + cell.y };
}