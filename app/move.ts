import { State } from "./state.ts";
import { RIGHT, EATING, UP, DOWN, LEFT, DIRECTION_ICON, BEHAVIOURS } from "./keys.ts";
import * as log from "./logger.ts";
import { applyMoveToCell, cellToString } from "./utils.ts";
import { baseScoreForCell, scoresToString, combineScores, normalizeScores, highestScoreMove } from "./scores.ts";
import { myHungerUrgency } from "./self.ts";


/**
 * Seek food
 * @param state 
 * @param playSafe 
 */
export const eat = (state: State, playSafe: boolean = false): number => {
    const scores = [0, 0, 0, 0];
    const hungerUrgency = myHungerUrgency(state);
    const emergency = false; // TODO: implement emergency flag tyrelh
    log.status(`EATING w/ urgency ${hungerUrgency} ${emergency ? ", EMERGENCY!" : ""}`);
    state.grid.print();
    // TODO: implement eat behaviour tyrelh
    log.status("Skipping eating behaviour, not yet implemented.");
    return addBiasesToBehaviour(scores, state, playSafe, EATING);
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

    // base move
    const baseScores = baseMoveBias(state);
    log.status(`Base scores:\n ${scoresToString(baseScores)}`);
    scores = combineScores(baseScores, scores);

    scores = normalizeScores(scores);
    // log all scores together for readability in logs
    log.status(`\nBehaviour scores:\n ${scoresToString(behaviourScores)}`);
    log.status(`Base scores:\n ${scoresToString(baseScores)}`);

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
    log.debug(`${UP} nextMove: ${cellToString( nextMove)}`);
    scores[UP] += baseScoreForCell(nextMove, state);

    nextMove = applyMoveToCell(DOWN, state.self.head);
    log.debug(`${DOWN} nextMove: ${cellToString( nextMove)}`);
    scores[DOWN] += baseScoreForCell(applyMoveToCell(DOWN, state.self.head), state);

    nextMove = applyMoveToCell(LEFT, state.self.head);
    log.debug(`${LEFT} nextMove: ${cellToString( nextMove)}`);
    scores[LEFT] += baseScoreForCell(applyMoveToCell(LEFT, state.self.head), state);

    nextMove = applyMoveToCell(RIGHT, state.self.head);
    log.debug(`${RIGHT} nextMove: ${cellToString( nextMove)}`);
    scores[RIGHT] += baseScoreForCell(applyMoveToCell(RIGHT, state.self.head), state);
    return scores;
}
