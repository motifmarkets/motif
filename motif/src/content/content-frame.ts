/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Frame } from 'src/component/internal-api';
export class ContentFrame extends Frame {
    protected _layoutConfigLoading = false;

    private _finalised = false;

    protected get finalised() { return this._finalised; }

    get layoutConfigLoading() { return this._layoutConfigLoading; }

    finalise() {
        this._finalised = true;
    }
}
