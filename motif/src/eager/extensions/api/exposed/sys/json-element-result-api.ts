/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err, Ok } from './result-api';

/** @public */
export type JsonElementResult<T, E = string> = Ok<T, E> | JsonElementErr<T, E>;

/** @public */
export interface JsonElementErr<T = undefined, E = string> extends Err<T, E> {
    readonly code: JsonElementErr.Code;
}

export namespace JsonElementErr {
    export const enum CodeEnum {
        InvalidJsonText = 'InvalidJsonText',
        ElementIsNotDefined = 'ElementIsNotDefined',
        ElementIsNotAJsonObject = 'ElementIsNotAJsonObject',
        JsonValueIsNotDefined = 'JsonValueIsNotDefined',
        JsonValueIsNotOfTypeObject = 'JsonValueIsNotOfTypeObject',
        JsonValueIsNotOfTypeString = 'JsonValueIsNotOfTypeString',
        JsonValueIsNotOfTypeNumber = 'JsonValueIsNotOfTypeNumber',
        JsonValueIsNotOfTypeBoolean = 'JsonValueIsNotOfTypeBoolean',
        DecimalJsonValueIsNotOfTypeString = 'DecimalJsonValueIsNotOfTypeString',
        InvalidDecimal = 'InvalidDecimal',
        JsonValueIsNotAnArray = 'JsonValueIsNotAnArray',
        JsonValueArrayElementIsNotAnObject = 'JsonValueArrayElementIsNotAnObject',
        JsonValueArrayElementIsNotJson = 'JsonValueArrayElementIsNotJson',
        JsonValueArrayElementIsNotAString = 'JsonValueArrayElementIsNotAString',
        JsonValueArrayElementIsNotANumber = 'JsonValueArrayElementIsNotANumber',
        JsonValueArrayElementIsNotABoolean = 'JsonValueArrayElementIsNotABoolean',
    }

    export type Code = keyof typeof CodeEnum;
}
