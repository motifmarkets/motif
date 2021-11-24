/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Version } from 'generated-internal-api';
import { ConfigNgService } from './config-ng.service';

@Injectable({
    providedIn: 'root'
})
export class CurrentVersionGuardNgService implements CanActivate {

    constructor(private _router: Router, private _configNgService: ConfigNgService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this._configNgService.version === Version.app)  {
            return true;
        } else {
            return this._router.createUrlTree(['/not-current-version']);
        }
    }
}
