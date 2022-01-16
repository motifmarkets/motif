/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { SessionNgService } from './session-ng.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuardNgService implements CanActivate {

    constructor(private _sessionNgService: SessionNgService) { }

    canActivate(): boolean {
        if (this._sessionNgService.isLoggedIn()) {
            return true;
        } else {
            this._sessionNgService.startAuthentication();
            return false;
        }
    }
}
