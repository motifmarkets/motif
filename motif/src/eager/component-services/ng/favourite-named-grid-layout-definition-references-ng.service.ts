/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { FavouriteNamedGridLayoutDefinitionReferencesService } from '@motifmarkets/motif-core';

@Injectable({
    providedIn: 'root',
})
export class FavouriteNamedGridLayoutDefinitionReferencesNgService {
    private _service: FavouriteNamedGridLayoutDefinitionReferencesService;

    constructor() {
        this._service = new FavouriteNamedGridLayoutDefinitionReferencesService();
    }

    get service() { return this._service; }
}
