/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AppStorageService,
    GridField,
    NamedGridLayoutsService,
    NamedGridSourcesService,
    NamedJsonRankedLitIvemIdListsService,
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
import { GridLayoutEditorAllowedFieldsFrame } from './grid-layout-dialog/internal-api';
import { GridSourceFrame } from './grid-source/internal-api';
import { HoldingsFrame } from './holdings/internal-api';
import { MarketsFrame } from './markets/internal-api';
import { OrderAuthoriseFrame } from './order-authorise/internal-api';
import { PadOrderRequestStepFrame, ResultOrderRequestStepFrame, ReviewOrderRequestStepFrame } from './order-request-step/internal-api';
import { OrdersFrame } from './orders/internal-api';
import { ScanListFrame } from './scan/internal-api';
import { SearchSymbolsFrame } from './search-symbols/internal-api';
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

    createFeedsFrame(componentAccess: GridSourceFrame.ComponentAccess) {
        return new FeedsFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
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

    createWatchlistFrame(componentAccess: GridSourceFrame.ComponentAccess) {
        return new WatchlistFrame(
            this._settingsService,
            this._namedJsonRankedLitIvemIdListsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
        );
    }

    createBrokerageAccountsFrame(componentAccess: GridSourceFrame.ComponentAccess) {
        return new BrokerageAccountsFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
        );
    }

    createOrdersFrame(componentAccess: GridSourceFrame.ComponentAccess) {
        return new OrdersFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
        );
    }

    createOrderAuthoriseFrame(componentAccess: GridSourceFrame.ComponentAccess) {
        return new OrderAuthoriseFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
        );
    }

    createHoldingsFrame(componentAccess: GridSourceFrame.ComponentAccess) {
        return new HoldingsFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
        );
    }

    createBalancesFrame(componentAccess: GridSourceFrame.ComponentAccess) {
        return new BalancesFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
        );
    }

    createSearchSymbolsFrame(componentAccess: GridSourceFrame.ComponentAccess) {
        return new SearchSymbolsFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
        );
    }

    createScanListFrame(componentAccess: GridSourceFrame.ComponentAccess) {
        return new ScanListFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
        );
    }

    createGridLayoutEditorAllowedFieldsFrame(componentAccess: GridLayoutEditorAllowedFieldsFrame.ComponentAccess, allowedFields: GridField[]) {
        return new GridLayoutEditorAllowedFieldsFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            componentAccess,
            allowedFields
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

    createTradesFrame(componentAccess: TradesFrame.ComponentAccess) {
        return new TradesFrame(this._settingsService, this._adiService, this._textFormatterService, componentAccess);
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
