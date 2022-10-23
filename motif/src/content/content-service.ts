/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AppStorageService,
    ScansService,
    SessionInfoService,
    SettingsService,
    SymbolsService,
    TableRecordDefinitionListsService,
    TablesService
} from '@motifmarkets/motif-core';
import { ContentFrame } from './content-frame';
import { DepthSideFrame } from './depth-side/internal-api';
import { DepthFrame } from './depth/internal-api';
import { FeedsFrame } from './feeds/internal-api';
import { MarketsFrame } from './markets/internal-api';
import { PadOrderRequestStepFrame, ResultOrderRequestStepFrame, ReviewOrderRequestStepFrame } from './order-request-step/internal-api';
import { ScansFrame } from './scan/internal-api';
import { StatusSummaryFrame } from './status-summary/internal-api';
import { TableFrame } from './table/internal-api';
import { TradesFrame } from './trades/internal-api';
import { ZenithStatusFrame } from './zenith-status/internal-api';

export class ContentService {
    constructor(
        private _settingsService: SettingsService,
        private readonly _symbolsService: SymbolsService,
        private readonly _appStorageService: AppStorageService,
        private readonly _adiService: AdiService,
        private readonly _tableRecordDefinitionListsService: TableRecordDefinitionListsService,
        private readonly _tablesService: TablesService,
    ) { }

    createZenithStatusFrame(componentAccess: ZenithStatusFrame.ComponentAccess, zenithEndpoints: readonly string[]) {
        return new ZenithStatusFrame(componentAccess, this._adiService, zenithEndpoints);
    }

    createFeedsFrame(componentAccess: FeedsFrame.ComponentAccess) {
        return new FeedsFrame(componentAccess, this._tablesService);
    }

    createMarketsFrame(componentAccess: MarketsFrame.ComponentAccess) {
        return new MarketsFrame(componentAccess, this._settingsService.core, this._adiService);
    }

    createTableFrame(componentAccess: TableFrame.ComponentAccess) {
        return new TableFrame(componentAccess, this._settingsService, this._tableRecordDefinitionListsService, this._tablesService);
    }

    createStatusSummaryFrame(componentAccess: StatusSummaryFrame.ComponentAccess, sessionInfoService: SessionInfoService) {
        return new StatusSummaryFrame(componentAccess, this._adiService, sessionInfoService);
    }

    createDepthSideFrame(componentAccess: DepthSideFrame.ComponentAccess) {
        return new DepthSideFrame(componentAccess);
    }

    createDepthFrame(componentAccess: DepthFrame.ComponentAccess) {
        return new DepthFrame(componentAccess, this._adiService);
    }

    createScansFrame(componentAccess: ScansFrame.ComponentAccess, scansService: ScansService) {
        return new ScansFrame(componentAccess, scansService, this._adiService);
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
