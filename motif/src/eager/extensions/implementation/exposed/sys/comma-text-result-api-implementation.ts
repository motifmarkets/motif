/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommaText, UnreachableCaseError } from '@motifmarkets/motif-core';
import {
    ApiError as ApiErrorApi,
    CommaTextErr as CommaTextErrApi,
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from './api-error-api-implementation';
import { ErrImplementation } from './result-api-implementation';

export class CommaTextErrImplementation<T> extends ErrImplementation<T> implements CommaTextErrApi<T> {
    readonly code: CommaTextErrApi.Code;

    constructor(private readonly _errorId: CommaText.ErrorId, readonly extraInfo: string) {
        const code = CommaTextErrImplementation.ErrorId.toApi(_errorId);
        super(code)
        this.code = code;
    }

    override isErr(): this is CommaTextErrApi<T> {
        return true;
    }
}

export namespace CommaTextErrImplementation {
    export function create<T>(errorId: CommaText.ErrorId, extraInfo: string): CommaTextErrApi<T> {
        return new CommaTextErrImplementation(errorId, extraInfo);
    }

    export namespace ErrorId {
        export function toApi(value: CommaText.ErrorId): CommaTextErrApi.Code {
            switch (value) {
                case CommaText.ErrorId.UnexpectedCharAfterQuotedElement: return CommaTextErrApi.CodeEnum.UnexpectedCharAfterQuotedElement;
                case CommaText.ErrorId.QuotesNotClosedInLastElement: return CommaTextErrApi.CodeEnum.QuotesNotClosedInLastElement;
                case CommaText.ErrorId.InvalidIntegerString: return CommaTextErrApi.CodeEnum.InvalidIntegerString;
                default:
                    throw new UnreachableCaseError('CTRAIEITA55598', value);
            }
        }

        export function fromApi(value: CommaTextErrApi.Code): CommaText.ErrorId {
            const enumValue = value as CommaTextErrApi.CodeEnum;
            switch (enumValue) {
                case CommaTextErrApi.CodeEnum.UnexpectedCharAfterQuotedElement: return CommaText.ErrorId.UnexpectedCharAfterQuotedElement;
                case CommaTextErrApi.CodeEnum.QuotesNotClosedInLastElement: return CommaText.ErrorId.QuotesNotClosedInLastElement;
                case CommaTextErrApi.CodeEnum.InvalidIntegerString: return CommaText.ErrorId.InvalidIntegerString;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidCommaTextErrorCode, enumValue);
            }
        }
    }
}
