/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Result } from '../../exposed/extension-api';

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
    toStringArrayWithResult(value: string, strict?: boolean): Result<string[]>;
    toIntegerArrayWithResult(value: string): Result<number[]>;

    strictValidate(value: string): Result<boolean>;
}
