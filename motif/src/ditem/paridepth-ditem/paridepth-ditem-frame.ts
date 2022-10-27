/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    CommandRegisterService,
    DepthStyleId,
    GridLayout,
    GridLayoutRecordStore,
    JsonElement,
    LitIvemId,
    LitIvemIdTableRecordDefinition,
    PortfolioTableDefinition,
    PortfolioTableRecordDefinitionList,
    SymbolsService,
    TableRecordDefinitionList,
    TableRecordDefinitionListsService,
    TextFormatterService
} from '@motifmarkets/motif-core';
import { DepthFrame, TableFrame, TradesFrame } from 'content-internal-api';
import { lowestValidModelUpdateId } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class ParidepthDitemFrame extends BuiltinDitemFrame {
    private _watchlistFrame: TableFrame;
    private _depthFrame: DepthFrame;
    private _tradesFrame: TradesFrame;

    // private _watchlistCommandProcessor: WatchlistCommandProcessor;
    // private _depthCommandProcessor: DepthCommandProcessor;
    // private _tradesCommandProcessor: TradesCommandProcessor;

    constructor(
        private _componentAccess: ParidepthDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _tableRecordDefinitionsListService: TableRecordDefinitionListsService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.DepthAndTrades, _componentAccess,
            commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._depthFrame !== undefined; }

    get filterActive() { return this._depthFrame.filterActive; }
    get filterXrefs() { return this._depthFrame.filterXrefs; }

    initialise(tableContentFrame: TableFrame, depthContentFrame: DepthFrame, tradesContentFrame: TradesFrame,
        frameElement: JsonElement | undefined
    ): void {
        this._watchlistFrame = tableContentFrame;
        this._depthFrame = depthContentFrame;
        this._tradesFrame = tradesContentFrame;

        this._watchlistFrame.requireDefaultTableDefinitionEvent = () => this.handleWatchlistRequireDefaultTableDefinitionEvent();
        this._watchlistFrame.tableOpenEvent = (recordDefinitionList) => this.handleWatchlistTableOpenEvent(recordDefinitionList);
        this._watchlistFrame.settingsApplyEvent = () => this.handleWatchlistSettingsApplyEvent();

        // this._depthFrame.activeWidthChangedEvent =
        //     (bidActiveWidth, askActiveWidth) => this.handleDepthActiveWidthChangedEvent(bidActiveWidth, askActiveWidth);

        // this._tradesFrame.activeWidthChangedEvent = () => this.handleTradesActiveWidthChangedEvent();

        // initialise() not required for watchlist or trades
        this._depthFrame.initialise();

        if (frameElement === undefined) {
            this._watchlistFrame.loadLayoutConfig(undefined);
            this._tradesFrame.loadLayoutConfig(undefined);
            this._depthFrame.loadLayoutConfig(undefined);
        } else {
            const watchlistElement = frameElement.tryGetElement(ParidepthDitemFrame.JsonName.watchlist);
            this._watchlistFrame.loadLayoutConfig(watchlistElement);
            const tradesElement = frameElement.tryGetElement(ParidepthDitemFrame.JsonName.trades);
            this._tradesFrame.loadLayoutConfig(tradesElement);
            const depthElement = frameElement.tryGetElement(ParidepthDitemFrame.JsonName.depth);
            this._depthFrame.loadLayoutConfig(depthElement);
        }

        this.applyLinked();

        this.handleWatchlistSettingsApplyEvent();
    }

    override save(element: JsonElement) {
        super.save(element);

        const watchlistElement = element.newElement(ParidepthDitemFrame.JsonName.watchlist);
        this._watchlistFrame.saveLayoutConfig(watchlistElement);
        const depthElement = element.newElement(ParidepthDitemFrame.JsonName.depth);
        this._depthFrame.saveLayoutToConfig(depthElement);
        const tradesElement = element.newElement(ParidepthDitemFrame.JsonName.trades);
        this._tradesFrame.saveLayoutConfig(tradesElement);
    }

    async open() {
        const litIvemId = this.litIvemId;
        if (litIvemId === undefined) {
            this.close();
        } else {
            // watchlist
            const definition = new LitIvemIdTableRecordDefinition(litIvemId);
            if (!this._watchlistFrame.tableOpened) {
                const tableDefinition = new PortfolioTableDefinition(
                    this.adi,
                    this._textFormatterService,
                    this._tableRecordDefinitionsListService,
                    new PortfolioTableRecordDefinitionList());
                this._watchlistFrame.newPrivateTable(tableDefinition, true);
                this._watchlistFrame.addRecordDefinition(definition);
                this._watchlistFrame.focusItem(0);
            } else {
                if (this._watchlistFrame.recordCount === 0) {
                    this._watchlistFrame.addRecordDefinition(definition);
                } else {
                    this._watchlistFrame.setRecordDefinition(0, definition);
                }
            }
            // depth
            this._depthFrame.open(litIvemId, DepthStyleId.Full);
            // trades
            this._tradesFrame.open(litIvemId, undefined);

            this._componentAccess.notifyOpenedClosed(litIvemId, undefined);

            const [bidOpePopulatedSuccess, askOpenPopulatedSuccess] = await this._depthFrame.waitOpenPopulated();
            if (bidOpePopulatedSuccess === true && askOpenPopulatedSuccess === true) {
                const [bidModelUpdateId, askModelUpdateId] = await this._depthFrame.waitRendered();
                if (bidModelUpdateId >= lowestValidModelUpdateId && askModelUpdateId >= lowestValidModelUpdateId) {
                    this.checkAutoAdjustOpenWidths();
                }
            }
        }
    }

    // getDepthRenderedActiveWidth() {
    //     return this._depthFrame.getRenderedActiveWidth();
    // }

    // getTradesRenderedActiveWidth() {
    //     return this._tradesFrame.getRenderedActiveWidth();
    // }

    toggleFilterActive() {
        this._depthFrame.toggleFilterActive();
    }

    setFilter(xrefs: string[]) {
        this._depthFrame.setFilter(xrefs);
    }

    expand(newRecordsOnly: boolean) {
        this._depthFrame.openExpand = true;
        this._depthFrame.expand(newRecordsOnly);
    }

    rollUp(newRecordsOnly: boolean) {
        this._depthFrame.openExpand = false;
        this._depthFrame.rollup(newRecordsOnly);
    }

    historicalTradesDateCommit() {
        this.openTrades();
    }

    autoSizeAllColumnWidths() {
        this._watchlistFrame.autoSizeAllColumnWidths();
        this._depthFrame.autoSizeAllColumnWidths();
        this._tradesFrame.autoSizeAllColumnWidths();
    }

    getGridLayoutsWithHeadings(): ParidepthDitemFrame.GridLayoutsWithHeaderMaps {
        return {
            depth: this._depthFrame.getGridLayoutsWithHeadings(),
            watchlist: this._watchlistFrame.getGridLayoutWithHeadersMap(),
            trades: this._tradesFrame.getGridLayoutWithHeadersMap(),
        };
    }

    setGridLayouts(layouts: ParidepthDitemFrame.GridLayouts) {
        this._depthFrame.setGridLayouts(layouts.depth);
        this._watchlistFrame.setGridLayout(layouts.watchlist);
        this._tradesFrame.setGridLayout(layouts.trades);
    }

    // adviseShown() {
    //     setTimeout(() => this._depthFrame.initialiseWidths(), 3000);
    // }

    protected override applyLitIvemId(litIvemId: LitIvemId | undefined, SelfInitiated: boolean): boolean {
        super.applyLitIvemId(litIvemId, SelfInitiated);
        if (litIvemId === undefined) {
            return false;
        } else {
            this._componentAccess.pushSymbol(litIvemId);
            this.open();
            return true;
        }
    }

    private handleWatchlistRequireDefaultTableDefinitionEvent() {
        return new PortfolioTableDefinition(
            this.adi,
            this._textFormatterService,
            this._tableRecordDefinitionsListService,
            new PortfolioTableRecordDefinitionList()
        );
    }

    private handleWatchlistTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
        // ignore as not needed
    }

    // private async handleDepthActiveWidthChangedEvent(bidActiveWidth: Integer | undefined, askActiveWidth: Integer | undefined) {
    //     const depthActiveWidth = await this._depthFrame.getCompleteRenderedActiveWidth(bidActiveWidth, askActiveWidth);
    //     this._componentAccess.setDepthActiveWidth(depthActiveWidth);
    // }

    // private async handleTradesActiveWidthChangedEvent() {
    //     const tradesActiveWidth = await this._tradesFrame.getRenderedActiveWidth();
    //     this._componentAccess.setTradesActiveWidth(tradesActiveWidth);
    // }

    private handleWatchlistSettingsApplyEvent() {
        // process settings change here to ensure grid has been updated
        const rowHeight = this._watchlistFrame.gridRowHeight;
        const headerHeight = this._watchlistFrame.getHeaderPlusFixedLineHeight();
        const gridHorizontalScrollbarMarginedHeight = this._watchlistFrame.gridHorizontalScrollbarMarginedHeight;
        const height = headerHeight + rowHeight + gridHorizontalScrollbarMarginedHeight;
        this._watchlistFrame.setFlexBasis(height);
    }

    private close() {
        this._watchlistFrame.clearRecordDefinitions();
        this._depthFrame.close();
        this._tradesFrame.close();
    }

    private openTrades() {
        const litIvemId = this.litIvemId;
        if (litIvemId !== undefined) {
            const historicalDate = this._componentAccess.getHistoricalDate();
            this._tradesFrame.open(litIvemId, historicalDate);
        }
    }

    private checkAutoAdjustOpenWidths() {
        if (!this._componentAccess.explicitDepthWidth) {
            const preferredDepthWidth = this._depthFrame.getSymetricActiveWidth();
            this._componentAccess.adjustDepthWidth(preferredDepthWidth);
        }
    }
}

