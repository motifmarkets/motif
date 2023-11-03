/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { FavouriteReferenceableGridLayoutDefinitionsStoreService } from '@motifmarkets/motif-core';

@Injectable({
    providedIn: 'root',
})
export class FavouriteReferenceableGridLayoutDefinitionsStoreNgService {
    private _service: FavouriteReferenceableGridLayoutDefinitionsStoreService;

    constructor() {
        this._service = new FavouriteReferenceableGridLayoutDefinitionsStoreService();
    }

    get service() { return this._service; }
}
