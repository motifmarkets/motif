/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, JsonElement } from 'src/sys/internal-api';
import { SettingsGroup } from './settings-group';
import { TypedKeyValueSettings } from './typed-key-value-settings';

export abstract class TypedKeyValueSettingsGroup extends SettingsGroup {
    protected abstract get idCount(): Integer;

    constructor(groupName: string) {
        super(SettingsGroup.Type.Id.TypedKeyValue, groupName);
    }

    load(element: JsonElement | undefined) {
        const count = this.idCount;
        for (let i = 0; i < count; i++) {
            const info = this.getInfo(i);
            const name = info.name;
            const jsonValue = element?.tryGetString(name, 'TKVSGL626262');
            const pushValue: TypedKeyValueSettings.PushValue = {
                info,
                value: jsonValue,
            };
            info.pusher(pushValue);
        }
    }

    override save(element: JsonElement) {
        super.save(element);
        const count = this.idCount;
        for (let i = 0; i < count; i++) {
            const info = this.getInfo(i);
            const name = info.name;
            const value = info.getter();
            element.setString(name, value);
        }
    }

    protected abstract getInfo(idx: Integer): TypedKeyValueSettings.Info;
}
