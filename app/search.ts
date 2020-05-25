import { GameRequest, Cell, Snake } from "./types.ts";
import * as log from "./logger.ts";
import { myLocation, isMe } from "./self.ts";
import { cellToString, applyMoveToCell, getDistance, newCell, calcDirection } from "./utils.ts";
import { State } from "./state.ts";
import { Grid } from "./grid.ts";
import { DANGER, FOOD, KILL_ZONE, ENEMY_HEAD, DIRECTIONS, SMALL_DANGER, SNAKE_BODY, WARNING, FUTURE_2 } from "./keys.ts";
import { DECAY, EXPONENT, MULTIPLIER } from "./weights.ts";
import { moveInScores } from "./scores.ts";
import { astar } from "./astar.ts";


/**
 * Get move scores for eating with data from Grid
 * @param urgency 
 * @param state 
 */
export const eatingScoresFromGrid = (urgency: number, state: State): number[] => {
    const foods: Cell[] = state.grid.getAll(FOOD);
    let scores = eatingScoresFromListOfFood(foods, state, urgency);
    if (!moveInScores(scores)) {
        scores = eatingScoresFromState(urgency, state);
    }
    return scores
}


/**
 * Get move scores for eating with data from state
 * @param urgency 
 * @param state 
 */
export const eatingScoresFromState = (urgency: number, state: State): number[] => {
    return eatingScoresFromListOfFood(state.board.food, state, urgency);
}


/**
 * Get move scores for eating for a list of food
 * @param foods 
 * @param state 
 * @param urgency 
 */
export const eatingScoresFromListOfFood = (foods: Cell[], state: State, urgency: number = 1) => {
    const scores = [0, 0, 0, 0];
    try {
        const myHead: Cell = myLocation(state);
        // TODO: refactor eatingScoresFromListOfFood to use the new scoring functions tyrelh
        const sortedFoodByDistance = foods.sort((a: Cell, b: Cell) => getDistance(myHead, a) - getDistance(myHead, b))
        while (sortedFoodByDistance.length > 0) {
            const food = sortedFoodByDistance[0];
            sortedFoodByDistance.shift();

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
        }
    } catch (e) {
        log.error("EX in search.eatingScoresFromListOfFoods: ", e);
    }
    return scores;
}


/**
 * Get move scores for hunting killzones
 * @param state 
 */
export const huntingScoresForAccessableKillzones = (state: State): number[] => {
    let scores = [0, 0, 0, 0];
    try {
        const scoringFunction = (distance: number, startPosition: Cell): number => {
            let score = 0;
            if (state.grid.value(startPosition) >= SMALL_DANGER) {
                score = (Math.pow(distance, EXPONENT.HUNT_DISTANCE_KILLZONE) / 10);
            } else {
                score = Math.pow(distance, EXPONENT.HUNT_DISTANCE_KILLZONE);
            }
            return score;
        }
        const killzones = state.grid.getAll(KILL_ZONE);
        scores = getScoresForTargets(killzones, scoringFunction, state);
    } catch(e) {
        log.error("EX in search.huntingScoresForAccessableKillzones: ", e);
    }
    return scores;
}


/**
 * Get move scores for hunting future2s
 * @param state 
 */
export const huntingScoresForAccessibleFuture2 = (state: State): number[] => {
    let scores = [0, 0, 0, 0]
    try {
        const scoringFunction = (distance: number, startPosition: Cell): number => {
            return Math.pow(distance, EXPONENT.HUNT_DISTANCE_FUTURE2)
        }
        const future2s = state.grid.getAll(FUTURE_2);
        scores = getScoresForTargets(future2s, scoringFunction, state);
    } catch(e) {
        log.error("EX in search.huntingScoresForAccessibleFuture2: ", e);
    }
    return scores;
}


/**
 * Get move scores for hunting a list of targets
 * @param targets 
 * @param scoringFunction 
 * @param state 
 */
const getScoresForTargets = (targets: Cell[], scoringFunction: (distance: number, startPosition: Cell) => number, state: State): number[] => {
    let scores = [0, 0, 0, 0];
    try {
        const myHead = myLocation(state);
        // loop over all targets
        for (let target of targets) {
            // loop through all possible moves
            for (let move of DIRECTIONS) {
                const startPosition = applyMoveToCell(move, myHead);
                // if move is valid
                if (!state.grid.outOfBounds(startPosition) && state.grid.value(startPosition) < SNAKE_BODY) {
                    let searchResult = astar(startPosition, target, state, SNAKE_BODY, true);
                    // if path is found
                    if (searchResult.success) {
                        scores[move] += scoringFunction(searchResult.distance, startPosition);
                    }
                }
            }
        }
    } catch(e) {
        log.error("EX in search.getHuntingScores: ", e);
    }
    return scores;
}


/**
 * Get move scores for farther from walls bias
 * @param state 
 */
export const fartherFromWallsBias = (state: State): number[] => {
    let scores = [0, 0, 0, 0];
    let minimumScore = 9999;
    try {
        for (let move of DIRECTIONS) {
            const currentDistance = distanceFromWall(applyMoveToCell(move, myLocation(state)), state);
            if (scores[move] < currentDistance) {
                scores[move] = currentDistance * MULTIPLIER.WALL_DISTANCE
                if (scores[move] < minimumScore) {
                    minimumScore = scores[move];
                }
            }
        }
        scores = scores.map((x: number): number => x - minimumScore);
    } catch (e) {
        log.error("EX in search.fartherFromWallsBias", e);
    }
    return scores;
}


/**
 * Calculate the distance from a Cell to the wall
 * @param cell 
 * @param state 
 */
export const distanceFromWall = (cell: Cell, state: State): number => {
    try {
        const yDown = cell.y;
        const yUp = (state.grid.height - 1) - cell.y;
        const xLeft = cell.x;
        const xRight = (state.grid.width - 1) - cell.x;
        const xDistance = Math.min(xLeft, xRight);
        const yDistance = Math.min(yUp, yDown);
        return (xDistance + yDistance);
    }
    catch (e) {
        log.error(`ex in search.distanceFromWall: ${e}`)
    };
    return 0;
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