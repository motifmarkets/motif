/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtensionRegistrar } from '../api/extension-api';

export class ExtensionRegistrarImplementation implements ExtensionRegistrar {
    private _requests: ExtensionRegistrar.Request[] = [];

    extractRequests() {
        const count = this._requests.length;
        const result = new Array<ExtensionRegistrar.Request>(count);
        for (let i = 0; i < count; i++) {
            result[i] = this._requests[i];
        }
        this._requests.length = 0;
        return result;
    }

    register(request: ExtensionRegistrar.Request) {
        this._requests.push(request);
    }
}
