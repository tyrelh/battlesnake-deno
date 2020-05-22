import { GameState, Cell, Snake } from "./types.ts";
import { KEYS as K } from "./keys.ts";
import { newCell, applyOffsetToCell } from "./utils.ts";
import * as log from "./logger.ts";
import { ORIGIN_POS, PARAMS } from "./params.ts";
import { isFriendly, isMe } from "./self.ts";

/**
 * Build grid using game state of current turn
 * @param gameState game state for this turn
 */
export const buildGrid = (gameState: GameState): number[][] => {
    const board = gameState.board;
    const self = gameState.you;
    const numberOfSnakes = board.snakes.length;

    // initialize grid
    const grid = initGrid(board.width, board.height, K.SPACE);

    // mark edges
    for (let y = 0; y < board.height; y++) {
        updateGridCell(grid, newCell(0, y), K.WALL_NEAR);
        updateGridCell(grid, newCell(board.width - 1, y), K.WALL_NEAR);
    }
    for (let x = 0; x < board.width; x++) {
        updateGridCell(grid, newCell(x, 0), K.WALL_NEAR);
        updateGridCell(grid, newCell(x, board.height - 1), K.WALL_NEAR);
    }

    // fill food locations
    board.food.forEach((food: Cell) => {
        updateGridCell(grid, food, K.FOOD);
    });

    // fill snake locations
    board.snakes.forEach((snake: Snake) => {
        const snakeIsMe = isMe(snake, gameState);
        const friendlySnake = (isFriendly(snake) && numberOfSnakes >= 2);
        const dangerSnake = (snake.length >= self.length);

        // fill snake body locations
        snake.body.forEach((bodySegment: Cell) => {
            updateGridCell(grid, bodySegment, (snakeIsMe) ? K.YOUR_BODY : K.SNAKE_BODY);
        });

        // fill head locations
        if (!snakeIsMe) {
            updateGridCell(grid, snake.head, (dangerSnake || friendlySnake) ? K.ENEMY_HEAD: K.SMALL_HEAD)
        }

        // check if tail can be marked as tail or snake body
        if (snake.health !== 100 && gameState.turn > 1) {
            const tail = snake.body[snake.length - 1];
            updateGridCell(grid, tail, K.TAIL);
        }

        // fill future locations around snake head
        if (!snakeIsMe) {
            // future 1
            let future1Key = K.DANGER;
            if (self.length > snake.length && !friendlySnake) {
                future1Key = K.KILL_ZONE;
            }
            else if (self.length === snake.length && !friendlySnake) {
                future1Key = K.SMALL_DANGER;
            }
            const future1Offsets = [
                newCell(0, -1), // down
                newCell(0, 1), // up
                newCell(-1, 0), // left
                newCell(1, 0) // right
            ];
            for (let offset of future1Offsets) {
                const position = applyOffsetToCell(offset, snake.head)
                const value = getGridCellValue(position, grid);
                if (!outOfBounds(position, grid) && value <= K.DANGER) {
                    updateGridCell(grid, position, future1Key);
                }
            }

            // future 2
            const future2Offsets = [
                newCell(-1, -1),
                newCell(-2, 0),
                newCell(-1, 1),
                newCell(0, 2),
                newCell(1, 1),
                newCell(2, 0),
                newCell(1, -1),
                newCell(0, -2)
            ];
            // TODO: tyrelh bug: marking tail as future 2 when cell not actually accessible in 2 turns
            for (let offset of future2Offsets) {
                const position = applyOffsetToCell(offset, snake.head);
                const value = getGridCellValue(position, grid);
                if (!outOfBounds(position, grid) && value <= K.WALL_NEAR && value !== K.FOOD) {
                    updateGridCell(grid, position, K.FUTURE_2)
                }
            }
        }
    });

    if (PARAMS.DEBUG_MAPS) {
        printGrid(grid);
    }
    return grid;
}


/**
 * Create a grid: number[][] filled with a given value
 * @param width width of grid
 * @param height height of grid
 * @param fillValue value to fill grid with
 */
export const initGrid = (width: number, height: number, fillValue: number): number[][] => {
    const grid = new Array(height);
    for (let i = 0; i < height; i++) {
        grid[i] = new Array(width);
        for (let j = 0; j < height; j++) {
            updateGridCell(grid, newCell(j, i), fillValue)
        }
    }
    return grid;
}


/**
 * Update a cell in a grid with newValue
 * @param grid 
 * @param cell 
 * @param newValue 
 */
export const updateGridCell = (grid: number[][], cell: Cell, newValue: number): number[][] => {
    grid[cell.y][cell.x] = newValue;
    return grid;
}


export const getGridCellValue = (cell: Cell, grid: number[][]): number => {
    return grid[cell.y][cell.x];
}


/**
 * Pretty print a grid to the console
 * @param grid 
 */
export const printGrid = (grid: number[][]) => {
    if (ORIGIN_POS === K.UP) {
        let xAxis = "  ";
        for (let x = 0; x < grid[0].length; x++) {
            xAxis += ` ${x % 10}`
        }
        log.status(`${xAxis}\n`);
        for (let i = 0; i < grid.length; i++) {
            let row = `${i % 10} `;
            for (let j = 0; j < grid[0].length; j++) {
                row += ` ${K.MAP[grid[i][j]]}`;
            }
            log.status(row);
        }
    }
    else {
        for (let i = grid.length - 1; i >= 0; i--) {
            let row = `${i % 10} `;
            for (let j = 0; j < grid[0].length; j++) {
                row += ` ${K.MAP[grid[i][j]]}`;
            }
            log.status(row);
        }
        let xAxis = "  ";
        for (let x = 0; x < grid[0].length; x++) {
            xAxis += ` ${x % 10}`
        }
        log.status(`\n${xAxis}`);
    }    
};


/**
 * Test if Cell is outside a grid
 * @param cell 
 * @param grid 
 */
export const outOfBounds = (cell: Cell, grid: number[][]): boolean => {
    return (cell.x < 0 || cell.y < 0 || cell.y >= grid.length || cell.x >= grid[0].length);
}