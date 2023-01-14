/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    Badness,
    CommaText,
    Correctness,
    DepthDataDefinition,
    DepthDataItem,
    DepthLevelsDataDefinition,
    DepthLevelsDataItem,
    DepthStyleId,
    GridLayoutDefinition,
    Integer,
    JsonElement,
    LitIvemId,
    Logger,
    MultiEvent,
    OrderSideId,
    SecurityDataDefinition,
    SecurityDataItem,
    uniqueElementArraysOverlap,
    UnreachableCaseError,
    ZenithSubscriptionDataId
} from '@motifmarkets/motif-core';
import { RecordGrid } from '../adapted-revgrid/internal-api';
import { ContentFrame } from '../content-frame';
import { DepthSideFrame } from '../depth-side/depth-side-frame';

export class DepthFrame extends ContentFrame {
    public openExpand = false;
    // public activeWidthChangedEvent: DepthFrame.ActiveWidthChangedEventHandler;

    private _bidDepthSideFrame: DepthSideFrame;
    private _askDepthSideFrame: DepthSideFrame;

    private _litIvemId: LitIvemId;
    private _preferredDepthStyleId: DepthStyleId;
    private _filterActive = false;
    private _filterXrefs: string[] = [];

    private _securityDataItem: SecurityDataItem;
    private _securityDataItemDefined = false;
    private _securityDataItemFieldValuesChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _securityDataItemDataCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _depthDataItem: DepthDataItem | undefined;
    // private _depthDataCorrectnessChangeSubscritionId: MultiEvent.SubscriptionId;
    private _depthBadnessChangeSubscritionId: MultiEvent.SubscriptionId;
    private _levelDataItem: DepthLevelsDataItem | undefined;
    // private _levelDataCorrectnessChangeSubscritionId: MultiEvent.SubscriptionId;
    private _levelBadnessChangeSubscritionId: MultiEvent.SubscriptionId;

    // private _beenUsable = false;

    // private _nextRenderedActiveWidthResolveFtns: DepthFrame.NextRenderedActiveWidthResolveFtns = [];

    constructor(private _componentAccess: DepthFrame.ComponentAccess, private _adi: AdiService) {
        super();
    }

    get filterActive() { return this._filterActive; }
    get filterXrefs() { return this._filterXrefs; }

    initialise() {
        this._bidDepthSideFrame.setOrderSideId(OrderSideId.Bid);
        this._askDepthSideFrame.setOrderSideId(OrderSideId.Ask);
    }

    bindChildFrames(bidDepthSideFrame: DepthSideFrame, askDepthSideFrame: DepthSideFrame) {
        this._bidDepthSideFrame = bidDepthSideFrame;
        // this._bidDepthSideFrame.columnWidthChangedEvent = (columnIndex) => this.handleBidSideColumnWidthChangedEvent(columnIndex);
        // this._bidDepthSideFrame.activeWidthChangedEvent = () => this.handleBidSideActiveWidthChangedEvent();
        this._askDepthSideFrame = askDepthSideFrame;
        // this._askDepthSideFrame.columnWidthChangedEvent = (columnIndex) => this.handleAskSideColumnWidthChangedEvent(columnIndex);
        // this._askDepthSideFrame.activeWidthChangedEvent = () => this.handleAskSideActiveWidthChangedEvent();
    }

