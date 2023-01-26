/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { LockOpenListItem, ScansService, SessionInfoService } from '@motifmarkets/motif-core';
import {
    AdiNgService,
    AppStorageNgService,
    NamedGridLayoutsNgService,
    NamedGridSourcesNgService,
    NamedJsonRankedLitIvemIdListsNgService,
    SettingsNgService,
    SymbolsNgService,
    TableRecordSourceDefinitionFactoryNgService,
    TableRecordSourceFactoryNgService,
    TextFormatterNgService
} from 'component-services-ng-api';
import { ContentService } from '../content-service';
import { DepthSideFrame } from '../depth-side/internal-api';
import { DepthFrame } from '../depth/internal-api';
import { FeedsFrame } from '../feeds/internal-api';
import { GridSourceFrame } from '../grid-source/internal-api';
import { MarketsFrame } from '../markets/internal-api';
import { PadOrderRequestStepFrame, ResultOrderRequestStepFrame, ReviewOrderRequestStepFrame } from '../order-request-step/internal-api';
import { ScansFrame } from '../scan/internal-api';
import { StatusSummaryFrame } from '../status-summary/status-summary-frame';
import { TradesFrame } from '../trades/internal-api';
import { WatchlistFrame } from '../watchlist/internal-api';
import { ZenithStatusFrame } from '../zenith-status/internal-api';

@Injectable({
    providedIn: 'root'
})
export class ContentNgService {
    private _content: ContentService;

    constructor(
        settingsNgService: SettingsNgService,
        symbolsNgService: SymbolsNgService,
        appStorageNgService: AppStorageNgService,
        adiNgService: AdiNgService,
        textFormatterNgService: TextFormatterNgService,
        namedJsonRankedLitIvemIdListsNgService: NamedJsonRankedLitIvemIdListsNgService,
        tableRecordSourceFactoryNgService: TableRecordSourceFactoryNgService,
        tableRecordSourceDefinitionFactoryNgService: TableRecordSourceDefinitionFactoryNgService,
        namedGridLayoutDefinitionsNgService: NamedGridLayoutsNgService,
        namedGridSourcesNgService: NamedGridSourcesNgService,
    ) {
        this._content = new ContentService(
            settingsNgService.settingsService,
            symbolsNgService.service,
            appStorageNgService.service,
            adiNgService.service,
            textFormatterNgService.service,
            namedJsonRankedLitIvemIdListsNgService.service,
            namedGridLayoutDefinitionsNgService.service,
            tableRecordSourceDefinitionFactoryNgService.service,
            tableRecordSourceFactoryNgService.service,
            namedGridSourcesNgService.service,
        );
    }

    createZenithStatusFrame(componentAccess: ZenithStatusFrame.ComponentAccess, zenithEndpoints: readonly string[]) {
        return this._content.createZenithStatusFrame(componentAccess, zenithEndpoints);
    }

    createFeedsFrame(componentAccess: FeedsFrame.ComponentAccess, opener: LockOpenListItem.Opener) {
        return this._content.createFeedsFrame(componentAccess, opener);
    }

    createMarketsFrame(componentAccess: MarketsFrame.ComponentAccess) {
        return this._content.createMarketsFrame(componentAccess);
    }

    createGridSourceFrame(componentAccess: GridSourceFrame.ComponentAccess) {
        return this._content.createGridSourceFrame(componentAccess);
    }

    createWatchlistFrame(componentAccess: WatchlistFrame.ComponentAccess) {
        return this._content.createWatchlistFrame(componentAccess);
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

    createScansFrame(componentAccess: ScansFrame.ComponentAccess, scansService: ScansService) {
        return this._content.createScansFrame(componentAccess, scansService);
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
