/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Balances,
    BalancesTableRecordSource,
    BrokerageAccountGroup,
    GridField,
    GridSourceDefinition,
    GridSourceOrNamedReference,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    KeyedCorrectnessList
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from 'revgrid';
import { AdaptedRevgridBehavioredColumnSettings, HeaderTextCellPainter, RecordGridMainTextCellPainter } from '../adapted-revgrid/internal-api';
import { DelayedBadnessGridSourceFrame } from '../delayed-badness-grid-source/internal-api';

export class BalancesFrame extends DelayedBadnessGridSourceFrame {
    gridSourceOpenedEventer: BalancesFrame.GridSourceOpenedEventer | undefined;
    recordFocusedEventer: BalancesFrame.RecordFocusedEventer | undefined

    private _recordSource: BalancesTableRecordSource;
    private _recordList: KeyedCorrectnessList<Balances>;

    private _gridHeaderCellPainter: HeaderTextCellPainter;
    private _gridMainCellPainter: RecordGridMainTextCellPainter;

    get recordList() { return this._recordList; }

    override createGridAndCellPainters(gridHostElement: HTMLElement) {
        const grid = this.createGrid(
            gridHostElement,
            {},
            (columnSettings) => this.customiseSettingsForNewGridColumn(columnSettings),
            (viewCell) => this.getGridMainCellPainter(viewCell),
            (viewCell) => this.getGridHeaderCellPainter(viewCell),
        );

        this._gridHeaderCellPainter = new HeaderTextCellPainter(this.settingsService, grid, grid.headerDataServer);
        this._gridMainCellPainter = new RecordGridMainTextCellPainter(this.settingsService, this.textFormatterService, grid, grid.mainDataServer);

        return grid;
    }

    tryOpenWithDefaultLayout(group: BrokerageAccountGroup, keepView: boolean) {
        const definition = this.createDefaultLayoutGridSourceOrNamedReferenceDefinition(group);
        return this.tryOpenGridSource(definition, keepView);
    }

    createDefaultLayoutGridSourceOrNamedReferenceDefinition(brokerageAccountGroup: BrokerageAccountGroup) {
        const tableRecordSourceDefinition = this.tableRecordSourceDefinitionFactoryService.createBalances(brokerageAccountGroup);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    }

    protected override getDefaultGridSourceOrNamedReferenceDefinition() {
        return this.createDefaultLayoutGridSourceOrNamedReferenceDefinition(BalancesFrame.defaultBrokerageAccountGroup);
    }

    protected override processGridSourceOpenedEvent(_gridSourceOrNamedReference: GridSourceOrNamedReference) {
        const table = this.openedTable;
        this._recordSource = table.recordSource as BalancesTableRecordSource;
        this._recordList = this._recordSource.recordList;
        const brokerageAccountGroup = this._recordSource.brokerageAccountGroup;
        if (this.gridSourceOpenedEventer !== undefined) {
            this.gridSourceOpenedEventer(brokerageAccountGroup);
        }
    }

    protected override processRecordFocusedEvent(newRecordIndex: Integer | undefined, _oldRecordIndex: Integer | undefined) {
        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex);
        }
    }

    private customiseSettingsForNewGridColumn(_columnSettings: AdaptedRevgridBehavioredColumnSettings) {
        // no customisation
    }

    private getGridHeaderCellPainter(_viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridHeaderCellPainter;
    }

    private getGridMainCellPainter(_viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridMainCellPainter;
    }
}

export namespace BalancesFrame {
    export type GridSourceOpenedEventer = (this: void, brokerageAccountGroup: BrokerageAccountGroup) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;

    export const defaultBrokerageAccountGroup = BrokerageAccountGroup.createAll();
}
