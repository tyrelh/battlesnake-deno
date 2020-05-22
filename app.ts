import { Application, Router, Request, Response } from "https://deno.land/x/oak/mod.ts";
import * as flags from "https://deno.land/std/flags/mod.ts";
import { root, move } from "./app/main.ts";
import { GameState } from "./app/types.ts";

const argPort = flags.parse(Deno.args).port;
const PORT = Number(argPort) || 5000;

const rootRoute = ({response}: {response: Response}) => {
    response.body = root();
    response.status = 200;
}

const startRoute = ({response}: {response: Response}) => {
    response.status = 200;
}

const moveRoute = async ({request, response}: {request: Request, response: Response}) => {
    const requestBody = await request.body();
    const gameState: GameState = requestBody.value;
    response.body = move(gameState);
    response.status = 200;
}

const endRoute = ({response}: {response: Response}) => {
    response.status = 200;
}

const router = new Router();
router.get("/", rootRoute);
router.post("/start", startRoute);
router.post("/move", moveRoute);
router.post("/end", endRoute);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Listening on port ${PORT}...`);
await app.listen({ port: PORT });