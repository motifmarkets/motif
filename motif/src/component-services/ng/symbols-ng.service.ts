/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { LitIvemId } from 'adi-internal-api';
import { SymbolsService } from 'core-internal-api';
import { CoreNgService } from './core-ng.service';

@Injectable({
  providedIn: 'root'
})
export class SymbolsNgService {
    private _symbolsManager: SymbolsService;

    constructor(coreNgService: CoreNgService) {
        this._symbolsManager = coreNgService.symbolsManager;
    }

    get symbolsManager() { return this._symbolsManager; }

    litIvemIdToDisplay(litIvemId: LitIvemId): string {
        return this._symbolsManager.litIvemIdToDisplay(litIvemId);
    }

    parseLitIvemId(value: string): SymbolsService.LitIvemIdParseDetails {
        return this._symbolsManager.parseLitIvemId(value);
    }
}
