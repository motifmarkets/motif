/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FeedClassId, UnreachableCaseError } from '@motifmarkets/motif-core';
import {
    ApiError as ApiErrorApi,
    FeedClass as FeedClassApi,
    FeedClassEnum as FeedClassEnumApi
} from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/internal-api';

export namespace FeedClassImplementation {
    export function toApi(value: FeedClassId): FeedClassApi {
        switch (value) {
            case FeedClassId.Authority: return FeedClassEnumApi.Authority;
            case FeedClassId.Market: return FeedClassEnumApi.Market;
            case FeedClassId.News: return FeedClassEnumApi.News;
            case FeedClassId.Trading: return FeedClassEnumApi.Trading;
            default: throw new UnreachableCaseError('FCAITAU9000432338', value);
        }
    }

    export function fromApi(value: FeedClassApi): FeedClassId {
        const enumValue = value as FeedClassEnumApi;
        switch (enumValue) {
            case FeedClassEnumApi.Authority: return FeedClassId.Authority;
            case FeedClassEnumApi.Market: return FeedClassId.Market;
            case FeedClassEnumApi.News: return FeedClassId.News;
            case FeedClassEnumApi.Trading: return FeedClassId.Trading;
            default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidFeedClass, enumValue);
        }
    }
}