    loadConfig(element: JsonElement | undefined) {
        if (element === undefined) {
            this.openExpand = DepthFrame.JsonDefault.openExpand;
            this._filterActive = DepthFrame.JsonDefault.filterActive;
            this._filterXrefs = DepthFrame.JsonDefault.filterXrefs;
            this._bidDepthSideFrame.loadConfig(undefined);
            this._askDepthSideFrame.loadConfig(undefined);
        } else {
            this.openExpand = element.getBoolean(DepthFrame.JsonName.openExpand, DepthFrame.JsonDefault.openExpand);

            this._filterActive = element.getBoolean(DepthFrame.JsonName.filterActive, DepthFrame.JsonDefault.filterActive);
            const asStrResult = element.tryGetStringType(DepthFrame.JsonName.filterXrefs);
            if (asStrResult.isErr()) {
                this._filterActive = false;
                this._filterXrefs = DepthFrame.JsonDefault.filterXrefs;
            } else {
                const commaTextResult = CommaText.tryToStringArray(asStrResult.value, true);
                if (commaTextResult.isErr()) {
                    this._filterActive = false;
                    this._filterXrefs = DepthFrame.JsonDefault.filterXrefs;
                    Logger.logWarning(`DepthDataItem LoadLayoutConfig: Invalid FilterXrefs: ${asStrResult} (${commaTextResult.error})`);
                } else {
                    this._filterXrefs = commaTextResult.value;
                }
            }

            if (this._filterActive) {
                this.activateBidAskFilter();
            }

            const bidElementResult = element.tryGetElementType(DepthFrame.JsonName.bid);
            if (bidElementResult.isErr()) {
                this._bidDepthSideFrame.loadConfig(undefined);
            } else {
                this._bidDepthSideFrame.loadConfig(bidElementResult.value);
            }
            const askElementResult = element.tryGetElementType(DepthFrame.JsonName.ask);
            if (askElementResult.isErr()) {
                this._askDepthSideFrame.loadConfig(undefined);
            } else {
                this._askDepthSideFrame.loadConfig(askElementResult.value);
            }
        }
    }

    saveLayoutToConfig(element: JsonElement) {
        if (this.openExpand !== DepthFrame.JsonDefault.openExpand) {
            element.setBoolean(DepthFrame.JsonName.openExpand, this.openExpand);
        }

        if (this._filterActive !== DepthFrame.JsonDefault.filterActive) {
            element.setBoolean(DepthFrame.JsonName.filterActive, this._filterActive);
        }
        if (!uniqueElementArraysOverlap(this._filterXrefs, DepthFrame.JsonDefault.filterXrefs)) {
            const asStr = CommaText.fromStringArray(this._filterXrefs);
            element.setString(DepthFrame.JsonName.filterXrefs, asStr);
        }

        const bidElement = element.newElement(DepthFrame.JsonName.bid);
        this._bidDepthSideFrame.saveConfig(bidElement);
        const askElement = element.newElement(DepthFrame.JsonName.ask);
        this._askDepthSideFrame.saveConfig(askElement);
    }

    // getBidRenderedActiveWidth() {
    //     return this._bidDepthSideFrame.getRenderedActiveWidth();
    // }

    // getAskRenderedActiveWidth() {
    //     return this._bidDepthSideFrame.getRenderedActiveWidth();
    // }

    // async getRenderedActiveWidth() {
    //     const bidPromise = this.getBidRenderedActiveWidth();
    //     const askPromise = this.getAskRenderedActiveWidth();
    //     const [bid, ask] = await Promise.all([bidPromise, askPromise]);
    //     return bid + ask + this._componentAccess.getBidAskSeparatorWidth();
    // }

    // async getCompleteRenderedActiveWidth(bidWidth: Integer | undefined, askWidth: Integer | undefined) {
    //     if (bidWidth === undefined) {
    //         if (askWidth === undefined) {
    //             return this.getRenderedActiveWidth();
    //         } else {
    //             bidWidth = await this.getBidRenderedActiveWidth();
    //             return bidWidth + askWidth + this._componentAccess.getBidAskSeparatorWidth();
    //         }
    //     } else {
    //         if (askWidth === undefined) {
    //             askWidth = await this.getAskRenderedActiveWidth();
    //         }
    //         return bidWidth + askWidth + this._componentAccess.getBidAskSeparatorWidth();
    //     }
    // }

    // getFirstUsableRenderedActiveWidth(): Promise<number> {
    //     const correctnessId = this.getDepthLevelDataCorrectnessId();
    //     if (Correctness.idIsUsable(correctnessId)) {
    //         const width = this.getRenderedActiveWidth();
    //         return Promise.resolve(width);
    //     } else {
    //         return new Promise(
    //             (resolve, reject) => {
    //                 this._nextRenderedActiveWidthResolveFtns.push(resolve);
    //             }
    //         );
    //     }
    // }

    open(litIvemId: LitIvemId, preferredDepthStyleId: DepthStyleId) {
        this.close();
        this._litIvemId = litIvemId;
        this._preferredDepthStyleId = preferredDepthStyleId;
        this.subscribeSecurityDataItem(litIvemId);
    }

