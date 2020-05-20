import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Request, Response } from "https://deno.land/x/oak/mod.ts";
import { start } from "../main.ts";

Deno.test("hello world", () => {
  const params = {
    request: new Request(),
    response: new Response()
  }
  start(params);
});
