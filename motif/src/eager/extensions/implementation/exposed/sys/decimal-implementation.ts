/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from '@motifmarkets/motif-core';
import { Decimal as DecimalApi } from '../../../api/extension-api';

export class DecimalImplementation implements DecimalApi {
    constructor(private readonly _actual: Decimal) { }

    get actual() { return this._actual; }

    /**
     * Return a new Decimal whose value is the absolute value of this Decimal.
     */
    absoluteValue() {
        return new DecimalImplementation(this._actual.absoluteValue());
    }

    /**
     * Return a new Decimal whose value is the absolute value of this Decimal.
     */
    abs() {
        return new DecimalImplementation(this._actual.abs());
    }

    /**
     * Return
     *   1    if the value of this Decimal is greater than the value of `y`,
     *  -1    if the value of this Decimal is less than the value of `y`,
     *   0    if they have the same value
     */
    comparedTo(y: DecimalApi.Numeric) {
        return this._actual.comparedTo(y);
    }

    /**
     * Return
     *   1    if the value of this Decimal is greater than the value of `y`,
     *  -1    if the value of this Decimal is less than the value of `y`,
     *   0    if they have the same value
     */
    cmp(y: DecimalApi.Numeric) {
        return this._actual.cmp(y);
    }

    /**
     * Return the number of decimal places of the value of this Decimal.
     */
    decimalPlaces() {
        return this._actual.decimalPlaces();
    }

    /**
     * Return the number of decimal places of the value of this Decimal.
     */
    dp() {
        return this._actual.dp();
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal divided by `y`, truncated to
     * `precision` significant digits.
     *
     */
    dividedBy(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.dividedBy(y));
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal divided by `y`, truncated to
     * `precision` significant digits.
     *
     */
    div(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.div(y));
    }

