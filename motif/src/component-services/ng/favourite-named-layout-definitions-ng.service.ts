/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { FavouriteNamedLayoutDefinitionsService } from '../favourite-named-layout-definitions-service';

@Injectable({
    providedIn: 'root',
})
export class FavouriteNamedLayoutDefinitionsNgService {
    private _service: FavouriteNamedLayoutDefinitionsService;

    constructor() {
        this._service = new FavouriteNamedLayoutDefinitionsService();
    }

    get service() { return this._service; }
}
