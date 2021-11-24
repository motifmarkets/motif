/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Frame } from 'component-internal-api';
export class ContentFrame extends Frame {
    protected _layoutConfigLoading = false;

    private _finalised = false;

    get layoutConfigLoading() { return this._layoutConfigLoading; }

    protected get finalised() { return this._finalised; }

    finalise() {
        this._finalised = true;
    }
}
