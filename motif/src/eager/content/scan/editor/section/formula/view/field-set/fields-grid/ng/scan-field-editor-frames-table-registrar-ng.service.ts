/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { TableFieldSourceDefinitionRegistryService } from '@motifmarkets/motif-core';
import { TableFieldSourceDefinitionRegistryNgService } from 'component-services-ng-api';
import { ScanFieldEditorFrameTableFieldSourceDefinition } from '../scan-field-editor-frame-table-field-source-definition';

@Injectable()
export class ScanFieldEditorFramesRegistrarNgService {
    private _tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService;

    constructor(tableFieldSourceDefinitionRegistryNgService: TableFieldSourceDefinitionRegistryNgService) {
        this._tableFieldSourceDefinitionRegistryService = tableFieldSourceDefinitionRegistryNgService.service;
    }

    register() {
        const tableFieldSourceDefinition = new ScanFieldEditorFrameTableFieldSourceDefinition();
        this._tableFieldSourceDefinitionRegistryService.register(tableFieldSourceDefinition);
    }
}
