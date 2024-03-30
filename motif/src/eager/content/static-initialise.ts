/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ColorControlsComponentModule } from './color-controls/ng-api';
import { LockOpenNotificationChannelTableFieldSourceDefinitionModule } from './lock-open-notification-channels/internal-api';
import { ResultOrderRequestStepFrameModule } from './order-request-step/internal-api';
import {
    LockerScanAttachedNotificationChannelTableFieldSourceDefinitionModule,
    ScanFieldEditorFrameTableFieldSourceDefinitionModule,
} from './scan/internal-api';
import {
    ConditionSetScanFormulaViewNgComponentModule,
    FormulaScanPropertiesSectionNgComponentModule,
    ScanTargetsNgComponentModule
} from './scan/ng-api';

export namespace StaticInitialise {
    export function initialise() {
        ColorControlsComponentModule.initialiseStatic();
        ResultOrderRequestStepFrameModule.initialiseStatic();
        FormulaScanPropertiesSectionNgComponentModule.initialiseStatic();
        ScanTargetsNgComponentModule.initialiseStatic();
        ConditionSetScanFormulaViewNgComponentModule.initialiseStatic();
        ScanFieldEditorFrameTableFieldSourceDefinitionModule.initialiseStatic();
        LockerScanAttachedNotificationChannelTableFieldSourceDefinitionModule.initialiseStatic();
        LockOpenNotificationChannelTableFieldSourceDefinitionModule.initialiseStatic();
    }
}
