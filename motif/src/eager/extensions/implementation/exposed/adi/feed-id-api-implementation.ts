/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, FeedId, UnreachableCaseError } from '@motifmarkets/motif-core';
import {
    ApiError as ApiErrorApi,
    FeedId as FeedIdApi,
    FeedIdEnum as FeedIdEnumApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace FeedIdImplementation {
    export function toApi(value: FeedId): FeedIdApi {
        switch (value) {
            case FeedId.Null: return FeedIdEnumApi.Null;
            case FeedId.Authority_Trading: return FeedIdEnumApi.Authority_Trading;
            case FeedId.Authority_Watchlist: return FeedIdEnumApi.Authority_Watchlist;
            case FeedId.Trading_Oms: return FeedIdEnumApi.Trading_Oms;
            case FeedId.Trading_Motif: return FeedIdEnumApi.Trading_Motif;
            case FeedId.Trading_Malacca: return FeedIdEnumApi.Trading_Malacca;
            case FeedId.Trading_Finplex: return FeedIdEnumApi.Trading_Finplex;
            case FeedId.Trading_CFMarkets: return FeedIdEnumApi.Trading_CFMarkets;
            case FeedId.Market_AsxBookBuild: throw new AssertInternalError('FIAITAABB5662349843');
            case FeedId.Market_AsxPureMatch: throw new AssertInternalError('FIAITAAPM5662349843');
            case FeedId.Market_AsxTradeMatch: return FeedIdEnumApi.Market_AsxTradeMatch;
            case FeedId.Market_AsxCentrePoint: return FeedIdEnumApi.Market_AsxCentrePoint;
            case FeedId.Market_AsxVolumeMatch: throw new AssertInternalError('FIAITAAVM5662349843');
            case FeedId.Market_ChixAustLimit: throw new AssertInternalError('FIAITACAL5662349843');
            case FeedId.Market_ChixAustFarPoint: throw new AssertInternalError('FIAITACFP5662349843');
            case FeedId.Market_ChixAustMarketOnClose: throw new AssertInternalError('FIAITACMOC5662349843');
            case FeedId.Market_ChixAustNearPoint: throw new AssertInternalError('FIAITACNP5662349843');
            case FeedId.Market_ChixAustMidPoint: throw new AssertInternalError('FIAITACMP5662349843');
            case FeedId.Market_SimVenture: throw new AssertInternalError('FIAITASV5662349843');
            case FeedId.Market_Nsx: throw new AssertInternalError('FIAITANSX5662349843');
            case FeedId.Market_SouthPacific: throw new AssertInternalError('FIAITASP5662349843');
            case FeedId.Market_Nzfox: throw new AssertInternalError('FIAITANZF5662349843');
            case FeedId.Market_Nzx: throw new AssertInternalError('FIAITANZX5662349843');
            case FeedId.Market_MyxNormal: return FeedIdEnumApi.Market_MyxNormal;
            case FeedId.Market_MyxDirectBusiness: return FeedIdEnumApi.Market_MyxDirectBusiness;
            case FeedId.Market_MyxIndex: return FeedIdEnumApi.Market_MyxIndex;
            case FeedId.Market_MyxOddLot: return FeedIdEnumApi.Market_MyxOddLot;
            case FeedId.Market_MyxBuyIn: return FeedIdEnumApi.Market_MyxBuyIn;
            case FeedId.Market_Ptx: return FeedIdEnumApi.Market_Ptx;
            case FeedId.Market_Fnsx: return FeedIdEnumApi.Market_Fnsx;
            case FeedId.Market_Fpsx: return FeedIdEnumApi.Market_Fpsx;
            case FeedId.Market_Cfxt: return FeedIdEnumApi.Market_Cfxt;
            case FeedId.Market_Calastone: throw new AssertInternalError('FIAITACLS5662349843');
            case FeedId.Market_AsxCxa: throw new AssertInternalError('FIAITAASC5662349843');
            case FeedId.News_Asx: return FeedIdEnumApi.News_Asx;
            case FeedId.News_Nsx: return FeedIdEnumApi.News_Nsx;
            case FeedId.News_Nzx: return FeedIdEnumApi.News_Nzx;
            case FeedId.News_Myx: return FeedIdEnumApi.News_Myx;
            case FeedId.News_Ptx: return FeedIdEnumApi.News_Ptx;
            case FeedId.News_Fnsx: return FeedIdEnumApi.News_Fnsx;
            case FeedId.Watchlist: return FeedIdEnumApi.Watchlist;
            case FeedId.Scanner: return FeedIdEnumApi.Scanner;
            default: throw new UnreachableCaseError('FIAITAU5662349843', value);
        }
    }

    export function fromApi(value: FeedIdApi): FeedId {
        const enumValue = value as FeedIdEnumApi;
        switch (enumValue) {
            case FeedIdEnumApi.Null: return FeedId.Null;
            case FeedIdEnumApi.Authority_Trading: return FeedId.Authority_Trading;
            case FeedIdEnumApi.Authority_Watchlist: return FeedId.Authority_Watchlist;
            case FeedIdEnumApi.Trading_Oms: return FeedId.Trading_Oms;
            case FeedIdEnumApi.Trading_Motif: return FeedId.Trading_Motif;
            case FeedIdEnumApi.Trading_Malacca: return FeedId.Trading_Malacca;
            case FeedIdEnumApi.Trading_Finplex: return FeedId.Trading_Finplex;
            case FeedIdEnumApi.Trading_CFMarkets: return FeedId.Trading_CFMarkets;
            case FeedIdEnumApi.Market_AsxTradeMatch: return FeedId.Market_AsxTradeMatch;
            case FeedIdEnumApi.Market_AsxCentrePoint: return FeedId.Market_AsxCentrePoint;
            case FeedIdEnumApi.Market_MyxNormal: return FeedId.Market_MyxNormal;
            case FeedIdEnumApi.Market_MyxDirectBusiness: return FeedId.Market_MyxDirectBusiness;
            case FeedIdEnumApi.Market_MyxIndex: return FeedId.Market_MyxIndex;
            case FeedIdEnumApi.Market_MyxOddLot: return FeedId.Market_MyxOddLot;
            case FeedIdEnumApi.Market_MyxBuyIn: return FeedId.Market_MyxBuyIn;
            case FeedIdEnumApi.Market_Ptx: return FeedId.Market_Ptx;
            case FeedIdEnumApi.Market_Fnsx: return FeedId.Market_Fnsx;
            case FeedIdEnumApi.Market_Fpsx: return FeedId.Market_Fpsx;
            case FeedIdEnumApi.Market_Cfxt: return FeedId.Market_Cfxt;
            case FeedIdEnumApi.News_Asx: return FeedId.News_Asx;
            case FeedIdEnumApi.News_Nsx: return FeedId.News_Nsx;
            case FeedIdEnumApi.News_Nzx: return FeedId.News_Nzx;
            case FeedIdEnumApi.News_Myx: return FeedId.News_Myx;
            case FeedIdEnumApi.News_Ptx: return FeedId.News_Ptx;
            case FeedIdEnumApi.News_Fnsx: return FeedId.News_Fnsx;
            case FeedIdEnumApi.Watchlist: return FeedId.Watchlist;
            case FeedIdEnumApi.Scanner: return FeedId.Scanner;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidFeedId, enumValue);
        }
    }
}
