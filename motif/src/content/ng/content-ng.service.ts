/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { SessionInfoService } from '@motifmarkets/motif-core';
import { AdiNgService, AppStorageNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ContentService } from '../content-service';
import { DepthSideFrame } from '../depth-side/depth-side-frame';
import { DepthFrame } from '../depth/depth-frame';
import { FeedsFrame } from '../feeds/feeds-frame';
import { MarketsFrame } from '../markets/markets-frame';
import { PadOrderRequestStepFrame } from '../order-request-step/pad-order-request-step/pad-order-request-step-frame';
import { ResultOrderRequestStepFrame } from '../order-request-step/result-order-request-step/result-order-request-step-frame';
import { ReviewOrderRequestStepFrame } from '../order-request-step/review-order-request-step/review-order-request-step-frame';
import { StatusSummaryFrame } from '../status-summary/status-summary-frame';
import { TableFrame } from '../table/table-frame';
import { TradesFrame } from '../trades/trades-frame';
import { ZenithStatusFrame } from '../zenith-status/zenith-status-frame';

@Injectable({
    providedIn: 'root'
})
export class ContentNgService {
    private _content: ContentService;

    constructor(settingsNgService: SettingsNgService,
        symbolsManagerNgService: SymbolsNgService,
        appStorageNgService: AppStorageNgService,
        adiNgService: AdiNgService
    ) {
        this._content = new ContentService(settingsNgService.settingsService,
            symbolsManagerNgService.symbolsManager,
            appStorageNgService.appStorage,
            adiNgService.adiService);
    }

    createZenithStatusFrame(componentAccess: ZenithStatusFrame.ComponentAccess, zenithEndpoints: readonly string[]) {
        return this._content.createZenithStatusFrame(componentAccess, zenithEndpoints);
    }

    createFeedsFrame(componentAccess: FeedsFrame.ComponentAccess) {
        return this._content.createFeedsFrame(componentAccess);
    }

    createMarketsFrame(componentAccess: MarketsFrame.ComponentAccess) {
        return this._content.createMarketsFrame(componentAccess);
    }

    createTableFrame(componentAccess: TableFrame.ComponentAccess) {
        return this._content.createTableFrame(componentAccess);
    }

    createStatusSummaryFrame(componentAccess: StatusSummaryFrame.ComponentAccess, sessionInfoService: SessionInfoService) {
        return this._content.createStatusSummaryFrame(componentAccess, sessionInfoService);
    }

    createDepthSideFrame(componentAccess: DepthSideFrame.ComponentAccess) {
        return this._content.createDepthSideFrame(componentAccess);
    }

    createDepthFrame(componentAccess: DepthFrame.ComponentAccess) {
        return this._content.createDepthFrame(componentAccess);
    }

    createTradesFrame(componentAccess: TradesFrame.ComponentAccess) {
        return this._content.createTradesFrame(componentAccess);
    }

    createPadOrderRequestStepFrame(componentAccess: PadOrderRequestStepFrame.ComponentAccess) {
        return this._content.createPadOrderRequestStepFrame(componentAccess);
    }

    createResultOrderRequestStepFrame(componentAccess: ResultOrderRequestStepFrame.ComponentAccess) {
        return this._content.createResultOrderRequestStepFrame(componentAccess);
    }

    createReviewOrderRequestStepFrame(componentAccess: ReviewOrderRequestStepFrame.ComponentAccess) {
        return this._content.createReviewOrderRequestStepFrame(componentAccess);
    }
}
