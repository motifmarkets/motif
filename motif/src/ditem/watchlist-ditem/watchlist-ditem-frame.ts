/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    CommandRegisterService, ExplicitLitIvemIdListDefinition, GridLayoutRecordStore, GridSourceDefinition, Guid,
    Integer,
    JsonElement,
    LitIvemId, LitIvemIdFromListTableRecordSourceDefinition, LitIvemIdList,
    LitIvemIdListDefinition,
    LitIvemIdTableRecordDefinition, SymbolsService
} from '@motifmarkets/motif-core';
import { GridFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class WatchlistDitemFrame extends BuiltinDitemFrame {
    defaultLitIvemIds: readonly LitIvemId[] | undefined;

    newTableEvent: WatchlistDitemFrame.NewTableEvent;
    litIvemIdAcceptedEvent: WatchlistDitemFrame.LitIvemIdAcceptedEvent;
    recordFocusEvent: WatchlistDitemFrame.RecordFocusEvent;

    private _litIvemIdList: LitIvemIdList;
    private _tableFrame: GridFrame;
    private _recordDefinitionList: PortfolioTableRecordDefinitionList;

    private _litIvemIdApplying = false;
    private _currentFocusedLitIvemIdSetting = false;

    constructor(
        componentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _consolidatedLitIvemIdListsFactoryService: ConsolidatedLitIvemIdListsFactoryService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Watchlist, componentAccess,
            commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._tableFrame !== undefined; }
    get recordFocused() { return this._tableFrame.recordFocused; }

    initialise(tableFrame: GridFrame, frameElement: JsonElement | undefined): void {
        this._tableFrame = tableFrame;
        this._tableFrame.recordFocusEvent = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);
        this._tableFrame.requireDefaultTableDefinitionEvent = () => this.handleRequireDefaultTableDefinitionEvent();
        this._tableFrame.tableOpenEvent = (recordDefinitionList) => this.handleTableOpenEvent(recordDefinitionList);

        if (frameElement === undefined) {
            this._tableFrame.loadLayoutConfig(undefined);
        } else {
            const contentElement = frameElement.tryGetElement(WatchlistDitemFrame.JsonName.content);
            this._tableFrame.loadLayoutConfig(contentElement);
        }

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(WatchlistDitemFrame.JsonName.content);
        this._tableFrame.saveLayoutConfig(contentElement);
    }

    getGridLayoutWithHeadersMap(): GridLayoutRecordStore.LayoutWithHeadersMap {
        return this._tableFrame.getGridLayoutWithHeadersMap();
    }

    canDeleteFocusedRecord() {
        return this._litIvemIdList.publicCanModify;
        // return this._tableFrame !== undefined && this._tableFrame.canDeleteFocusedRecord();
    }

    deleteFocusedSymbol() {
        const index = this._tableFrame.getFocusedRecordIndex();
        if (index === undefined) {
            throw new AssertInternalError('WDFDFS01023');
        } else {
            this._litIvemIdList.delete(index);
        }
        // this._tableFrame.deleteFocusedRecord();
    }

    // newPrivate(keepCurrentLayout: boolean) {
    //     if (this.checkConfirmPrivateWatchListCanBeDiscarded()) {
    //         this.newPrivateTable(keepCurrentLayout);
    //     }
    // }

    newPrivate() {
        const listDefinition = new ExplicitLitIvemIdListDefinition();
        // const gridLayout = this._namedGridLayoutsService.createPrivate();
        const recordSourceDefinition = new LitIvemIdFromListTableRecordSourceDefinition(listDefinition);
        this._tableFrame.newPrivate(recordSourceDefinition, NamedGridLayoutsService.CategoryId.Watchlist);
    }

    saveAsPrivate() {
        const recordSourceDefinition = this._tableFrame.recordSourceDefinition;
        if (LitIvemIdFromListTableRecordSourceDefinition.is(recordSourceDefinition)) {
            const list = recordSourceDefinition.litIvemIdList;
            const explicitList = new ExplicitLitIvemIdListDefinition(list.litIvemIds[]);
            const recordSourceDefinition = new LitIvemIdFromListTableRecordSourceDefinition(explicitList.createDefinition());
            this._tableFrame.saveAsPrivate(recordSourceDefinition);
        } else {
            throw new AssertInternalError('WDISAPI13008');
        }
    }

    loadLitIvemIdList(listDefinition: LitIvemIdListDefinition) {
        const recordSourceDefinition = new LitIvemIdFromListTableRecordSourceDefinition(listDefinition);
        this._tableFrame.loadRecordSourceDefinition(recordSourceDefinition);
    }

    saveAsLitIvemIdList(listDefinition: LitIvemIdListDefinition) {
        const recordSourceDefinition = new LitIvemIdFromListTableRecordSourceDefinition(listDefinition);
        this._tableFrame.saveAsRecordSourceDefinition(recordSourceDefinition);
    }

    loadGridSource(definition: GridSourceDefinition) {
        this._tableFrame.loadGridSource(GridSourceDefinition);
    }

    saveAsGridSource(name: string) {
        this._tableFrame.saveAsGridSource(GridSourceDefinition);
    }

    setGridLayout(definition: NamedGridLayoutDefinition) {
        this._tableFrame.setGridLayout(definition);
    }

    setGridLayoutFavourites(definitions: NamedGridLayoutDefinition[]) {
        this._tableFrame.setGridLayoutFavourites(definitions);
    }

    autoSizeAllColumnWidths() {
        this._tableFrame.autoSizeAllColumnWidths();
    }

    tryIncludeLitIvemIds(litIvemIds: LitIvemId[], focusFirst: boolean) {
        if (litIvemIds.length === 0) {
            return true;
        } else {
            if (this._tableFrame.layoutConfigLoading || this._currentFocusedLitIvemIdSetting) {
                return false;
            } else {
                this._litIvemIdApplying = true;
                try {
                    return this.includeLitIvemIds(litIvemIds, focusFirst);
                } finally {
                    this._litIvemIdApplying = false;
                }
            }
        }
    }

    protected override applyLitIvemId(litIvemId: LitIvemId | undefined, selfInitiated: boolean): boolean { // override
        if (this._tableFrame.layoutConfigLoading || this._currentFocusedLitIvemIdSetting || litIvemId === undefined) {
            return false;
        } else {
            let result: boolean;
            this._litIvemIdApplying = true;
            try {
                const definition = new LitIvemIdTableRecordDefinition(litIvemId);
                const itemDefinitionIndex = this._tableFrame.findRecordDefinition(definition);

                if (itemDefinitionIndex !== undefined) {
                    this._tableFrame.focusItem(itemDefinitionIndex);
                    result = super.applyLitIvemId(litIvemId, selfInitiated);
                } else {
                    if (!selfInitiated || !this._tableFrame.canAddRecordDefinition(definition)) {
                        result = false;
                    } else {
                        const confirmedItemDefinitionIndex = this.addLitIvemIdTableRecordDefinition(definition);
                        if (confirmedItemDefinitionIndex === undefined) {
                            result = false;
                        } else {
                            this._tableFrame.focusItem(confirmedItemDefinitionIndex);
                            result = super.applyLitIvemId(litIvemId, selfInitiated);
                        }
                    }
                }

                if (result && selfInitiated) {
                    this.notifyLitIvemIdAccepted(litIvemId);
                }
            } finally {
                this._litIvemIdApplying = false;
            }

            return result;
        }
    }

    private handleRecordFocusEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const definition = this._recordDefinitionList.getLitIvemIdDefinition(newRecordIndex);
            const litIvemId = definition.litIvemId;
            this.processLitIvemIdFocusChange(litIvemId);
        }
        this.recordFocusEvent(newRecordIndex);
    }

    private handleRequireDefaultTableDefinitionEvent() {
        if (this.defaultLitIvemIds === undefined) {
            return this._tablesService.definitionFactory.createPortfolio();
        } else {
            const count = this.defaultLitIvemIds.length;
            if (count === 0) {
                return this._tablesService.definitionFactory.createPortfolio();
            } else {
                const definitions = new Array<LitIvemIdTableRecordDefinition>(count);
                for (let i = 0; i < count; i++) {
                    const litIvemId = this.defaultLitIvemIds[i];
                    const definition = new LitIvemIdTableRecordDefinition(litIvemId);
                    definitions[i] = definition;
                }
                const list = new PortfolioTableRecordDefinitionList();
                list.addArray(definitions);
                return this._tablesService.definitionFactory.createPortfolioFromRecordDefinitionList(list);
            }
        }
    }

    private handleTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
        this._recordDefinitionList = recordDefinitionList as PortfolioTableRecordDefinitionList;
    }

    private notifyNewTable(description: WatchlistDitemFrame.TableDescription) {
        this.newTableEvent(description);
    }

    private notifyLitIvemIdAccepted(litIvemId: LitIvemId) {
        this.litIvemIdAcceptedEvent(litIvemId);
    }

    private includeLitIvemIds(litIvemIds: LitIvemId[], focusFirst: boolean) {
        let wantFocus = focusFirst;
        let result = false;
        const count = litIvemIds.length;
        for (let i = 0; i < count; i++) {
            const litIvemId = litIvemIds[i];
            const included = this.includeLitIvemId(litIvemId, wantFocus);
            if (included) {
                wantFocus = false;
                result = true;
            }
        }
        return true;
    }

    private includeLitIvemId(litIvemId: LitIvemId, focus: boolean) {
        const definition = new LitIvemIdTableRecordDefinition(litIvemId);
        const itemDefinitionIndex = this._tableFrame.findRecordDefinition(definition);

        if (itemDefinitionIndex !== undefined) {
            if (focus) {
                this._tableFrame.focusItem(itemDefinitionIndex);
            }
            return true;
        } else {
            if (!this._tableFrame.canAddRecordDefinition(definition)) {
                return false;
            } else {
                const confirmedItemDefinitionIndex = this.addLitIvemIdTableRecordDefinition(definition);
                if (confirmedItemDefinitionIndex === undefined) {
                    return false;
                } else {
                    if (focus) {
                        this._tableFrame.focusItem(confirmedItemDefinitionIndex);
                    }
                    return true;
                }
            }
        }
    }

    private addLitIvemIdTableRecordDefinition(definition: LitIvemIdTableRecordDefinition) {
        this._tableFrame.addRecordDefinition(definition);

        return this._tableFrame.findRecordDefinition(definition);
    }

    private processLitIvemIdFocusChange(newFocusedLitIvemId: LitIvemId) {
        if (!this._litIvemIdApplying) {
            if (newFocusedLitIvemId !== undefined) {
                this._currentFocusedLitIvemIdSetting = true;
                try {
                    this.applyDitemLitIvemIdFocus(newFocusedLitIvemId, true);
                } finally {
                    this._currentFocusedLitIvemIdSetting = false;
                }
            }
        }
    }

    private checkConfirmPrivateWatchListCanBeDiscarded(): boolean {
        if (!this._tableFrame.isPrivate() || this._tableFrame.recordCount === 0) {
            return true;
        } else {
            return true;
            // todo
        }
    }

    private newPrivateTable(keepCurrentLayout: boolean) {
        const portfolioTableDefinition = this._tablesService.definitionFactory.createPortfolio();
        this._tableFrame.newPrivateTable(portfolioTableDefinition, keepCurrentLayout);
        this.updateWatchlistDescription();
    }

    private openRecordDefinitionList(listId: Guid, keepCurrentLayout: boolean) {
        const portfolioTableDefinition = this._tablesService.definitionFactory.createPortfolioFromId(listId);
        this._tableFrame.newPrivateTable(portfolioTableDefinition, keepCurrentLayout);
        this.updateWatchlistDescription();
    }

    private updateWatchlistDescription() {
        const description = this._tableFrame.calculateDescription();

        this.notifyNewTable(description);
        // RefreshCaption;
    }
}

export namespace WatchlistDitemFrame {
    export type TableDescription = GridFrame.Description;

    export namespace JsonName {
        export const content = 'content';
    }

    export type NotifySaveLayoutConfigEventHandler = (this: void) => void;
    export type NewTableEvent = (description: TableDescription) => void;
    export type LitIvemIdAcceptedEvent = (litIvemId: LitIvemId) => void;
    export type RecordFocusEvent = (newRecordIndex: Integer | undefined) => void;
}
