/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    CommandRegisterService,
    DepthStyleId,
    GridLayoutDefinition,
    JsonElement,
    LitIvemId,
    SymbolsService,
    TextFormatterService
} from '@motifmarkets/motif-core';
import { DepthFrame, GridSourceFrame, RecordGrid, TradesFrame } from 'content-internal-api';
import { lowestValidModelUpdateId } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class ParidepthDitemFrame extends BuiltinDitemFrame {
    private _watchlistFrame: GridSourceFrame;
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
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.DepthAndTrades, _componentAccess,
            commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._depthFrame !== undefined; }

    get filterActive() { return this._depthFrame.filterActive; }
    get filterXrefs() { return this._depthFrame.filterXrefs; }

    initialise(watchlistFrame: GridSourceFrame, depthFrame: DepthFrame, tradesFrame: TradesFrame,
        frameElement: JsonElement | undefined
    ): void {
        this._watchlistFrame = watchlistFrame;
        this._depthFrame = depthFrame;
        this._tradesFrame = tradesFrame;

        this._watchlistFrame.settingsApplyEventer = () => this.handleWatchlistSettingsApplyEvent();

        // this._depthFrame.activeWidthChangedEvent =
        //     (bidActiveWidth, askActiveWidth) => this.handleDepthActiveWidthChangedEvent(bidActiveWidth, askActiveWidth);

        // this._tradesFrame.activeWidthChangedEvent = () => this.handleTradesActiveWidthChangedEvent();

        // initialise() not required for watchlist or trades
        this._depthFrame.initialise();

        if (frameElement === undefined) {
            this.loadWatchlistConfig(undefined);
            this._tradesFrame.initialise(undefined);
            this._depthFrame.loadConfig(undefined);
        } else {
            const watchlistElementResult = frameElement.tryGetElementType(ParidepthDitemFrame.JsonName.watchlist);
            if (watchlistElementResult.isErr()) {
                this.loadWatchlistConfig(undefined);
            } else {
                this.loadWatchlistConfig(watchlistElementResult.value);
            }

            const tradesElementResult = frameElement.tryGetElementType(ParidepthDitemFrame.JsonName.trades);
            if (tradesElementResult.isErr()) {
                this._tradesFrame.initialise(undefined);
            } else {
                this._tradesFrame.initialise(tradesElementResult.value);
            }

            const depthElementResult = frameElement.tryGetElementType(ParidepthDitemFrame.JsonName.depth);
            if (depthElementResult.isErr()) {
                this._depthFrame.loadConfig(undefined);
            } else {
                this._depthFrame.loadConfig(depthElementResult.value);
            }
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
        this._tradesFrame.saveLayoutToConfig(tradesElement);
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

    getAllowedFieldsAndLayoutDefinitions(): ParidepthDitemFrame.AllowedFieldsAndLayoutDefinitions {
        return {
            depth: this._depthFrame.createAllowedFieldsAndLayoutDefinitions(),
            watchlist: this._watchlistFrame.getFieldsAndLayoutDefinition(),
            trades: this._tradesFrame.getFieldsAndLayoutDefinition(),
        };
    }

    applyGridLayoutDefinitions(layouts: ParidepthDitemFrame.GridLayoutDefinitions) {
        this._depthFrame.applyGridLayoutDefinitions(layouts.depth);
        this._watchlistFrame.applyGridLayoutDefinition(layouts.watchlist);
        this._tradesFrame.applyGridLayoutDefinition(layouts.trades);
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

    private loadWatchlistConfig(frameElement: JsonElement | undefined) {

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

    export interface GridLayoutDefinitions {
        watchlist: GridLayoutDefinition;
        depth: DepthFrame.GridLayoutDefinitions;
        trades: GridLayoutDefinition;
    }

    export interface AllowedFieldsAndLayoutDefinitions {
        watchlist: RecordGrid.AllowedFieldsAndLayoutDefinition;
        depth: DepthFrame.AllowedFieldsAndLayoutDefinitions;
        trades: RecordGrid.AllowedFieldsAndLayoutDefinition;
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
