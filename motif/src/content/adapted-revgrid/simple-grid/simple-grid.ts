import { SettingsService, UnexpectedUndefinedError } from '@motifmarkets/motif-core';
import {
    CellEvent,
    GridProperties,
    Revgrid,
    RevSimpleAdapterSet,
    RevSimpleHeaderAdapter,
    RevSimpleMainAdapter,
    RevSimpleSchemaAdapter,
    SelectionDetail,
    Subgrid
} from 'revgrid';
import { AdaptedRevgrid } from '../adapted-revgrid';
import { SimpleGridCellAdapter } from './simple-grid-cell-adapter';
import { SimpleGridCellPainter } from './simple-grid-cell-painter';

export class SimpleGrid extends AdaptedRevgrid {
    private readonly _componentAccess: SimpleGrid.ComponentAccess;

    private readonly _adapterSet: RevSimpleAdapterSet;
    private readonly _schemaAdapter: RevSimpleSchemaAdapter;
    private readonly _headerAdapter: RevSimpleHeaderAdapter;
    private readonly _mainAdapter: RevSimpleMainAdapter;

    private _lastNotifiedFocusedRowIndex: number | undefined;

    private _rowFocusEventer: SimpleGrid.RecordFocusEventer | undefined;
    private _mainClickEventer: SimpleGrid.MainClickEventer | undefined;
    private _mainDblClickEventer: SimpleGrid.MainDblClickEventer | undefined;

    private readonly _selectionChangedListener: (event: CustomEvent<SelectionDetail>) => void;
    private readonly _clickListener: (event: CustomEvent<CellEvent>) => void;
    private readonly _dblClickListener: (event: CustomEvent<CellEvent>) => void;

