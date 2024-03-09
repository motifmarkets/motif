/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    CommandRegisterService,
    CreateNotificationChannelDataDefinition,
    GridLayoutOrReferenceDefinition,
    Integer,
    JsonElement,
    LockOpenListItem,
    LockOpenNotificationChannel,
    LockOpenNotificationChannelList,
    NotificationChannelsService,
    NotificationDistributionMethod,
    NotificationDistributionMethodId,
    SettingsService,
    StringId,
    Strings,
    SymbolsService
} from '@motifmarkets/motif-core';
import { LockOpenNotificationChannelsGridFrame } from 'content-internal-api';
import { ToastService } from '../../component-services/toast-service';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class NotificationChannelsDitemFrame extends BuiltinDitemFrame {
    gridSelectionChangedEventer: NotificationChannelsDitemFrame.GridSelectionChangedEventer | undefined;

    private _gridFrame: LockOpenNotificationChannelsGridFrame | undefined;

    private _openedChannel: LockOpenNotificationChannel | undefined;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopInterface: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _notificationChannelsService: NotificationChannelsService,
        private readonly _toastService: ToastService,
        private readonly _opener: LockOpenListItem.Opener,
        private readonly _notificationChannelFocusedEventer: NotificationChannelsDitemFrame.NotificationChannelFocusedEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Scans, ditemComponentAccess,
            settingsService, commandRegisterService, desktopInterface, symbolsService, adiService
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._gridFrame !== undefined; }
    get gridSelectedCount() {
        const gridFrame = this._gridFrame;
        return gridFrame === undefined ? 0 : gridFrame.selectedCount;
    }

    initialise(ditemFrameElement: JsonElement | undefined, gridFrame: LockOpenNotificationChannelsGridFrame): void {
        this._gridFrame = gridFrame;

        gridFrame.recordFocusedEventer = (newRecordIndex) => { this.handleGridFrameRecordFocusedEvent(newRecordIndex); }
        gridFrame.selectionChangedEventer = () => {
            if (this.gridSelectionChangedEventer !== undefined) {
                this.gridSelectionChangedEventer();
            }
        }

        let gridFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const scanListFrameElementResult = ditemFrameElement.tryGetElement(NotificationChannelsDitemFrame.JsonName.scanListFrame);
            if (scanListFrameElementResult.isOk()) {
                gridFrameElement = scanListFrameElementResult.value;
            }
        }

        gridFrame.initialiseGrid(this.opener, undefined, true);

        const openPromise = gridFrame.tryOpenJsonOrDefault(gridFrameElement, true)
        openPromise.then(
            (openResult) => {
                if (openResult.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.NotificationChannels]}: ${openResult.error}`);
                } else {
                    this.applyLinked();
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCDFI45509') }
        );
    }

    override finalise() {
        const gridFrame = this._gridFrame;
        if (gridFrame !== undefined) {
            gridFrame.recordFocusedEventer = undefined;
            gridFrame.selectionChangedEventer = undefined;
            gridFrame.finalise();
            this._gridFrame = undefined;
        }
        super.finalise();
    }

    override save(ditemFrameElement: JsonElement) {
        super.save(ditemFrameElement);

        const scanListFrame = this._gridFrame;
        if (scanListFrame === undefined) {
            throw new AssertInternalError('SDFS29974');
        } else {
            const scanListFrameElement = ditemFrameElement.newElement(NotificationChannelsDitemFrame.JsonName.scanListFrame);
            scanListFrame.save(scanListFrameElement);
        }
    }

    async getSupportedDistributionMethodIds(): Promise<readonly NotificationDistributionMethodId[] | undefined> {
        const getResult = await this._notificationChannelsService.getSupportedDistributionMethodIds(false);
        if (getResult.isErr()) {
            this._toastService.popup(`${Strings[StringId.ErrorGetting]} ${Strings[StringId.DistributionMethodIds]}: ${getResult.error}`);
            return undefined;
        } else {
            return getResult.value;
        }
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        if (this._gridFrame === undefined) {
            throw new AssertInternalError('SDFASACW49471');
        } else {
            this._gridFrame.autoSizeAllColumnWidths(widenOnly);
        }
    }

    createAllowedFieldsGridLayoutDefinition() {
        if (this._gridFrame === undefined) {
            throw new AssertInternalError('SDFCAFALD04418');
        } else {
            return this._gridFrame.createAllowedFieldsGridLayoutDefinition();
        }
    }

    tryOpenGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition) {
        if (this._gridFrame === undefined) {
            throw new AssertInternalError('SLFOGLONRD04418');
        } else {
            return this._gridFrame.tryOpenGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition);
        }
    }

    refreshList() {
        const getPromise = this._notificationChannelsService.getLoadedList(true);
        getPromise.then(
            (getResult) => {
                if (getResult.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorGetting]} ${Strings[StringId.NotificationChannels]}: ${getResult.error}`);
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCDFRL33346'); }
        );
    }

    add(methodId: NotificationDistributionMethodId) {
        const getPromise = this._notificationChannelsService.getLoadedList(false);
        getPromise.then(
            (getResult) => {
                if (getResult.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorGetting]} ${Strings[StringId.NotificationChannels]}: ${getResult.error}`);
                } else {
                    const list = getResult.value;
                    if (list !== undefined) { // ignore if undefined as shutting down
                        const channelName = this.createUniqueNewChannelName(list, methodId);
                        const definition = new CreateNotificationChannelDataDefinition();
                        definition.enabled = false;
                        definition.notificationChannelName = channelName;
                        definition.distributionMethodId = methodId;

                        const createPromise = this._notificationChannelsService.tryCreateChannel(definition);
                        createPromise.then(
                            (createResult) => {
                                if (createResult.isErr()) {
                                    this._toastService.popup(`${Strings[StringId.ErrorCreatingNew]} ${Strings[StringId.NotificationChannel]}: ${createResult.error}`);
                                }
                            },
                            (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCDFAC33346'); }
                        );
                    }
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCDFAG33346'); }
        );
    }

    selectAllInGrid() {
        const gridFrame = this._gridFrame;
        if (gridFrame === undefined) {
            throw new AssertInternalError('NCDFSAIG56071');
        } else {
            gridFrame.selectAllRows();
        }
    }

    deleteGridSelected() {
        const gridFrame = this._gridFrame;
        if (gridFrame === undefined) {
            throw new AssertInternalError('NCDFDGS56071');
        } else {
            const selectedChannelIds = gridFrame.getSelectedChannelIds();
            if (selectedChannelIds.length > 0) {
                const deletePromise = this._notificationChannelsService.tryDeleteChannels(selectedChannelIds);
                deletePromise.then(
                    (deleteResult) => {
                        if (deleteResult.isErr()) {
                            this._toastService.popup(`${Strings[StringId.ErrorDeleting]} ${Strings[StringId.NotificationChannels]}: ${deleteResult.error}`);
                        }
                    },
                    (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCDFDGS33346'); }
                );
            }
        }
    }

    private handleGridFrameRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        this._notificationChannelFocusedEventer(undefined);
        const openedChannel = this._openedChannel;
        if (openedChannel !== undefined) {
            this._notificationChannelsService.closeChannel(openedChannel, this._opener);
            this._notificationChannelsService.unlockChannel(openedChannel, this._opener);
            this._openedChannel = undefined;
        }

        if (newRecordIndex !== undefined) {
            const list = this._notificationChannelsService.list;
            const unlockedChannel = list.getAt(newRecordIndex);
            const lockAndOpenPromise = this._notificationChannelsService.tryLockAndOpenChannel(unlockedChannel.id, this._opener, false);
            lockAndOpenPromise.then(
                (lockAndOpenResult) => {
                    if (lockAndOpenResult.isErr()) {
                        this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.NotificationChannel]} {${unlockedChannel.id}}: ${lockAndOpenResult.error}`);
                    } else {
                        const newOpenedChannel = lockAndOpenResult.value;
                        if (newOpenedChannel !== undefined) {
                            this._notificationChannelFocusedEventer(newOpenedChannel);
                        }
                    }
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'NCDFHGFRFE53322'); }
            );
        }
    }

    private createUniqueNewChannelName(list: LockOpenNotificationChannelList, methodId: NotificationDistributionMethodId) {
        const base = `${Strings[StringId.New]} ${NotificationDistributionMethod.idToDisplay(methodId)}`;
        let suffixAsInteger = 0;
        let name: string;
        let index: Integer;
        do {
            suffixAsInteger++;
            name = suffixAsInteger === 1 ? base : `${base} ${suffixAsInteger}`;
            index = list.indexOfChannelByName(name);
        } while (index >= 0);

        return name;
    }
}


export namespace NotificationChannelsDitemFrame {
    export namespace JsonName {
        export const scanListFrame = 'scanListFrame';
    }

    export type NotificationChannelFocusedEventer = (this: void, channel: LockOpenNotificationChannel | undefined) => void;
    export type GridSelectionChangedEventer = (this: void) => void;
}
