import { CONSOLE_LOG, STATUS, DEBUG } from "./params.ts";


export const divider = "`\n\n#######################################";

export const error = (message: string, exception?: Error) => {
    if (CONSOLE_LOG) {
        if (exception) {
            console.error(message, exception);
        }
        else {
            console.error(message);
        }
    }
}

export const status = (message: string) => {
    if (STATUS) {
        if (CONSOLE_LOG) {
            console.log(message);
        }
    }
}

export const debug = (message: string) => {
    if (DEBUG) {
        if (CONSOLE_LOG) {
            console.log(message);
        }
    }
}