/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdaptedRevgridBehavioredColumnSettings,
    AssertInternalError,
    Badness,
    CellPainterFactoryService,
    CheckboxRenderValueRecordGridCellEditor,
    CheckboxRenderValueRecordGridCellPainter,
    DataSourceDefinition,
    DataSourceOrReference,
    DataSourceOrReferenceDefinition,
    GridField,
    Integer,
    LockOpenListItem,
    LockOpenNotificationChannelList,
    NotificationChannelsService,
    ReferenceableDataSourcesService,
    ReferenceableGridLayoutsService,
    RenderValueRecordGridCellPainter,
    RevFieldCustomHeadingsService,
    RevGridLayoutOrReferenceDefinition,
    SettingsService,
    TableFieldSourceDefinitionCachingFactoryService,
    TableRecordSourceFactory,
    TextHeaderCellPainter,
    TextRenderValueCellPainter
} from '@motifmarkets/motif-core';
import { CellEditor, DatalessViewCell, Subgrid, ViewCell } from '@xilytix/revgrid';
import { ToastService } from 'component-services-internal-api';
import { GridSourceFrame } from '../../grid-source/internal-api';
import { TableRecordSourceDefinitionFactoryService } from '../../table-record-source-definition-factory-service';
import { LockOpenNotificationChannelListTableRecordSource } from './lock-open-notification-channel-list-table-record-source';
import { LockOpenNotificationChannelListTableRecordSourceDefinition } from './lock-open-notification-channel-list-table-record-source-definition';

export class LockOpenNotificationChannelsGridFrame extends GridSourceFrame {
    recordFocusedEventer: LockOpenNotificationChannelsGridFrame.RecordFocusedEventer | undefined
    selectionChangedEventer: LockOpenNotificationChannelsGridFrame.SelectionChangedEventer | undefined;

    private _list: LockOpenNotificationChannelList;

    private _gridHeaderCellPainter: TextHeaderCellPainter;
    private _gridMainCellPainter: RenderValueRecordGridCellPainter<TextRenderValueCellPainter>;
    private _visibleCheckboxPainter: CheckboxRenderValueRecordGridCellPainter;
    private _visibleCheckboxEditor: CheckboxRenderValueRecordGridCellEditor;
    private _widthEditor: CellEditor<AdaptedRevgridBehavioredColumnSettings, GridField>;

    constructor(
        settingsService: SettingsService,
        notificationChannelsService: NotificationChannelsService,
        gridFieldCustomHeadingsService: RevFieldCustomHeadingsService,
        referenceableGridLayoutsService: ReferenceableGridLayoutsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactory: TableRecordSourceFactory,
        referenceableGridSourcesService: ReferenceableDataSourcesService,
        cellPainterFactoryService: CellPainterFactoryService,
        toastService: ToastService,
        frameOpener: LockOpenListItem.Opener,
    ) {
        super(
            settingsService,
            gridFieldCustomHeadingsService,
            referenceableGridLayoutsService,
            tableFieldSourceDefinitionCachingFactoryService,
            tableRecordSourceDefinitionFactoryService,
            tableRecordSourceFactory,
            referenceableGridSourcesService,
            cellPainterFactoryService,
            toastService,
        );
    }

    get list() { return this._list; }
    get selectedCount() { return this.grid.getSelectedRowCount(true); }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            {
                fixedColumnCount: 1,
                mouseColumnSelectionEnabled: false,
                switchNewRectangleSelectionToRowOrColumn: 'row',
            },
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = this.cellPainterFactoryService.createTextHeader(grid, grid.headerDataServer);
        this._gridMainCellPainter = this.cellPainterFactoryService.createTextRenderValueRecordGrid(grid, grid.mainDataServer);
        this._visibleCheckboxPainter = this.cellPainterFactoryService.createCheckboxRenderValueRecordGrid(grid, grid.mainDataServer);
        this._visibleCheckboxEditor = new CheckboxRenderValueRecordGridCellEditor(this.settingsService, grid, grid.mainDataServer);

        grid.focus.getCellEditorEventer = (
            field,
            subgridRowIndex,
            subgrid,
            readonly,
            viewCell
        ) => this.getCellEditor(field, subgridRowIndex, subgrid, readonly, viewCell);

        grid.selectionChangedEventer = () => {
            if (this.selectionChangedEventer !== undefined) {
                this.selectionChangedEventer();
            }
        }

        return grid;
    }

    getLockerScanAttachedNotificationChannelAt(index: Integer) {
        return this._list.getAt(index);
    }

    getSelectedChannelIds() {
        const grid = this.grid;
        const rowIndices = grid.selection.getRowIndices(true);
        const count = rowIndices.length;
        const channelIds = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            const rowIndex = rowIndices[i];
            const recordIndex = grid.rowToRecordIndex(rowIndex);
            const channel = this._list.getAt(recordIndex);
            channelIds[i] = channel.id;
        }

        return channelIds;
    }

    protected override getDefaultGridSourceOrReferenceDefinition() {
        return this.createListGridSourceOrReferenceDefinition(undefined);
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrReference: DataSourceOrReference) {
        const table = this.openedTable;
        const recordSource = table.recordSource as LockOpenNotificationChannelListTableRecordSource;
        this._list = recordSource.recordList;
    }

    protected override setBadness(value: Badness) {
        if (!Badness.isUsable(value)) {
            throw new AssertInternalError('GLECFSB42112', Badness.generateText(value));
        }
    }

    protected override hideBadnessWithVisibleDelay(_badness: Badness) {
        // always hidden as never bad
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private createListGridSourceOrReferenceDefinition(layoutDefinition: RevGridLayoutOrReferenceDefinition | undefined) {
        const tableRecordSourceDefinition = new LockOpenNotificationChannelListTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
        );
        const gridSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, layoutDefinition, undefined);
        return new DataSourceOrReferenceDefinition(gridSourceDefinition);
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

    private getCellEditor(
        field: GridField,
        subgridRowIndex: Integer,
        _subgrid: Subgrid<AdaptedRevgridBehavioredColumnSettings, GridField>,
        readonly: boolean,
        _viewCell: ViewCell<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined
    ): CellEditor<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined {
        return this.tryGetCellEditor(field.definition.sourcelessName, readonly, subgridRowIndex);
    }

    private tryGetCellEditor(sourcelesFieldName: string, readonly: boolean, subgridRowIndex: Integer): CellEditor<AdaptedRevgridBehavioredColumnSettings, GridField> | undefined {
        // if (sourcelesFieldName === EditableGridLayoutDefinitionColumn.FieldName.visible) {
        //     this._visibleCheckboxEditor.readonly = readonly || subgridRowIndex < this._recordList.fixedColumnCount;
        //     return this._visibleCheckboxEditor;
        // } else {
        //     if (sourcelesFieldName === EditableGridLayoutDefinitionColumn.FieldName.width) {
        //         this._widthEditor.readonly = readonly
        //         return this._widthEditor;
        //     } else {
                return undefined;
        //     }
        // }
    }
}

export namespace LockOpenNotificationChannelsGridFrame {
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type SelectionChangedEventer = (this: void) => void;
}
