/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { TextFormatterService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class TextFormatterNgService {
    private _service: TextFormatterService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.textFormatterService;
    }

    get service() { return this._service; }
}
