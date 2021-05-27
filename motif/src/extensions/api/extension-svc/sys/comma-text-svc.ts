/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export interface CommaTextSvc {
    readonly delimiterChar: string;
    readonly quoteChar: string;
    readonly pairQuoteChar: string;

    from2Values(value1: string, value2: string): string;
    from3Values(value1: string, value2: string, value3: string): string;
    from4Values(value1: string, value2: string, value3: string, value4: string): string;

    fromStringArray(value: readonly string[]): string;
    fromIntegerArray(value: number[]): string;

    toStringArray(value: string): string[];
    toStringArrayWithResult(value: string, strict?: boolean): CommaTextSvc.ToStringArrayResult;
    toIntegerArrayWithResult(value: string): CommaTextSvc.ToIntegerArrayResult;

    strictValidate(value: string): CommaTextSvc.StrictValidateResult;
}

/** @public */
export namespace CommaTextSvc {
    export interface ToStringArrayResult {
        success: boolean;
        array: string[];
        errorText: string;
    }

    export interface ToIntegerArrayResult {
        success: boolean;
        array: number[];
        errorText: string;
    }

    export interface StrictValidateResult {
        success: boolean;
        errorText: string;
    }
}
