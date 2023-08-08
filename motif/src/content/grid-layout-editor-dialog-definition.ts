/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdaptedRevgrid, GridField, GridLayoutDefinition, GridLayoutOrNamedReferenceDefinition } from '@motifmarkets/motif-core';

export interface AllowedFieldsAndLayoutDefinition {
    readonly allowedFields: readonly GridField[];
    readonly layoutDefinition: GridLayoutDefinition;
}

export interface BidAskAllowedFieldsAndLayoutDefinitions {
    bid: AdaptedRevgrid.AllowedFieldsAndLayoutDefinition;
    ask: AdaptedRevgrid.AllowedFieldsAndLayoutDefinition;
}

export interface ParidepthAllowedFieldsAndLayoutDefinitions {
    watchlist: AdaptedRevgrid.AllowedFieldsAndLayoutDefinition;
    depth: BidAskAllowedFieldsAndLayoutDefinitions;
    trades: AllowedFieldsAndLayoutDefinition;
}

export interface BidAskGridLayoutDefinitions {
    bid: GridLayoutDefinition;
    ask: GridLayoutDefinition;
}

export interface ParidepthGridLayoutDefinitions {
    watchlist: GridLayoutOrNamedReferenceDefinition;
    depth: BidAskGridLayoutDefinitions;
    trades: GridLayoutDefinition;
}
