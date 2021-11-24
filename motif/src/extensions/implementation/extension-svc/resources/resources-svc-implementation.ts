/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtStrings } from 'res-internal-api';
import { ExtensionHandle } from 'sys-internal-api';
import { ResourcesSvc } from '../../../api/extension-api';

export class ResourcesSvcImplementation implements ResourcesSvc {

    constructor(private readonly _extensionHandle: ExtensionHandle) {
    }

    setI18nStrings(value: string[]) {
        ExtStrings.setExtensionStrings(this._extensionHandle, value);
    }

    clearI18nStrings(value: string[]) {
        ExtStrings.clearExtensionStrings(this._extensionHandle);
    }
}
