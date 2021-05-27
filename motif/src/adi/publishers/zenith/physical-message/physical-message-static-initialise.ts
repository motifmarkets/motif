/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ZenithConvertModule } from './zenith-convert';

export namespace PhysicalMessageStaticInitialise {
    export function initialise() {
        ZenithConvertModule.initialiseStatic();
    }
}
