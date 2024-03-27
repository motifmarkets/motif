/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { RevFavouriteReferenceableGridLayoutDefinitionsStoreService } from '@motifmarkets/motif-core';

@Injectable({
    providedIn: 'root',
})
export class FavouriteReferenceableGridLayoutDefinitionsStoreNgService {
    private _service: RevFavouriteReferenceableGridLayoutDefinitionsStoreService;

    constructor() {
        this._service = new RevFavouriteReferenceableGridLayoutDefinitionsStoreService();
    }

    get service() { return this._service; }
}
