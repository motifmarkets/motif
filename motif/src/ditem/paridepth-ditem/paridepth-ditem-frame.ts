/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    CommandRegisterService,
    DepthStyleId,
    GridLayoutDefinition,
    GridLayoutOrNamedReferenceDefinition,
    JsonElement,
    JsonRankedLitIvemIdListDefinition,
    LitIvemId,
    SettingsService,
    SymbolsService,
    TextFormatterService
} from '@motifmarkets/motif-core';
import {
    BidAskGridLayoutDefinitions,
    DepthFrame,
    ParidepthAllowedFieldsAndLayoutDefinitions,
    TradesFrame,
    WatchlistFrame
} from 'content-internal-api';
import { lowestValidModelUpdateId } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class ParidepthDitemFrame extends BuiltinDitemFrame {
    private _watchlistFrame: WatchlistFrame;
    private _depthFrame: DepthFrame;
    private _tradesFrame: TradesFrame;

    // private _watchlistCommandProcessor: WatchlistCommandProcessor;
    // private _depthCommandProcessor: DepthCommandProcessor;
    // private _tradesCommandProcessor: TradesCommandProcessor;

    constructor(
        private _componentAccess: ParidepthDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _textFormatterService: TextFormatterService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.DepthAndTrades, _componentAccess,
            settingsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._depthFrame !== undefined; }

    get filterActive() { return this._depthFrame.filterActive; }
    get filterXrefs() { return this._depthFrame.filterXrefs; }

    initialise(watchlistFrame: WatchlistFrame, depthFrame: DepthFrame, tradesFrame: TradesFrame,
        frameElement: JsonElement | undefined
    ): void {
        this._watchlistFrame = watchlistFrame;
        this._depthFrame = depthFrame;
        this._tradesFrame = tradesFrame;

        this._watchlistFrame.fixedRowCount = 1;

        if (frameElement === undefined) {
            this._watchlistFrame.initialise(this.opener, undefined, true);
            this._tradesFrame.initialise(undefined);
            this._depthFrame.initialise(undefined);
        } else {
            const watchlistElementResult = frameElement.tryGetElement(ParidepthDitemFrame.JsonName.watchlist);
            if (watchlistElementResult.isErr()) {
                this._watchlistFrame.initialise(this.opener, undefined, true);
            } else {
                this._watchlistFrame.initialise(this.opener, watchlistElementResult.value, true);
            }

            const tradesElementResult = frameElement.tryGetElement(ParidepthDitemFrame.JsonName.trades);
            if (tradesElementResult.isErr()) {
                this._tradesFrame.initialise(undefined);
            } else {
                this._tradesFrame.initialise(tradesElementResult.value);
            }

            const depthElementResult = frameElement.tryGetElement(ParidepthDitemFrame.JsonName.depth);
            if (depthElementResult.isErr()) {
                this._depthFrame.initialise(undefined);
            } else {
                this._depthFrame.initialise(depthElementResult.value);
            }
        }

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        if (this._watchlistFrame.opened) {
            const watchlistElement = element.newElement(ParidepthDitemFrame.JsonName.watchlist);
            this._watchlistFrame.saveLayout(watchlistElement);
        }

        if (this._depthFrame.opened) {
            const depthElement = element.newElement(ParidepthDitemFrame.JsonName.depth);
            this._depthFrame.save(depthElement);
        }

        if (this._tradesFrame.opened) {
            const tradesElement = element.newElement(ParidepthDitemFrame.JsonName.trades);
            this._tradesFrame.saveLayoutToConfig(tradesElement);
        }
    }

    async open() {
        const litIvemId = this.litIvemId;
        if (litIvemId === undefined) {
            this.close();
        } else {
            // watchlist
            if (!this._watchlistFrame.opened) {
                const litIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition([litIvemId]);
                const definition = this._watchlistFrame.createGridSourceOrNamedReferenceDefinitionFromList(
                    litIvemIdListDefinition,
                    undefined,
                    undefined
                );
                this._watchlistFrame.tryOpenGridSource(definition, false);
                this._watchlistFrame.focusItem(0);
            } else {
                if (this._watchlistFrame.recordCount === 0) {
                    this._watchlistFrame.addLitIvemIds([litIvemId], true);
                } else {
                    this._watchlistFrame.userReplaceAt(0, [litIvemId]);
                }
            }
            // depth
            this._depthFrame.open(litIvemId, DepthStyleId.Full);
            // trades
            this._tradesFrame.open(litIvemId, undefined);

            this._componentAccess.notifyOpenedClosed(litIvemId, undefined);

            const [bidOpePopulatedSuccess, askOpenPopulatedSuccess] = await this._depthFrame.waitOpenPopulated();
            if (bidOpePopulatedSuccess && askOpenPopulatedSuccess) {
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

    autoSizeAllColumnWidths(widenOnly: boolean) {
        this._watchlistFrame.autoSizeAllColumnWidths(widenOnly);
        this._depthFrame.autoSizeAllColumnWidths(widenOnly);
        this._tradesFrame.autoSizeAllColumnWidths(widenOnly );
    }

    createAllowedFieldsAndLayoutDefinition(): ParidepthAllowedFieldsAndLayoutDefinitions {
        return {
            depth: this._depthFrame.createAllowedFieldsAndLayoutDefinitions(),
            watchlist: this._watchlistFrame.createAllowedFieldsAndLayoutDefinition(),
            trades: this._tradesFrame.createAllowedFieldsAndLayoutDefinition(),
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
            const promise = this.open();
            promise.then(
                () => {/**/},
                (error) => { throw AssertInternalError.createIfNotError(error, 'PDFALII22297'); }
            )
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

    private close() {
        this._watchlistFrame.closeGridSource(false);
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
        export const keptLayout = 'keptLayout';
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
        watchlist: GridLayoutOrNamedReferenceDefinition;
        depth: BidAskGridLayoutDefinitions;
        trades: GridLayoutDefinition;
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
