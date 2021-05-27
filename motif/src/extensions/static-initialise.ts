/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ApiErrorImplementationModule } from './implementation/internal-api';

export namespace StaticInitialise {
    export function initialise() {
        ApiErrorImplementationModule.initialiseStatic();
    }
}
