/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PayloadTableRecordDefinition, TableFieldSourceDefinition, TableRecordDefinition } from '@motifmarkets/motif-core';
import { ScanFieldEditorFrame } from '../field/internal-api';

export interface ScanFieldEditorFrameTableRecordDefinition extends PayloadTableRecordDefinition<ScanFieldEditorFrame> {
    readonly typeId: TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame;
}

export namespace ScanFieldEditorFrameTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is ScanFieldEditorFrameTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame;
    }
}
