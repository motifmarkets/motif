/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ColorControlsComponentModule } from './color-controls/ng-api';
import { ResultOrderRequestStepFrameModule } from './order-request-step/internal-api';
import {
    ConditionSetScanFormulaViewNgComponentModule,
    FieldSetScanFormulaViewNgComponentModule,
    FormulaScanPropertiesSectionNgComponentModule,
    ScanTargetsNgComponentModule,
} from './scan/ng-api';

export namespace StaticInitialise {
    export function initialise() {
        ColorControlsComponentModule.initialiseStatic();
        ResultOrderRequestStepFrameModule.initialiseStatic();
        FormulaScanPropertiesSectionNgComponentModule.initialiseStatic();
        ScanTargetsNgComponentModule.initialiseStatic();
        ConditionSetScanFormulaViewNgComponentModule.initialiseStatic();
        FieldSetScanFormulaViewNgComponentModule.initialiseStatic();
    }
}