    close() {
        this._bidDepthSideFrame.close();
        this._askDepthSideFrame.close();
        if (this._depthDataItem !== undefined) {
            // this._depthDataItem.unsubscribeCorrectnessChangedEvent(this._depthDataCorrectnessChangeSubscritionId);
            // this._depthDataCorrectnessChangeSubscritionId = undefined;
            this._depthDataItem.unsubscribeBadnessChangeEvent(this._depthBadnessChangeSubscritionId);
            this._depthBadnessChangeSubscritionId = undefined;
            this._adi.unsubscribe(this._depthDataItem);
            this._depthDataItem = undefined;
        }
        if (this._levelDataItem !== undefined) {
            // this._levelDataItem.unsubscribeCorrectnessChangedEvent(this._levelDataCorrectnessChangeSubscritionId);
            // this._levelDataCorrectnessChangeSubscritionId = undefined;
            this._levelDataItem.unsubscribeBadnessChangeEvent(this._levelBadnessChangeSubscritionId);
            this._levelBadnessChangeSubscritionId = undefined;
            this._adi.unsubscribe(this._levelDataItem);
            this._levelDataItem = undefined;
        }
        if (this._securityDataItemDefined) {
            if (this._securityDataItemDataCorrectnessChangeSubscriptionId !== undefined) {
                this._securityDataItem.unsubscribeCorrectnessChangedEvent(this._securityDataItemDataCorrectnessChangeSubscriptionId);
                this._securityDataItemDataCorrectnessChangeSubscriptionId = undefined;
            }
            if (this._securityDataItemFieldValuesChangedSubscriptionId !== undefined) {
                this._securityDataItem.unsubscribeFieldValuesChangedEvent(this._securityDataItemFieldValuesChangedSubscriptionId);
                this._securityDataItemFieldValuesChangedSubscriptionId = undefined;
            }
            this._adi.unsubscribe(this._securityDataItem);
            this._securityDataItemDefined = false;
        }

        // this._beenUsable = false;
    }

    waitOpenPopulated() {
        return Promise.all([this._bidDepthSideFrame.waitOpenPopulated(), this._bidDepthSideFrame.waitOpenPopulated()]);
    }
    waitRendered() {
        return Promise.all([this._bidDepthSideFrame.waitRendered(), this._bidDepthSideFrame.waitRendered()]);
    }

    getSymetricActiveWidth() {
        const bidActiveColumnsWidth = this._bidDepthSideFrame.calculateActiveColumnsWidth();
        const askActiveColumnsWidth = this._askDepthSideFrame.calculateActiveColumnsWidth();
        const splitterWidth = this._componentAccess.splitterGutterSize;
        const maxActiveColumnsWidth = Math.max(bidActiveColumnsWidth, askActiveColumnsWidth);
        return 2 * maxActiveColumnsWidth + splitterWidth;
    }

    rollup(newRecordsOnly: boolean) {
        if (newRecordsOnly) {
            this._bidDepthSideFrame.setNewPriceLevelAsOrder(false);
            this._askDepthSideFrame.setNewPriceLevelAsOrder(false);
        } else {
            this._bidDepthSideFrame.setAllRecordsToPriceLevel();
            this._askDepthSideFrame.setAllRecordsToPriceLevel();
        }
    }

    expand(newRecordsOnly: boolean) {
        if (newRecordsOnly) {
            this._bidDepthSideFrame.setNewPriceLevelAsOrder(true);
            this._askDepthSideFrame.setNewPriceLevelAsOrder(true);
        } else {
            this._bidDepthSideFrame.setAllRecordsToOrder();
            this._askDepthSideFrame.setAllRecordsToOrder();
        }
    }

    toggleFilterActive() {
        this._filterActive = !this._filterActive;
        if (this._filterActive) {
            this.activateBidAskFilter();
        } else {
            this.deactivateBidAskFilter();
        }
    }

    setFilter(filterXrefs: string[]) {
        this._filterXrefs = filterXrefs;
        if (this._filterActive) {
            this.activateBidAskFilter();
        }
    }

