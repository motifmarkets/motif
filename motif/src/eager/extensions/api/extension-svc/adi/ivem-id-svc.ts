/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparisonResult, ExchangeId, IvemId, JsonElement, Result } from '../../exposed/extension-api';

/** @public */
export interface IvemIdSvc {
    create(code: string, exchangeId: ExchangeId): IvemId;
    isEqual(left: IvemId, right: IvemId): boolean;
    isUndefinableEqual(left: IvemId | undefined, right: IvemId | undefined): boolean;
    compare(left: IvemId, right: IvemId): ComparisonResult;
    tryCreateFromJson(element: JsonElement): Result<IvemId>;
    tryCreateArrayFromJson(elements: JsonElement[]): Result<IvemId[]>;
}
