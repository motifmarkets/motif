/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CssColor, GridAttribute, GridTransform, GridTransformData } from '@motifmarkets/revgrid';

export enum PulseGridAttributeId {
    AuctionMatch = 'AuctionMatch',  // Indicates an order will be filled when the pre-market auction phase resolves.
    OwnOrder = 'OwnOrder',          // Indicates an order was placed with an account the user has access privileges for.
}

const auctionMatchTransform: GridTransform = {
    Name: 'AuctionMatch',

    Transform: (attribute: GridAttribute): GridTransformData => {
        if (typeof attribute === 'string' && attribute === PulseGridAttributeId.AuctionMatch) {
            return {
                // TODO:MED What colors to use for Auction Match
                BackgroundColour: '#2fb4c8',
                ForegroundColour: CssColor.White,
            };
        } else {
            return {};
        }
    },
};

const ownOrderTransform: GridTransform = {
    Name: 'OwnOrder',

    Transform: (attribute: GridAttribute): GridTransformData => {
        if (typeof attribute === 'string' && attribute === PulseGridAttributeId.OwnOrder) {
            return {
                // TODO:MED What colors to use for own order match
                BackgroundColour: '#D77F27',
                ForegroundColour: CssColor.White,
            };
        } else {
            return {};
        }
    },
};

// TODO:MED The transforms will require access to the settings instance. Right now they don't.

export const pulseGridTransforms: GridTransform[] = [
    auctionMatchTransform,
    ownOrderTransform,
];
