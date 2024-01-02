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
    GridLayoutOrReferenceDefinition,
    GridRowOrderDefinition,
    GridSourceDefinition,
    GridSourceOrReference,
    GridSourceOrReferenceDefinition,
    Integer,
    LitIvemId,
    LitIvemIdArrayRankedLitIvemIdListDefinition,
    RankedLitIvemId,
    RankedLitIvemIdList,
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListTableRecordSource,
    ReferenceableGridLayoutsService,
    ReferenceableGridSourceDefinitionsStoreService,
    ReferenceableGridSourcesService,
    RenderValueRecordGridCellPainter,
    SettingsService,
    TableRecordSourceDefinition,
    TableRecordSourceDefinitionFactoryService,
    TableRecordSourceFactoryService,
    TextHeaderCellPainter,
    TextRenderValueCellPainter,
    compareInteger
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from 'revgrid';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class WatchlistFrame extends DelayedBadnessGridSourceFrame {
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
        namedGridLayoutsService: ReferenceableGridLayoutsService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        private readonly _referenceableGridSourceDefinitionsStoreService: ReferenceableGridSourceDefinitionsStoreService,
        referenceableGridSourcesService: ReferenceableGridSourcesService,
        cellPainterFactoryService: CellPainterFactoryService,
    ) {
        super(
            settingsService,
            namedGridLayoutsService,
            tableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactoryService,
            referenceableGridSourcesService,
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
    get focusedRowColoredAllowed() { return this._gridMainCellPainter.focusedRowColoredAllowed; }
    set focusedRowColoredAllowed(value: boolean) {
        this._gridMainCellPainter.focusedRowColoredAllowed = value;
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

    tryOpenLitIvemIdArray(litIvemIds: readonly LitIvemId[], keepView: boolean) {
        const definition = this.createGridSourceOrReferenceDefinitionFromLitIvemIds(litIvemIds);
        return this.tryOpenGridSource(definition, keepView);
    }

    createGridSourceOrReferenceDefinitionFromList(
        listDefinition: RankedLitIvemIdListDefinition,
        gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition | undefined,
        rowOrderDefinition: GridRowOrderDefinition | undefined,
    ) {
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createRankedLitIvemIdList(
            TableRecordSourceDefinition.TypeId.Watchlist,
            listDefinition
        );
        const gridSourceDefinition = new GridSourceDefinition(
            tableRecordSourceDefinition,
            gridLayoutOrReferenceDefinition,
            rowOrderDefinition,
        );
        return new GridSourceOrReferenceDefinition(gridSourceDefinition);
    }

    async saveGridSourceAs(as: GridSourceOrReferenceDefinition.SaveAsDefinition): Promise<void> {
        const oldLitIvemIdList = this._litIvemIdList;
        const count = oldLitIvemIdList.count;
        const rankedLitIvemIds = new Array<RankedLitIvemId>(count);
        for (let i = 0; i < count; i++) {
            rankedLitIvemIds[i] = oldLitIvemIdList.getAt(i);
        }

        rankedLitIvemIds.sort((left, right) => compareInteger(left.rank, right.rank));
        const newLitIvemIds = rankedLitIvemIds.map((rankedLitIvemId) => rankedLitIvemId.litIvemId);

        let gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition | undefined;
        let rowOrderDefinition: GridRowOrderDefinition | undefined;
        if (as.tableRecordSourceOnly) {
            gridLayoutOrReferenceDefinition = undefined;
            rowOrderDefinition = undefined;
        } else {
            gridLayoutOrReferenceDefinition = this.createGridLayoutOrReferenceDefinition();
            rowOrderDefinition = this.createRowOrderDefinition();
        }

        let litIvemIdArrayRankedLitIvemIdListDefinition: LitIvemIdArrayRankedLitIvemIdListDefinition | undefined;
        if (as.name === undefined) {
            litIvemIdArrayRankedLitIvemIdListDefinition = new LitIvemIdArrayRankedLitIvemIdListDefinition('', '', '', newLitIvemIds);
            this.notifySaveRequired();
        } else {
            litIvemIdArrayRankedLitIvemIdListDefinition = new LitIvemIdArrayRankedLitIvemIdListDefinition('', '', '', newLitIvemIds); // remove when implemented
            // if (as.id !== undefined) {
            //     const referentialLockResult = await this._referenceableGridSourceDefinitionsStoreService.tryLockItemByKey(as.id, this.opener);
            //     if (referentialLockResult.isOk()) {
            //         const referential = referentialLockResult.value;
            //         if (referential !== undefined) {
            //             const list = referential.lockedList;
            //             if (list instanceof JsonScoredRankedLitIvemIdList) {
            //                 list.set(newLitIvemIds);
            //                 jsonRankedLitIvemIdListDefinition = list.createDefinition();
            //             }
            //         }
            //     }
            // }

            // if (jsonRankedLitIvemIdListDefinition === undefined) {
            //     const namedJsonRankedLitIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(as.name, '', '', newLitIvemIds);
            //     this._referenceableGridSourceDefinitionsStoreService.new(namedJsonRankedLitIvemIdListDefinition);
            //     jsonRankedLitIvemIdListDefinition = namedJsonRankedLitIvemIdListDefinition;
            // }
        }

        const definition = this.createGridSourceOrReferenceDefinitionFromList(
            litIvemIdArrayRankedLitIvemIdListDefinition,
            gridLayoutOrReferenceDefinition,
            rowOrderDefinition,
        );

        const gridSourceOrReferencePromise = this.tryOpenGridSource(definition, true);
        AssertInternalError.throwErrorIfPromiseRejected(gridSourceOrReferencePromise, 'WFSGSA49991', `${this.opener.lockerName}: ${as.name ?? ''}`);

        return Promise.resolve(undefined); // remove when fixed
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

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createGridSourceOrReferenceDefinitionFromLitIvemIds([]);
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrReference: GridSourceOrReference) {
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

    private createGridSourceOrReferenceDefinitionFromLitIvemIds(litIvemIds: readonly LitIvemId[]) {
        const litIvemIdListDefinition = new LitIvemIdArrayRankedLitIvemIdListDefinition('', '', '', litIvemIds);
        return this.createGridSourceOrReferenceDefinitionFromList(litIvemIdListDefinition, undefined, undefined);
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
