/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    compareInteger,
    GridField,
    GridLayoutOrNamedReferenceDefinition,
    GridRowOrderDefinition,
    GridSourceDefinition,
    GridSourceOrNamedReference,
    GridSourceOrNamedReferenceDefinition,
    Integer,
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
    TableRecordSourceFactoryService,
    TextFormatterService
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from 'revgrid';
import { AdaptedRevgridBehavioredColumnSettings, HeaderTextCellPainter, RecordGridMainTextCellPainter } from '../adapted-revgrid/internal-api';
import { GridSourceFrame } from '../grid-source/internal-api';

export class WatchlistFrame extends GridSourceFrame {
    defaultLitIvemIds: readonly LitIvemId[] | undefined;

    gridSourceOpenedEventer: WatchlistFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: WatchlistFrame.RecordFocusedEventer | undefined
    saveRequiredEventer: WatchlistFrame.SaveRequiredEventer | undefined;

    private _litIvemIdList: RankedLitIvemIdList;
    private _recordSource: RankedLitIvemIdListTableRecordSource;
    private _fixedRowCount: Integer | undefined;

    private _gridHeaderCellPainter: HeaderTextCellPainter;
    private _gridMainCellPainter: RecordGridMainTextCellPainter;

    constructor(
        settingsService: SettingsService,
        private readonly _namedJsonRankedLitIvemIdListsService: NamedJsonRankedLitIvemIdListsService,
        textFormatterService: TextFormatterService,
        namedGridLayoutsService: NamedGridLayoutsService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        namedGridSourcesService: NamedGridSourcesService,
        componentAccess: GridSourceFrame.ComponentAccess,
        hostElement: HTMLElement,
    ) {
        super(
            settingsService,
            namedGridLayoutsService,
            tableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactoryService,
            namedGridSourcesService,
            componentAccess,
            hostElement,
            { fixedColumnCount: 1 },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
            (viewCell) => this.getGridMainCellPainter(viewCell),
        );

        const grid = this.grid;
        this._gridHeaderCellPainter = new HeaderTextCellPainter(settingsService, grid, grid.headerDataServer);
        this._gridMainCellPainter = new RecordGridMainTextCellPainter(settingsService, textFormatterService, grid, grid.mainDataServer);

    }

    get userCanAdd() { return this._litIvemIdList.userCanAdd; }
    get userCanReplace() { return this._litIvemIdList.userCanReplace; }
    get userCanRemove() { return this._litIvemIdList.userCanRemove; }
    get lockedNamedRankedLitIvemIdList() { return this._recordSource.lockedNamedRankedLitIvemIdList; }
    get lockedRankedLitIvemIdList() { return this._recordSource.lockedRankedLitIvemIdList; }
    get fixedRowCount() { return this._fixedRowCount; }
    set fixedRowCount(value: Integer | undefined) {
        if (value !== this._fixedRowCount) {
            this._fixedRowCount = value;
            this.updateFlexBasis();
        }
    }

    newEmpty(keepView: boolean) {
        const definition = this.createEmptyGridSourceOrNamedReferenceDefinition();
        this.tryOpenGridSource(definition, keepView);
    }

    createGridSourceOrNamedReferenceDefinitionFromList(
        listDefinition: RankedLitIvemIdListDefinition,
        gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition | undefined,
        rowOrderDefinition: GridRowOrderDefinition | undefined,
    ) {
        const listOrNamedReferenceDefinition = new RankedLitIvemIdListOrNamedReferenceDefinition(listDefinition);
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createRankedLitIvemIdList(
            listOrNamedReferenceDefinition
        );
        const gridSourceDefinition = new GridSourceDefinition(
            tableRecordSourceDefinition,
            gridLayoutOrNamedReferenceDefinition,
            rowOrderDefinition,
        );
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
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

        this.updateFlexBasis();
    }

    protected override getDefaultGridSourceOrNamedReferenceDefinition() {
        return this.createGridSourceOrNamedReferenceDefinitionFromLitIvemIds(this.defaultLitIvemIds);
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrNamedReference: GridSourceOrNamedReference) {
        const table = this.openedTable;
        this._recordSource = table.recordSource as RankedLitIvemIdListTableRecordSource;
        const litIvemIdList = this._recordSource.lockedRankedLitIvemIdList;
        this._litIvemIdList = litIvemIdList;
        if (this.gridSourceOpenedEventer !== undefined) {
            this.gridSourceOpenedEventer(litIvemIdList, this._recordSource.lockedNamedRankedLitIvemIdList?.name);
        }
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private notifySaveRequired() {
        if (this.saveRequiredEventer !== undefined) {
            this.saveRequiredEventer();
        }
    }

    private createGridSourceOrNamedReferenceDefinitionFromLitIvemIds(litIvemIds: readonly LitIvemId[] | undefined) {
        if (litIvemIds === undefined) {
            return this.createEmptyGridSourceOrNamedReferenceDefinition();
        } else {
            const litIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(litIvemIds);
            return this.createGridSourceOrNamedReferenceDefinitionFromList(litIvemIdListDefinition, undefined, undefined);
        }
    }

    private createEmptyGridSourceOrNamedReferenceDefinition() {
        const litIvemIds: readonly LitIvemId[] = [];
        const litIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(litIvemIds);
        return this.createGridSourceOrNamedReferenceDefinitionFromList(litIvemIdListDefinition, undefined, undefined);
    }

    private customiseSettingsForNewGridColumn(_columnSettings: AdaptedRevgridBehavioredColumnSettings) {
        // no customisation
    }

    private getGridHeaderCellPainter(_viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridHeaderCellPainter;
    }

    private getGridMainCellPainter(viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridMainCellPainter;
    }

    private updateFlexBasis() {
        if (this._fixedRowCount !== undefined) {
            // process settings change here to ensure grid has been updated
            const rowHeight = this.gridRowHeight * this._fixedRowCount;
            const headerHeight = this.calculateHeaderPlusFixedRowsHeight();
            const gridHorizontalScrollbarMarginedHeight = this.gridHorizontalScrollbarMarginedHeight;
            const height = headerHeight + rowHeight + gridHorizontalScrollbarMarginedHeight;
            this.setFlexBasis(height);
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
    export type GridSourceOpenedEventer = (
        this: void,
        rankedLitIvemIdList: RankedLitIvemIdList,
        rankedLitIvemIdListName: string | undefined
    ) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type SaveRequiredEventer = (this: void) => void;

    export namespace WatchlistJsonName {
        export const keptLayout = 'keptLayout';
    }
}
