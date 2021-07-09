/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridFieldState } from '@motifmarkets/revgrid';
import { BidAskSideId } from 'src/adi/internal-api';
import { CorrectnessId, UnreachableCaseError } from 'src/sys/internal-api';
import { DepthSideGridField } from './depth-side-grid-field';
import { RenderValue } from './render-value';
import { ShortDepthRecord } from './short-depth-record';
import { ShortDepthSideField, ShortDepthSideFieldId } from './short-depth-side-field';

export class ShortDepthSideGridField extends DepthSideGridField {
    constructor(
        private _id: ShortDepthSideFieldId,
        private _sideId: BidAskSideId,
        private _getDataItemCorrectnessIdEvent: ShortDepthSideGridField.GetDataItemCorrectnessIdEventHandler
    ) {
        super(ShortDepthSideField.idToName(_id));
    }

    override GetFieldValue(record: ShortDepthRecord): RenderValue {
        let dataCorrectnessAttribute: RenderValue.Attribute | undefined;
        const correctnessId = this._getDataItemCorrectnessIdEvent();
        switch (correctnessId) {
            case CorrectnessId.Suspect:
                dataCorrectnessAttribute = RenderValue.DataCorrectnessAttribute.suspect;
                break;
            case CorrectnessId.Error:
                dataCorrectnessAttribute = RenderValue.DataCorrectnessAttribute.error;
                break;
            case CorrectnessId.Usable:
            case CorrectnessId.Good:
                dataCorrectnessAttribute = undefined;
                break;
            default:
                throw new UnreachableCaseError('SDSGFGFV5438827', correctnessId);
        }

        return record.getRenderValue(this._id, this._sideId, dataCorrectnessAttribute);
    }

    override CompareField(left: ShortDepthRecord, right: ShortDepthRecord): number {
        return ShortDepthRecord.compareField(this._id, left, right);
    }

    override CompareFieldDesc(left: ShortDepthRecord, right: ShortDepthRecord): number {
        return ShortDepthRecord.compareFieldDesc(this._id, left, right);
    }
}

export namespace ShortDepthSideGridField {
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;

    export function createAllFieldsAndDefaults(
        sideId: BidAskSideId,
        getDataItemCorrectnessIdEventHandler: DepthSideGridField.GetDataItemCorrectnessIdEventHandler,
    ): DepthSideGridField.AllFieldsAndDefaults {
        const idCount = ShortDepthSideField.idCount;

        const fields = new Array<DepthSideGridField>(idCount);
        const defaultStates = new Array<GridFieldState>(idCount);
        const defaultVisibles = new Array<boolean>(idCount);

        for (let id = 0; id < idCount; id++) {
            fields[id] = new ShortDepthSideGridField(id, sideId, getDataItemCorrectnessIdEventHandler);
            const defaultState: GridFieldState = {
                Header: ShortDepthSideField.idToDefaultHeading(id),
                Alignment: ShortDepthSideField.idToDefaultTextAlign(id),
            };
            defaultStates[id] = defaultState;
            defaultVisibles[id] = ShortDepthSideField.idToDefaultVisible(id);
        }

        return {
            fields,
            defaultStates,
            defaultVisibles,
        };
    }
}
