/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { CommandRegisterNgService } from 'src/component-services/ng-api';
import { MenuBarService } from '../menu-bar-service';

@Injectable({
    providedIn: 'root'
})
export class MenuBarNgService {
    private _service: MenuBarService;

    get service() { return this._service; }

    constructor(commandRegisterNgService: CommandRegisterNgService) {
        this._service = new MenuBarService(commandRegisterNgService.service);
    }
}
