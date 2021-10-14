/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Halign } from 'revgrid';
import { DepthLevelsDataItem } from 'src/adi/depth-levels-data-item';
import { EnumInfoOutOfOrderError, Integer, UnreachableCaseError } from 'src/sys/internal-api';

export const enum ShortDepthSideFieldId {
    PriceAndHasUndisclosed,
    Volume,
    OrderCount,
    MarketId,
    VolumeAhead,
    Price,
}

export namespace ShortDepthSideField {
    export type Id = ShortDepthSideFieldId;

    const leftTextAlign = 'left';
    const rightTextAlign = 'right';

    class Info {
        constructor(
            public id: Id,
            public name: string,
            public defaultHeading: string,
            public defaultVisible: boolean,
            public defaultTextAlign: Halign,
        ) { }
    }

    type InfosObject = { [id in keyof typeof ShortDepthSideFieldId]: Info };

    const infosObject: InfosObject = {
        PriceAndHasUndisclosed: {
            id: ShortDepthSideFieldId.PriceAndHasUndisclosed,
            name: 'PriceAndHasUndisclosed',
            defaultHeading: 'PriceU',
            defaultVisible: true,
            defaultTextAlign: rightTextAlign,
        },
        Volume: {
            id: ShortDepthSideFieldId.Volume,
            name: 'Volume',
            defaultHeading: 'Volume',
            defaultVisible: true,
            defaultTextAlign: rightTextAlign,
        },
        OrderCount: {
            id: ShortDepthSideFieldId.OrderCount,
            name: 'OrderCount',
            defaultHeading: 'Count',
            defaultVisible: true,
            defaultTextAlign: rightTextAlign,
        },
        MarketId: {
            id: ShortDepthSideFieldId.MarketId,
            name: 'MarketId',
            defaultHeading: 'Market',
            defaultVisible: false,
            defaultTextAlign: leftTextAlign,
        },
        VolumeAhead: {
            id: ShortDepthSideFieldId.VolumeAhead,
            name: 'VolumeAhead',
            defaultHeading: 'VAhead',
            defaultVisible: false,
            defaultTextAlign: rightTextAlign,
        },
        Price: {
            id: ShortDepthSideFieldId.Price,
            name: 'Price',
            defaultHeading: 'Price',
            defaultVisible: false,
            defaultTextAlign: rightTextAlign,
        },
    };

    export const idCount = Object.keys(infosObject).length;

    const infos = Object.values(infosObject);

    export function initialise() {
        const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
        if (outOfOrderIdx >= 0) {
            throw new EnumInfoOutOfOrderError('ShortDepthSideFieldId', outOfOrderIdx, infos[outOfOrderIdx].name);
        }
    }

    export function idToName(id: Id) {
        return infos[id].name;
    }

    export function idToDefaultHeading(id: Id) {
        return infos[id].defaultHeading;
    }

    export function idToDefaultVisible(id: Id) {
        return infos[id].defaultVisible;
    }

    export function idToDefaultTextAlign(id: Id) {
        return infos[id].defaultTextAlign;
    }

    export function createIdFromDepthLevelFieldId(levelFieldId: DepthLevelsDataItem.Level.Field.Id): ShortDepthSideFieldId | undefined {
        switch (levelFieldId) {
            case DepthLevelsDataItem.Level.Field.Id.Id:
                return undefined;
            case DepthLevelsDataItem.Level.Field.Id.SideId:
                return undefined;
            case DepthLevelsDataItem.Level.Field.Id.Price:
                return ShortDepthSideFieldId.Price; // Also affects ShortDepthSideFieldId.PriceAndHasUndisclosed - handled elsewhere
            case DepthLevelsDataItem.Level.Field.Id.OrderCount:
                return ShortDepthSideFieldId.OrderCount;
            case DepthLevelsDataItem.Level.Field.Id.Volume:
                return ShortDepthSideFieldId.Volume;
            case DepthLevelsDataItem.Level.Field.Id.HasUndisclosed:
                return ShortDepthSideFieldId.PriceAndHasUndisclosed;
            case DepthLevelsDataItem.Level.Field.Id.MarketId:
                return ShortDepthSideFieldId.MarketId;
            default:
                throw new UnreachableCaseError('SDSDCDLFD77411', levelFieldId);
        }
    }
}
