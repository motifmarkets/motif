/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import Decimal from 'decimal.js-light';
import { SymbolDetailCache } from './symbol-detail-cache';

export class SecurityPriceStepper {
    // needs more work
    constructor(private _detail: SymbolDetailCache.LitIvemIdDetail) { }

    isOnStep(price: Decimal) {
        return true;
    }
}
