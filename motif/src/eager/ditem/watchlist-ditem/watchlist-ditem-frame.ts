/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    CommandRegisterService,
    FavouriteReferenceableGridLayoutDefinitionsStoreService,
    GridLayout,
    GridLayoutOrReferenceDefinition,
    GridSourceOrReference,
    GridSourceOrReferenceDefinition,
    Integer,
    JsonElement,
    LitIvemId,
    RankedLitIvemIdList,
    SettingsService,
    SymbolsService,
    TableRecordSourceDefinitionFactoryService,
    TextFormatterService
} from '@motifmarkets/motif-core';
import {
    GridSourceFrame,
    WatchlistFrame
} from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class WatchlistDitemFrame extends BuiltinDitemFrame {
    defaultLitIvemIds: readonly LitIvemId[] | undefined;

    private _watchlistFrame: WatchlistFrame | undefined;

    private _litIvemIdApplying = false;
    private _currentFocusedLitIvemIdSetting = false;

    constructor(
        componentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _favouriteNamedGridLayoutDefinitionReferencesService: FavouriteReferenceableGridLayoutDefinitionsStoreService,
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

    get initialised() { return this._watchlistFrame !== undefined; }
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    get recordFocused() { return this._watchlistFrame !== undefined && this._watchlistFrame.recordFocused; }

    initialise(ditemFrameElement: JsonElement | undefined, watchlistFrame: WatchlistFrame): void {
        this._watchlistFrame = watchlistFrame;
        watchlistFrame.gridSourceOpenedEventer = this._gridSourceOpenedEventer;
        watchlistFrame.gridLayoutSetEventer = this._gridLayoutSetEventer;
        watchlistFrame.gridSourceOpenedEventer = (rankedLitIvemIdList, rankedLitIvemIdListName) =>
            this.handleGridSourceOpenedEvent(rankedLitIvemIdList, rankedLitIvemIdListName);
        watchlistFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex);
        watchlistFrame.saveRequiredEventer = () => this.flagSaveRequired();

        watchlistFrame.initialiseGrid(this.opener, undefined, false);

        let gridSourceOrReferenceDefinition: GridSourceOrReferenceDefinition | undefined;
        if (ditemFrameElement !== undefined) {
            const watchlistFrameElementResult = ditemFrameElement.tryGetElement(WatchlistDitemFrame.JsonName.watchlistFrame);
            if (watchlistFrameElementResult.isOk()) {
                const watchlistFrameElement = watchlistFrameElementResult.value;
                const definitionCreateResult = watchlistFrame.tryCreateDefinitionFromJson(watchlistFrameElement);
                if (definitionCreateResult.isErr()) {
                    // toast in future
                } else {
                    gridSourceOrReferenceDefinition = definitionCreateResult.value;
                }
            }
        }

        let openPromise: Promise<GridSourceOrReference | undefined>;
        if (gridSourceOrReferenceDefinition === undefined) {
            openPromise = watchlistFrame.tryOpenLitIvemIdArray(this.defaultLitIvemIds ?? [], false);
        } else {
            openPromise = watchlistFrame.tryOpenGridSource(gridSourceOrReferenceDefinition, false)
        }

        openPromise.then(
            (gridSourceOrReference) => {
                if (gridSourceOrReference === undefined) {
                    throw new AssertInternalError('WDFIPU50134');
                } else {
                    this.applyLinked();
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'WDFIPR50134') }
        );
    }

    override finalise() {
        if (this._watchlistFrame !== undefined) {
            this._watchlistFrame.finalise();
        }
        super.finalise();
    }

    override save(ditemFrameElement: JsonElement) {
        super.save(ditemFrameElement);

        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFS10174');
        } else {
            const watchlistFrameElement = ditemFrameElement.newElement(WatchlistDitemFrame.JsonName.watchlistFrame);
            this._watchlistFrame.save(watchlistFrameElement);
        }
    }

    tryOpenGridSource(definition: GridSourceOrReferenceDefinition, keepView: boolean) {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFTOGS10174');
        } else {
            const gridSourceOrReferencePromise = this._watchlistFrame.tryOpenGridSource(definition, keepView);
            AssertInternalError.throwErrorIfPromiseRejected(gridSourceOrReferencePromise, 'WDFTOGS33391', `${this.opener.lockerName}: ${definition.referenceId ?? ''}`);
        }
    }

    saveGridSourceAs(as: GridSourceOrReferenceDefinition.SaveAsDefinition) {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFSGSAU10174');
        } else {
            const promise = this._watchlistFrame.saveGridSourceAs(as);
            AssertInternalError.throwErrorIfPromiseRejected(promise, 'WDFSGSAS10174', this._watchlistFrame.opener.lockerName);
        }
    }

    openGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition) {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFOGLONRD10174');
        } else {
            this._watchlistFrame.openGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition);
        }
    }

    createAllowedFieldsGridLayoutDefinition() {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFCAFALD10174');
        } else {
            return this._watchlistFrame.createAllowedFieldsGridLayoutDefinition();
        }
    }

    newEmpty(keepView: boolean) {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFNE10174');
        } else {
            return this._watchlistFrame.tryOpenLitIvemIdArray([], keepView);
        }
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

    //     const definition = this.createGridSourceOrReferenceDefinitionFromList(
    //         jsonRankedLitIvemIdListDefinition,
    //         this._gridSourceFrame.createLayoutOrReferenceDefinition(),
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
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFASACW10174');
        } else {
            this._watchlistFrame.autoSizeAllColumnWidths(widenOnly);
        }
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
                    if (this._watchlistFrame === undefined) {
                        throw new AssertInternalError('WDFTILII10174');
                    } else {
                        return this._watchlistFrame.addLitIvemIds(litIvemIds, focusFirst);
                    }
                } finally {
                    this._litIvemIdApplying = false;
                }
            }
        }
    }

    canDeleteRecord() {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFCDR10174');
        } else {
            return this._watchlistFrame.userCanRemove;
        }
    }

    deleteFocusedRecord() {
        if (this._watchlistFrame === undefined) {
            throw new AssertInternalError('WDFDFR10174');
        } else {
            this._watchlistFrame.deleteFocusedRecord();
        }
    }


    protected override applyLitIvemId(litIvemId: LitIvemId | undefined, selfInitiated: boolean): boolean { // override
        if (this._currentFocusedLitIvemIdSetting || litIvemId === undefined) {
            return false;
        } else {
            let result: boolean;
            this._litIvemIdApplying = true;
            try {
                if (this._watchlistFrame === undefined) {
                    throw new AssertInternalError('WDFALI10174');
                } else {
                    const focused = this._watchlistFrame.tryFocus(litIvemId, selfInitiated);

                    if (focused) {
                        result = super.applyLitIvemId(litIvemId, selfInitiated);
                    } else {
                        result = false;
                    }

                    if (result && selfInitiated) {
                        this.notifyLitIvemIdAccepted(litIvemId);
                    }
                }
            } finally {
                this._litIvemIdApplying = false;
            }

            return result;
        }
    }

    private handleGridSourceOpenedEvent(rankedLitIvemIdList: RankedLitIvemIdList, rankedLitIvemIdListName: string | undefined) {
        this.updateLockerName(rankedLitIvemIdListName ?? '');
        this._gridSourceOpenedEventer(rankedLitIvemIdList, rankedLitIvemIdListName);
    }

    private handleRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            if (this._watchlistFrame === undefined) {
                throw new AssertInternalError('WDFHRFE10174');
            } else {
                const litIvemId = this._watchlistFrame.getAt(newRecordIndex).litIvemId;
                this.processLitIvemIdFocusChange(litIvemId);
            }
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

    // private checkConfirmPrivateWatchListCanBeDiscarded(): boolean {
    //     if (this._watchlistFrame.isNamed || this._watchlistFrame.recordCount === 0) {
    //         return true;
    //     } else {
    //         return true;
    //         // todo
    //     }
    // }

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
