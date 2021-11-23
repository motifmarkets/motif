/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { Decimal as DecimalApi, DecimalSvc } from '../../../api/extension-api';
import { DecimalImplementation } from '../../exposed/sys/decimal-implementation';

export class DecimalSvcImplementation implements DecimalSvc {
    get ROUND_UP() { return Decimal.ROUND_UP; }
    get ROUND_DOWN() { return Decimal.ROUND_DOWN; }
    get ROUND_CEIL() { return Decimal.ROUND_CEIL; }
    get ROUND_FLOOR() { return Decimal.ROUND_FLOOR; }
    get ROUND_HALF_UP() { return Decimal.ROUND_HALF_UP; }
    get ROUND_HALF_DOWN() { return Decimal.ROUND_HALF_DOWN; }
    get ROUND_HALF_EVEN() { return Decimal.ROUND_HALF_EVEN; }
    get ROUND_HALF_CEIL() { return Decimal.ROUND_HALF_CEIL; }
    get ROUND_HALF_FLOOR() { return Decimal.ROUND_HALF_FLOOR; }

    // The maximum number of significant digits of the result of a calculation or base conversion.
    // E.g. `Decimal.config({ precision: 20 });`
    get precision() { return Decimal.precision; }
    set precision(value: number) { Decimal.precision = value; }

    // The rounding mode used by default by `toInteger`, `toDecimalPlaces`, `toExponential`,
    // `toFixed`, `toPrecision` and `toSignificantDigits`.
    //
    // E.g.
    // `Decimal.rounding = 4;`
    // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get rounding() { return Decimal.rounding; }
    set rounding(value: number) { Decimal.rounding = value; }

    // The exponent value at and beneath which `toString` returns exponential notation.
    // JavaScript numbers: -7
    // 0 to MAX_E
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get toExpNeg() { return Decimal.toExpNeg; }
    set toExpNeg(value: number) { Decimal.toExpNeg = value; }

    // The exponent value at and above which `toString` returns exponential notation.
    // JavaScript numbers: 21
    // 0 to MAX_E
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get toExpPos() { return Decimal.toExpPos; }
    set toExpPos(value: number) { Decimal.toExpPos = value; }

    // The natural logarithm of 10.
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get LN10() { return Decimal.LN10; }
    set LN10(value: Decimal) { Decimal.LN10 = value; }

    /**
     * The Decimal constructor and exported function.
     * Return a new Decimal instance.
     *
     * @param value {number|string|Decimal} A numeric value.
     *
     */
    create(value: DecimalApi.Numeric, config?: DecimalSvc.Config): DecimalApi {
        let actual: Decimal;
        if (config === undefined) {
            actual = new Decimal(value);
        } else {
            const decimalConstructor = Decimal.clone(config);
            actual = new decimalConstructor(value);
        }
        return new DecimalImplementation(actual);
    }

    /**
     * Configure global settings for a Decimal constructor.
     */
    config(config: DecimalSvc.Config) {
        Decimal.config(config);
    }

    /**
     * Configure global settings for a Decimal constructor.
     */
    set(config: DecimalSvc.Config) {
        Decimal.set(config);
    }
}
