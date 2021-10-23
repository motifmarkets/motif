/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordField } from 'revgrid';
import { MotifGrid } from 'src/content/internal-api';
import { CorrectnessId } from 'src/sys/internal-api';
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
