/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { I18nStrings, StringId } from 'src/res/internal-api';
import { Logger } from './logger';

export class PulseError extends Error {
    constructor(message: string) {
        super(message);
        Logger.logError(message, 100);
    }
}

abstract class BaseInternalError extends Error {
    constructor(errorTypeDescription: StringId, private code: string, message?: string) {
        super(message === undefined || message === '' ?
            I18nStrings.getStringPlusEnglish(errorTypeDescription) + `: ${code}`
            :
            I18nStrings.getStringPlusEnglish(errorTypeDescription) + `: ${code}: ${message}`);
        Logger.logError(this.message, 120);
    }
}

export class InternalError extends BaseInternalError {
    constructor(code: string, message: string) {
        super(StringId.InternalError, code, message);
    }
}

export class AssertInternalError extends BaseInternalError {
    constructor(code: string, message?: string) {
        super(StringId.AssertInternalError, code, message);
    }
}

export class NotImplementedError extends BaseInternalError {
    constructor(code: string) {
        super(StringId.NotImplementedInternalError, code);
    }
}

export class UnexpectedTypeError extends BaseInternalError {
    constructor(code: string, message: string) {
        super(StringId.UnexpectedTypeInternalError, code, message);
    }
}

export class UnreachableCaseError extends BaseInternalError {
    constructor(code: string, value: never) {
        super(StringId.UnreachableCaseInternalError, code, `"${value}"`);
    }
}

export class UnexpectedCaseError extends BaseInternalError {
    constructor(code: string, message?: string) {
        super(StringId.UnreachableCaseInternalError, code, message);
    }
}

export class EnumInfoOutOfOrderError extends BaseInternalError {
    constructor(enumName: string, outOfOrderInfoElementIndex: number, infoDescription: string) {
        super(StringId.EnumInfoOutOfOrderInternalError, enumName,  `${outOfOrderInfoElementIndex}: ${infoDescription.substr(0, 100)}`);
    }
}
