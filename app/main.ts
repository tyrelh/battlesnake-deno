import { GameRequest, MoveResponse, RootResponse, Snake } from "./types.ts";
import * as log from "./logger.ts";
import { State } from "./state.ts";
import { MY_SNAKE } from "./params.ts";
import { myMinimumHealth, amIBiggestSnake, existsSnakeSmallerThanMe } from "./self.ts";
import { SAME_NUMBER_OF_SNAKES } from "./weights.ts";
import { eat } from "./move.ts";
import { DIRECTION, RIGHT } from "./keys.ts";

// globals to track over course of game
// will break if multiple games are running simultaneously
let slowest = 0;
let slowestMove = 0;
let moveTimes: number[] = [];


export const root = (): RootResponse => {
    log.status(`${log.divider} ROOT`);
    log.status(` apiversion: ${MY_SNAKE.API_VERSION}`)
    log.status(` author: ${MY_SNAKE.AUTHOR}`)
    log.status(` color: ${MY_SNAKE.COLOR}`)
    log.status(` head: ${MY_SNAKE.HEAD_DESIGN}`)
    log.status(` tail: ${MY_SNAKE.TAIL_DESIGN}`)
    return {
        color: MY_SNAKE.COLOR,
        head: MY_SNAKE.HEAD_DESIGN,
        tail: MY_SNAKE.TAIL_DESIGN,
        apiversion: MY_SNAKE.API_VERSION,
        author: MY_SNAKE.AUTHOR
    };
}


export const start = (gameRequest: GameRequest): void => {
    try {
        // ensure previous game logs are cleared
        // log.initLogs();
        log.status(`####################################### STARTING GAME ${gameRequest.game.id}`);
        log.status(`My snake id is ${gameRequest.you.id}`);
        slowest = 0;
        slowestMove = 0;
        moveTimes = [];
    
        log.status("Snakes playing this game are:");
        for (let snake of gameRequest.board.snakes) {
            log.status(snake.name);
        }
    }
    catch (e) {
        log.error(`ex in main.start: ${e}`);
    }
}


export const move = (gameRequest: GameRequest): MoveResponse => {
    const startTime = Date.now();
    let move = -1;

    //TODO: tyrelh save the move JSON

    const gameTurn = gameRequest.turn;
    log.status(`\n\n####################################### MOVE ${gameTurn}`);
    const health = gameRequest.you.health;
    const numSnakes = gameRequest.board.snakes.length;
    const playSafe = numSnakes > SAME_NUMBER_OF_SNAKES;

    const state = new State(gameRequest);
    try {
        state.grid.preprocessGrid(state)
    } catch (e) {
        log.error("EX in main.preprocessGrid: ", e);
    }

    const iAmBiggestSnake = amIBiggestSnake(state);
    const existsSmallerSnake = existsSnakeSmallerThanMe(state);

    // if you are hungry or small you gotta eat
    if (health < myMinimumHealth(state)) {
        try {
            move = eat(state, playSafe);
        } catch (e) {
            log.error("EX in main.hungry: ", e);
        }
    }

    // if there are smaller snakes than you, hunt them
    else if (iAmBiggestSnake || existsSmallerSnake) {
        try {
            move = hunt(state, playSafe);
        } catch (e) {
            log.error("EX in main.hunt: ", e);
        }
    }

    // backup plan?
    if (move < 0) {
        try {
            move = eat(state, playSafe);
        } catch (e) {
            log.error("Ex in main.hungry: ", e);
        }
    }

    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    log.status(`${health} health remaining.`);
    log.status(`Turn ${state.turn} took ${timeTaken}ms.\n`);
    const result = { move: (move >= 0) ? DIRECTION[move] : DIRECTION[RIGHT] };
    return result;
}


export const end = (gameRequest: GameRequest): void => {
    try {
        log.status(`\nSlowest move ${slowestMove} took ${slowest}ms.`);
        const numberOfMoves = moveTimes.length;
        const totalTime = moveTimes.reduce((acc, c) => acc + c, 0);
        const averageTime = totalTime / numberOfMoves;
        log.status(`Total time computing was ${totalTime}ms for ${numberOfMoves} moves.`);
        log.status(`Average move time was ${averageTime.toFixed(1)}ms.`);
        // write logs for this game to file
        // log.writeLogs(req.body);
        slowest = 0;
        slowestMove = 0;
        moveTimes = [];
    } catch (e) {
        log.error("EX in main.end: ", e)
    }
    
  };
