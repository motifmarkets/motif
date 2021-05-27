/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ZenithStaticInitialise } from './zenith/internal-api';

export namespace PublishersStaticInitialise {
    export function initialise() {
        ZenithStaticInitialise.initialise();
    }
}
