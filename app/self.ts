import { Snake, GameRequest, Cell } from "./types.ts";
import { State } from "./state.ts";
import { MY_SNAKE } from "./params.ts";
import { SURVIVAL_MIN_HEALTH, LONG_GAME_HEALTH_RESILIENCY, MULTIPLIER } from "./weights.ts";
import { distanceFromCellToClosestFoodInFoodList } from "./search.ts";


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


export const myHealth = (state: State): number => {
    return state.self.health;
}


export const myMinimumHealth = (state: State): number => {
    return (SURVIVAL_MIN_HEALTH - Math.floor(state.turn / LONG_GAME_HEALTH_RESILIENCY));
}


export const myHungerUrgency = (state: State): number => {
    return (Math.round((101 - myHealth(state)) * MULTIPLIER.HUNGER_URGENCY));
}


export const isHungerEmergency = (state: State): boolean => {
    const distanceToClosestFood = distanceFromCellToClosestFoodInFoodList(myLocation(state), state);
    return ((distanceToClosestFood >= myHealth(state) - 1) || myHealth(state) <= myMinimumHealth(state))
}


export const amIBiggestSnake = (state: State): boolean => {
    for (let snake of state.board.snakes) {
        if (isMe(snake, state)) {
            continue;
        }
        if (snake.length >= state.self.length) {
            return false;
        }
    }
    return true;
}


export const existsSnakeSmallerThanMe = (state: State): boolean => {
    for (let snake of state.board.snakes) {
        if (isMe(snake, state)) {
            continue;
        }
        if (snake.length < state.self.length) {
            return true;
        }
    }
    return false;
}