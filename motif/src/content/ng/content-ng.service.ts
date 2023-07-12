/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { SessionInfoService } from '@motifmarkets/motif-core';
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
import { DepthFrame } from '../depth/internal-api';
import { GridSourceFrame } from '../grid-source/internal-api';
import { MarketsFrame } from '../markets/internal-api';
import { PadOrderRequestStepFrame, ResultOrderRequestStepFrame, ReviewOrderRequestStepFrame } from '../order-request-step/internal-api';
import { StatusSummaryFrame } from '../status-summary/status-summary-frame';
import { TradesFrame } from '../trades/internal-api';
import { ZenithStatusFrame } from '../zenith-status/internal-api';

@Injectable({
    providedIn: 'root'
})
export class ContentNgService {
    private _content: ContentService;

    constructor(
        settingsNgService: SettingsNgService,
        appStorageNgService: AppStorageNgService,
        adiNgService: AdiNgService,
        symbolsNgService: SymbolsNgService,
        textFormatterNgService: TextFormatterNgService,
        namedJsonRankedLitIvemIdListsNgService: NamedJsonRankedLitIvemIdListsNgService,
        tableRecordSourceFactoryNgService: TableRecordSourceFactoryNgService,
        tableRecordSourceDefinitionFactoryNgService: TableRecordSourceDefinitionFactoryNgService,
        namedGridLayoutDefinitionsNgService: NamedGridLayoutsNgService,
        namedGridSourcesNgService: NamedGridSourcesNgService,
    ) {
        this._content = new ContentService(
            settingsNgService.service,
            appStorageNgService.service,
            adiNgService.service,
            symbolsNgService.service,
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

    createFeedsFrame(componentAccess: GridSourceFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createFeedsFrame(componentAccess, hostElement);
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

    createWatchlistFrame(componentAccess: GridSourceFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createWatchlistFrame(componentAccess, hostElement);
    }

    createBrokerageAccountsFrame(componentAccess: GridSourceFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createBrokerageAccountsFrame(componentAccess, hostElement);
    }

    createOrdersFrame(componentAccess: GridSourceFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createOrdersFrame(componentAccess, hostElement);
    }

    createOrderAuthoriseFrame(componentAccess: GridSourceFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createOrderAuthoriseFrame(componentAccess, hostElement);
    }

    createHoldingsFrame(componentAccess: GridSourceFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createHoldingsFrame(componentAccess, hostElement);
    }

    createBalancesFrame(componentAccess: GridSourceFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createBalancesFrame(componentAccess, hostElement);
    }

    createStatusSummaryFrame(sessionInfoService: SessionInfoService, componentAccess: StatusSummaryFrame.ComponentAccess) {
        return this._content.createStatusSummaryFrame(sessionInfoService, componentAccess);
    }

    createSearchSymbolsFrame(componentAccess: GridSourceFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createSearchSymbolsFrame(componentAccess, hostElement);
    }

    createDepthSideFrame(hostElement: HTMLElement) {
        return this._content.createDepthSideFrame(hostElement);
    }

    createDepthFrame(componentAccess: DepthFrame.ComponentAccess) {
        return this._content.createDepthFrame(componentAccess);
    }

    createScanListFrame(componentAccess: GridSourceFrame.ComponentAccess, hostElement: HTMLElement) {
        return this._content.createScanListFrame(componentAccess, hostElement);
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
