/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from 'src/adi/internal-api';
import { SecurityPriceStepper } from './security-price-stepper';
import { SymbolDetailCache } from './symbol-detail-cache';

export class PriceStepperIncubator {
    constructor(private _adi: AdiService) {

    }

    // may need information from server.  If so, return a promise
    incubate(detail: SymbolDetailCache.LitIvemIdDetail): SecurityPriceStepper | Promise<SecurityPriceStepper | undefined> {
        return new SecurityPriceStepper(detail);
    }

    initialise() {

    }

    finalise() {
        // cancel subscription if used in future
    }
}

export namespace PriceStepperIncubator {
    export function isStepper(stepperOrPromise:
        SecurityPriceStepper | Promise<SecurityPriceStepper | undefined>
    ): stepperOrPromise is SecurityPriceStepper {
        return stepperOrPromise instanceof SecurityPriceStepper;
    }
}
