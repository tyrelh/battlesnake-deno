import { assert } from "https://deno.land/std/testing/asserts.ts";
import { move } from "../app/main.ts";


Deno.test("Should take danger head on collision instead of dead end", () => {
  // given
  const gameRequest = {"game":{"id":"b06f98a8-f15a-4aa3-9b86-f3359caafed7","timeout":500},"turn":213,"board":{"height":11,"width":11,"food":[{"x":2,"y":4}],"snakes":[{"id":"gs_ywrf7YFHr6RCK7pDrCctG969","name":"Zero Cool Deno Snake Local","health":68,"body":[{"x":3,"y":6},{"x":2,"y":6},{"x":2,"y":7},{"x":1,"y":7},{"x":1,"y":6},{"x":0,"y":6},{"x":0,"y":7},{"x":0,"y":8},{"x":1,"y":8},{"x":1,"y":9},{"x":2,"y":9},{"x":2,"y":8}],"head":{"x":3,"y":6},"length":12,"shout":""},{"id":"gs_XykScvhX9c6Q3BD6gkCpKvb9","name":"Wyrmhol","health":76,"body":[{"x":6,"y":5},{"x":5,"y":5},{"x":4,"y":5},{"x":3,"y":5},{"x":2,"y":5},{"x":1,"y":5},{"x":0,"y":5},{"x":0,"y":4},{"x":0,"y":3},{"x":0,"y":2},{"x":0,"y":1},{"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0}],"head":{"x":6,"y":5},"length":16,"shout":""},{"id":"gs_MfGhMtJxB6Gg9gS6BjmtY8WX","name":"OG Jimmy","health":94,"body":[{"x":8,"y":1},{"x":7,"y":1},{"x":6,"y":1},{"x":5,"y":1},{"x":4,"y":1},{"x":4,"y":2},{"x":4,"y":3},{"x":5,"y":3}],"head":{"x":8,"y":1},"length":8,"shout":""},{"id":"gs_cKYP9wgXXCh73Rp7DW8w4x98","name":"snacky","health":88,"body":[{"x":4,"y":7},{"x":5,"y":7},{"x":5,"y":6},{"x":6,"y":6},{"x":7,"y":6},{"x":7,"y":7},{"x":7,"y":8},{"x":6,"y":8},{"x":6,"y":9},{"x":5,"y":9},{"x":5,"y":10},{"x":4,"y":10}],"head":{"x":4,"y":7},"length":12,"shout":""}]},"you":{"id":"gs_ywrf7YFHr6RCK7pDrCctG969","name":"Zero Cool Deno Snake Local","health":68,"body":[{"x":3,"y":6},{"x":2,"y":6},{"x":2,"y":7},{"x":1,"y":7},{"x":1,"y":6},{"x":0,"y":6},{"x":0,"y":7},{"x":0,"y":8},{"x":1,"y":8},{"x":1,"y":9},{"x":2,"y":9},{"x":2,"y":8}],"head":{"x":3,"y":6},"length":12,"shout":""}};
  const expectedMove = "up";
  // when
  const result = move(gameRequest);
  // then
  assert(result?.move)
  assert(result.move === expectedMove);
});
