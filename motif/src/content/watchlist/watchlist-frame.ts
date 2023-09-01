/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgridBehavioredColumnSettings,
    AssertInternalError,
    CellPainterFactoryService,
    GridField,
    GridLayoutOrNamedReferenceDefinition,
    GridRowOrderDefinition,
    GridSourceDefinition,
    GridSourceOrNamedReference,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    JsonRankedLitIvemIdListDefinition,
    JsonScoredRankedLitIvemIdList,
    LitIvemId,
    NamedGridLayoutsService,
    NamedGridSourcesService,
    RankedLitIvemId,
    RankedLitIvemIdList,
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListOrReferenceDefinition,
    RankedLitIvemIdListReferentialsService,
    RankedLitIvemIdListTableRecordSource,
    RenderValueRecordGridCellPainter,
    SettingsService,
    TableRecordSourceDefinitionFactoryService,
    TableRecordSourceFactoryService,
    TextHeaderCellPainter,
    TextRenderValueCellPainter,
    compareInteger,
    newGuid
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from 'revgrid';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class WatchlistFrame extends DelayedBadnessGridSourceFrame {
    defaultLitIvemIds: readonly LitIvemId[] | undefined;

    gridSourceOpenedEventer: WatchlistFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: WatchlistFrame.RecordFocusedEventer | undefined
    saveRequiredEventer: WatchlistFrame.SaveRequiredEventer | undefined;
    setGridHostFlexBasisEventer: WatchlistFrame.SetGridHostFlexBasisEventer;

    private _litIvemIdList: RankedLitIvemIdList;
    private _recordSource: RankedLitIvemIdListTableRecordSource;
    private _fixedRowCount: Integer | undefined;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;

    constructor(
        settingsService: SettingsService,
        private readonly _rankedLitIvemIdListReferentialsService: RankedLitIvemIdListReferentialsService,
        namedGridLayoutsService: NamedGridLayoutsService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        namedGridSourcesService: NamedGridSourcesService,
        cellPainterFactoryService: CellPainterFactoryService,
    ) {
        super(
            settingsService,
            namedGridLayoutsService,
            tableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactoryService,
            namedGridSourcesService,
            cellPainterFactoryService,
        );
    }

    get userCanAdd() { return this._litIvemIdList.userCanAdd; }
    get userCanReplace() { return this._litIvemIdList.userCanReplace; }
    get userCanRemove() { return this._litIvemIdList.userCanRemove; }
    get lockedRankedLitIvemIdList() { return this._recordSource.lockedRankedLitIvemIdList; }
    get fixedRowCount() { return this._fixedRowCount; }
    set fixedRowCount(value: Integer | undefined) {
        if (value !== this._fixedRowCount) {
            this._fixedRowCount = value;
            this.updateFlexBasis();
        }
    }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            { fixedColumnCount: 1 },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this.cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this.cellPainterFactoryService.createTextRenderValueRecordGrid(grid, grid.mainDataServer);

        return grid;
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
        const listOrNamedReferenceDefinition = new RankedLitIvemIdListOrReferenceDefinition(listDefinition);
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
            const id = newGuid();
            jsonRankedLitIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(id, '', '', '', newLitIvemIds);
            this.notifySaveRequired();
        } else {
            if (as.id !== undefined) {
                const referentialLockResult = this._rankedLitIvemIdListReferentialsService.tryLockItemByKey(as.id, this.opener);
                if (referentialLockResult.isOk()) {
                    const referential = referentialLockResult.value;
                    if (referential !== undefined) {
                        const list = referential.lockedList;
                        if (list instanceof JsonScoredRankedLitIvemIdList) {
                            list.set(newLitIvemIds);
                            jsonRankedLitIvemIdListDefinition = list.createDefinition();
                        }
                    }
                }
            }

            if (jsonRankedLitIvemIdListDefinition === undefined) {
                const id = newGuid();
                const namedJsonRankedLitIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(id, as.name, '', '', newLitIvemIds);
                this._rankedLitIvemIdListReferentialsService.new(namedJsonRankedLitIvemIdListDefinition);
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
            this.gridSourceOpenedEventer(litIvemIdList, this._recordSource.lockedRankedLitIvemIdList.name);
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
            const id = newGuid();
            const litIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(id, '', '', '', litIvemIds);
            return this.createGridSourceOrNamedReferenceDefinitionFromList(litIvemIdListDefinition, undefined, undefined);
        }
    }

    private createEmptyGridSourceOrNamedReferenceDefinition() {
        const id = newGuid();
        const litIvemIds: readonly LitIvemId[] = [];
        const litIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(id, '', '', '', litIvemIds);
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
            const gridHorizontalScrollbarMarginedHeight = this.gridHorizontalScrollbarInsideOverlap;
            const height = headerHeight + rowHeight + gridHorizontalScrollbarMarginedHeight;
            this.setGridHostFlexBasisEventer(height);
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
    export type GridSourceOpenedEventer = (this: void, rankedLitIvemIdList: RankedLitIvemIdList, rankedLitIvemIdListName: string | undefined) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type SaveRequiredEventer = (this: void) => void;
    export type SetGridHostFlexBasisEventer = (this: void, value: number) => void;

    export namespace WatchlistJsonName {
        export const keptLayout = 'keptLayout';
    }
}
