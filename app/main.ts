import { Request, Response } from "https://deno.land/x/oak/mod.ts";
import { GameRequest, MoveResponse, RootResponse } from "./types.ts";
import * as log from "./logger.ts";
import { State } from "./state.ts";
import { MY_SNAKE } from "./params.ts";


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
    //TODO: tyrelh save the move JSON

    const gameTurn = gameRequest.turn;
    log.status(`\n\n####################################### MOVE ${gameTurn}`);
    const health = gameRequest.you.health;
    const numSnakes = gameRequest.board.snakes.length;

    try {
        const state = new State(gameRequest);
        state.grid.preprocessGrid(state)
    }
    catch (e) {
        log.error("Ex in main.buildGrid: ", e);
    }
    
    // let move = -1;

    // if (health < )

    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    console.log(`Turn ${"x"} took ${timeTaken}ms.\n`);
    return { move: "right" };
}
