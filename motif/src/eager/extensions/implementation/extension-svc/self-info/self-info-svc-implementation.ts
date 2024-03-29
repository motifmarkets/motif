/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtensionInfo } from '@motifmarkets/motif-core';
import { SelfInfoSvc } from '../../../api/extension-api';
import { PublisherTypeImplementation } from '../../exposed/internal-api';
import { SvcImplementation } from '../svc-implementation';

export class SelfInfoSvcImplementation extends SvcImplementation implements SelfInfoSvc {

    constructor(private readonly _extensionInfo: ExtensionInfo) {
        super();
    }

    get publisherType() { return PublisherTypeImplementation.toApi(this._extensionInfo.publisherId.typeId); }
    get publisherName() { return this._extensionInfo.publisherId.name; }
    get name() { return this._extensionInfo.name; }
    get version() { return this._extensionInfo.version; }
    get shortDescription() { return this._extensionInfo.shortDescription; }
    get longDescription() { return this._extensionInfo.longDescription; }

    destroy() {

    }
}
