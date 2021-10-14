/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ConfigNgService } from 'src/root/ng/config-ng.service';
import { SessionNgService } from '../../ng/session-ng.service';

@Component({
    selector: 'app-auth-callback',
    templateUrl: './auth-callback-ng.component.html',
    styleUrls: ['./auth-callback-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthCallbackNgComponent implements OnInit {
    // @HostBinding('class.app-loading') readonly isAppLoading: true;
    // @HostBinding('style.background-image') topSplashImageUrl: string;

    // public readonly topSplashImageExists: boolean;
    // public readonly topSplashImageUrl: string;

    constructor(
        configNgService: ConfigNgService,
        private _sessionNgService: SessionNgService
    ) {
        const config = configNgService.config;
        const topSplashImageUrl = config.branding.startupTopSplashImageUrl;
        if (topSplashImageUrl === undefined) {
            // this.topSplashImageExists = false;
            // this.topSplashImageUrl = '';
        } else {
            // this.topSplashImageExists = true;
            // this.topSplashImageUrl = topSplashImageUrl;
            // this.topSplashImageUrl = `url("${topSplashImageUrl}")`;
        }
    }

    ngOnInit() {
        this._sessionNgService.completeAuthentication();
    }
}
