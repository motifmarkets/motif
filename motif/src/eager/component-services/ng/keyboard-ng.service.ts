/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { KeyboardService } from '@motifmarkets/motif-core';
import { CoreNgService } from './core-ng.service';

@Injectable({
    providedIn: 'root'
})
export class KeyboardNgService {
    readonly service: KeyboardService;

    constructor(coreNgService: CoreNgService) {
        this.service = coreNgService.keyboardService;
    }
}
