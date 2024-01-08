/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { EagerRootNgModule } from 'root-ng-api';
import { environment } from './environments/environment';

if (environment.prodMode) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(EagerRootNgModule)
    .catch((err) => console.log(err));
