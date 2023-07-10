/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AppStorageService, LockOpenListItem, NamedGridLayoutsService,
    NamedGridSourcesService,
    NamedJsonRankedLitIvemIdListsService,
    ScansService,
    SessionInfoService,
    SettingsService,
    SymbolsService,
    TableRecordSourceDefinitionFactoryService,
    TableRecordSourceFactoryService,
    TextFormatterService
} from '@motifmarkets/motif-core';
import { BalancesFrame } from './balances/internal-api';
import { BrokerageAccountsFrame } from './brokerage-accounts/internal-api';
import { DepthSideFrame } from './depth-side/internal-api';
import { DepthFrame } from './depth/internal-api';
import { FeedsFrame } from './feeds/internal-api';
import { HoldingsFrame } from './holdings/internal-api';
import { MarketsFrame } from './markets/internal-api';
import { PadOrderRequestStepFrame, ResultOrderRequestStepFrame, ReviewOrderRequestStepFrame } from './order-request-step/internal-api';
import { OrdersFrame } from './orders/internal-api';
import { ScansFrame } from './scan/internal-api';
import { StatusSummaryFrame } from './status-summary/internal-api';
import { TradesFrame } from './trades/internal-api';
import { WatchlistFrame } from './watchlist/internal-api';
import { ZenithStatusFrame } from './zenith-status/internal-api';

export class ContentService {
    constructor(
        private readonly _settingsService: SettingsService,
        private readonly _appStorageService: AppStorageService,
        private readonly _adiService: AdiService,
        private readonly _symbolsService: SymbolsService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _namedJsonRankedLitIvemIdListsService: NamedJsonRankedLitIvemIdListsService,
        private readonly _namedGridLayoutDefinitionsService: NamedGridLayoutsService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        private readonly _namedGridSourcesService: NamedGridSourcesService,
) { }

    createZenithStatusFrame(componentAccess: ZenithStatusFrame.ComponentAccess, zenithEndpoints: readonly string[]) {
        return new ZenithStatusFrame(componentAccess, this._adiService, zenithEndpoints);
    }

    createFeedsFrame(componentAccess: FeedsFrame.ComponentAccess, opener: LockOpenListItem.Opener) {
        return new FeedsFrame(
            componentAccess,
            this._tableRecordSourceDefinitionFactoryService,
            opener
        );
    }

    createMarketsFrame(componentAccess: MarketsFrame.ComponentAccess) {
        return new MarketsFrame(componentAccess, this._settingsService.core, this._adiService, this._textFormatterService);
    }

    // createGridSourceFrame(
    //     componentAccess: GridSourceFrame.ComponentAccess,
    //     hostElement: HTMLElement,
    //     customGridSettings: AdaptedRevgrid.CustomGridSettings,
    //     customiseSettingsForNewColumnEventer: AdaptedRevgrid.CustomiseSettingsForNewColumnEventer,
    //     getMainCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    //     getHeaderCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
    // ) {
    //     return new GridSourceFrame(
    //         this._settingsService,
    //         this._namedGridLayoutDefinitionsService,
    //         this._tableRecordSourceFactoryService,
    //         this._namedGridSourcesService,
    //         componentAccess,
    //         hostElement,
    //         customGridSettings,
    //         customiseSettingsForNewColumnEventer,
    //         getMainCellPainterEventer,
    //         getHeaderCellPainterEventer,
    //     );
    // }

    createWatchlistFrame(componentAccess: WatchlistFrame.ComponentAccess, hostElement: HTMLElement) {
        return new WatchlistFrame(
            this._settingsService,
            this._namedJsonRankedLitIvemIdListsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
            hostElement,
        );
    }

    createBrokerageAccountsFrame(componentAccess: WatchlistFrame.ComponentAccess, hostElement: HTMLElement) {
        return new BrokerageAccountsFrame(
            this._settingsService,
            this._namedJsonRankedLitIvemIdListsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
            hostElement,
        );
    }

    createOrdersFrame(componentAccess: OrdersFrame.ComponentAccess, hostElement: HTMLElement) {
        return new OrdersFrame(
            this._settingsService,
            this._namedJsonRankedLitIvemIdListsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
            hostElement,
        );
    }

    createHoldingsFrame(componentAccess: HoldingsFrame.ComponentAccess, hostElement: HTMLElement) {
        return new HoldingsFrame(
            this._settingsService,
            this._namedJsonRankedLitIvemIdListsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
            hostElement,
        );
    }

    createBalancesFrame(componentAccess: BalancesFrame.ComponentAccess, hostElement: HTMLElement) {
        return new BalancesFrame(
            this._settingsService,
            this._namedJsonRankedLitIvemIdListsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
            hostElement,
        );
    }

    createStatusSummaryFrame(sessionInfoService: SessionInfoService, componentAccess: StatusSummaryFrame.ComponentAccess) {
        return new StatusSummaryFrame(this._adiService, sessionInfoService, componentAccess,);
    }

    createDepthSideFrame(hostElement: HTMLElement) {
        return new DepthSideFrame(this._settingsService, this._textFormatterService, hostElement);
    }

    createDepthFrame(componentAccess: DepthFrame.ComponentAccess) {
        return new DepthFrame(componentAccess, this._adiService);
    }

    createScansFrame(scansService: ScansService, componentAccess: ScansFrame.ComponentAccess) {
        return new ScansFrame(this._adiService, scansService, componentAccess);
    }

    createTradesFrame(componentAccess: TradesFrame.ComponentAccess, hostElement: HTMLElement) {
        return new TradesFrame(this._settingsService, this._adiService, this._textFormatterService, componentAccess, hostElement);
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
}
