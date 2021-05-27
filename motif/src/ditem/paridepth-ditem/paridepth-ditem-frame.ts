/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridLayout } from '@motifmarkets/revgrid';
import { AdiService, DepthStyleId, LitIvemId } from 'src/adi/internal-api';
import { DepthFrame, TableFrame, TradesFrame } from 'src/content/internal-api';
import {
    CommandRegisterService,
    GridLayoutDataStore, LitIvemIdTableRecordDefinition,
    PortfolioTableDefinition,
    PortfolioTableRecordDefinitionList,
    SymbolsService,
    TableRecordDefinitionList
} from 'src/core/internal-api';
import { Integer, JsonElement } from 'src/sys/internal-api';
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

    get initialised() { return this._depthFrame !== undefined; }

    get filterActive() { return this._depthFrame.filterActive; }
    get filterXrefs() { return this._depthFrame.filterXrefs; }

    constructor(
        private _componentAccess: ParidepthDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.DepthAndTrades, _componentAccess,
            commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    initialise(tableContentFrame: TableFrame, depthContentFrame: DepthFrame, tradesContentFrame: TradesFrame,
        frameElement: JsonElement | undefined
    ): void {
        this._watchlistFrame = tableContentFrame;
        this._depthFrame = depthContentFrame;
        this._tradesFrame = tradesContentFrame;

        this._watchlistFrame.requireDefaultTableDefinitionEvent = () => this.handleWatchlistRequireDefaultTableDefinitionEvent();
        this._watchlistFrame.tableOpenEvent = (recordDefinitionList) => this.handleWatchlistTableOpenEvent(recordDefinitionList);

        this._depthFrame.activeWidthChangedEvent =
            (bidActiveWidth, askActiveWidth) => this.handleDepthActiveWidthChangedEvent(bidActiveWidth, askActiveWidth);

        this._tradesFrame.activeWidthChangedEvent = () => this.handleTradesActiveWidthChangedEvent();

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
    }

    save(element: JsonElement) {
        super.save(element);

        const watchlistElement = element.newElement(ParidepthDitemFrame.JsonName.watchlist);
        this._watchlistFrame.saveLayoutConfig(watchlistElement);
        const depthElement = element.newElement(ParidepthDitemFrame.JsonName.depth);
        this._depthFrame.saveLayoutToConfig(depthElement);
        const tradesElement = element.newElement(ParidepthDitemFrame.JsonName.trades);
        this._tradesFrame.saveLayoutConfig(tradesElement);
    }

    open() {
        const litIvemId = this.litIvemId;
        if (litIvemId === undefined) {
            this.close();
        } else {
            // watchlist
            const definition = new LitIvemIdTableRecordDefinition(litIvemId);
            if (!this._watchlistFrame.tableOpened) {
                const tableDefinition = new PortfolioTableDefinition(this.adi, new PortfolioTableRecordDefinitionList());
                this._watchlistFrame.newPrivateTable(tableDefinition, true);
                this._watchlistFrame.addRecordDefinition(definition);
                this._watchlistFrame.focusItem(0);
            } else {
                if (this._watchlistFrame.RecordCount === 0) {
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
        }
    }

    getDepthRenderedActiveWidth() {
        return this._depthFrame.getRenderedActiveWidth();
    }

    getTradesRenderedActiveWidth() {
        return this._tradesFrame.getRenderedActiveWidth();
    }

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

    getGridLayoutsWithHeadings(): ParidepthDitemFrame.GridLayoutsWithHeadings {
        return {
            depth: this._depthFrame.getGridLayoutsWithHeadings(),
            watchlist: this._watchlistFrame.getGridLayoutWithHeadings(),
            trades: this._tradesFrame.getGridLayoutWithHeadings(),
        };
    }

    setGridLayouts(layouts: ParidepthDitemFrame.GridLayouts) {
        this._depthFrame.setGridLayouts(layouts.depth);
        this._watchlistFrame.setGridLayout(layouts.watchlist);
        this._tradesFrame.setGridLayout(layouts.trades);
    }

    adviseShown() {
        setTimeout(() => this._depthFrame.initialiseWidths(), 3000);
    }

    protected applyLitIvemId(litIvemId: LitIvemId | undefined, SelfInitiated: boolean): boolean {
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
        return new PortfolioTableDefinition(this.adi, new PortfolioTableRecordDefinitionList());
    }

    private handleWatchlistTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
        // ignore as not needed
    }

    private async handleDepthActiveWidthChangedEvent(bidActiveWidth: Integer | undefined, askActiveWidth: Integer | undefined) {
        const depthActiveWidth = await this._depthFrame.getCompleteRenderedActiveWidth(bidActiveWidth, askActiveWidth);
        this._componentAccess.setDepthActiveWidth(depthActiveWidth);
    }

    private async handleTradesActiveWidthChangedEvent() {
        const tradesActiveWidth = await this._tradesFrame.getRenderedActiveWidth();
        this._componentAccess.setTradesActiveWidth(tradesActiveWidth);
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

    export interface GridLayoutsWithHeadings {
        watchlist: GridLayoutDataStore.GridLayoutWithHeaders;
        depth: DepthFrame.GridLayoutsWithHeadings;
        trades: GridLayoutDataStore.GridLayoutWithHeaders;
    }

    export type OpenedEventHandler = (this: void) => void;

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        getHistoricalDate(): Date | undefined;
        pushSymbol(litIvemId: LitIvemId): void;
        notifyOpenedClosed(litIvemId: LitIvemId, historicalDate: Date | undefined): void;
        setDepthActiveWidth(width: Integer): void;
        setTradesActiveWidth(width: Integer): void;
    }
}
