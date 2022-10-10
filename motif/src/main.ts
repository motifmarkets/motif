/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment';
import { AppNgModule } from './root/ng/app-ng.module';

if (environment.prodMode) {
    enableProdMode();
}

// CoreStaticInitialise.initialise();

platformBrowserDynamic().bootstrapModule(AppNgModule)
    .catch((err) => console.log(err));
