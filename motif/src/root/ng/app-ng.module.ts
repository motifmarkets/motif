/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

// import { OverlayModule } from '@angular/cdk/overlay';
// import { PortalModule } from '@angular/cdk/portal';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ControlsNgModule } from 'controls-ng-api';
import { DesktopNgModule } from 'desktop-ng-api';
import { ExtensionsNgModule } from 'src/extensions/ng-api';
import { OverlayNgModule } from 'src/overlay/ng-api';
import { WorkspaceNgModule } from 'src/workspace/ng-api';
import { AuthCallbackNgComponent } from '../auth-callback/ng-api';
import { ModalNgComponent } from '../modal/ng-api';
import { NotCurrentVersionNgComponent } from '../not-current-version/ng-api';
import { RootNgComponent } from '../root/ng-api';
import { SignedOutNgComponent } from '../signed-out/ng-api';
import { StartupNgComponent } from '../startup/ng-api';
import { StaticInitialise } from '../static-initialise';
import { UserAlertNgComponent } from '../user-alert/ng-api';
import { AppRoutingModule } from './app-routing.module';
import { AuthGuardNgService } from './auth-guard-ng.service';
import { ConfigNgService } from './config-ng.service';
import { CurrentVersionGuardNgService } from './current-version-guard-ng.service';
import { ErrorHandlerNgService } from './error-handler-ng.service';

@NgModule({
    declarations: [
        RootNgComponent,
        StartupNgComponent,
        ModalNgComponent,
        AuthCallbackNgComponent,
        SignedOutNgComponent,
        UserAlertNgComponent,
        NotCurrentVersionNgComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        OverlayNgModule,
        DesktopNgModule,
        ControlsNgModule,
        WorkspaceNgModule,
        ExtensionsNgModule,
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: ConfigNgService.getLoadFtn,
            deps: [
                ConfigNgService,
            ],
            multi: true
        },
        AuthGuardNgService,
        CurrentVersionGuardNgService,
        { provide: ErrorHandler, useClass: ErrorHandlerNgService },
    ],
    bootstrap: [RootNgComponent]
})

export class AppNgModule {

    constructor() {
        StaticInitialise.initialise();
    }
}
