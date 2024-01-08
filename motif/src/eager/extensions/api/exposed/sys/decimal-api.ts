/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/** @public */
export interface Decimal {
    /**
     * Return a new Decimal whose value is the absolute value of this Decimal.
     */
    absoluteValue(): Decimal;

    /**
     * Return a new Decimal whose value is the absolute value of this Decimal.
     */
    abs(): Decimal;

    /**
     * Return
     *   1    if the value of this Decimal is greater than the value of `y`,
     *  -1    if the value of this Decimal is less than the value of `y`,
     *   0    if they have the same value
     */
    comparedTo(y: Decimal.Numeric): 1 | 0 | -1;

    /**
     * Return
     *   1    if the value of this Decimal is greater than the value of `y`,
     *  -1    if the value of this Decimal is less than the value of `y`,
     *   0    if they have the same value
     */
    cmp(y: Decimal.Numeric): 1 | 0 | -1;

    /**
     * Return the number of decimal places of the value of this Decimal.
     */
    decimalPlaces(): number;

    /**
     * Return the number of decimal places of the value of this Decimal.
     */
    dp(): number;

    /**
     * Return a new Decimal whose value is the value of this Decimal divided by `y`, truncated to
     * `precision` significant digits.
     *
     */
    dividedBy(y: Decimal.Numeric): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal divided by `y`, truncated to
     * `precision` significant digits.
     *
     */
    div(y: Decimal.Numeric): Decimal;

    /**
     * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
     * by the value of `y`, truncated to `precision` significant digits.
     *
     */
    dividedToIntegerBy(y: Decimal.Numeric): Decimal;

    /**
     * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
     * by the value of `y`, truncated to `precision` significant digits.
     *
     */
    idiv(y: Decimal.Numeric): Decimal;

    /**
     * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
     */
    equals(y: Decimal.Numeric): boolean;

    /**
     * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
     */
    eq(y: Decimal.Numeric): boolean;

    /**
     * Return the (base 10) exponent value of this Decimal (this.e is the base 10000000 exponent).
     */
    exponent(): number;

    /**
     * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
     * false.
     */
    greaterThan(y: Decimal.Numeric): boolean;

    /**
     * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
     * false.
     */
    gt(y: Decimal.Numeric): boolean;

    /**
     * Return true if the value of this Decimal is greater than or equal to the value of `y`,
     * otherwise return false.
     *
     */
    greaterThanOrEqualTo(y: Decimal.Numeric): boolean;

    /**
     * Return true if the value of this Decimal is greater than or equal to the value of `y`,
     * otherwise return false.
     *
     */
    gte(y: Decimal.Numeric): boolean;

    /**
     * Return true if the value of this Decimal is an integer, otherwise return false.
     *
     */
    isInteger(): boolean;

    /**
     * Return true if the value of this Decimal is an integer, otherwise return false.
     *
     */
    isint(): boolean;

    /**
     * Return true if the value of this Decimal is negative, otherwise return false.
     *
     */
    isNegative(): boolean;

    /**
     * Return true if the value of this Decimal is negative, otherwise return false.
     *
     */
    isneg(): boolean;

    /**
     * Return true if the value of this Decimal is positive, otherwise return false.
     *
     */
    isPositive(): boolean;

    /**
     * Return true if the value of this Decimal is positive, otherwise return false.
     *
     */
    ispos(): boolean;

    /**
     * Return true if the value of this Decimal is 0, otherwise return false.
     *
     */
    isZero(): boolean;

    /**
     * Return true if the value of this Decimal is less than `y`, otherwise return false.
     *
     */
    lessThan(y: Decimal.Numeric): boolean;

    /**
     * Return true if the value of this Decimal is less than `y`, otherwise return false.
     *
     */
    lt(y: Decimal.Numeric): boolean;

    /**
     * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
     *
     */
    lessThanOrEqualTo(y: Decimal.Numeric): boolean;

    /**
     * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
     *
     */
    lte(y: Decimal.Numeric): boolean;

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
    logarithm(base?: Decimal.Numeric): Decimal;

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
    log(base?: Decimal.Numeric): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal minus `y`, truncated to
     * `precision` significant digits.
     *
     */
    minus(y: Decimal.Numeric): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal minus `y`, truncated to
     * `precision` significant digits.
     *
     */
    sub(y: Decimal.Numeric): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal modulo `y`, truncated to
     * `precision` significant digits.
     *
     */
    modulo(y: Decimal.Numeric): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal modulo `y`, truncated to
     * `precision` significant digits.
     *
     */
    mod(y: Decimal.Numeric): Decimal;

