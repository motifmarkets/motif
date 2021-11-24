/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { MenuBarService } from '../menu-bar-service';

@Injectable({
    providedIn: 'root'
})
export class MenuBarNgService {
    private _service: MenuBarService;

    constructor(commandRegisterNgService: CommandRegisterNgService) {
        this._service = new MenuBarService(commandRegisterNgService.service);
    }

    get service() { return this._service; }
}
