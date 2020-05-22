import { Snake, GameState } from "./types.ts";
import { PARAMS } from "./params.ts";

export const isFriendly = (snake: Snake): boolean => {
    const normalizedName = snake.name.trim().replace(/\s+/g, "").toLowerCase();
    for (const friend of PARAMS.MY_SNAKE.FRIENDS) {
        if (!!normalizedName.match(friend)) {
            return true;
        }
    }
    return false;
}

export const isMe = (snake: Snake, gameState: GameState): boolean => {
    return (snake.id === gameState.you.id);
}