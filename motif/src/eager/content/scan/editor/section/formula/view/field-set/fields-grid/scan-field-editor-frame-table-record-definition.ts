/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PayloadTableRecordDefinition, TypedTableFieldSourceDefinition, TypedTableRecordDefinition } from '@motifmarkets/motif-core';
import { ScanFieldEditorFrame } from '../field/internal-api';

export interface ScanFieldEditorFrameTableRecordDefinition extends PayloadTableRecordDefinition<ScanFieldEditorFrame> {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.ScanFieldEditorFrame;
}

export namespace ScanFieldEditorFrameTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is ScanFieldEditorFrameTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.ScanFieldEditorFrame;
    }
}
