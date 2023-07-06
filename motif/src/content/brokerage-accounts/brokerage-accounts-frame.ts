/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Account,
    BrokerageAccountTableRecordSource,
    GridField,
    GridSourceDefinition,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    JsonElement,
    KeyedCorrectnessList,
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

export class BrokerageAccountsFrame extends GridSourceFrame {
    gridSourceOpenedEventer: BrokerageAccountsFrame.GridSourceOpenedEventer | undefined;

    private _recordSource: BrokerageAccountTableRecordSource;
    private _recordList: KeyedCorrectnessList<Account>;

    private _gridHeaderCellPainter: HeaderTextCellPainter;
    private _gridMainCellPainter: RecordGridMainTextCellPainter;

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

    get recordList() { return this._recordList; }

    initialise(element: JsonElement | undefined, opener: LockOpenListItem.Opener, recordFocusedEventer: GridSourceFrame.RecordFocusedEventer) {
        this.opener = opener;
        this.recordFocusedEventer = recordFocusedEventer;

        let gridSourceOrNamedReferenceDefinition: GridSourceOrNamedReferenceDefinition;
        if (element === undefined) {
            gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
        } else {
            const contentElementResult = element.tryGetElement(BrokerageAccountsFrameJsonName.brokerageAccountsFrame);
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

        this.applySettings();
    }

    override tryOpenGridSource(definition: GridSourceOrNamedReferenceDefinition, keepView: boolean) {
        const gridSourceOrNamedReference = super.tryOpenGridSource(definition, keepView);
        if (gridSourceOrNamedReference !== undefined) {
            const table = this.openedTable;
            this._recordSource = table.recordSource as BrokerageAccountTableRecordSource;
            this._recordList = this._recordSource.recordList;
            if (this.gridSourceOpenedEventer !== undefined) {
                this.gridSourceOpenedEventer();
            }
        }
        return gridSourceOrNamedReference;
    }

    private createDefaultGridSourceOrNamedReferenceDefinition() {
        const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createBrokerageAccount();
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
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


export namespace BrokerageAccountsFrame {
    export type RecordFocusedEventer = (this: void, newRecordIndex: Integer | undefined) => void;
    export type GridSourceOpenedEventer = (this: void) => void;

    export interface ComponentAccess extends GridSourceFrame.ComponentAccess {

    }
}

namespace BrokerageAccountsFrameJsonName {
    export const brokerageAccountsFrame = 'brokerageAccountsFrame';
}

