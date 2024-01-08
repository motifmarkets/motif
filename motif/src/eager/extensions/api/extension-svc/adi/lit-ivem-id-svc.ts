/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparisonResult, DataEnvironmentId, JsonElement, LitIvemId, MarketId, Result } from '../../exposed/extension-api';

/** @public */
export interface LitIvemIdSvc {
    create(code: string, litId: MarketId, exchangeEnvironmentId?: DataEnvironmentId): LitIvemId;
    isEqual(left: LitIvemId, right: LitIvemId): boolean;
    isUndefinableEqual(left: LitIvemId | undefined, right: LitIvemId | undefined): boolean;
    compare(left: LitIvemId, right: LitIvemId): ComparisonResult;
    tryCreateFromJson(element: JsonElement): Result<LitIvemId>;
    tryCreateArrayFromJson(elements: JsonElement[]): Result<LitIvemId[]>;
}
