import { Application, Router, Request, Response } from "https://deno.land/x/oak/mod.ts";
import * as flags from "https://deno.land/std/flags/mod.ts";
import { GameState } from "./app/types.ts";

const argPort = flags.parse(Deno.args).port;
const PORT = Number(argPort) || 5000;

export const root = ({response}: {response: Response}): void => {
    response.body = {
        color: "#7733FF",
        head: "bwc-ski",
        tail: "bolt",
        apiversion: "1",
        author: "tyrelh"
    };
}

export const start = ({response}: {response: Response}): void => {
    response.status = 200;
}

export const move = async ({request, response}: {request: any, response: any}) => {
    const startTime = Date.now();

    const requestBody = await request.body();
    const gameState: GameState = requestBody.value;
    console.log(gameState)

    response.body = { move: "right" };
    response.status = 200;

    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    console.log(`Turn ${"x"} took ${timeTaken}ms.\n`);
}

export const end = ({request, response}: {request: Request, response: Response}): void => {
    response.status = 200;
}

const router = new Router();
router.get("/", root);
router.post("/start", start);
router.post("/move", move);
router.post("/end", end);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Listening on port ${PORT}...`);
await app.listen({ port: PORT });