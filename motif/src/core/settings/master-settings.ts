/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import { AssertInternalError, EnumInfoOutOfOrderError, Integer } from 'src/sys/internal-api';
import { TypedKeyValueSettings } from './typed-key-value-settings';
import { TypedKeyValueSettingsGroup } from './typed-key-value-settings-group';

export class MasterSettings extends TypedKeyValueSettingsGroup {
    private _applicationEnvironmentSelectorId = MasterSettings.Default.applicationEnvironmentSelectorId;

    private _infosObject: MasterSettings.InfosObject = {
        ApplicationEnvironmentSelectorId: { id: MasterSettings.Id.ApplicationEnvironmentSelectorId,
            name: 'applicationEnvironmentSelectorId',
            defaulter: () => this.formatApplicationEnvironmentSelectorId(MasterSettings.Default.applicationEnvironmentSelectorId),
            getter: () => this.formatApplicationEnvironmentSelectorId(this._applicationEnvironmentSelectorId),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._applicationEnvironmentSelectorId = this.parseApplicationEnvironmentSelectorId(value);
            }
        },
    } as const;

    private readonly _infos = Object.values(this._infosObject);
    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly idCount = this._infos.length;

    constructor() {
        super(MasterSettings.groupName);
    }

    get applicationEnvironmentSelectorId() { return this._applicationEnvironmentSelectorId; }
    set applicationEnvironmentSelectorId(value: Integer) {
        this._applicationEnvironmentSelectorId = value;
        this.notifySettingChanged(MasterSettings.Id.ApplicationEnvironmentSelectorId);
    }

    protected getInfo(idx: Integer) {
        return this._infos[idx];
    }

    private formatApplicationEnvironmentSelectorId(value: MasterSettings.ApplicationEnvironmentSelector.SelectorId) {
        return MasterSettings.ApplicationEnvironmentSelector.idToSettingValue(value);
    }

    private parseApplicationEnvironmentSelectorId(pushValue: TypedKeyValueSettings.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return this.parseDefaultApplicationEnvironmentSelectorId(info);
        } else {
            const parsedValue = MasterSettings.ApplicationEnvironmentSelector.trySettingValueToId(value);
            if (parsedValue === undefined) {
                return this.parseDefaultApplicationEnvironmentSelectorId(info);
            } else {
                return parsedValue;
            }
        }
    }

    private parseDefaultApplicationEnvironmentSelectorId(info: TypedKeyValueSettings.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined) {
            throw new AssertInternalError('MSPDAESIU2228111', defaultValueText);
        } else {
            const parsedDefaultValue = MasterSettings.ApplicationEnvironmentSelector.trySettingValueToId(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('MSPDAESIV2228111', parsedDefaultValue);
            }
        }
    }
}

export namespace MasterSettings {
    export const groupName = 'master';

    export const enum Id {
        ApplicationEnvironmentSelectorId,
    }

    export type InfosObject = { [id in keyof typeof Id]: TypedKeyValueSettings.Info };

    export namespace Default {
        export const applicationEnvironmentSelectorId = ApplicationEnvironmentSelector.SelectorId.ExchangeEnvironment;
    }

    export namespace ApplicationEnvironmentSelector {
        export const enum SelectorId {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            Default,
            ExchangeEnvironment,
            ExchangeEnvironment_Demo,
            ExchangeEnvironment_DelayedProduction,
            ExchangeEnvironment_Production,
            Test,
        }

        export const enum SettingValue {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            Default = 'default',
            ExchangeEnvironment = 'exchangeEnvironment',
            ExchangeEnvironment_Demo = 'exchangeEnvironment_Demo',
            ExchangeEnvironment_DelayedProduction = 'exchangeEnvironment_Delayed',
            ExchangeEnvironment_Production = 'exchangeEnvironment_Production',
            Test = 'test',
        }

        export const defaultId = SelectorId.Default;

        interface Info {
            readonly id: SelectorId;
            readonly settingValue: string;
            readonly displayId: StringId;
            readonly titleId: StringId;
        }

        type SelectorInfosObject = { [id in keyof typeof SelectorId]: Info };

        const selectorInfosObject: SelectorInfosObject = {
            Default: {
                id: SelectorId.Default,
                settingValue: SettingValue.Default,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_Default,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_Default,
            },
            ExchangeEnvironment: {
                id: SelectorId.ExchangeEnvironment,
                settingValue: SettingValue.ExchangeEnvironment,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_ExchangeEnvironment,
            },
            ExchangeEnvironment_Demo: {
                id: SelectorId.ExchangeEnvironment_Demo,
                settingValue: SettingValue.ExchangeEnvironment_Demo,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment_Demo,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_ExchangeEnvironment_Demo,
            },
            ExchangeEnvironment_DelayedProduction: {
                id: SelectorId.ExchangeEnvironment_DelayedProduction,
                settingValue: SettingValue.ExchangeEnvironment_DelayedProduction,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment_Delayed,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_ExchangeEnvironment_Delayed,
            },
            ExchangeEnvironment_Production: {
                id: SelectorId.ExchangeEnvironment_Production,
                settingValue: SettingValue.ExchangeEnvironment_Production,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment_Production,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_ExchangeEnvironment_Production,
            },
            Test: {
                id: SelectorId.Test,
                settingValue: SettingValue.Test,
                displayId: StringId.ApplicationEnvironmentSelectorDisplay_Test,
                titleId: StringId.ApplicationEnvironmentSelectorTitle_Test,
            },
        } as const;

        export const idCount = Object.keys(selectorInfosObject).length;
        const infos = Object.values(selectorInfosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ApplicationEnvironmentSelector', outOfOrderIdx, Strings[infos[outOfOrderIdx].displayId]);
            }
        }

        export function idToSettingValue(id: SelectorId) {
            return infos[id].settingValue;
        }

        export function trySettingValueToId(value: string) {
            const foundInfo = infos.find((info) => info.settingValue === value);
            return foundInfo?.id;
        }

        export function idToDisplayId(id: SelectorId) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: SelectorId) {
            return Strings[idToDisplayId(id)];
        }

        export function idToTitleId(id: SelectorId) {
            return infos[id].titleId;
        }

        export function idToDescription(id: SelectorId) {
            return Strings[idToTitleId(id)];
        }
    }
}

export namespace MasterSettingsModule {
    export function initialiseStatic() {
        MasterSettings.ApplicationEnvironmentSelector.initialise();
    }
}
