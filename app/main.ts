import { Request, Response } from "https://deno.land/x/oak/mod.ts";
import { GameState, MoveResponse, RootResponse } from "./types.ts";
import * as log from "./logger.ts";
import { PARAMS } from "./params.ts";
import { buildGrid } from "./grid.ts";


export const root = (): RootResponse => {
    log.status(`${log.divider} ROOT`);
    const mySnake = PARAMS.MY_SNAKE
    log.status(` apiversion: ${mySnake.API_VERSION}`)
    log.status(` author: ${mySnake.AUTHOR}`)
    log.status(` color: ${mySnake.COLOR}`)
    log.status(` head: ${mySnake.HEAD_DESIGN}`)
    log.status(` tail: ${mySnake.TAIL_DESIGN}`)
    return {
        color: mySnake.COLOR,
        head: mySnake.HEAD_DESIGN,
        tail: mySnake.TAIL_DESIGN,
        apiversion: mySnake.API_VERSION,
        author: mySnake.AUTHOR
    };
}


export const move = (gameState: GameState): MoveResponse => {
    const startTime = Date.now();
    //TODO: tyrelh save the move JSON

    const gameTurn = gameState.turn;
    log.status(`\n\n####################################### MOVE ${gameTurn}`);
    const health = gameState.you.health;
    const numSnakes = gameState.board.snakes.length;

    const grid = buildGrid(gameState);

    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    console.log(`Turn ${"x"} took ${timeTaken}ms.\n`);
    return { move: "right" };
}
