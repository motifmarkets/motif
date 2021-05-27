/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { FrameExtensionsAccessService } from 'src/desktop/internal-api';

@Injectable({
    providedIn: 'root'
})
export class ExtensionsAccessNgService {
    private _service: FrameExtensionsAccessService;

    get service() { return this._service; }

    setService(value: FrameExtensionsAccessService) {
        this._service = value;
    }
}
