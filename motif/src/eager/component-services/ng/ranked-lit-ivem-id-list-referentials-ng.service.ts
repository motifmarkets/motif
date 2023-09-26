/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { RankedLitIvemIdListReferentialsService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root',
})
export class RankedLitIvemIdListReferentialsNgService {
    private _service: RankedLitIvemIdListReferentialsService;

    constructor(coreNgService: CoreNgService) {
        this._service = coreNgService.rankedLitIvemIdListReferentialsService;
    }

    get service() { return this._service; }
}
