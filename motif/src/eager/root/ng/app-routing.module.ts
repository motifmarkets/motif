/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DesktopNgComponent } from 'desktop-ng-api';
import { AuthCallbackNgComponent } from '../auth-callback/ng/auth-callback-ng.component';
import { NotCurrentVersionNgComponent } from '../not-current-version/ng-api';
import { StartupNgComponent } from '../startup/ng-api';
import { AuthGuardNgService } from './auth-guard-ng.service';
import { CurrentVersionGuardNgService } from './current-version-guard-ng.service';

const routes: Routes = [
    {
        path: '',
        children: [],
        canActivate: [CurrentVersionGuardNgService, AuthGuardNgService]
    },
    {
        path: 'not-current-version',
        component: NotCurrentVersionNgComponent
    },
    {
        path: 'auth-callback',
        component: AuthCallbackNgComponent
    },
    {
        path: 'startup',
        component: StartupNgComponent,
        canActivate: [CurrentVersionGuardNgService, AuthGuardNgService]
    },
    {
        path: 'desktop',
        component: DesktopNgComponent,
        canActivate: [CurrentVersionGuardNgService, AuthGuardNgService]
    },
    // {
    //     path: 'signed-out',
    //     component: SignedOutComponent,
    //     canActivate: [AuthGuardService]
    // },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {})
    ],
    exports: [
        RouterModule
    ],
    declarations: []
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppRoutingModule { }
