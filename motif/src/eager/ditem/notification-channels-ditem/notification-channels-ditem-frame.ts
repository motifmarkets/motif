/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    CommandRegisterService,
    GridLayoutOrReferenceDefinition,
    Integer,
    JsonElement,
    LockOpenListItem,
    LockOpenNotificationChannel,
    NotificationChannelsService,
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
    private _gridFrame:LockOpenNotificationChannelsGridFrame | undefined;

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

    initialise(ditemFrameElement: JsonElement | undefined, gridFrame: LockOpenNotificationChannelsGridFrame): void {
        this._gridFrame = gridFrame;

        gridFrame.recordFocusedEventer = (newRecordIndex) => { this.handleGridFrameRecordFocusedEvent(newRecordIndex); }

        let gridFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const scanListFrameElementResult = ditemFrameElement.tryGetDefinedElement(NotificationChannelsDitemFrame.JsonName.scanListFrame);
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
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'SDFIPR50135') }
        );
    }

    override finalise() {
        const gridFrame = this._gridFrame;
        if (gridFrame !== undefined) {
            gridFrame.recordFocusedEventer = undefined;
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

    openGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition) {
        if (this._gridFrame === undefined) {
            throw new AssertInternalError('SLFOGLONRD04418');
        } else {
            this._gridFrame.openGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition);
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
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'SDFHSLFRFEPR50515'); }
            );
        }
    }
}


export namespace NotificationChannelsDitemFrame {
    export namespace JsonName {
        export const scanListFrame = 'scanListFrame';
    }

    export type NotificationChannelFocusedEventer = (this: void, channel: LockOpenNotificationChannel | undefined) => void;
}
