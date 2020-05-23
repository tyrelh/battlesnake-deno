import { Snake, GameRequest, Cell } from "./types.ts";
import { State } from "./state.ts";
import { MY_SNAKE } from "./params.ts";
import { SURVIVAL_MIN_HEALTH, LONG_GAME_HEALTH_RESILIENCY } from "./weights.ts";


export const isFriendly = (snake: Snake): boolean => {
    const normalizedName = snake.name.trim().replace(/\s+/g, "").toLowerCase();
    for (const friend of MY_SNAKE.FRIENDS) {
        if (!!normalizedName.match(friend)) {
            return true;
        }
    }
    return false;
}


export const isMe = (snake: Snake, state: State): boolean => {
    return (snake.id === state.self.id);
}


export const myLocation = (state: State): Cell => {
    return state.self.head;
}

export const myMinimumHealth = (state: State): number => {
    return (SURVIVAL_MIN_HEALTH - Math.floor(state.turn / LONG_GAME_HEALTH_RESILIENCY));
}