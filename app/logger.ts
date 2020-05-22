import { PARAMS } from "./params.ts";

export const divider = "`\n\n#######################################";

export const error = (message: string, exception?: Error) => {
    if (PARAMS.CONSOLE_LOG) {
        if (exception) {
            console.error(message, exception);
        }
        else {
            console.error(message);
        }
    }
}

export const status = (message: string) => {
    if (PARAMS.STATUS) {
        if (PARAMS.CONSOLE_LOG) {
            console.log(message);
        }
    }
}

export const debug = (message: string) => {
    if (PARAMS.DEBUG) {
        if (PARAMS.CONSOLE_LOG) {
            console.log(message);
        }
    }
}