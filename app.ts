import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as flags from "https://deno.land/std/flags/mod.ts";
import { root, start, move, end } from "./app/main.ts";

const argPort = flags.parse(Deno.args).port;
const PORT = Number(argPort) || 5000;

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