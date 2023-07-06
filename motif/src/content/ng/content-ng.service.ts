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
import { BalancesFrame } from '../balances/internal-api';
import { ContentService } from '../content-service';
import { DepthFrame } from '../depth/internal-api';
import { FeedsFrame } from '../feeds/internal-api';
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
            settingsNgService.service,
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

    // createGridSourceFrame(
    //     componentAccess: GridSourceFrame.ComponentAccess,
    //     hostElement: HTMLElement,
    //     customGridSettings: AdaptedRevgrid.CustomGridSettings,
    //     customiseSettingsForNewColumnEventer: AdaptedRevgrid.CustomiseSettingsForNewColumnEventer,
    //     getMainCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    //     getHeaderCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    // ) {
    //     return this._content.createGridSourceFrame(
    //         componentAccess,
    //         hostElement,
    //         customGridSettings,
    //         customiseSettingsForNewColumnEventer,
    //         getMainCellPainterEventer,
    //         getHeaderCellPainterEventer,
    //     );
    // }

    createWatchlistFrame(componentAccess: WatchlistFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createWatchlistFrame(componentAccess, hostElement);
    }

    createBalancesFrame(componentAccess: BalancesFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createBalancesFrame(componentAccess, hostElement);
    }

    createBrokerageAccountsFrame(componentAccess: WatchlistFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createBrokerageAccountsFrame(componentAccess, hostElement);
    }

    createStatusSummaryFrame(sessionInfoService: SessionInfoService, componentAccess: StatusSummaryFrame.ComponentAccess) {
        return this._content.createStatusSummaryFrame(sessionInfoService, componentAccess);
    }

    createDepthSideFrame(hostElement: HTMLElement) {
        return this._content.createDepthSideFrame(hostElement);
    }

    createDepthFrame(componentAccess: DepthFrame.ComponentAccess) {
        return this._content.createDepthFrame(componentAccess);
    }

    createScansFrame(scansService: ScansService, componentAccess: ScansFrame.ComponentAccess) {
        return this._content.createScansFrame(scansService, componentAccess);
    }

    createTradesFrame(componentAccess: TradesFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createTradesFrame(componentAccess, hostElement);
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
