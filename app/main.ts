import { GameRequest, MoveResponse, RootResponse } from "./types.ts";
import * as log from "./logger.ts";
import { State } from "./state.ts";
import { MY_SNAKE } from "./params.ts";
import { myMinimumHealth } from "./self.ts";
import { SAME_NUMBER_OF_SNAKES } from "./weights.ts";
import { eat } from "./move.ts";
import { DIRECTION, UP } from "./keys.ts";


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

        if (health < myMinimumHealth(state)) {
            move = eat(state, playSafe);
        }

    } catch (e) {
        log.error("Ex in main.buildGrid: ", e);
    }

    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    log.status(`${health} health remaining.`);
    log.status(`Turn ${state.turn} took ${timeTaken}ms.\n`);
    return { move: (move > 0) ? DIRECTION[move] : DIRECTION[UP] };
}
