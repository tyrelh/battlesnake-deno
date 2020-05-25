// game weights
export const SURVIVAL_MIN_HEALTH = 33;
export const LONG_GAME_HEALTH_RESILIENCY = 500;
export const SAME_NUMBER_OF_SNAKES = 4;

// basic space weights

export const BASE_WEIGHT = {
    FORGET_ABOUT_IT: -200,
    SPACE: 0.9,
    FOOD: 0.4,
    KILL_ZONE: 4.5,
    WALL_NEAR: -0.4,
    WARNING: -2.6,
    SMALL_DANGER: -11.0,
    DANGER: -12
}
export const BASE_MULTIPLIER = {
    KILL_ZONE: 1.3,
    WALL_NEAR: 6.5
}

export const MULTIPLIER = {
    HUNGER_URGENCY: 0.4
}

export const DECAY = {
    FOOD_DISTANCE: 2.8
}

export const EXPONENT = {
    HUNT_DISTANCE_KILLZONE: 0.65,
    HUNT_DISTANCE_FUTURE2: 0.4
}