    autoSizeAllColumnWidths() {
        this._bidDepthSideFrame.autoSizeAllColumnWidths();
        this._askDepthSideFrame.autoSizeAllColumnWidths();
    }

    createAllowedFieldsAndLayoutDefinitions(): DepthFrame.AllowedFieldsAndLayoutDefinitions {
        return {
            bid: this._bidDepthSideFrame.createAllowedFieldsAndLayoutDefinition(),
            ask: this._askDepthSideFrame.createAllowedFieldsAndLayoutDefinition(),
        };
    }

    applyGridLayoutDefinitions(layoutDefinitions: DepthFrame.GridLayoutDefinitions) {
        this._bidDepthSideFrame.applyGridLayoutDefinition(layoutDefinitions.bid);
        this._askDepthSideFrame.applyGridLayoutDefinition(layoutDefinitions.ask);
    }

    // async initialiseWidths() {
    //     const bidActiveWidth = await this.getBidRenderedActiveWidth();
    //     const askActiveWidth = await this.getAskRenderedActiveWidth();
    //     this._componentAccess.setActiveWidths(bidActiveWidth, askActiveWidth);
    // }

    private handleSecurityDataCorrectnessChangeEvent() {
        if (Correctness.idIsUsable(this._securityDataItem.correctnessId)) {
            this.checkUnsubscribeSecurityDataItemDataCorrectnessChange();
            this.processUsableSecurityDataItem();
        }
    }

    private handleSecurityDataItemFieldValuesChangedEvent(valueChanges: SecurityDataItem.ValueChange[]) {
        if (SecurityDataItem.valueChangeArrayIncludesFieldId(valueChanges, SecurityDataItem.FieldId.AuctionQuantity)) {
            this.processAuctionQuantityChanged(this._securityDataItem.auctionQuantity);
        }
    }

    // private handleDepthDataCorrectnessChangeEvent() {
    //     if (this._depthDataItem !== undefined) {
    //         if (!this._beenUsable && Correctness.idIsUsable(this._depthDataItem.correctnessId)) {
    //             this.processDepthLevelFirstUsable();
    //         }
    //     }
    // }

    // private handleLevelDataCorrectnessChangeEvent() {
    //     if (this._levelDataItem !== undefined) {
    //         if (!this._beenUsable && Correctness.idIsUsable(this._levelDataItem.correctnessId)) {
    //             this.processDepthLevelFirstUsable();
    //         }
    //     }
    // }

    // private async handleBidSideColumnWidthChangedEvent(columnIndex: Integer) {
    //     const width = await this._bidDepthSideFrame.getRenderedActiveWidth();
    //     this._componentAccess.setBidActiveWidth(width);
    //     if (this.activeWidthChangedEvent !== undefined) {
    //         this.activeWidthChangedEvent(width, undefined);
    //     }
    // }

    // private async handleAskSideColumnWidthChangedEvent(columnIndex: Integer) {
    //     const width = await this._askDepthSideFrame.getRenderedActiveWidth();
    //     this._componentAccess.setAskActiveWidth(width);
    //     if (this.activeWidthChangedEvent !== undefined) {
    //         this.activeWidthChangedEvent(undefined, width);
    //     }
    // }

    // private handleBidSideActiveWidthChangedEvent() {
    //     const areaSizes = this._componentAccess.getSplitAreaSizes();
    // }

    // private handleAskSideActiveWidthChangedEvent() {

    // }

    private handleDepthBadnessChangeEvent() {
        if (this._depthDataItem === undefined) {
            throw new AssertInternalError('DFHDBCE6399184373');
        } else {
            this._componentAccess.setBadness(this._depthDataItem.badness);
        }
    }

    private handleLevelBadnessChangeEvent() {
        if (this._levelDataItem === undefined) {
            throw new AssertInternalError('DFHLBCE2219035378');
        } else {
            this._componentAccess.setBadness(this._levelDataItem.badness);
        }
    }

    private checkUnsubscribeSecurityDataItemDataCorrectnessChange() {
        if (this._securityDataItemDataCorrectnessChangeSubscriptionId !== undefined) {
            this._securityDataItem.unsubscribeCorrectnessChangedEvent(this._securityDataItemDataCorrectnessChangeSubscriptionId);
            this._securityDataItemDataCorrectnessChangeSubscriptionId = undefined;
        }
    }

