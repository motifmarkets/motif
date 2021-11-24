/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Badness } from 'sys-internal-api';
import { DataDefinition } from './common/internal-api';
import { DataItem } from './data-item';

export abstract class ExtConnectionDataItem extends DataItem {

    private _preOnlined = false;

    constructor(MyDataDefinition: DataDefinition) {
        super(MyDataDefinition);
    }

    get Connected(): boolean { return this.getConnected(); }

    protected calculateUsabilityBadness() {
        return Badness.notBad;
    }

    protected processSubscriptionPreOnline() { // virtual
        // should only get called once
        if (this._preOnlined) {
            throw new AssertInternalError('ECDIPSPO69943437281');
        } else {
            this._preOnlined = true;
        }
    }

    protected abstract getConnected(): boolean;
}
