/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement, UnreachableCaseError } from '@motifmarkets/motif-core';
import {
    ApiError as ApiErrorApi,
    JsonElementErr as JsonElementErrApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from './api-error-api-implementation';
import { ErrImplementation } from './result-api-implementation';

export class JsonElementErrImplementation<T> extends ErrImplementation<T> implements JsonElementErrApi<T> {
    readonly code: JsonElementErrApi.Code;

    constructor(private readonly _errorId: JsonElement.ErrorId) {
        const code = JsonElementErrImplementation.ErrorId.toApi(_errorId);
        super(code)
        this.code = code;
    }

    override isErr(): this is JsonElementErrApi<T> {
        return true;
    }
}

export namespace JsonElementErrImplementation {
    export function create<T>(errorId: JsonElement.ErrorId): JsonElementErrApi<T> {
        return new JsonElementErrImplementation(errorId);
    }

    export namespace ErrorId {
        export function toApi(value: JsonElement.ErrorId): JsonElementErrApi.Code {
            switch (value) {
                case JsonElement.ErrorId.InvalidJsonText: return JsonElementErrApi.CodeEnum.InvalidJsonText;
                case JsonElement.ErrorId.ElementIsNotDefined: return JsonElementErrApi.CodeEnum.ElementIsNotDefined;
                case JsonElement.ErrorId.ElementIsNotAJsonObject: return JsonElementErrApi.CodeEnum.ElementIsNotAJsonObject;
                case JsonElement.ErrorId.JsonValueIsNotDefined: return JsonElementErrApi.CodeEnum.JsonValueIsNotDefined;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeObject: return JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeObject;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeString: return JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeString;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeNumber: return JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeNumber;
                case JsonElement.ErrorId.JsonValueIsNotOfTypeBoolean: return JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeBoolean;
                case JsonElement.ErrorId.DecimalJsonValueIsNotOfTypeString: return JsonElementErrApi.CodeEnum.DecimalJsonValueIsNotOfTypeString;
                case JsonElement.ErrorId.InvalidDecimal: return JsonElementErrApi.CodeEnum.InvalidDecimal;
                case JsonElement.ErrorId.JsonValueIsNotAnArray: return JsonElementErrApi.CodeEnum.JsonValueIsNotAnArray;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotAnObject: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotAnObject;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotJson: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotJson;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotAString: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotAString;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotANumber: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotANumber;
                case JsonElement.ErrorId.JsonValueArrayElementIsNotABoolean: return JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotABoolean;
                default:
                    throw new UnreachableCaseError('JERAIEOTA55598', value);
            }
        }

        export function fromApi(value: JsonElementErrApi.Code): JsonElement.ErrorId {
            const enumValue = value as JsonElementErrApi.CodeEnum;
            switch (enumValue) {
                case JsonElementErrApi.CodeEnum.InvalidJsonText: return JsonElement.ErrorId.InvalidJsonText;
                case JsonElementErrApi.CodeEnum.ElementIsNotDefined: return JsonElement.ErrorId.ElementIsNotDefined;
                case JsonElementErrApi.CodeEnum.ElementIsNotAJsonObject: return JsonElement.ErrorId.ElementIsNotAJsonObject;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotDefined: return JsonElement.ErrorId.JsonValueIsNotDefined;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeObject: return JsonElement.ErrorId.JsonValueIsNotOfTypeObject;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeString: return JsonElement.ErrorId.JsonValueIsNotOfTypeString;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeNumber: return JsonElement.ErrorId.JsonValueIsNotOfTypeNumber;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotOfTypeBoolean: return JsonElement.ErrorId.JsonValueIsNotOfTypeBoolean;
                case JsonElementErrApi.CodeEnum.DecimalJsonValueIsNotOfTypeString: return JsonElement.ErrorId.DecimalJsonValueIsNotOfTypeString;
                case JsonElementErrApi.CodeEnum.InvalidDecimal: return JsonElement.ErrorId.InvalidDecimal;
                case JsonElementErrApi.CodeEnum.JsonValueIsNotAnArray: return JsonElement.ErrorId.JsonValueIsNotAnArray;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotAnObject: return JsonElement.ErrorId.JsonValueArrayElementIsNotAnObject;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotJson: return JsonElement.ErrorId.JsonValueArrayElementIsNotJson;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotAString: return JsonElement.ErrorId.JsonValueArrayElementIsNotAString;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotANumber: return JsonElement.ErrorId.JsonValueArrayElementIsNotANumber;
                case JsonElementErrApi.CodeEnum.JsonValueArrayElementIsNotABoolean: return JsonElement.ErrorId.JsonValueArrayElementIsNotABoolean;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidJsonELementErrorCode, enumValue);
            }
        }
    }
}
