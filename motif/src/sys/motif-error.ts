export class MotifError extends Error {

}

export namespace MotifError {
    export function appendToErrorMessage(e: unknown, appendText: string) {
        if (e instanceof Error) {
            e.message += appendText;
            return e;
        } else {
            if (typeof e === 'string') {
                e += appendText;
                return e;
            } else {
                return e; // Do not know how to append
            }
        }
    }

    export function prependErrorMessage(e: unknown, prependText: string) {
        if (e instanceof Error) {
            e.message = prependText + e.message;
            return e;
        } else {
            if (typeof e === 'string') {
                e = prependText + e;
                return e;
            } else {
                return e; // Do not know how to prepend
            }
        }
    }
}
