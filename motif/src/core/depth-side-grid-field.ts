/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MotifGrid } from 'content-internal-api';
import { RevRecordField } from 'revgrid';
import { CorrectnessId } from 'sys-internal-api';
import { DepthRecord } from './depth-record';
import { RenderValue } from './render-value';

export abstract class DepthSideGridField implements RevRecordField {
    constructor(public readonly name: string) { }

    abstract getValue(record: DepthRecord): RenderValue;
}

export namespace DepthSideGridField {
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;
    export interface AllFieldsAndDefaults {
        fields: DepthSideGridField[];
        defaultStates: MotifGrid.FieldState[];
        defaultVisibles: boolean[];
    }
}
