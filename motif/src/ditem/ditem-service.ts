/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CoreService, SessionInfoService } from '@motifmarkets/motif-core';
import { DesktopAccessService } from './desktop-access-service';

export class DitemService {
    constructor(private readonly _coreService: CoreService,
        private readonly _desktopAccessService: DesktopAccessService,
        private readonly _sessionInfoService: SessionInfoService
    ) {

    }
}
