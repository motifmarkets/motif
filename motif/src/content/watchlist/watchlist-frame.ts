/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    compareInteger,
    GridLayoutOrNamedReferenceDefinition,
    GridRowOrderDefinition,
    GridSourceDefinition,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    JsonElement,
    JsonRankedLitIvemIdListDefinition,
    LitIvemId,
    NamedGridLayoutsService,
    NamedGridSourcesService,
    NamedJsonRankedLitIvemIdListDefinition,
    NamedJsonRankedLitIvemIdListsService,
    newGuid,
    RankedLitIvemId,
    RankedLitIvemIdList,
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListOrNamedReferenceDefinition,
    RankedLitIvemIdListTableRecordSource,
    SettingsService,
    TableRecordSourceDefinitionFactoryService,
    TableRecordSourceFactoryService
} from '@motifmarkets/motif-core';
import { GridSourceFrame } from '../grid-source/internal-api';

export class WatchlistFrame extends GridSourceFrame {
    saveRequiredEventer: WatchlistFrame.SaveRequiredEventer | undefined;

    private _litIvemIdList: RankedLitIvemIdList;
    private _recordSource: RankedLitIvemIdListTableRecordSource;
    private _fixedRowCount: Integer | undefined;

    constructor(
        componentAccess: GridSourceFrame.ComponentAccess,
        settingsService: SettingsService,
        private readonly _namedJsonRankedLitIvemIdListsService: NamedJsonRankedLitIvemIdListsService,
        namedGridLayoutsService: NamedGridLayoutsService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        namedGridSourcesService: NamedGridSourcesService,
    ) {
        super(componentAccess, settingsService, namedGridLayoutsService, tableRecordSourceFactoryService, namedGridSourcesService);
    }

    get userCanAdd() { return this._litIvemIdList.userCanAdd; }
    get userCanReplace() { return this._litIvemIdList.userCanReplace; }
    get userCanRemove() { return this._litIvemIdList.userCanRemove; }
    get lockedNamedRankedLitIvemIdList() { return this._recordSource.lockedNamedRankedLitIvemIdList; }
    get lockedRankedLitIvemIdList() { return this._recordSource.lockedRankedLitIvemIdList; }

    initialise(element: JsonElement | undefined, keepPreviousLayoutIfPossible: boolean, fixedRowCount: Integer | undefined) {
        if (element !== undefined) {
            const keptLayoutElementResult = element.tryGetElement(WatchlistFrame.WatchlistJsonName.keptLayout);
            if (keptLayoutElementResult.isOk()) {
                const keptLayoutElement = keptLayoutElementResult.value;
                const keptLayoutResult = GridLayoutOrNamedReferenceDefinition.tryCreateFromJson(keptLayoutElement);
                if (keptLayoutResult.isOk()) {
                    this.keptGridLayoutOrNamedReferenceDefinition = keptLayoutResult.value;
                }
            }
        }
        this.keepPreviousLayoutIfPossible = keepPreviousLayoutIfPossible;

        this._fixedRowCount = fixedRowCount;

        this.applySettings();
    }

    createGridSourceOrNamedReferenceDefinitionFromList(
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

    override tryOpenGridSource(definition: GridSourceOrNamedReferenceDefinition, keepView: boolean) {
        const gridSourceOrNamedReference = super.tryOpenGridSource(definition, keepView);
        if (gridSourceOrNamedReference !== undefined) {
            const table = this.openedTable;
            this._recordSource = table.recordSource as RankedLitIvemIdListTableRecordSource;
            this._litIvemIdList = this._recordSource.lockedRankedLitIvemIdList;
        }
        return gridSourceOrNamedReference;
    }

    saveGridSourceAs(as: GridSourceOrNamedReferenceDefinition.SaveAsDefinition) {
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
            gridLayoutOrNamedReferenceDefinition = this.createGridLayoutOrNamedReferenceDefinition();
            rowOrderDefinition = this.createRowOrderDefinition();
        }

        let jsonRankedLitIvemIdListDefinition: JsonRankedLitIvemIdListDefinition | undefined;
        if (as.name === undefined) {
            jsonRankedLitIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(newLitIvemIds);
            this.notifySaveRequired();
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

    saveLayout(element: JsonElement) {
        const keptLayoutElement = element.newElement(WatchlistFrame.WatchlistJsonName.keptLayout);
        const layoutDefinition = this.createGridLayoutOrNamedReferenceDefinition();
        layoutDefinition.saveToJson(keptLayoutElement);
    }

    getAt(index: Integer) {
        return this._litIvemIdList.getAt(index);
    }

    addLitIvemIds(litIvemIds: LitIvemId[], focusFirst: boolean) {
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
                    this.focusItem(existingIndexOrAddIndex);
                    wantFocus = false;
                }
            }
        }

        return result;
    }

    userAdd(litIvemId: LitIvemId) {
        return this._litIvemIdList.userAdd(litIvemId);
    }

    userReplaceAt(index: Integer, litIvemIds: LitIvemId[]) {
        return this._litIvemIdList.userReplaceAt(index, litIvemIds);
    }

    deleteFocusedRecord() {
        const index = this.getFocusedRecordIndex();
        if (index === undefined) {
            throw new AssertInternalError('WFDFS01023');
        } else {
            this._litIvemIdList.userRemoveAt(index, 1);
        }
    }

    tryFocus(litIvemId: LitIvemId, tryAddIfNotExist: boolean): boolean {
        const existingIndex = this.indexOfRecordByLitIvemId(litIvemId);

        if (existingIndex >= 0) {
            this.focusItem(existingIndex);
            return true;
        } else {
            if (!tryAddIfNotExist || !this.userCanAdd) {
                return false;
            } else {
                const addIndex = this.userAdd(litIvemId);
                this.focusItem(addIndex);
                return true;
            }
        }
    }

    protected override applySettings() {
        super.applySettings();

        if (this._fixedRowCount !== undefined) {
            // process settings change here to ensure grid has been updated
            const rowHeight = this.gridRowHeight * this._fixedRowCount;
            const headerHeight = this.calculateHeaderPlusFixedRowsHeight();
            const gridHorizontalScrollbarMarginedHeight = this.gridHorizontalScrollbarMarginedHeight;
            const height = headerHeight + rowHeight + gridHorizontalScrollbarMarginedHeight;
            this.setFlexBasis(height);
        }
    }

    private notifySaveRequired() {
        if (this.saveRequiredEventer !== undefined) {
            this.saveRequiredEventer();
        }
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
}


export namespace WatchlistFrame {
    export type SaveRequiredEventer = (this: void) => void;

    export namespace WatchlistJsonName {
        export const keptLayout = 'keptLayout';
    }

    export interface ComponentAccess extends GridSourceFrame.ComponentAccess {

    }
}
