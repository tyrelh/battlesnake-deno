import { GameState, Cell } from "./types.ts";
import { PARAMS as P } from "./params.ts";
import * as log from "./logger.ts";
import { nearPerimeter, copyGrid, onPerimeter } from "./grid.ts";
import { myLocation, isMe } from "./self.ts";
import { cellToString } from "./utils.ts";


/**
 * Preprocess grid to find valuable cells
 * @param grid 
 * @param gameState 
 */
export const preprocessGrid = (grid: number[][], gameState: GameState): number[][] => {
    log.status("Preprocessing grid.")
    if (nearPerimeter(myLocation(gameState), grid)) {
        log.debug("I am near perimeter.");
        const enemyHeadLocations = getEnemyLocations(gameState);
        const gridCopy = copyGrid(grid);

        for (let enemyHead of enemyHeadLocations) {
            if (onPerimeter(enemyHead, grid)) {
                log.debug(`Enemy at ${cellToString(enemyHead)} is on perimeter`);
                // TODO: tyrelh implement edgeFillFromEnemyToYou
            }
        }
        return gridCopy;
    }
    return grid;
}


/**
 * Get a list of opponent head cells
 * @param gameState 
 */
export const getEnemyLocations = (gameState: GameState): Cell[] => {
    // TODO: tyrelh getEnemyLocations not taking into account friendly names
    const locations = [];
    for (let snake of gameState.board.snakes) {
        if (isMe(snake, gameState)) {
            continue;
        }
        locations.push(snake.head);
    }
    return locations;
}