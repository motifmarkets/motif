/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

abstract class BaseInternalError extends Error {
    get code() { return this._code; }

    constructor(private readonly _code: string, message?: string) {
        super(message === undefined || message === '' ? `${_code}` : `${_code}: ${message}`);
        console.error(this.message, 120);
    }
}

export class AssertInternalError extends BaseInternalError {
}

export class UnreachableCaseError extends BaseInternalError {
    constructor(code: string, value: never) {
        super(code, `"${value}"`);
    }
}

export class EnumInfoOutOfOrderError extends BaseInternalError {
    constructor(enumName: string, outOfOrderInfoElementIndex: number, infoDescription: string) {
        super('Enum: ' + enumName,  `${outOfOrderInfoElementIndex}: ${infoDescription.substr(0, 100)}`);
    }
}
