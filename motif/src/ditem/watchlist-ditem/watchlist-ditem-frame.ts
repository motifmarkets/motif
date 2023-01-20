/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    CommandRegisterService,
    compareInteger,
    FavouriteNamedGridLayoutDefinitionReferencesService,
    GridLayout,
    GridLayoutOrNamedReferenceDefinition,
    GridRowOrderDefinition,
    GridSourceDefinition,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    JsonElement,
    JsonRankedLitIvemIdListDefinition,
    LitIvemId,
    NamedJsonRankedLitIvemIdListDefinition,
    NamedJsonRankedLitIvemIdListsService,
    newGuid,
    RankedLitIvemId,
    RankedLitIvemIdList,
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListOrNamedReferenceDefinition,
    RankedLitIvemIdListTableRecordSource,
    SymbolsService,
    TableRecordSourceDefinitionFactoryService
} from '@motifmarkets/motif-core';
import { GridSourceFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class WatchlistDitemFrame extends BuiltinDitemFrame {
    defaultLitIvemIds: readonly LitIvemId[] | undefined;

    private _litIvemIdList: RankedLitIvemIdList;
    private _gridSourceFrame: GridSourceFrame;
    private _recordSource: RankedLitIvemIdListTableRecordSource;

    private _litIvemIdApplying = false;
    private _currentFocusedLitIvemIdSetting = false;

    constructor(
        componentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _namedJsonRankedLitIvemIdListsService: NamedJsonRankedLitIvemIdListsService,
        private readonly _favouriteNamedGridLayoutDefinitionReferencesService: FavouriteNamedGridLayoutDefinitionReferencesService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _gridSourceOpenedEventer: WatchlistDitemFrame.GridSourceOpenedEventer,
        private readonly _recordFocusedEventer: WatchlistDitemFrame.RecordFocusedEventer,
        private readonly _gridLayoutSetEventer: WatchlistDitemFrame.GridLayoutSetEventer,
        private readonly _litIvemIdAcceptedEventer: WatchlistDitemFrame.LitIvemIdAcceptedEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Watchlist, componentAccess,
            commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._gridSourceFrame !== undefined; }
    get recordFocused() { return this._gridSourceFrame.recordFocused; }

    initialise(gridSourceFrame: GridSourceFrame, frameElement: JsonElement | undefined): void {
        this._gridSourceFrame = gridSourceFrame;
        this._gridSourceFrame.opener = this.opener;
        this._gridSourceFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);

        let gridSourceOrNamedReferenceDefinition: GridSourceOrNamedReferenceDefinition;
        if (frameElement === undefined) {
            gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
        } else {
            const contentElementResult = frameElement.tryGetElementType(WatchlistDitemFrame.JsonName.content);
            if (contentElementResult.isErr()) {
                gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
            } else {
                const definitionResult = GridSourceOrNamedReferenceDefinition.tryCreateFromJson(
                    this._tableRecordSourceDefinitionFactoryService,
                    contentElementResult.value,
                );
                if (definitionResult.isOk()) {
                    gridSourceOrNamedReferenceDefinition = definitionResult.value;
                } else {
                    gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
                    // Temporary error toast
                }
            }
        }

        this.tryOpenGridSource(gridSourceOrNamedReferenceDefinition, false);

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(WatchlistDitemFrame.JsonName.content);
        const definition = this._gridSourceFrame.createGridSourceOrNamedReferenceDefinition();
        definition.saveToJson(contentElement);
    }

    tryOpenGridSource(definition: GridSourceOrNamedReferenceDefinition, keepView: boolean) {
        const gridSourceOrNamedReference = this._gridSourceFrame.open(definition, keepView);
        if (gridSourceOrNamedReference !== undefined) {
            const table = this._gridSourceFrame.openedTable;
            this._recordSource = table.recordSource as RankedLitIvemIdListTableRecordSource;
            this._litIvemIdList = this._recordSource.lockedRankedLitIvemIdList;
            const rankedLitIvemIdListName = this._recordSource.lockedNamedRankedLitIvemIdList?.name;
            this.updateLockerName(rankedLitIvemIdListName ?? '');
            this._gridSourceOpenedEventer(this._recordSource.lockedRankedLitIvemIdList, rankedLitIvemIdListName);
        }
    }

    openGridLayoutOrNamedReferenceDefinition(gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition) {
        this._gridSourceFrame.openGridLayoutOrNamedReferenceDefinition(gridLayoutOrNamedReferenceDefinition);
    }

    createAllowedFieldsAndLayoutDefinition() {
        return this._gridSourceFrame.createAllowedFieldsAndLayoutDefinition();
    }

    canDeleteFocusedRecord() {
        return this._litIvemIdList.userCanRemove;
    }

    deleteFocusedSymbol() {
        const index = this._gridSourceFrame.getFocusedRecordIndex();
        if (index === undefined) {
            throw new AssertInternalError('WDFDFS01023');
        } else {
            this._litIvemIdList.userRemoveAt(index, 1);
        }
    }

    newEmpty() {
        const definition = this.createEmptyGridSourceOrNamedReferenceDefinition();
        this.tryOpenGridSource(definition, false);
    }

    saveAs(as: GridSourceOrNamedReferenceDefinition.SaveAsDefinition) {
        const oldLitIvemIdList = this._litIvemIdList;
        const count = oldLitIvemIdList.count;
        const rankedLitIvemIds = new Array<RankedLitIvemId>(count);
        for (let i = 0; i < count; i++) {
            rankedLitIvemIds[i] = oldLitIvemIdList.getAt(i);
        }

        rankedLitIvemIds.sort((left, right) => compareInteger(left.rank, right.rank));
        const newLitIvemIds = rankedLitIvemIds.map((rankedLitIvemId) => rankedLitIvemId.litIvemId);

        let gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition | undefined;
        let rowOrderDefinition: GridRowOrderDefinition | undefined;
        if (as.tableRecordSourceOnly) {
            gridLayoutOrNamedReferenceDefinition = undefined;
            rowOrderDefinition = undefined;
        } else {
            gridLayoutOrNamedReferenceDefinition = this._gridSourceFrame.createGridLayoutOrNamedReferenceDefinition();
            rowOrderDefinition = this._gridSourceFrame.createRowOrderDefinition();
        }

        let jsonRankedLitIvemIdListDefinition: JsonRankedLitIvemIdListDefinition | undefined;
        if (as.name === undefined) {
            jsonRankedLitIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(newLitIvemIds);
            this.flagSaveRequired();
        } else {
            if (as.id !== undefined) {
                const list = this._namedJsonRankedLitIvemIdListsService.getItemByKey(as.id);
                if (list !== undefined) {
                    list.set(newLitIvemIds);
                    jsonRankedLitIvemIdListDefinition = list.createDefinition();
                }
            }

            if (jsonRankedLitIvemIdListDefinition === undefined) {
                const id = newGuid();
                const namedJsonRankedLitIvemIdListDefinition = new NamedJsonRankedLitIvemIdListDefinition(id, as.name, newLitIvemIds);
                this._namedJsonRankedLitIvemIdListsService.new(namedJsonRankedLitIvemIdListDefinition);
                jsonRankedLitIvemIdListDefinition = namedJsonRankedLitIvemIdListDefinition;
            }
        }

        const definition = this.createGridSourceOrNamedReferenceDefinitionFromList(
            jsonRankedLitIvemIdListDefinition,
            gridLayoutOrNamedReferenceDefinition,
            rowOrderDefinition,
        );

        this.tryOpenGridSource(definition, true);
    }

    // saveAsPrivate() {
    //     const oldLitIvemIdList = this._litIvemIdList;
    //     const count = oldLitIvemIdList.count;
    //     const rankedLitIvemIds = new Array<RankedLitIvemId>(count);
    //     for (let i = 0; i < count; i++) {
    //         rankedLitIvemIds[i] = oldLitIvemIdList.getAt(i);
    //     }

    //     rankedLitIvemIds.sort((left, right) => compareInteger(left.rank, right.rank));
    //     const newLitIvemIds = rankedLitIvemIds.map((rankedLitIvemId) => rankedLitIvemId.litIvemId);

    //     const definition = this.createGridSourceOrNamedReferenceDefinitionFromList(
    //         jsonRankedLitIvemIdListDefinition,
    //         this._gridSourceFrame.createLayoutOrNamedReferenceDefinition(),
    //         this._gridSourceFrame.createRowOrderDefinition(),
    //     );

    //     this.tryOpenGridSource(definition, true);
    //     this.flagSaveRequired();
    // }

    // saveAsLitIvemIdList(listDefinition: LitIvemIdListDefinition) {
    //     const recordSourceDefinition = new LitIvemIdFromListTableRecordSourceDefinition(listDefinition);
    //     this._gridSourceFrame.saveAsRecordSourceDefinition(recordSourceDefinition);
    // }

    // saveAsGridSource(definition: GridSourceDefinition) {
    //     this._gridSourceFrame.saveAsGridSource(definition);
    // }

    autoSizeAllColumnWidths() {
        this._gridSourceFrame.autoSizeAllColumnWidths();
    }

    tryIncludeLitIvemIds(litIvemIds: LitIvemId[], focusFirst: boolean) {
        if (litIvemIds.length === 0) {
            return true;
        } else {
            if (this._currentFocusedLitIvemIdSetting) {
                return false;
            } else {
                this._litIvemIdApplying = true;
                try {
                    return this.addLitIvemIds(litIvemIds, focusFirst);
                } finally {
                    this._litIvemIdApplying = false;
                }
            }
        }
    }

    protected override applyLitIvemId(litIvemId: LitIvemId | undefined, selfInitiated: boolean): boolean { // override
        if (this._currentFocusedLitIvemIdSetting || litIvemId === undefined) {
            return false;
        } else {
            let result: boolean;
            this._litIvemIdApplying = true;
            try {
                const existingIndex = this.indexOfRecordByLitIvemId(litIvemId);

                if (existingIndex >= 0) {
                    this._gridSourceFrame.focusItem(existingIndex);
                    result = super.applyLitIvemId(litIvemId, selfInitiated);
                } else {
                    if (!selfInitiated || !this._litIvemIdList.userCanAdd) {
                        result = false;
                    } else {
                        const addIndex = this._litIvemIdList.userAdd(litIvemId);
                        this._gridSourceFrame.focusItem(addIndex);
                        result = super.applyLitIvemId(litIvemId, selfInitiated);
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
            const litIvemId = this._litIvemIdList.getAt(newRecordIndex).litIvemId;
            this.processLitIvemIdFocusChange(litIvemId);
        }
        this._recordFocusedEventer(newRecordIndex);
    }

    // private handleTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
    //     this._recordDefinitionList = recordDefinitionList as PortfolioTableRecordDefinitionList;
    // }

    // private notifyNewTable(description: WatchlistDitemFrame.TableDescription) {
    //     this.loadGridSourceEvent(description);
    // }

    private notifyLitIvemIdAccepted(litIvemId: LitIvemId) {
        this._litIvemIdAcceptedEventer(litIvemId);
    }

    private createGridSourceOrNamedReferenceDefinitionFromList(
        listDefinition: RankedLitIvemIdListDefinition,
        gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition | undefined,
        rowOrderDefinition: GridRowOrderDefinition | undefined,
    ) {
        const listOrNamedReferenceDefinition = new RankedLitIvemIdListOrNamedReferenceDefinition(listDefinition);
        const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createRankedLitIvemIdList(
            listOrNamedReferenceDefinition
        );
        const gridSourceDefinition = new GridSourceDefinition(
            tableRecordSourceDefinition,
            gridLayoutOrNamedReferenceDefinition,
            rowOrderDefinition,
        );
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    }

    private createDefaultGridSourceOrNamedReferenceDefinition() {
        const litIvemIds: readonly LitIvemId[] = this.defaultLitIvemIds ?? [];
        const litIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(litIvemIds);
        return this.createGridSourceOrNamedReferenceDefinitionFromList(litIvemIdListDefinition, undefined, undefined);
    }

    private createEmptyGridSourceOrNamedReferenceDefinition() {
        const litIvemIds: readonly LitIvemId[] = [];
        const litIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(litIvemIds);
        return this.createGridSourceOrNamedReferenceDefinitionFromList(litIvemIdListDefinition, undefined, undefined);
    }

    private indexOfRecordByLitIvemId(litIvemId: LitIvemId): Integer {
        const list = this._litIvemIdList;
        const count = list.count;
        for (let i = 0; i < count; i++) {
            const rankedLitIvemId = list.getAt(i);
            if (LitIvemId.isEqual(rankedLitIvemId.litIvemId, litIvemId)) {
                return i;
            }
        }
        return -1;
    }

    private addLitIvemIds(litIvemIds: LitIvemId[], focusFirst: boolean) {
        let wantFocus = focusFirst;
        let result = false;
        const count = litIvemIds.length;

        const canAdd = this._litIvemIdList.userCanAdd;
        for (let i = 0; i < count; i++) {
            const litIvemId = litIvemIds[i];
            let existingIndexOrAddIndex = this.indexOfRecordByLitIvemId(litIvemId);
            if (existingIndexOrAddIndex < 0) {
                if (canAdd) {
                    existingIndexOrAddIndex = this._litIvemIdList.userAdd(litIvemId);
                } else {
                    existingIndexOrAddIndex = -1;
                }
            }
            if (existingIndexOrAddIndex >= 0) {
                result = true;

                if (wantFocus) {
                    this._gridSourceFrame.focusItem(existingIndexOrAddIndex);
                    wantFocus = false;
                }
            }
        }
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
        if (this._gridSourceFrame.isNamed || this._gridSourceFrame.recordCount === 0) {
            return true;
        } else {
            return true;
            // todo
        }
    }

    // private openRecordDefinitionList(listId: Guid, keepCurrentLayout: boolean) {
    //     const portfolioTableDefinition = this._tablesService.definitionFactory.createPortfolioFromId(listId);
    //     this._gridSourceFrame.newPrivateTable(portfolioTableDefinition, keepCurrentLayout);
    //     this.updateWatchlistDescription();
    // }
}

export namespace WatchlistDitemFrame {
    export type TableDescription = GridSourceFrame.Description;

    export namespace JsonName {
        export const content = 'content';
    }

    export type NotifySaveLayoutConfigEventHandler = (this: void) => void;
    export type GridSourceOpenedEventer = (
        this: void,
        rankedLitIvemIdList: RankedLitIvemIdList,
        rankedLitIvemIdListName: string | undefined
    ) => void;
    export type LitIvemIdAcceptedEventer = (this: void, litIvemId: LitIvemId) => void;
    export type GridLayoutSetEventer = (this: void, layout: GridLayout) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
}
