import { PARAMS as P } from "./params.ts";

export const divider = "`\n\n#######################################";

export const error = (message: string, exception?: Error) => {
    if (P.CONSOLE_LOG) {
        if (exception) {
            console.error(message, exception);
        }
        else {
            console.error(message);
        }
    }
}

export const status = (message: string) => {
    if (P.STATUS) {
        if (P.CONSOLE_LOG) {
            console.log(message);
        }
    }
}

export const debug = (message: string) => {
    if (P.DEBUG) {
        if (P.CONSOLE_LOG) {
            console.log(message);
        }
    }
}