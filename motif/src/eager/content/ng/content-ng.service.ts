/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Injectable } from '@angular/core';
import { AdaptedRevgridGridSettings, EditableGridLayoutDefinitionColumnList, GridField, SessionInfoService } from '@motifmarkets/motif-core';
import {
    AdiNgService,
    AppStorageNgService,
    CellPainterFactoryNgService,
    GridFieldCustomHeadingsNgService,
    ReferenceableGridLayoutsNgService,
    ReferenceableGridSourceDefinitionsStoreNgService,
    ReferenceableGridSourcesNgService,
    SessionInfoNgService,
    SettingsNgService,
    SymbolsNgService,
    TableFieldSourceDefinitionRegistryNgService,
    TableRecordSourceDefinitionFactoryNgService,
    TableRecordSourceFactoryNgService,
    TextFormatterNgService
} from 'component-services-ng-api';
import { ContentService } from '../content-service';
import { DepthFrame } from '../depth/internal-api';
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
        sessionInfoNgService: SessionInfoNgService,
        textFormatterNgService: TextFormatterNgService,
        gridFieldCustomHeadingsNgService: GridFieldCustomHeadingsNgService,
        referenceableGridLayoutsNgService: ReferenceableGridLayoutsNgService,
        tableFieldSourceDefinitionRegistryNgService: TableFieldSourceDefinitionRegistryNgService,
        tableRecordSourceFactoryNgService: TableRecordSourceFactoryNgService,
        tableRecordSourceDefinitionFactoryNgService: TableRecordSourceDefinitionFactoryNgService,
        referenceableGridSourceDefinitionsStoreNgService: ReferenceableGridSourceDefinitionsStoreNgService,
        referenceableGridSourcesNgService: ReferenceableGridSourcesNgService,
        cellPainterFactoryNgService: CellPainterFactoryNgService,
    ) {
        this._content = new ContentService(
            settingsNgService.service,
            appStorageNgService.service,
            adiNgService.service,
            symbolsNgService.service,
            sessionInfoNgService.service,
            textFormatterNgService.service,
            gridFieldCustomHeadingsNgService.service,
            referenceableGridLayoutsNgService.service,
            tableFieldSourceDefinitionRegistryNgService.service,
            tableRecordSourceDefinitionFactoryNgService.service,
            tableRecordSourceFactoryNgService.service,
            referenceableGridSourceDefinitionsStoreNgService.service,
            referenceableGridSourcesNgService.service,
            cellPainterFactoryNgService.service,
        );
    }

    createZenithStatusFrame(componentAccess: ZenithStatusFrame.ComponentAccess, zenithEndpoints: readonly string[]) {
        return this._content.createZenithStatusFrame(componentAccess, zenithEndpoints);
    }

    createFeedsFrame() {
        return this._content.createFeedsFrame();
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

    createLitIvemIdListFrame(initialCustomGridSettings: Partial<AdaptedRevgridGridSettings> | undefined) {
        return this._content.createLitIvemIdListFrame(initialCustomGridSettings);
    }

    createWatchlistFrame() {
        return this._content.createWatchlistFrame();
    }

    createScanTestMatchesFrame() {
        return this._content.createScanTestMatchesFrame();
    }

    createBrokerageAccountsFrame() {
        return this._content.createBrokerageAccountsFrame();
    }

    createOrdersFrame() {
        return this._content.createOrdersFrame();
    }

    createOrderAuthoriseFrame() {
        return this._content.createOrderAuthoriseFrame();
    }

    createHoldingsFrame() {
        return this._content.createHoldingsFrame();
    }

    createBalancesFrame() {
        return this._content.createBalancesFrame();
    }

    createStatusSummaryFrame(sessionInfoService: SessionInfoService, componentAccess: StatusSummaryFrame.ComponentAccess) {
        return this._content.createStatusSummaryFrame(sessionInfoService, componentAccess);
    }

    createSearchSymbolsFrame() {
        return this._content.createSearchSymbolsFrame();
    }

    createScanListFrame() {
        return this._content.createScanListFrame();
    }

    createScanFieldEditorFramesGridFrame() {
        return this._content.createScanFieldEditorFramesGridFrame();
    }

    createGridLayoutEditorAllowedFieldsFrame(allowedFields: readonly GridField[], columnList: EditableGridLayoutDefinitionColumnList) {
        return this._content.createGridLayoutEditorAllowedFieldsFrame(allowedFields, columnList);
    }

    createGridLayoutEditorColumnsFrame(columnList: EditableGridLayoutDefinitionColumnList) {
        return this._content.createGridLayoutEditorColumnsFrame(columnList);
    }

    createDepthSideFrame(hostElement: HTMLElement) {
        return this._content.createDepthSideFrame(hostElement);
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
