/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, CommandRegisterService, EnumInfoOutOfOrderError, SettingsService, StringId, Strings, SymbolsService } from '@motifmarkets/motif-core';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class SettingsDitemFrame extends BuiltinDitemFrame {
    readonly initialised = true;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Settings,
            ditemComponentAccess, settingsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.Settings; }
}

export namespace SettingsDitemFrame {

    export const enum GroupId {
        General,
        Grid,
        OrderPad,
        Exchanges,
        Colors,
    }

    export namespace Group {
        export type Id = GroupId;

        interface Info {
            readonly id: Id;
            readonly captionId: StringId;
            readonly titleId: StringId;
        }

        type InfosObject = { [id in keyof typeof GroupId]: Info };

        const infosObject: InfosObject = {
            General: {
                id: GroupId.General,
                captionId: StringId.SettingsDitemGroup_GeneralCaption,
                titleId: StringId.SettingsDitemGroup_GeneralTitle,
            },
            Grid: {
                id: GroupId.Grid,
                captionId: StringId.SettingsDitemGroup_GridCaption,
                titleId: StringId.SettingsDitemGroup_GridTitle,
            },
            OrderPad: {
                id: GroupId.OrderPad,
                captionId: StringId.SettingsDitemGroup_OrderPadCaption,
                titleId: StringId.SettingsDitemGroup_OrderPadTitle,
            },
            Exchanges: {
                id: GroupId.Exchanges,
                captionId: StringId.SettingsDitemGroup_ExchangesCaption,
                titleId: StringId.SettingsDitemGroup_ExchangesTitle,
            },
            Colors: {
                id: GroupId.Colors,
                captionId: StringId.SettingsDitemGroup_ColorsCaption,
                titleId: StringId.SettingsDitemGroup_ColorsTitle,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                if (infos[i].id !== i as GroupId) {
                    throw new EnumInfoOutOfOrderError('SettingsDitemFrame.GroupId', i, idToCaption(i));
                }
            }
        }

        function idToCaptionId(id: Id) {
            return infos[id].captionId;
        }

        export function idToCaption(id: Id) {
            return Strings[idToCaptionId(id)];
        }

        function idToTitleId(id: Id) {
            return infos[id].titleId;
        }

        export function idToTitle(id: Id) {
            return Strings[idToTitleId(id)];
        }
    }
}

export namespace SettingsDitemFrameModule {
    export function initialiseStatic() {
        SettingsDitemFrame.Group.initialise();
    }
}
