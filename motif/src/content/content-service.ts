/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from 'src/adi/internal-api';
import { AppStorageService, SettingsService, SymbolsService } from 'src/core/internal-api';
import { ContentFrame } from './content-frame';
import { DepthSideFrame } from './depth-side/internal-api';
import { DepthFrame } from './depth/internal-api';
import { FeedsFrame } from './feeds/internal-api';
import { MarketsFrame } from './markets/internal-api';
import { PadOrderRequestStepFrame, ResultOrderRequestStepFrame, ReviewOrderRequestStepFrame } from './order-request-step/internal-api';
import { StatusSummaryFrame } from './status-summary/internal-api';
import { TableFrame } from './table/internal-api';
import { TradesFrame } from './trades/internal-api';
import { ZenithStatusFrame } from './zenith-status/internal-api';

export class ContentService {
    constructor(private _settingsService: SettingsService,
        private _symbolsService: SymbolsService,
        private _appStorageService: AppStorageService,
        private _adiService: AdiService) { }

    createZenithStatusFrame(componentAccess: ZenithStatusFrame.ComponentAccess, endpoint: string) {
        return new ZenithStatusFrame(componentAccess, this._adiService, endpoint);
    }

    createFeedsFrame(componentAccess: FeedsFrame.ComponentAccess) {
        return new FeedsFrame(componentAccess);
    }

    createMarketsFrame(componentAccess: MarketsFrame.ComponentAccess) {
        return new MarketsFrame(componentAccess, this._settingsService.core, this._adiService);
    }

    createTableFrame(componentAccess: TableFrame.ComponentAccess) {
        return new TableFrame(componentAccess, this._settingsService);
    }

    createStatusSummaryFrame(componentAccess: StatusSummaryFrame.ComponentAccess, zenithEndpoint: string) {
        return new StatusSummaryFrame(componentAccess, this._adiService, zenithEndpoint);
    }

    createDepthSideFrame(componentAccess: DepthSideFrame.ComponentAccess) {
        return new DepthSideFrame(componentAccess);
    }

    createDepthFrame(componentAccess: DepthFrame.ComponentAccess) {
        return new DepthFrame(componentAccess, this._adiService);
    }

    createTradesFrame(componentAccess: TradesFrame.ComponentAccess) {
        return new TradesFrame(componentAccess, this._adiService);
    }

    createPadOrderRequestStepFrame(componentAccess: PadOrderRequestStepFrame.ComponentAccess) {
        return new PadOrderRequestStepFrame(componentAccess, this._symbolsService);
    }

    createResultOrderRequestStepFrame(componentAccess: ResultOrderRequestStepFrame.ComponentAccess) {
        return new ResultOrderRequestStepFrame(componentAccess, this._adiService);
    }

    createReviewOrderRequestStepFrame(componentAccess: ReviewOrderRequestStepFrame.ComponentAccess) {
        return new ReviewOrderRequestStepFrame(componentAccess);
    }

    finaliseContentFrame(contentFrame: ContentFrame): void {
        contentFrame.finalise();
    }
}
