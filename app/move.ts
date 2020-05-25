import { State } from "./state.ts";
import { RIGHT, EATING, UP, DOWN, LEFT, DIRECTION_ICON, BEHAVIOURS, EATING_EMERGENCY } from "./keys.ts";
import * as log from "./logger.ts";
import { applyMoveToCell, cellToString } from "./utils.ts";
import { baseScoreForCell, scoresToString, combineScores, normalizeScores, highestScoreMove } from "./scores.ts";
import { myHungerUrgency, isHungerEmergency } from "./self.ts";
import { distanceFromCellToClosestFoodInFoodList, eatingScoresFromState, eatingScoresFromGrid } from "./search.ts";


/**
 * Seek food
 * @param state 
 * @param playSafe 
 */
export const eat = (state: State, playSafe: boolean = false): number => {
    let scores = [0, 0, 0, 0];
    let behaviour = EATING;
    const hungerUrgency = myHungerUrgency(state);
    const distanceToClosestFood = distanceFromCellToClosestFoodInFoodList(state.self.head, state);
    const emergency = isHungerEmergency(state)
    log.status(`EATING w/ urgency ${hungerUrgency} ${emergency ? ", EMERGENCY!" : ""}`);

    state.grid.print();

    // if emergency look for closest foods in data list
    if (emergency) {
        behaviour = EATING_EMERGENCY;
        try {
            scores = eatingScoresFromState(hungerUrgency, state);
        } catch (e) {
            log.error(`ex in move.eat.emergency: ${e}`);
        }
    }
    // if not emergency use foods marked in grid
    else {
        try {
            scores = eatingScoresFromGrid(hungerUrgency, state);
        } catch (e) {
            log.error(`ex in move.eat.non-emergency: ${e}`);
        }
    }

    return addBiasesToBehaviour(scores, state, playSafe, behaviour);
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

    // TODO: implement tight move bias tyrelh
    // TODO: implement flood bias tyrelh
    // TODO: implement farther from danger snake heads bias tyrelh
    // TODO: implement closer to killable snake heads bias tyrelh
    // TODO: implement farther from wall bias tyrelh
    // TODO: implement follow tail bias tyrelh

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
    scores[UP] += baseScoreForCell(nextMove, state);

    nextMove = applyMoveToCell(DOWN, state.self.head);
    scores[DOWN] += baseScoreForCell(applyMoveToCell(DOWN, state.self.head), state);

    nextMove = applyMoveToCell(LEFT, state.self.head);
    scores[LEFT] += baseScoreForCell(applyMoveToCell(LEFT, state.self.head), state);

    nextMove = applyMoveToCell(RIGHT, state.self.head);
    scores[RIGHT] += baseScoreForCell(applyMoveToCell(RIGHT, state.self.head), state);

    return scores;
}
