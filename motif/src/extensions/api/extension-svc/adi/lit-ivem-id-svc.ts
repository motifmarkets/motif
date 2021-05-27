/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparisonResult, ExchangeEnvironmentId, Json, LitIvemId, MarketId } from '../../exposed/extension-api';

/** @public */
export interface LitIvemIdSvc {
    create(code: string, litId: MarketId, exchangeEnvironmentId?: ExchangeEnvironmentId): LitIvemId;
    isEqual(left: LitIvemId, right: LitIvemId): boolean;
    isUndefinableEqual(left: LitIvemId | undefined, right: LitIvemId | undefined): boolean;
    compare(left: LitIvemId, right: LitIvemId): ComparisonResult;
    tryCreateFromJson(json: Json): LitIvemId | undefined;
    tryCreateArrayFromJson(jsonArray: Json[]): LitIvemId[] | undefined;
}
