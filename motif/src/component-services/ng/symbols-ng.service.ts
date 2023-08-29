/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { LitIvemId, SymbolsService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class SymbolsNgService {
    private _service: SymbolsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.symbolsService;
    }

    get service() { return this._service; }

    litIvemIdToDisplay(litIvemId: LitIvemId): string {
        return this._service.litIvemIdToDisplay(litIvemId);
    }

    parseLitIvemId(value: string): SymbolsService.LitIvemIdParseDetails {
        return this._service.parseLitIvemId(value);
    }
}
