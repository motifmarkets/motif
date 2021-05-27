/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from '../../exposed/extension-api';

/** @public */
export interface DecimalSvc {
    // The maximum number of significant digits of the result of a calculation or base conversion.
    // E.g. `Decimal.config({ precision: 20 });`
    precision: number;

    // The rounding mode used by default by `toInteger`, `toDecimalPlaces`, `toExponential`,
    // `toFixed`, `toPrecision` and `toSignificantDigits`.
    //
    // E.g.
    // `Decimal.rounding = 4;`
    // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
    rounding: number;
    readonly ROUND_UP: number;
    readonly ROUND_DOWN: number;
    readonly ROUND_CEIL: number;
    readonly ROUND_FLOOR: number;
    readonly ROUND_HALF_UP: number;
    readonly ROUND_HALF_DOWN: number;
    readonly ROUND_HALF_EVEN: number;
    readonly ROUND_HALF_CEIL: number;
    readonly ROUND_HALF_FLOOR: number;

    // The exponent value at and beneath which `toString` returns exponential notation.
    // JavaScript numbers: -7
    toExpNeg: number; // 0 to -MAX_E

    // The exponent value at and above which `toString` returns exponential notation.
    // JavaScript numbers: 21
    toExpPos: number; // 0 to MAX_E

    // The natural logarithm of 10.
    LN10: Decimal;

    /**
     * The Decimal constructor and exported function.
     * Return a new Decimal instance.
     *
     * @param value - A numeric value.
     *
     */
    create(value: Decimal.Numeric, config?: DecimalSvc.Config): Decimal;

    /**
     * Configure global settings for a Decimal constructor.
     */
    config(config: DecimalSvc.Config): void;

    /**
     * Configure global settings for a Decimal constructor.
     */
    set(config: DecimalSvc.Config): void;
}

/** @public */
export namespace DecimalSvc {
    export interface Config {
        precision?: number;
        rounding?: number;
        toExpNeg?: number;
        toExpPos?: number;
        LN10?: Decimal.Numeric;
    }
}
