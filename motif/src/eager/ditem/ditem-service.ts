/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CoreService, SessionInfoService } from '@motifmarkets/motif-core';
import { DitemFrame } from './ditem-frame';

export class DitemService {
    constructor(private readonly _coreService: CoreService,
        private readonly _desktopAccessService: DitemFrame.DesktopAccessService,
        private readonly _sessionInfoService: SessionInfoService
    ) {

    }
}
