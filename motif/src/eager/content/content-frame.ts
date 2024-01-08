/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Frame } from 'component-internal-api';
export class ContentFrame extends Frame {
    private _finalised = false;

    protected get finalised() { return this._finalised; }

    finalise() {
        this._finalised = true;
    }
}
