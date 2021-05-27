/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { LitIvemId } from 'src/adi/internal-api';
import { SymbolsService } from 'src/core/internal-api';
import { CoreNgService } from './core-ng.service';

@Injectable({
  providedIn: 'root'
})
export class SymbolsNgService {
    private _symbolsManager: SymbolsService;

    get symbolsManager() { return this._symbolsManager; }

    constructor(coreNgService: CoreNgService) {
        this._symbolsManager = coreNgService.symbolsManager;
    }

    litIvemIdToDisplay(litIvemId: LitIvemId): string {
        return this._symbolsManager.litIvemIdToDisplay(litIvemId);
    }

    parseLitIvemId(value: string): SymbolsService.LitIvemIdParseDetails {
        return this._symbolsManager.parseLitIvemId(value);
    }
}
