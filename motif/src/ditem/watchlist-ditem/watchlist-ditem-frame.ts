/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    CommandRegisterService,
    FavouriteNamedGridLayoutDefinitionReferencesService,
    GridField,
    GridLayout,
    GridLayoutOrNamedReferenceDefinition,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    JsonElement,
    JsonRankedLitIvemIdListDefinition,
    LitIvemId,
    RankedLitIvemIdList,
    SettingsService,
    SymbolsService,
    TableRecordSourceDefinitionFactoryService,
    TextFormatterService
} from '@motifmarkets/motif-core';
import {
    AdaptedRevgridBehavioredColumnSettings,
    GridSourceFrame,
    HeaderTextCellPainter,
    RecordGridMainTextCellPainter,
    WatchlistFrame
} from 'content-internal-api';
import { DatalessViewCell } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class WatchlistDitemFrame extends BuiltinDitemFrame {
    defaultLitIvemIds: readonly LitIvemId[] | undefined;

    private _watchlistFrame: WatchlistFrame;

    private _litIvemIdApplying = false;
    private _currentFocusedLitIvemIdSetting = false;

    private _gridHeaderCellPainter: HeaderTextCellPainter;
    private _gridMainCellPainter: RecordGridMainTextCellPainter;

    constructor(
        componentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _favouriteNamedGridLayoutDefinitionReferencesService: FavouriteNamedGridLayoutDefinitionReferencesService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _gridSourceOpenedEventer: WatchlistDitemFrame.GridSourceOpenedEventer,
        private readonly _recordFocusedEventer: WatchlistDitemFrame.RecordFocusedEventer,
        private readonly _gridLayoutSetEventer: WatchlistDitemFrame.GridLayoutSetEventer,
        private readonly _litIvemIdAcceptedEventer: WatchlistDitemFrame.LitIvemIdAcceptedEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Watchlist, componentAccess,
            settingsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._watchlistFrame !== undefined; }
    get recordFocused() { return this._watchlistFrame.recordFocused; }

    initialise(gridSourceFrame: WatchlistFrame, frameElement: JsonElement | undefined): void {
        this._watchlistFrame = gridSourceFrame;
        this._watchlistFrame.opener = this.opener;
        this._watchlistFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);
        this._watchlistFrame.saveRequiredEventer = () => this.flagSaveRequired();

        const grid = gridSourceFrame.grid;
        this._gridHeaderCellPainter = new HeaderTextCellPainter(this.settingsService, grid, grid.headerDataServer);
        this._gridMainCellPainter = new RecordGridMainTextCellPainter(this.settingsService, this._textFormatterService, grid, grid.mainDataServer);

        let gridSourceOrNamedReferenceDefinition: GridSourceOrNamedReferenceDefinition;
        if (frameElement === undefined) {
            gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
        } else {
            const contentElementResult = frameElement.tryGetElement(WatchlistDitemFrame.JsonName.watchlistFrame);
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

        const contentElement = element.newElement(WatchlistDitemFrame.JsonName.watchlistFrame);
        const definition = this._watchlistFrame.createGridSourceOrNamedReferenceDefinition();
        definition.saveToJson(contentElement);
    }

    tryOpenGridSource(definition: GridSourceOrNamedReferenceDefinition, keepView: boolean) {
        const gridSourceOrNamedReference = this._watchlistFrame.tryOpenGridSource(definition, keepView);
        if (gridSourceOrNamedReference !== undefined) {
            const rankedLitIvemIdListName = this._watchlistFrame.lockedNamedRankedLitIvemIdList?.name;
            this.updateLockerName(rankedLitIvemIdListName ?? '');
            this._gridSourceOpenedEventer(this._watchlistFrame.lockedRankedLitIvemIdList, rankedLitIvemIdListName);
        }
    }

    saveGridSourceAs(as: GridSourceOrNamedReferenceDefinition.SaveAsDefinition) {
        this._watchlistFrame.saveGridSourceAs(as);
    }

    openGridLayoutOrNamedReferenceDefinition(gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition) {
        this._watchlistFrame.openGridLayoutOrNamedReferenceDefinition(gridLayoutOrNamedReferenceDefinition);
    }

    createAllowedFieldsAndLayoutDefinition() {
        return this._watchlistFrame.createAllowedFieldsAndLayoutDefinition();
    }

    newEmpty(keepView: boolean) {
        const definition = this.createEmptyGridSourceOrNamedReferenceDefinition();
        this.tryOpenGridSource(definition, keepView);
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

    autoSizeAllColumnWidths(widenOnly: boolean) {
        this._watchlistFrame.autoSizeAllColumnWidths(widenOnly);
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
                    return this._watchlistFrame.addLitIvemIds(litIvemIds, focusFirst);
                } finally {
                    this._litIvemIdApplying = false;
                }
            }
        }
    }

    canDeleteRecord() {
        return this._watchlistFrame.userCanRemove;
    }

    deleteFocusedRecord() {
        this._watchlistFrame.deleteFocusedRecord();
    }


    protected override applyLitIvemId(litIvemId: LitIvemId | undefined, selfInitiated: boolean): boolean { // override
        if (this._currentFocusedLitIvemIdSetting || litIvemId === undefined) {
            return false;
        } else {
            let result: boolean;
            this._litIvemIdApplying = true;
            try {
                const focused = this._watchlistFrame.tryFocus(litIvemId, selfInitiated);

                if (focused) {
                    result = super.applyLitIvemId(litIvemId, selfInitiated);
                } else {
                    result = false;
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
            const litIvemId = this._watchlistFrame.getAt(newRecordIndex).litIvemId;
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

    private customiseSettingsForNewGridColumn(_columnSettings: AdaptedRevgridBehavioredColumnSettings) {
        // no customisation
    }

    private getGridHeaderCellPainter(_viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridHeaderCellPainter;
    }

    private getGridMainCellPainter(_viewCell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        return this._gridMainCellPainter;
    }

    private createDefaultGridSourceOrNamedReferenceDefinition() {
        const litIvemIds: readonly LitIvemId[] = this.defaultLitIvemIds ?? [];
        const litIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(litIvemIds);
        return this._watchlistFrame.createGridSourceOrNamedReferenceDefinitionFromList(litIvemIdListDefinition, undefined, undefined);
    }

    private createEmptyGridSourceOrNamedReferenceDefinition() {
        const litIvemIds: readonly LitIvemId[] = [];
        const litIvemIdListDefinition = new JsonRankedLitIvemIdListDefinition(litIvemIds);
        return this._watchlistFrame.createGridSourceOrNamedReferenceDefinitionFromList(litIvemIdListDefinition, undefined, undefined);
    }

    private processLitIvemIdFocusChange(newFocusedLitIvemId: LitIvemId) {
        if (!this._litIvemIdApplying) {
            this._currentFocusedLitIvemIdSetting = true;
            try {
                this.applyDitemLitIvemIdFocus(newFocusedLitIvemId, true);
            } finally {
                this._currentFocusedLitIvemIdSetting = false;
            }
        }
    }

    private checkConfirmPrivateWatchListCanBeDiscarded(): boolean {
        if (this._watchlistFrame.isNamed || this._watchlistFrame.recordCount === 0) {
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
        export const watchlistFrame = 'watchlistFrame';
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
