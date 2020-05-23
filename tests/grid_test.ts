import { assert } from "https://deno.land/std/testing/asserts.ts";
import { Grid } from "../app/grid.ts";
import { GameRequest } from "../app/types.ts";
import { FOOD } from "../app/keys.ts";


Deno.test("Root response contains expected fields", () => {
    // given
    const grid = new Grid(mockGameRequest.board.width, mockGameRequest.board.height);

    // when
    grid.buildGrid(mockGameRequest);

    //then
    assert(grid.height === mockGameRequest.board.height);
    assert(grid.data.length === mockGameRequest.board.height);
    assert(grid.width === mockGameRequest.board.width)
    assert(grid.data[0].length === mockGameRequest.board.width)
    for (let food of mockGameRequest.board.food) {
        assert(grid.value(food) === FOOD);
    }
});


const mockGameRequest: GameRequest = {
    game: {
      id: "gameid",
      timeout: 500
    },
    turn: 3,
    board: {
      height: 11,
      width: 11,
      food: [
        { x: 3, y: 3 }
      ],
      snakes: [
        {
          id: "someid",
          name: "Deno Snake",
          health: 97,
          body: [
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 3, y: 1 }
          ],
          head: { x: 1, y: 1 },
          length: 3,
          shout: "Why are we shouting?"
        }
      ]
    },
    you: {
      id: "someid",
      name: "Deno Snake",
      health: 97,
      body: [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 }
      ],
      head: { x: 1, y: 1 },
      length: 3,
      shout: "Why are we shouting?"
    }
  }