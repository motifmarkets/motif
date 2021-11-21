/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ComponentBaseNgDirective } from 'src/component/ng-api';
import { SessionNgService } from '../../ng/session-ng.service';

@Component({
    selector: 'app-auth-callback',
    templateUrl: './auth-callback-ng.component.html',
    styleUrls: ['./auth-callback-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthCallbackNgComponent extends ComponentBaseNgDirective implements OnInit {
    constructor(private _sessionNgService: SessionNgService) {
        super();
    }

    ngOnInit() {
        this._sessionNgService.completeAuthentication();
    }
}