    /**
     * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
     * by the value of `y`, truncated to `precision` significant digits.
     *
     */
    dividedToIntegerBy(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.dividedToIntegerBy(y));
    }

    /**
     * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
     * by the value of `y`, truncated to `precision` significant digits.
     *
     */
    idiv(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.idiv(y));
    }

    /**
     * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
     */
    equals(y: DecimalApi.Numeric) {
        return this._actual.equals(y);
    }

    /**
     * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
     */
    eq(y: DecimalApi.Numeric) {
        return this._actual.eq(y);
    }

    /**
     * Return the (base 10) exponent value of this Decimal (this.e is the base 10000000 exponent).
     */
    exponent() {
        return this._actual.exponent();
    }

    /**
     * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
     * false.
     */
    greaterThan(y: DecimalApi.Numeric) {
        return this._actual.greaterThan(y);
    }

    /**
     * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
     * false.
     */
    gt(y: DecimalApi.Numeric) {
        return this._actual.gt(y);
    }

    /**
     * Return true if the value of this Decimal is greater than or equal to the value of `y`,
     * otherwise return false.
     *
     */
    greaterThanOrEqualTo(y: DecimalApi.Numeric) {
        return this._actual.greaterThanOrEqualTo(y);
    }

    /**
     * Return true if the value of this Decimal is greater than or equal to the value of `y`,
     * otherwise return false.
     *
     */
    gte(y: DecimalApi.Numeric) {
        return this._actual.gte(y);
    }

    /**
     * Return true if the value of this Decimal is an integer, otherwise return false.
     *
     */
    isInteger() {
        return this._actual.isInteger();
    }

    /**
     * Return true if the value of this Decimal is an integer, otherwise return false.
     *
     */
    isint() {
        return this._actual.isint();
    }

    /**
     * Return true if the value of this Decimal is negative, otherwise return false.
     *
     */
    isNegative() {
        return this._actual.isNegative();
    }

    /**
     * Return true if the value of this Decimal is negative, otherwise return false.
     *
     */
    isneg() {
        return this._actual.isneg();
    }

    /**
     * Return true if the value of this Decimal is positive, otherwise return false.
     *
     */
    isPositive() {
        return this._actual.isPositive();
    }

    /**
     * Return true if the value of this Decimal is positive, otherwise return false.
     *
     */
    ispos() {
        return this._actual.ispos();
    }

    /**
     * Return true if the value of this Decimal is 0, otherwise return false.
     *
     */
    isZero() {
        return this._actual.isZero();
    }

    /**
     * Return true if the value of this Decimal is less than `y`, otherwise return false.
     *
     */
    lessThan(y: DecimalApi.Numeric) {
        return this._actual.lessThan(y);
    }

    /**
     * Return true if the value of this Decimal is less than `y`, otherwise return false.
     *
     */
    lt(y: DecimalApi.Numeric) {
        return this._actual.lt(y);
    }

    /**
     * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
     *
     */
    lessThanOrEqualTo(y: DecimalApi.Numeric) {
        return this._actual.lessThanOrEqualTo(y);
    }

    /**
     * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
     *
     */
    lte(y: DecimalApi.Numeric) {
        return this._actual.lte(y);
    }

    /**
     * Return the logarithm of the value of this Decimal to the specified base, truncated to
     * `precision` significant digits.
     *
     * If no base is specified, return log[10](x).
     *
     * log[base](x) = ln(x) / ln(base)
     *
     * The maximum error of the result is 1 ulp (unit in the last place).
     *
     */
    logarithm(base?: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.logarithm(base));
    }

    /**
     * Return the logarithm of the value of this Decimal to the specified base, truncated to
     * `precision` significant digits.
     *
     * If no base is specified, return log[10](x).
     *
     * log[base](x) = ln(x) / ln(base)
     *
     * The maximum error of the result is 1 ulp (unit in the last place).
     *
     */
    log(base?: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.log(base));
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal minus `y`, truncated to
     * `precision` significant digits.
     *
     */
    minus(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.minus(y));
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal minus `y`, truncated to
     * `precision` significant digits.
     *
     */
    sub(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.sub(y));
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal modulo `y`, truncated to
     * `precision` significant digits.
     *
     */
    modulo(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.modulo(y));
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal modulo `y`, truncated to
     * `precision` significant digits.
     *
     */
    mod(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.mod(y));
    }

    /**
     * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
     * i.e. the base e raised to the power the value of this Decimal, truncated to `precision`
     * significant digits.
     *
     */
    naturalExponetial() {
        return new DecimalImplementation(this._actual.naturalExponetial());
    }

    /**
     * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
     * i.e. the base e raised to the power the value of this Decimal, truncated to `precision`
     * significant digits.
     *
     */
    exp() {
        return new DecimalImplementation(this._actual.exp());
    }

    /**
     * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
     * truncated to `precision` significant digits.
     *
     */
    naturalLogarithm() {
        return new DecimalImplementation(this._actual.naturalLogarithm());
    }

    /**
     * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
     * truncated to `precision` significant digits.
     *
     */
    ln() {
        return new DecimalImplementation(this._actual.ln());
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
     * -1.
     *
     */
    negated() {
        return new DecimalImplementation(this._actual.negated());
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
     * -1.
     *
     */
    neg() {
        return new DecimalImplementation(this._actual.neg());
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal plus `y`, truncated to
     * `precision` significant digits.
     *
     */
    plus(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.plus(y));
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal plus `y`, truncated to
     * `precision` significant digits.
     *
     */
    add(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.add(y));
    }

    /**
     * Return the number of significant digits of the value of this Decimal.
     *
     * @param zeros {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
     */
    precision(zeros: boolean | number) {
        return this._actual.precision(zeros);
    }

    /**
     * Return the number of significant digits of the value of this Decimal.
     *
     * @param zeros {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
     */
    sd(zeros: boolean | number) {
        return this._actual.sd(zeros);
    }

    /**
     * Return a new Decimal whose value is the square root of this Decimal, truncated to `precision`
     * significant digits.
     *
     */
    squareRoot() {
        return new DecimalImplementation(this._actual.squareRoot());
    }

    /**
     * Return a new Decimal whose value is the square root of this Decimal, truncated to `precision`
     * significant digits.
     *
     */
    sqrt() {
        return new DecimalImplementation(this._actual.sqrt());
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal times `y`, truncated to
     * `precision` significant digits.
     *
     */
    times(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.times(y));
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal times `y`, truncated to
     * `precision` significant digits.
     *
     */
    mul(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.mul(y));
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
     * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
     *
     * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
     *
     * @param dp {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * @param rm {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    toDecimalPlaces(dp?: number, rm?: number) {
        return new DecimalImplementation(this._actual.toDecimalPlaces(dp, rm));
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
     * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
     *
     * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
     *
     * @param dp {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * @param rm {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    todp(dp?: number, rm?: number) {
        return new DecimalImplementation(this._actual.todp(dp, rm));
    }

    /**
     * Return a string representing the value of this Decimal in exponential notation rounded to
     * `dp` fixed decimal places using rounding mode `rounding`.
     *
     * @param dp {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * @param rm {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    toExponential(dp?: number, rm?: number) {
        return this._actual.toExponential(dp, rm);
    }

    /**
     * Return a string representing the value of this Decimal in normal (fixed-point) notation to
     * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
     * omitted.
     *
     * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
     *
     * @param dp {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * @param rm {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
     * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
     * (-0).toFixed(3) is '0.000'.
     * (-0.5).toFixed(0) is '-0'.
     *
     */
    toFixed(dp?: number, rm?: number) {
        return this._actual.toFixed(dp, rm);
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
     * rounding mode `rounding`.
     *
     */
    toInteger() {
        return new DecimalImplementation(this._actual.toInteger());
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
     * rounding mode `rounding`.
     *
     */
    toint() {
        return new DecimalImplementation(this._actual.toint());
    }

    /**
     * Return the value of this Decimal converted to a number primitive.
     *
     */
    toNumber() {
        return this._actual.toNumber();
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal raised to the power `y`,
     * truncated to `precision` significant digits.
     *
     * For non-integer or very large exponents pow(x, y) is calculated using
     *
     *   x^y = exp(y*ln(x))
     *
     * The maximum error is 1 ulp (unit in last place).
     *
     * @param y {number|string|Decimal} The power to which to raise this Decimal.
     *
     */
    toPower(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.toPower(y));
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal raised to the power `y`,
     * truncated to `precision` significant digits.
     *
     * For non-integer or very large exponents pow(x, y) is calculated using
     *
     *   x^y = exp(y*ln(x))
     *
     * The maximum error is 1 ulp (unit in last place).
     *
     * @param y {number|string|Decimal} The power to which to raise this Decimal.
     *
     */
    pow(y: DecimalApi.Numeric) {
        return new DecimalImplementation(this._actual.pow(y));
    }

    /**
     * Return a string representing the value of this Decimal rounded to `sd` significant digits
     * using rounding mode `rounding`.
     *
     * Return exponential notation if `sd` is less than the number of digits necessary to represent
     * the integer part of the value in normal notation.
     *
     * @param sd {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * @param rm {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    toPrecision(sd?: number, rm?: number) {
        return this._actual.toPrecision(sd, rm);
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
     * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
     * omitted.
     *
     * @param sd {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * @param rm {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    toSignificantDigits(sd?: number, rm?: number) {
        return new DecimalImplementation(this._actual.toSignificantDigits(sd, rm));
    }

    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
     * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
     * omitted.
     *
     * @param sd {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * @param rm {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    tosd(sd?: number, rm?: number) {
        return new DecimalImplementation(this._actual.tosd(sd, rm));
    }

    /**
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    toString() {
        return this._actual.toString();
    }

    /**
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    valueOf() {
        return this._actual.valueOf();
    }

    /**
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    val() {
        return this._actual.val();
    }

    /**
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    toJSON() {
        return this._actual.toJSON();
    }
}

export namespace DecimalImplementation {
    export function toApi(value: Decimal) {
        return new DecimalImplementation(value);
    }

    export function fromApi(value: DecimalApi) {
        const implementation = value as DecimalImplementation;
        return implementation.actual;
    }
}
