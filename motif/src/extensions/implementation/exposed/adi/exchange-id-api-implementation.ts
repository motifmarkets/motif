/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExchangeId, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ApiError as ApiErrorApi, ExchangeId as ExchangeIdApi, ExchangeIdEnum as ExchangeIdEnumApi } from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace ExchangeIdImplementation {
    export function toApi(value: ExchangeId): ExchangeIdApi {
        switch (value) {
            case ExchangeId.Asx: return ExchangeIdEnumApi.Asx;
            case ExchangeId.Cxa: return ExchangeIdEnumApi.Cxa;
            case ExchangeId.Nsx: throw new AssertInternalError('EIAITANSX98887722');
            case ExchangeId.Nzx: throw new AssertInternalError('EIAITANZX98887722');
            case ExchangeId.Myx: return ExchangeIdEnumApi.Myx;
            case ExchangeId.Calastone: throw new AssertInternalError('EIAITACLS98887722');
            case ExchangeId.Ptx: return ExchangeIdEnumApi.Ptx;
            case ExchangeId.Fnsx: return ExchangeIdEnumApi.Fnsx;
            case ExchangeId.AsxCxa: throw new AssertInternalError('EIAITAASC98887722');
            default: throw new UnreachableCaseError('EIAITADEF98887722', value);
        }
    }

    export function fromApi(value: ExchangeIdApi): ExchangeId {
        const enumValue = value as ExchangeIdEnumApi;
        switch (enumValue) {
            case ExchangeIdEnumApi.Asx: return ExchangeId.Asx;
            case ExchangeIdEnumApi.Cxa: return ExchangeId.Cxa;
            case ExchangeIdEnumApi.Myx: return ExchangeId.Myx;
            case ExchangeIdEnumApi.Ptx: return ExchangeId.Ptx;
            case ExchangeIdEnumApi.Fnsx: return ExchangeId.Fnsx;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidExchangeId, enumValue);
        }
    }

    export function arrayToApi(value: readonly ExchangeId[]): ExchangeIdApi[] {
        const count = value.length;
        const result = new Array<ExchangeIdApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: readonly ExchangeIdApi[]): ExchangeId[] {
        const count = value.length;
        const result = new Array<ExchangeId>(count);
        for (let i = 0; i < count; i++) {
            result[i] = fromApi(value[i]);
        }
        return result;
    }
}