    private subscribeSecurityDataItem(litIvemId: LitIvemId) {
        const definition = new SecurityDataDefinition();
        definition.litIvemId = litIvemId;
        this._securityDataItem = this._adi.subscribe(definition) as SecurityDataItem;
        this._securityDataItemDefined = true;
        this._securityDataItemFieldValuesChangedSubscriptionId = this._securityDataItem.subscribeFieldValuesChangedEvent(
            (modifiedFieldIds) => this.handleSecurityDataItemFieldValuesChangedEvent(modifiedFieldIds)
        );
        if (Correctness.idIsUsable(this._securityDataItem.correctnessId)) {
            this.processUsableSecurityDataItem();
        } else {
            this._securityDataItemDataCorrectnessChangeSubscriptionId =
                this._securityDataItem.subscribeCorrectnessChangedEvent(() => this.handleSecurityDataCorrectnessChangeEvent());
        }
    }

    private processUsableSecurityDataItem() {
        const resolvedDepthStyleId = this.resolveDepthStyleId();
        switch (resolvedDepthStyleId) {
            case DepthStyleId.Full:
                const depthDefinition = new DepthDataDefinition();
                depthDefinition.litIvemId = this._litIvemId;
                this._depthDataItem = this._adi.subscribe(depthDefinition) as DepthDataItem;
                // this._depthDataCorrectnessChangeSubscritionId =
                //     this._depthDataItem.subscribeCorrectnessChangedEvent(() => this.handleDepthDataCorrectnessChangeEvent());
                this._depthBadnessChangeSubscritionId =
                    this._depthDataItem.subscribeBadnessChangeEvent(() => this.handleDepthBadnessChangeEvent());
                this.openFull();
                break;
            case DepthStyleId.Short:
                const levelDefinition = new DepthLevelsDataDefinition();
                levelDefinition.litIvemId = this._litIvemId;
                this._levelDataItem = this._adi.subscribe(levelDefinition) as DepthLevelsDataItem;
                // this._levelDataCorrectnessChangeSubscritionId =
                //     this._levelDataItem.subscribeCorrectnessChangedEvent(() => this.handleLevelDataCorrectnessChangeEvent());
                this._levelBadnessChangeSubscritionId =
                    this._levelDataItem.subscribeBadnessChangeEvent(() => this.handleLevelBadnessChangeEvent());
                this.openShort();
                break;
            default:
                throw new UnreachableCaseError('DFPGSDIR44476', resolvedDepthStyleId);
        }

        this.processAuctionQuantityChanged(this._securityDataItem.auctionQuantity);
    }

    // private async processDepthLevelFirstUsable() {
    //     if (this._nextRenderedActiveWidthResolveFtns.length > 0) {
    //         const width = await this.getRenderedActiveWidth();

    //         for (const ftn of this._nextRenderedActiveWidthResolveFtns) {
    //             ftn(width);
    //         }
    //         this._nextRenderedActiveWidthResolveFtns.splice(0);
    //     }

    //     this._beenUsable = true;
    // }

    private resolveDepthStyleId() {
        const subscriptionData = this._securityDataItem.subscriptionData;
        let resolvedDepthStyleId: DepthStyleId;
        if (subscriptionData === undefined) {
            Logger.logWarning(`Security ${this._litIvemId} does not have Subscription Data`);
            resolvedDepthStyleId = this._preferredDepthStyleId; // try this
        } else {
            switch (this._preferredDepthStyleId) {
                case DepthStyleId.Full:
                    if (subscriptionData.includes(ZenithSubscriptionDataId.DepthFull)) {
                        resolvedDepthStyleId = DepthStyleId.Full;
                    } else {
                        if (subscriptionData.includes(ZenithSubscriptionDataId.Depth)) {
                            resolvedDepthStyleId = DepthStyleId.Full;
                        } else {
                            if (subscriptionData.includes(ZenithSubscriptionDataId.DepthShort)) {
                                resolvedDepthStyleId = DepthStyleId.Short;
                            } else {
                                Logger.logWarning(`Symbol ${this._litIvemId} does not have any Depth`);
                                resolvedDepthStyleId = DepthStyleId.Full; // try this - probably wont work
                            }
                        }
                    }
                    break;

                case DepthStyleId.Short:
                    if (subscriptionData.includes(ZenithSubscriptionDataId.DepthShort)) {
                        resolvedDepthStyleId = DepthStyleId.Short;
                    } else {
                        if (subscriptionData.includes(ZenithSubscriptionDataId.Depth)) {
                            resolvedDepthStyleId = DepthStyleId.Short;
                        } else {
                            if (subscriptionData.includes(ZenithSubscriptionDataId.DepthFull)) {
                                resolvedDepthStyleId = DepthStyleId.Full;
                            } else {
                                Logger.logWarning(`Symbol ${this._litIvemId} does not have any Depth`);
                                resolvedDepthStyleId = DepthStyleId.Short; // try this - probably wont work
                            }
                        }
                    }
                    break;

                default:
                    throw new UnreachableCaseError('DFRDSI144476', this._preferredDepthStyleId);
            }
        }

        return resolvedDepthStyleId;
    }

