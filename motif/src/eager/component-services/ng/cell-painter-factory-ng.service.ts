/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { CellPainterFactoryService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class CellPainterFactoryNgService {
    private _service: CellPainterFactoryService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.cellPainterFactoryService;
    }

    get service() { return this._service; }
}
