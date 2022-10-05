/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, MarketId, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ApiError as ApiErrorApi, MarketId as MarketIdApi, MarketIdEnum as MarketIdEnumApi } from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace MarketIdImplementation {
    export function toApi(value: MarketId): MarketIdApi {
        switch (value) {
            case MarketId.AsxBookBuild: throw new AssertInternalError('MIAITAABB98887722');
            case MarketId.AsxPureMatch: throw new AssertInternalError('MIAITAPMB98887722');
            case MarketId.AsxTradeMatch: return MarketIdEnumApi.AsxTradeMatch;
            case MarketId.AsxTradeMatchCentrePoint: return MarketIdEnumApi.AsxCentrePoint;
            case MarketId.AsxVolumeMatch: throw new AssertInternalError('MIAITAAVM98887722');
            case MarketId.ChixAustLimit: throw new AssertInternalError('MIAITACAL98887722');
            case MarketId.ChixAustFarPoint: throw new AssertInternalError('MIAITACAFP98887722');
            case MarketId.ChixAustMarketOnClose: throw new AssertInternalError('MIAITACAMOC98887722');
            case MarketId.ChixAustNearPoint: throw new AssertInternalError('MIAITACANP98887722');
            case MarketId.ChixAustMidPoint: throw new AssertInternalError('MIAITACAMP98887722');
            case MarketId.SimVenture: throw new AssertInternalError('MIAITASV98887722');
            case MarketId.Nsx: throw new AssertInternalError('MIAITANSX98887722');
            case MarketId.SouthPacific: throw new AssertInternalError('MIAITASP98887722');
            case MarketId.MyxNormal: return MarketIdEnumApi.MyxNormal;
            case MarketId.MyxDirectBusiness: return MarketIdEnumApi.MyxDirectBusiness;
            case MarketId.MyxIndex: return MarketIdEnumApi.MyxIndex;
            case MarketId.MyxOddLot: return MarketIdEnumApi.MyxOddLot;
            case MarketId.MyxBuyIn: return MarketIdEnumApi.MyxBuyIn;
            case MarketId.Nzx: return MarketIdEnumApi.Nzx;
            case MarketId.Calastone: throw new AssertInternalError('MIAITACLS98887722');
            case MarketId.AsxCxa: throw new AssertInternalError('MIAITAASC98887722');
            case MarketId.Ptx: return MarketIdEnumApi.Ptx;
            case MarketId.Fnsx: return MarketIdEnumApi.Fnsx;
            default: throw new UnreachableCaseError('MIAITADEF98887722', value);
        }
    }

    export function fromApi(value: MarketIdApi): MarketId {
        const enumValue = value as MarketIdEnumApi;
        switch (enumValue) {
            case MarketIdEnumApi.AsxTradeMatch: return MarketId.AsxTradeMatch;
            case MarketIdEnumApi.AsxCentrePoint: return MarketId.AsxTradeMatchCentrePoint;
            case MarketIdEnumApi.MyxNormal: return MarketId.MyxNormal;
            case MarketIdEnumApi.MyxDirectBusiness: return MarketId.MyxDirectBusiness;
            case MarketIdEnumApi.MyxIndex: return MarketId.MyxIndex;
            case MarketIdEnumApi.MyxOddLot: return MarketId.MyxOddLot;
            case MarketIdEnumApi.MyxBuyIn: return MarketId.MyxBuyIn;
            case MarketIdEnumApi.Nzx: return MarketId.Nzx;
            case MarketIdEnumApi.Ptx: return MarketId.Ptx;
            case MarketIdEnumApi.Fnsx: return MarketId.Fnsx;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidMarketId, enumValue);
        }
    }

    export function arrayToApi(value: readonly MarketId[]): MarketIdApi[] {
        const count = value.length;
        const result = new Array<MarketIdApi>(count);
        for (let i = 0; i < count; i++) {
            result[i] = toApi(value[i]);
        }
        return result;
    }

    export function arrayFromApi(value: readonly MarketIdApi[]): MarketId[] {
        const count = value.length;
        const result = new Array<MarketId>(count);
        for (let i = 0; i < count; i++) {
            result[i] = fromApi(value[i]);
        }
        return result;
    }
}
