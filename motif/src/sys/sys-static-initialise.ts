/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BadnessModule } from './badness';
import { CorrectnessModule } from './correctness';
import { LoggerModule } from './logger';
import { SourceTzOffsetTimeRenderValueModule } from './source-tz-offset-date-time';
import { UserAlertServiceModule } from './user-alert-service';
import { WebsocketCloseCodeModule } from './websocket-close-code';

export namespace SysStaticInitialise {
    export function initialise() {
        UserAlertServiceModule.initialiseStatic();
        CorrectnessModule.initialiseStatic();
        BadnessModule.initialiseStatic();
        SourceTzOffsetTimeRenderValueModule.initaliseStatic();
        WebsocketCloseCodeModule.initialiseStatic();
        LoggerModule.initialiseStatic();
    }
}
