/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ColorControlsComponentModule } from './color-controls/ng-api';
import { ExtensionIdModule } from './extensions/internal-api';
import { ResultOrderRequestStepFrameModule } from './order-request-step/internal-api';
import { CriteriaScanPropertiesSectionNgComponentModule, ScanTargetsNgComponentModule } from './scan/ng-api';

export namespace StaticInitialise {
    export function initialise() {
        ColorControlsComponentModule.initialiseStatic();
        ResultOrderRequestStepFrameModule.initialiseStatic();
        ExtensionIdModule.initialiseStatic();
        CriteriaScanPropertiesSectionNgComponentModule.initialiseStatic();
        ScanTargetsNgComponentModule.initialiseStatic();
    }
}
