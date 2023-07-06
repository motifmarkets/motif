/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BalancesTableRecordSource,
    BrokerageAccountGroup,
    GridField,
    GridSourceDefinition,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    JsonElement,
    LockOpenListItem,
    NamedGridLayoutsService,
    NamedGridSourcesService,
    NamedJsonRankedLitIvemIdListsService,
    SettingsService,
    TableRecordSourceDefinitionFactoryService,
    TableRecordSourceFactoryService,
    TextFormatterService
} from '@motifmarkets/motif-core';
import { DatalessViewCell } from 'revgrid';
import { AdaptedRevgridBehavioredColumnSettings, HeaderTextCellPainter, RecordGridMainTextCellPainter } from '../adapted-revgrid/internal-api';
import { GridSourceFrame } from '../grid-source/internal-api';

export class BalancesFrame extends GridSourceFrame {
    private _recordSource: BalancesTableRecordSource;

    private _gridHeaderCellPainter: HeaderTextCellPainter;
    private _gridMainCellPainter: RecordGridMainTextCellPainter;

    private _gridSourceOpenedEventer: BalancesFrame.GridSourceOpenedEventer | undefined;

    constructor(
        settingsService: SettingsService,
        private readonly _namedJsonRankedLitIvemIdListsService: NamedJsonRankedLitIvemIdListsService,
        textFormatterService: TextFormatterService,
        namedGridLayoutsService: NamedGridLayoutsService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        tableRecordSourceFactoryService: TableRecordSourceFactoryService,
        namedGridSourcesService: NamedGridSourcesService,
        componentAccess: GridSourceFrame.ComponentAccess,
        hostElement: HTMLElement,
    ) {
        super(
            settingsService,
            namedGridLayoutsService,
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

    initialise(
        element: JsonElement | undefined,
        opener: LockOpenListItem.Opener,
        gridSourceOpenedEventer: BalancesFrame.GridSourceOpenedEventer,
        recordFocusedEventer: GridSourceFrame.RecordFocusedEventer
    ) {
        this.opener = opener;
        this._gridSourceOpenedEventer = gridSourceOpenedEventer;
        this.recordFocusedEventer = recordFocusedEventer;

        let gridSourceOrNamedReferenceDefinition: GridSourceOrNamedReferenceDefinition;
        if (element === undefined) {
            gridSourceOrNamedReferenceDefinition = this.createDefaultAllGridSourceOrNamedReferenceDefinition();
        } else {
            const contentElementResult = element.tryGetElement(BalancesFrameJsonName.balancesFrame);
            if (contentElementResult.isErr()) {
                gridSourceOrNamedReferenceDefinition = this.createDefaultAllGridSourceOrNamedReferenceDefinition();
            } else {
                const definitionResult = GridSourceOrNamedReferenceDefinition.tryCreateFromJson(
                    this._tableRecordSourceDefinitionFactoryService,
                    contentElementResult.value,
                );
                if (definitionResult.isOk()) {
                    gridSourceOrNamedReferenceDefinition = definitionResult.value;
                } else {
                    gridSourceOrNamedReferenceDefinition = this.createDefaultAllGridSourceOrNamedReferenceDefinition();
                    // Temporary error toast
                }
            }
        }
        this.tryOpenGridSource(gridSourceOrNamedReferenceDefinition, false);

        this.applySettings();
    }

    override tryOpenGridSource(definition: GridSourceOrNamedReferenceDefinition, keepView: boolean) {
        const gridSourceOrNamedReference = super.tryOpenGridSource(definition, keepView);
        if (gridSourceOrNamedReference !== undefined) {
            const table = this.openedTable;
            this._recordSource = table.recordSource as BalancesTableRecordSource;
            const brokerageAccountGroup = this._recordSource.brokerageAccountGroup;
            if (this._gridSourceOpenedEventer !== undefined) {
                this._gridSourceOpenedEventer(brokerageAccountGroup);
            }
        }
        return gridSourceOrNamedReference;
    }

    tryOpenDefault(group: BrokerageAccountGroup, keepView: boolean) {
        const definition = this.createDefaultGridSourceOrNamedReferenceDefinition(group);
        this.tryOpenGridSource(definition, keepView);
    }

    createDefaultGridSourceOrNamedReferenceDefinition(brokerageAccountGroup: BrokerageAccountGroup) {
        const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createBalances(brokerageAccountGroup);
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    }

    private createDefaultAllGridSourceOrNamedReferenceDefinition() {
        const brokerageAccountGroup = BrokerageAccountGroup.createAll();
        return this.createDefaultGridSourceOrNamedReferenceDefinition(brokerageAccountGroup);
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
}


export namespace BalancesFrame {
    export type GridSourceOpenedEventer = (this: void, brokerageAccountGroup: BrokerageAccountGroup) => void;
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;

    export interface ComponentAccess extends GridSourceFrame.ComponentAccess {

    }
}

namespace BalancesFrameJsonName {
    export const balancesFrame = 'balancesFrame';
}

