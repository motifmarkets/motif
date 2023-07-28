/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AppStorageService,
    EditableGridLayoutDefinitionColumnList,
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
import { GridLayoutEditorAllowedFieldsFrame, GridLayoutEditorColumnsFrame } from './grid-layout-dialog/internal-api';
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

    createFeedsFrame() {
        return new FeedsFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
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

    createWatchlistFrame() {
        return new WatchlistFrame(
            this._settingsService,
            this._namedJsonRankedLitIvemIdListsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
        );
    }

    createBrokerageAccountsFrame() {
        return new BrokerageAccountsFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
        );
    }

    createOrdersFrame() {
        return new OrdersFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
        );
    }

    createOrderAuthoriseFrame() {
        return new OrderAuthoriseFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
        );
    }

    createHoldingsFrame() {
        return new HoldingsFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
        );
    }

    createBalancesFrame() {
        return new BalancesFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
        );
    }

    createSearchSymbolsFrame() {
        return new SearchSymbolsFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
        );
    }

    createScanListFrame() {
        return new ScanListFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
        );
    }

    createGridLayoutEditorAllowedFieldsFrame(allowedFields: GridField[]) {
        return new GridLayoutEditorAllowedFieldsFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            allowedFields,
        );
    }

    createGridLayoutEditorColumnsFrame(columnList: EditableGridLayoutDefinitionColumnList) {
        return new GridLayoutEditorColumnsFrame(
            this._settingsService,
            this._textFormatterService,
            this._namedGridLayoutDefinitionsService,
            this._tableRecordSourceDefinitionFactoryService,
            this._tableRecordSourceFactoryService,
            this._namedGridSourcesService,
            columnList,
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
