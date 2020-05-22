import { KEYS } from "./keys.ts";

const blue = "#3b9fef";
const pink = "#cc4ff1";
const green = "#2be384";
const green2 = "#02B07C";
const purple = "#9557EF";

const belugaHead = "beluga";
const boltTail = "bolt";
const gogglesHead = "bwc-ski";

export const API_VERSION = 1;
export const ORIGIN_POS = API_VERSION >= 1 ? KEYS.DOWN : KEYS.UP;

export const PARAMS = {
    // logging
    DEBUG: true,
    STATUS: true,
    DEBUG_MAPS: true,
    CONSOLE_LOG: true,

    // my snake
    MY_SNAKE: {
        HEAD_DESIGN: gogglesHead,
        TAIL_DESIGN: boltTail,
        COLOR: purple,
        FRIENDS: [/zerocool/, /denosnake/],
        API_VERSION: API_VERSION.toString(),
        AUTHOR: "tyrelh"
    }
    
}