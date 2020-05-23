import { GameRequest, Cell, Snake } from "./types.ts";
import * as log from "./logger.ts";
import { myLocation, isMe } from "./self.ts";
import { cellToString, applyMoveToCell, getDistance } from "./utils.ts";
import { State } from "./state.ts";
import { Grid } from "./grid.ts";
import { DANGER } from "./keys.ts";


export const eatingScoresFromState = (urgency: number, state: State): number[] => {
    // TODO: implement eatingScoresFromState for emergencies
    return eatingScoresFromGrid(urgency, state);
}


export const eatingScoresFromGrid = (urgency: number, state: State): number[] => {
    const scores = [0, 0, 0, 0];
    // TODO: implement eatingScoresFromGrid
    log.status("Skipping eatingScoresFromGrid, not yet implemented.")
    return scores;
}


/**
 * Get a list of opponent head cells
 * @param state 
 */
export const getEnemySnakes = (state: State): Snake[] => {
    // FIXME: tyrelh getEnemyLocations not taking into account friendly names
    const snakes: Snake[] = [];
    for (let snake of state.board.snakes) {
        if (isMe(snake, state)) {
            continue;
        }
        snakes.push(snake);
    }
    return snakes;
}


export const edgeFillFromEnemyToSelf = (enemy: Snake, gridDataCopy: number[][], state: State): number[][] => {
    const enemyMoves: Cell[] = getEnemyMoveLocations(enemy, state);
    for (let enemyMove of enemyMoves) {
        // log.debug(`Doing enemy edge fill for move @ ${cellToString(enemyMove)}`)

        // TODO: tyrelh implement edge flood fill
        log.debug("Skipping edgeFillFromEnemyToSelf, not yet implemented.");

    }

    return gridDataCopy;
}


export const getEnemyMoveLocations = (enemy: Snake, state: State): Cell[] => {
    const positions = [];
    for (let m = 0; m < 4; m++) {
        if (validMove(m, enemy.head, state)) {
            positions.push(applyMoveToCell(m, enemy.head));
        }
    }
    return positions
}


export const distanceFromCellToClosestFoodInFoodList = (start: Cell, state: State): number => {
    try {
        const foodList = state.board.food;
        let closestFoodCell = null;
        let closestFoodDistance = 9999;
        for (let food of foodList) {
            let currentDistance = getDistance(start, food);
            if (currentDistance < closestFoodDistance) {
                closestFoodCell = food;
                closestFoodDistance = currentDistance;
            }
        }
        return ((closestFoodDistance === 9999) ? (state.board.height * 0.7) : closestFoodDistance);
    }
    catch (e) {
        log.error(`ex in search.distanceFromCellToClosestFoodInFoodList: `, e);
    }
    return ((state?.board?.height) ? (state.board.height * 0.7) : 80);
}


export const validMove = (move: number, cell: Cell, state: State): boolean => {
    const newCell = applyMoveToCell(move, cell);
    if (state.grid.outOfBounds(newCell)) {
        return false;
    }
    return (state.grid.value(newCell) <= DANGER);
}