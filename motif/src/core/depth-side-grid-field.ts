/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridField, GridFieldState } from '@motifmarkets/revgrid';
import { CorrectnessId } from 'src/sys/internal-api';

export class DepthSideGridField extends GridField {

}

export namespace DepthSideGridField {
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;
    export interface AllFieldsAndDefaults {
        fields: DepthSideGridField[];
        defaultStates: GridFieldState[];
        defaultVisibles: boolean[];
    }
}
