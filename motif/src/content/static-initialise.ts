/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ColorControlsComponentModule } from './color-controls/ng-api';
import { ExtensionIdModule } from './extensions/internal-api';
import { ResultOrderRequestStepFrameModule } from './order-request-step/internal-api';
import { ScanCriteriaNgComponentModule } from './scans/scan-criteria/ng-api';
import { ScanTargetsNgComponentModule } from './scans/scan-targets/ng-api';

export namespace StaticInitialise {
    export function initialise() {
        ColorControlsComponentModule.initialiseStatic();
        ResultOrderRequestStepFrameModule.initialiseStatic();
        ExtensionIdModule.initialiseStatic();
        ScanCriteriaNgComponentModule.initialiseStatic();
        ScanTargetsNgComponentModule.initialiseStatic();
    }
}
