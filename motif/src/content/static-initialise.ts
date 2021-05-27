/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ColorSelectorComponentModule } from './color-selector/ng-api';
import { ExtensionIdModule } from './extensions/internal-api';
import { ResultOrderRequestStepFrameModule } from './order-request-step/internal-api';

export namespace StaticInitialise {
    export function initialise() {
        ColorSelectorComponentModule.initialiseStatic();
        ResultOrderRequestStepFrameModule.initialiseStatic();
        ExtensionIdModule.initialiseStatic();
    }
}