    /**
     * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
     * i.e. the base e raised to the power the value of this Decimal, truncated to `precision`
     * significant digits.
     *
     */
    naturalExponetial(): Decimal;

    /**
     * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
     * i.e. the base e raised to the power the value of this Decimal, truncated to `precision`
     * significant digits.
     *
     */
    exp(): Decimal;

    /**
     * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
     * truncated to `precision` significant digits.
     *
     */
    naturalLogarithm(): Decimal;

    /**
     * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
     * truncated to `precision` significant digits.
     *
     */
    ln(): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
     * -1.
     *
     */
    negated(): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
     * -1.
     *
     */
    neg(): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal plus `y`, truncated to
     * `precision` significant digits.
     *
     */
    plus(y: Decimal.Numeric): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal plus `y`, truncated to
     * `precision` significant digits.
     *
     */
    add(y: Decimal.Numeric): Decimal;

    /**
     * Return the number of significant digits of the value of this Decimal.
     *
     * @param zeros - Whether to count integer-part trailing zeros: true, false, 1 or 0.
     */
    precision(zeros: boolean | number): number;

    /**
     * Return the number of significant digits of the value of this Decimal.
     *
     * @param zeros - Whether to count integer-part trailing zeros: true, false, 1 or 0.
     */
    sd(zeros: boolean | number): number;

    /**
     * Return a new Decimal whose value is the square root of this Decimal, truncated to `precision`
     * significant digits.
     *
     */
    squareRoot(): Decimal;

    /**
     * Return a new Decimal whose value is the square root of this Decimal, truncated to `precision`
     * significant digits.
     *
     */
    sqrt(): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal times `y`, truncated to
     * `precision` significant digits.
     *
     */
    times(y: Decimal.Numeric): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal times `y`, truncated to
     * `precision` significant digits.
     *
     */
    mul(y: Decimal.Numeric): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
     * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
     *
     * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
     *
     * @param dp - Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    toDecimalPlaces(dp?: number, rm?: number): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
     * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
     *
     * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
     *
     * @param dp - Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    todp(dp?: number, rm?: number): Decimal;

    /**
     * Return a string representing the value of this Decimal in exponential notation rounded to
     * `dp` fixed decimal places using rounding mode `rounding`.
     *
     * @param dp - Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    toExponential(dp?: number, rm?: number): string;

    /**
     * Return a string representing the value of this Decimal in normal (fixed-point) notation to
     * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
     * omitted.
     *
     * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
     *
     * @param dp - Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
     * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
     * (-0).toFixed(3) is '0.000'.
     * (-0.5).toFixed(0) is '-0'.
     *
     */
    toFixed(dp?: number, rm?: number): string;

    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
     * rounding mode `rounding`.
     *
     */
    toInteger(): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
     * rounding mode `rounding`.
     *
     */
    toint(): Decimal;

    /**
     * Return the value of this Decimal converted to a number primitive.
     *
     */
    toNumber(): number;

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
     * @param y - The power to which to raise this Decimal.
     *
     */
    toPower(y: Decimal.Numeric): Decimal;

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
     * @param y - The power to which to raise this Decimal.
     *
     */
    pow(y: Decimal.Numeric): Decimal;

    /**
     * Return a string representing the value of this Decimal rounded to `sd` significant digits
     * using rounding mode `rounding`.
     *
     * Return exponential notation if `sd` is less than the number of digits necessary to represent
     * the integer part of the value in normal notation.
     *
     * @param sd - Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    toPrecision(sd?: number, rm?: number): string;

    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
     * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
     * omitted.
     *
     * @param sd - Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    toSignificantDigits(sd?: number, rm?: number): Decimal;

    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
     * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
     * omitted.
     *
     * @param sd - Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    tosd(sd?: number, rm?: number): Decimal;

    /**
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    toString(): string;

    /**
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    valueOf(): string;

    /**
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    val(): string;

    /**
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    toJSON(): string;
}

/** @public */
export namespace Decimal {
    export type Numeric = string|number|Decimal;
}
