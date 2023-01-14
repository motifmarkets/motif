/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommaText } from '@motifmarkets/motif-core';
import { CommaTextSvc, Result as ResultApi } from '../../../api/extension-api';

export class CommaTextSvcImplementation implements CommaTextSvc {
    get delimiterChar(): string { return CommaText.delimiterChar; }
    get quoteChar(): string { return CommaText.quoteChar; }
    get pairQuoteChar(): string  { return CommaText.pairQuoteChar; }

    from2Values(value1: string, value2: string): string {
        return CommaText.from2Values(value1, value2);
    }

    from3Values(value1: string, value2: string, value3: string): string {
        return CommaText.from3Values(value1, value2, value3);
    }

    from4Values(value1: string, value2: string, value3: string, value4: string): string {
        return CommaText.from4Values(value1, value2, value3, value4);
    }

    fromStringArray(value: readonly string[]): string {
        return CommaText.fromStringArray(value);
    }

    fromIntegerArray(value: number[]): string {
        return CommaText.fromIntegerArray(value);
    }

    toStringArray(value: string): string[] {
        return CommaText.toStringArray(value);
    }

    toStringArrayWithResult(value: string, strict?: boolean): ResultApi<string[]> {
        return CommaText.tryToStringArray(value, strict !== false);
    }
    toIntegerArrayWithResult(value: string): ResultApi<number[]> {
        return CommaText.toIntegerArrayWithResult(value);
    }

    strictValidate(value: string): ResultApi<boolean> {
        return CommaText.strictValidate(value);
    }
}
