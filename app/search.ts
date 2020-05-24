import { GameRequest, Cell, Snake } from "./types.ts";
import * as log from "./logger.ts";
import { myLocation, isMe } from "./self.ts";
import { cellToString, applyMoveToCell, getDistance, newCell, calcDirection } from "./utils.ts";
import { State } from "./state.ts";
import { Grid } from "./grid.ts";
import { DANGER, FOOD, KILL_ZONE, ENEMY_HEAD, DIRECTIONS, SMALL_DANGER, SNAKE_BODY, WARNING } from "./keys.ts";
import { DECAY } from "./weights.ts";
import { moveInScores } from "./scores.ts";
import { astar } from "./astar.ts";


export const eatingScoresFromState = (urgency: number, state: State): number[] => {
    // TODO: implement eatingScoresFromState for emergencies
    return eatingScoresFromGrid(urgency, state);
}


export const eatingScoresFromGrid = (urgency: number, state: State): number[] => {
    const scores = [0, 0, 0, 0];
    try {
        const myHead: Cell = myLocation(state);
        const gridCopy: Grid = state.grid.copyGrid();
        let food = null;
        while (true) {
            // get next closest food from grid
            food = closestFood(myHead, gridCopy);
            if (food === null) {
                break;
            }

            // perform search for all possible moves
            for (let m of DIRECTIONS) {
                const startPosition = applyMoveToCell(m, myHead);
                if (!state.grid.outOfBounds(startPosition) && state.grid.value(startPosition) < SMALL_DANGER) {
                    let movePosition = null;
                    let distance = 1;
                    let move = null;
                    let searchResult = astar(startPosition, food, state, SNAKE_BODY, true);
                    if (searchResult.success) {
                        movePosition = searchResult.position;
                        distance = searchResult.distance;
                        if (movePosition !== null) {
                            move = calcDirection(myHead, movePosition);
                        }
                        if (move !== null) {
                            log.debug(`Distance: ${distance}`);
                            distance = distance / 2;
                            scores[move] += (urgency * Math.exp((-Math.abs(distance)) / DECAY.FOOD_DISTANCE));
                        }
                    }
                }
            }
            gridCopy.updateCell(food, WARNING);
        }
    } catch (e) {
        log.error("EX in search.eatingScoresFromGrid: ", e);
    }

    if (!moveInScores(scores)) {
        // TODO: enable backup search when implemented
        log.debug("Skipping backup eatingScoresFromState search, not yet implemented")
        // scores = eatingScoresFromState(urgency, state);
    }
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


export const closestFood = (startCell: Cell, grid: Grid): Cell | null => {
    return closestTarget(startCell, grid, FOOD);
}


export const closestKillableSnake = (startCell: Cell, grid: Grid): Cell | null => {
    return closestTarget(startCell, grid, KILL_ZONE);
}


export const closestDangerSnake = (startCell: Cell, grid: Grid): Cell | null => {
    return closestTarget(startCell, grid, ENEMY_HEAD);
}


export const closestTarget = (startCell: Cell, grid: Grid, targetType: number): Cell | null => {
    try {
        let closestTarget = null;
        let closestDistance = 9999;
        for (let i = 0; i < grid.height; i++) {
            for (let j = 0; j < grid.width; j++) {
                const target = newCell(j, i);
                if (grid.value(target) === targetType) {
                    const distance = getDistance(startCell, target);
                    if (distance < closestDistance) {
                        closestTarget = target;
                        closestDistance = distance;
                    }
                }
            }
        }
        return closestTarget;
    } catch (e) {
        log.error(`ex in target.closestTarget ${e}`);
    }
    return null;
}