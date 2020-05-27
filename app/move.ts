import { State } from "./state.ts";
import { RIGHT, EATING, UP, DOWN, LEFT, DIRECTION_ICON, BEHAVIOURS, EATING_EMERGENCY, HUNTING } from "./keys.ts";
import * as log from "./logger.ts";
import { applyMoveToCell, cellToString } from "./utils.ts";
import { baseScoreForCell, scoresToString, combineScores, normalizeScores, highestScoreMove, moveInScores } from "./scores.ts";
import { myHungerUrgency, isHungerEmergency, existsSnakeSmallerThanMe } from "./self.ts";
import { distanceFromCellToClosestFoodInFoodList, eatingScoresFromState, eatingScoresFromGrid, huntingScoresForAccessableKillzones, huntingScoresForAccessibleFuture2, fartherFromWallsBias, fartherFromDangerousSnakesBias, floodBias, closerToTailsBias, tightMoveBias } from "./search.ts";


/**
 * Seek food
 * @param state 
 * @param playSafe 
 */
export const eat = (state: State, playSafe: boolean = false): number => {
    let scores = [0, 0, 0, 0];
    let behaviour = EATING;
    const hungerUrgency = myHungerUrgency(state);
    const emergency = isHungerEmergency(state)
    log.status(`EATING w/ urgency ${hungerUrgency} ${emergency ? ", EMERGENCY!" : ""}`);

    // if emergency look for closest foods in data list
    if (emergency) {
        behaviour = EATING_EMERGENCY;
        try {
            scores = eatingScoresFromState(hungerUrgency, state);
        } catch (e) {
            log.error(`EX in move.eat.emergency: ${e}`);
        }
    }
    // if not emergency use foods marked in grid
    else {
        try {
            scores = eatingScoresFromGrid(hungerUrgency, state);
        } catch (e) {
            log.error(`EX in move.eat.non-emergency: ${e}`);
        }
    }

    return addBiasesToBehaviour(scores, state, playSafe, behaviour);
}

/**
 * Seek nearest killable enemy snake
 * @param state 
 * @param playSafe 
 */
export const hunt = (state: State, playSafe: boolean = false): number => {
    let scores = [0, 0, 0, 0];
    log.status("HUNTING");
    try {
        scores = huntingScoresForAccessableKillzones(state);
        if (!moveInScores(scores)) {
            log.status("No accessable killzone found, targeting future 2.")
            scores = huntingScoresForAccessibleFuture2(state);
        }
    } catch (e) {
        log.error(`EX in move.hunt: ${e}`);
    }
    return addBiasesToBehaviour(scores, state, playSafe, HUNTING);
}


export const lateHunt = (state: State, playSafe: boolean = false): number => {
    let scores = [0, 0, 0, 0];
    log.status("HUNTING, LATE GAME");
    try {
        if (existsSnakeSmallerThanMe(state)) {
            scores = huntingScoresForAccessableKillzones(state);
        } else {
            scores = huntingScoresForAccessibleFuture2(state);
        }
    } catch (e) {
        log.error(`EX in move.hunt: ${e}`);
    }
    return addBiasesToBehaviour(scores, state, playSafe, HUNTING);
}


/**
 * Add bias scores to behaviour scores
 * @param behaviourScores 
 * @param state 
 * @param playSafe 
 * @param behaviour 
 */
const addBiasesToBehaviour = (behaviourScores: number[], state: State, playSafe: boolean = false, behaviour: number | null = null): number => {
    let scores = [behaviourScores[0], behaviourScores[1], behaviourScores[2], behaviourScores[3]];
    log.status(`Behaviour scores:\n ${scoresToString(behaviourScores)}`);

    // TODO: implement fallback bias tyrelh

    // base bias
    const baseBiasScores = baseMoveBias(state);
    log.status(`Base bias scores:\n ${scoresToString(baseBiasScores)}`);
    scores = combineScores(baseBiasScores, scores);

    // TODO: implement tight move bias tyrelh
    const tightMoveBiasScores = tightMoveBias(state);
    log.status(`Tight move bias scores:\n ${scoresToString(tightMoveBiasScores)}`);
    scores = combineScores(tightMoveBiasScores, scores)

    // flood bias
    const floodBiasScores = floodBias(state);
    log.status(`Flood bias scores:\n ${scoresToString(floodBiasScores)}`);
    scores = combineScores(floodBiasScores, scores)

    // dangerous snakes bias
    const fartherFromDangerousSnakesBiasScores = fartherFromDangerousSnakesBias(state);
    log.status(`Farther from dangerous snakes bias scores:\n ${scoresToString(fartherFromDangerousSnakesBiasScores)}`);
    scores = combineScores(fartherFromDangerousSnakesBiasScores, scores);

    // TODO: implement closer to killable snake heads bias tyrelh

    // center bias
    const fartherFromWallsBiasScores = fartherFromWallsBias(state);
    log.status(`Farther from walls bias scores:\n ${scoresToString(fartherFromWallsBiasScores)}`);
    scores = combineScores(fartherFromWallsBiasScores, scores);

    // tail bias
    const closerToTailsScores = closerToTailsBias(state);
    log.status(`Closer to tails scores:\n ${scoresToString(closerToTailsScores)}`);
    scores = combineScores(closerToTailsScores, scores);

    // log all scores together for readability in logs
    log.status(`\nBehaviour scores:\n ${scoresToString(behaviourScores)}`);
    log.status(`Base bias scores:\n ${scoresToString(baseBiasScores)}`);
    log.status(`Tight move bias scores:\n ${scoresToString(tightMoveBiasScores)}`);
    log.status(`Flood bias scores:\n ${scoresToString(floodBiasScores)}`);
    log.status(`Farther from dangerous snakes bias scores:\n ${scoresToString(fartherFromDangerousSnakesBiasScores)}`);
    log.status(`Farther from walls bias scores:\n ${scoresToString(fartherFromWallsBiasScores)}`);
    log.status(`Closer to tails scores:\n ${scoresToString(closerToTailsScores)}`);

    state.grid.print();
    
    scores = normalizeScores(scores);
    log.status(`\nFinal scores:\n ${scoresToString(scores)}`);
    log.status(`\nMove: ${DIRECTION_ICON[highestScoreMove(scores)]}${behaviour !== null ? `  was ${BEHAVIOURS[behaviour]}` : ""}\n`);
    
    return highestScoreMove(scores);
}


/**
 * Scores for all possible moves from self
 * @param state 
 */
const baseMoveBias = (state: State): number[] => {
    const scores = [0, 0, 0, 0];

    let nextMove = applyMoveToCell(UP, state.self.head);
    scores[UP] += baseScoreForCell(nextMove, state);

    nextMove = applyMoveToCell(DOWN, state.self.head);
    scores[DOWN] += baseScoreForCell(applyMoveToCell(DOWN, state.self.head), state);

    nextMove = applyMoveToCell(LEFT, state.self.head);
    scores[LEFT] += baseScoreForCell(applyMoveToCell(LEFT, state.self.head), state);

    nextMove = applyMoveToCell(RIGHT, state.self.head);
    scores[RIGHT] += baseScoreForCell(applyMoveToCell(RIGHT, state.self.head), state);

    return scores;
}