export namespace ParidepthDitemFrame {
    export namespace JsonName {
        export const watchlist = 'watchlist';
        export const depth = 'depth';
        export const trades = 'trades';
        export const filterActive = 'filterActive';
        export const filterXrefs = 'filterXrefs';
        export const historicalTradeDate = 'historicalTradeDate';
    }

    export namespace JsonDefault {
        export const filterActive = false;
        export const filterXrefs: string[] = [];
        export const historicalTradeDate = undefined;
    }

    export interface GridLayouts {
        watchlist: GridLayout;
        depth: DepthFrame.GridLayouts;
        trades: GridLayout;
    }

    export interface GridLayoutsWithHeaderMaps {
        watchlist: GridLayoutRecordStore.LayoutWithHeadersMap;
        depth: DepthFrame.GridLayoutsWithHeadersMap;
        trades: GridLayoutRecordStore.LayoutWithHeadersMap;
    }

    export type OpenedEventHandler = (this: void) => void;

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        readonly explicitDepthWidth: boolean;
        adjustDepthWidth(preferredDepthWidth: number): void;
        getHistoricalDate(): Date | undefined;
        pushSymbol(litIvemId: LitIvemId): void;
        notifyOpenedClosed(litIvemId: LitIvemId, historicalDate: Date | undefined): void;
        // setDepthActiveWidth(width: Integer): void;
        // setTradesActiveWidth(width: Integer): void;
    }
}
