/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LogServiceModule } from './log-service';

export namespace StaticInitialise {
    export function initialise() {
        LogServiceModule.initialiseStatic();
    }
}
