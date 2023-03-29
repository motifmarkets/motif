/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    GridField,
    GridSourceDefinition,
    GridSourceOrNamedReferenceDefinition,
    TableRecordSourceDefinitionFactoryService
} from '@motifmarkets/motif-core';
import { ContentFrame } from '../../../content-frame';
import { GridSourceFrame } from '../../../internal-api';

export class GridLayoutEditorAllowedFieldsFrame extends ContentFrame {
    private _gridSourceFrame: GridSourceFrame;

    constructor(
        private _componentAccess: GridLayoutEditorAllowedFieldsFrame.ComponentAccess,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _allowedFields: GridField[],
    ) {
        super();
    }

    initialise(gridSourceFrame: GridSourceFrame) {
        this._gridSourceFrame = gridSourceFrame;

        const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createGridField(this._allowedFields);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        const gridSourceOrNamedReferenceDefinition = new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
        gridSourceFrame.tryOpenGridSource(gridSourceOrNamedReferenceDefinition, false);
    }
}

export namespace GridLayoutEditorAllowedFieldsFrame {
    export interface ComponentAccess {
    }
}