    constructor(
        componentAccess: SimpleGrid.ComponentAccess,
        settingsService: SettingsService,
        gridElement: HTMLElement,
        cellPainter: SimpleGridCellPainter,
        gridProperties: Partial<GridProperties>
    ) {
        const adapterSet = new RevSimpleAdapterSet();
        const schemaAdapter = adapterSet.schemaAdapter;
        const headerAdapter = adapterSet.headerAdapter;
        const mainAdapter = adapterSet.mainAdapter;
        const cellAdapter = new SimpleGridCellAdapter(cellPainter);

        const options: Revgrid.Options = {
            adapterSet: {
                schemaModel: schemaAdapter,
                subgrids: [
                    {
                        role: Subgrid.RoleEnum.header,
                        dataModel: headerAdapter,
                    },
                    {
                        role: Subgrid.RoleEnum.main,
                        dataModel: mainAdapter,
                        cellModel: cellAdapter,
                    },
                ],
            },
            gridProperties,
            loadBuiltinFinbarStylesheet: false,
        };

        super(settingsService, gridElement, options);

        this._componentAccess = componentAccess;

        this._adapterSet = adapterSet;
        this._schemaAdapter = schemaAdapter;
        this._headerAdapter = headerAdapter;
        this._mainAdapter = mainAdapter;

        this._selectionChangedListener = (event) => this.handleHypegridSelectionChanged(event);
        this._clickListener = (event) => this.handleHypegridClickEvent(event);
        this._dblClickListener = (event) => this.handleHypegridDblClickEvent(event);

        this.applySettings();
        // this.applySettingsToMainRecordAdapter();

        this.allowEvents(true);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get focusedRowIndex(): number | undefined {
        const selections = this.selections;

        if (selections === null || selections.length === 0) {
            return undefined;
        } else {
            return selections[0].firstSelectedCell.y;
        }
    }

    set focusedRowIndex(rowIndex: number | undefined) {
        if (rowIndex === undefined) {
            this.clearSelections();
        } else {
            if (rowIndex === undefined) {
                this.clearSelections();
            } else {
                this.selectRows(rowIndex, rowIndex);
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get headerRowCount(): number {
        return this._headerAdapter.getRowCount();
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get rowHeight(): number {
        return this.properties.defaultRowHeight;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get rowFocusEventer() {
        return this._rowFocusEventer;
    }
    set rowFocusEventer(value: SimpleGrid.RecordFocusEventer | undefined) {
        if (this._rowFocusEventer !== undefined) {
            this.removeEventListener('rev-selection-changed', this._selectionChangedListener);
        }
        this._rowFocusEventer = value;

        if (this._rowFocusEventer !== undefined) {
            this.addEventListener('rev-selection-changed', this._selectionChangedListener);
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get mainClickEventer() {
        return this._mainClickEventer;
    }
    set mainClickEventer(value: SimpleGrid.MainClickEventer | undefined) {
        if (this._mainClickEventer !== undefined) {
            this.removeEventListener('rev-click', this._clickListener);
        }
        this._mainClickEventer = value;

        if (this._mainClickEventer !== undefined) {
            this.addEventListener('rev-click', this._clickListener);
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get mainDblClickEventer() {
        return this._mainDblClickEventer;
    }
    set mainDblClickEventer(value: SimpleGrid.MainDblClickEventer | undefined) {
        if (this._mainDblClickEventer !== undefined) {
            this.removeEventListener('rev-double-click', this._dblClickListener);
        }
        this._mainDblClickEventer = value;

        if (this._mainDblClickEventer !== undefined) {
            this.addEventListener('rev-double-click', this._dblClickListener);
        }
    }

    override reset(adapterSet?: GridProperties.AdapterSet): void {
        if (this._schemaAdapter !== undefined) {
            // will be undefined while grid is being constructed
            this._schemaAdapter.reset();
        }
        if (this._mainAdapter !== undefined) {
            // will be undefined while grid is being constructed
            this._mainAdapter.reset();
        }
        super.reset(adapterSet, undefined, false);
    }

    setData(data: RevSimpleAdapterSet.DataRow[]) {
        this._adapterSet.setData(data);
    }

    protected override applySettings() {
        const result = super.applySettings();

        this._componentAccess.applySettings();

        return result;
    }

    protected invalidateAll() {
        this._mainAdapter.invalidateAll();
    }

    private handleHypegridClickEvent(event: CustomEvent<CellEvent>): void {
        const gridY = event.detail.gridCell.y;
        if (gridY !== 0) {
            // Skip clicks to the column headers
            if (this._mainClickEventer !== undefined) {
                const rowIndex = event.detail.dataCell.y;
                if (rowIndex === undefined) {
                    throw new UnexpectedUndefinedError('MGHC89877');
                } else {
                    const fieldIndex = event.detail.dataCell.x;
                    this._mainClickEventer(fieldIndex, rowIndex);
                }
            }
        }
    }

    /** @internal */
    private handleHypegridDblClickEvent(event: CustomEvent<CellEvent>): void {
        if (event.detail.gridCell.y !== 0) {
            // Skip clicks to the column headers
            if (this._mainDblClickEventer !== undefined) {
                const rowIndex = event.detail.dataCell.y;
                if (rowIndex === undefined) {
                    throw new UnexpectedUndefinedError('MGHDC87877');
                } else {
                    this._mainDblClickEventer(event.detail.dataCell.x, rowIndex);
                }
            }
        }
    }

    /** @internal */
    private handleHypegridSelectionChanged(event: CustomEvent<SelectionDetail>) {
        const selections = event.detail.selections;

        if (selections.length === 0) {
            if (this._lastNotifiedFocusedRowIndex !== undefined) {
                const oldSelectedRowIndex = this._lastNotifiedFocusedRowIndex;
                this._lastNotifiedFocusedRowIndex = undefined;
                const rowFocusEventer = this.rowFocusEventer;
                if (rowFocusEventer !== undefined) {
                    rowFocusEventer(undefined, oldSelectedRowIndex);
                }
            }
        } else {
            const selection = selections[0];
            const newFocusedRowIndex = selection.firstSelectedCell.y;
            if (
                newFocusedRowIndex !== this._lastNotifiedFocusedRowIndex
            ) {
                const oldFocusedRowIndex = this._lastNotifiedFocusedRowIndex;
                this._lastNotifiedFocusedRowIndex = newFocusedRowIndex;
                const rowFocusEventer = this.rowFocusEventer;
                if (rowFocusEventer !== undefined) {
                    rowFocusEventer(newFocusedRowIndex, oldFocusedRowIndex);
                }
            }
        }
    }
}

/** @public */
export namespace SimpleGrid {
    export type RecordFocusEventer = (this: void, newRowIndex: number | undefined, oldRowIndex: number | undefined) => void;
    export type MainClickEventer = (this: void, columnIndex: number, rowIndex: number) => void;
    export type MainDblClickEventer = (this: void, columnIndex: number, rowIndex: number) => void;

    export interface ComponentAccess {
        applySettings(): void;
    }
}
