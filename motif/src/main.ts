/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AdiStaticInitialise } from 'src/adi/internal-api';
import { CoreStaticInitialise } from 'src/core/internal-api';
import { ResStaticInitialise } from 'src/res/internal-api';
import { SysStaticInitialise } from 'src/sys/internal-api';
import { AppFeature } from './app.feature';
import { environment } from './environments/environment';
import { AppNgModule } from './root/ng/app-ng.module';

if (environment.prodMode) {
    enableProdMode();
    AppFeature.dev = false;
} else {
    AppFeature.dev = true;
}

ResStaticInitialise.initialise();
SysStaticInitialise.initialise();
AdiStaticInitialise.initialise();
CoreStaticInitialise.initialise();

platformBrowserDynamic().bootstrapModule(AppNgModule)
    .catch((err) => console.log(err));