    private openFull() {
        if (this._depthDataItem !== undefined) {
            this._bidDepthSideFrame.openFull(this._depthDataItem, this.openExpand);
            this._askDepthSideFrame.openFull(this._depthDataItem, this.openExpand);
            this._componentAccess.hideBadnessWithVisibleDelay(this._depthDataItem.badness);
        }
    }

    private openShort() {
        if (this._levelDataItem !== undefined) {
            this._bidDepthSideFrame.openShort(this._levelDataItem, this.openExpand);
            this._askDepthSideFrame.openShort(this._levelDataItem, this.openExpand);
            this._componentAccess.hideBadnessWithVisibleDelay(this._levelDataItem.badness);
        }
    }

    private activateBidAskFilter() {
        this._bidDepthSideFrame.activateFilter(this._filterXrefs);
        this._askDepthSideFrame.activateFilter(this._filterXrefs);
    }

    private deactivateBidAskFilter() {
        this._bidDepthSideFrame.deactivateFilter();
        this._askDepthSideFrame.deactivateFilter();
    }

    private processAuctionQuantityChanged(newValue: Integer | undefined) {
        this._bidDepthSideFrame.setAuctionQuantity(newValue);
        this._askDepthSideFrame.setAuctionQuantity(newValue);
    }

    private getDepthLevelDataCorrectnessId() {
        if (this._depthDataItem !== undefined) {
            return this._depthDataItem.correctnessId;
        } else {
            if (this._levelDataItem !== undefined) {
                return this._levelDataItem.correctnessId;
            } else {
                throw new AssertInternalError('DFGDLDCI98335578');
            }
        }
    }
}

export namespace DepthFrame {
    export namespace JsonName {
        export const bid = 'bid';
        export const ask = 'ask';
        export const openExpand = 'openExpand';
        export const filterActive = 'filterActive';
        export const filterXrefs = 'filterXrefs';
    }

    export namespace JsonDefault {
        export const openExpand = false;
        export const filterActive = false;
        export const filterXrefs: string[] = [];
    }

    export type ActiveWidthChangedEventHandler = (
        this: void, bidActiveWidth: Integer | undefined, askActiveWidth: Integer | undefined
    ) => void;

    // type RenderedActiveWidthResolveFtn = (width: number) => void;
    // export type NextRenderedActiveWidthResolveFtns = RenderedActiveWidthResolveFtn[];

    export interface GridLayoutDefinitions {
        bid: GridLayoutDefinition;
        ask: GridLayoutDefinition;
    }

    export interface AllowedFieldsAndLayoutDefinitions {
        bid: RecordGrid.AllowedFieldsAndLayoutDefinition;
        ask: RecordGrid.AllowedFieldsAndLayoutDefinition;
    }

    export interface ComponentAccess {
        // setActiveWidths(bidActiveWidth: number, askActiveWidth: number): void;
        // getBidAskSeparatorWidth(): Integer;
        // setBidActiveWidth(pixels: Integer): void;
        // setAskActiveWidth(pixels: Integer): void;
        // getSplitAreaSizes(): void;

        readonly splitterGutterSize: number;
        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }
}
