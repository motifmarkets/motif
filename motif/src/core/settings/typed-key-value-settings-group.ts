/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderType, OrderTypeId, TimeInForce, TimeInForceId } from 'src/adi/internal-api';
import { AssertInternalError, Integer, JsonElement, parseIntStrict, parseNumberStrict } from 'src/sys/internal-api';
import { SettingsGroup } from './settings-group';

export abstract class TypedKeyValueSettingsGroup extends SettingsGroup {
    private _numberFormat: Intl.NumberFormat;
    private _integerFormat: Intl.NumberFormat;

    protected abstract get idCount(): Integer;

    constructor(name: string) {
        super(SettingsGroup.Type.Id.TypedKeyValue, name);
        this._numberFormat = new Intl.NumberFormat(TypedKeyValueSettingsGroup.locale, { useGrouping: false });
        this._integerFormat = new Intl.NumberFormat(TypedKeyValueSettingsGroup.locale, { useGrouping: false,  maximumFractionDigits: 0 });
    }

    load(element: JsonElement | undefined) {
        const count = this.idCount;
        for (let i = 0; i < count; i++) {
            const info = this.getInfo(i);
            const name = info.name;
            const jsonValue = element?.tryGetString(name, 'TKVSGL626262');
            const pushValue: TypedKeyValueSettingsGroup.PushValue = {
                info,
                value: jsonValue,
            };
            info.pusher(pushValue);
        }
    }

    save(element: JsonElement) {
        super.save(element);
        const count = this.idCount;
        for (let i = 0; i < count; i++) {
            const info = this.getInfo(i);
            const name = info.name;
            const value = info.getter();
            element.setString(name, value);
        }
    }

    protected formatString(value: string) {
        return value;
    }

    protected parseString(pushValue: TypedKeyValueSettingsGroup.PushValue) {
        const { info, value } = pushValue;
        if (value !== undefined) {
            return value;
        } else {
            const defaultValue = info.defaulter();
            if (defaultValue !== undefined) {
                return defaultValue;
            } else {
                throw new AssertInternalError('TKVSGPS', info.name);
            }
        }
    }

    protected formatChar(value: string) {
        if (value.length >= 2) {
            value = value[0];
        }
        return value;
    }

    protected parseChar(pushValue: TypedKeyValueSettingsGroup.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return this.parseDefaultChar(info);
        } else {
            const parsedValue = this.tryParseCharText(value);
            if (parsedValue === undefined) {
                return this.parseDefaultChar(info);
            } else {
                return parsedValue;
            }
        }
    }

    protected formatEnumString(value: string): TypedKeyValueSettingsGroup.EnumString {
        return value;
    }

    protected parseEnumString(pushValue: TypedKeyValueSettingsGroup.PushValue): TypedKeyValueSettingsGroup.EnumString {
        const { info, value } = pushValue;
        if (value !== undefined) {
            return value;
        } else {
            const defaultValue = info.defaulter();
            if (defaultValue === undefined) {
                throw new AssertInternalError('TKVSGPES233999');
            } else {
                return defaultValue;
            }
        }
    }

    protected formatUndefinableEnumString(value: TypedKeyValueSettingsGroup.EnumString | undefined) {
        return value;
    }

    protected formatBoolean(value: boolean) {
        return value ? TypedKeyValueSettingsGroup.BooleanString.trueString : TypedKeyValueSettingsGroup.BooleanString.falseString;
    }

    protected parseBoolean(pushValue: TypedKeyValueSettingsGroup.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return this.parseDefaultBoolean(info);
        } else {
            const parsedValue = this.tryParseBooleanText(value);
            if (parsedValue === undefined) {
                return this.parseDefaultBoolean(info);
            } else {
                return parsedValue;
            }
        }
    }

    protected formatInteger(value: Integer) {
        return this._integerFormat.format(value);
    }

    protected parseInteger(pushValue: TypedKeyValueSettingsGroup.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined || value === '') {
            return this.parseDefaultInteger(info);
        } else {
            const parsedValue = this.tryParseIntegerText(value);
            if (parsedValue === undefined) {
                return this.parseDefaultInteger(info);
            } else {
                return parsedValue;
            }
        }
    }

    protected formatUndefinableInteger(value: Integer | undefined) {
        if (value === undefined) {
            return '';
        } else {
            return this._integerFormat.format(value);
        }
    }

    protected parseUndefinableInteger(pushValue: TypedKeyValueSettingsGroup.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return this.parseDefaultUndefinableInteger(info);
        } else {
            if (value === '') {
                return undefined;
            } else {
                const parsedValue = this.tryParseIntegerText(value);
                if (parsedValue === undefined) {
                    return this.parseDefaultUndefinableInteger(info);
                } else {
                    return parsedValue;
                }
            }
        }
    }

    protected formatNumber(value: number) {
        return this._numberFormat.format(value);
    }

    protected parseNumber(pushValue: TypedKeyValueSettingsGroup.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return this.parseDefaultNumber(info);
        } else {
            const parsedValue = this.tryParseNumberText(value);
            if (parsedValue === undefined) {
                return this.parseDefaultNumber(info);
            } else {
                return parsedValue;
            }
        }
    }

    protected formatUndefinableOrderTypeId(value: OrderTypeId | undefined) {
        if (value === undefined) {
            return '';
        } else {
            return OrderType.idToJsonValue(value);
        }
    }

    protected parseUndefinableOrderTypeId(pushValue: TypedKeyValueSettingsGroup.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return this.parseDefaultUndefinableOrderTypeId(info);
        } else {
            if (value === '') {
                return undefined;
            } else {
                const parsedValue = OrderType.tryJsonValueToId(value);
                if (parsedValue === undefined) {
                    return this.parseDefaultUndefinableOrderTypeId(info);
                } else {
                    return parsedValue;
                }
            }
        }
    }

    protected formatUndefinableTimeInForceId(value: TimeInForceId | undefined) {
        if (value === undefined) {
            return '';
        } else {
            return TimeInForce.idToJsonValue(value);
        }
    }

    protected parseUndefinableTimeInForceId(pushValue: TypedKeyValueSettingsGroup.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return this.parseDefaultUndefinableTimeInForceId(info);
        } else {
            if (value === '') {
                return undefined;
            } else {
                const parsedValue = TimeInForce.tryJsonValueToId(value);
                if (parsedValue === undefined) {
                    return this.parseDefaultUndefinableTimeInForceId(info);
                } else {
                    return parsedValue;
                }
            }
        }
    }

    private tryParseCharText(value: string) {
        switch (value.length) {
            case 0: return undefined;
            case 1: return value;
            default: return value[0];
        }
    }

    private parseDefaultChar(info: TypedKeyValueSettingsGroup.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined) {
            throw new AssertInternalError('TKVSGPDBD222982342', defaultValueText);
        } else {
            const parsedDefaultValue = this.tryParseCharText(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDBP222982342', defaultValueText);
            }
        }
    }

    private tryParseBooleanText(value: string) {
        switch (value) {
            case TypedKeyValueSettingsGroup.BooleanString.falseString: return false;
            case TypedKeyValueSettingsGroup.BooleanString.trueString: return true;
            default: return undefined;
        }
    }

    private parseDefaultBoolean(info: TypedKeyValueSettingsGroup.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined) {
            throw new AssertInternalError('TKVSGPDBD222982342', defaultValueText);
        } else {
            const parsedDefaultValue = this.tryParseBooleanText(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDBP222982342', defaultValueText);
            }
        }
    }

    private tryParseIntegerText(value: string) {
        return parseIntStrict(value);
    }

    private parseDefaultInteger(info: TypedKeyValueSettingsGroup.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined) {
            throw new AssertInternalError('TKVSGPDID199534775', defaultValueText);
        } else {
            const parsedDefaultValue = this.tryParseIntegerText(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDIP199534775', defaultValueText);
            }
        }
    }

    private parseDefaultUndefinableInteger(info: TypedKeyValueSettingsGroup.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined || defaultValueText === '') {
            return undefined;
        } else {
            const parsedDefaultValue = this.tryParseIntegerText(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDI199534775', defaultValueText);
            }
        }
    }

    private tryParseNumberText(value: string) {
        return parseNumberStrict(value);
    }

    private parseDefaultNumber(info: TypedKeyValueSettingsGroup.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined) {
            throw new AssertInternalError('TKVSGPDND121200934', defaultValueText);
        } else {
            const parsedDefaultValue = this.tryParseNumberText(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDNP121200934', defaultValueText);
            }
        }
    }

    private parseDefaultUndefinableNumber(info: TypedKeyValueSettingsGroup.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined || defaultValueText === '') {
            return undefined;
        } else {
            const parsedDefaultValue = this.tryParseNumberText(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDNP121200934', defaultValueText);
            }
        }
    }

    private parseDefaultUndefinableOrderTypeId(info: TypedKeyValueSettingsGroup.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined || defaultValueText === '') {
            return undefined;
        } else {
            const parsedDefaultValue = OrderType.tryJsonValueToId(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDUOTI32320099', defaultValueText);
            }
        }
    }

    private parseDefaultUndefinableTimeInForceId(info: TypedKeyValueSettingsGroup.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined || defaultValueText === '') {
            return undefined;
        } else {
            const parsedDefaultValue = TimeInForce.tryJsonValueToId(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDUTIFI1100232', defaultValueText);
            }
        }
    }

    protected abstract getInfo(idx: Integer): TypedKeyValueSettingsGroup.Info;
}

export namespace TypedKeyValueSettingsGroup {
    export const locale = 'en';
    export type EnumString = string;

    export type DefaultFunction = (this: void) => string | undefined;
    export type GetFunction = (this: void) => string | undefined;
    export interface PushValue {
        info: Info;
        value: string | undefined;
    }
    export type PushFunction = (this: void, value: PushValue) => void;

    export interface Info {
        readonly id: Integer;
        readonly name: string;
        readonly defaulter: DefaultFunction;
        readonly getter: GetFunction;
        readonly pusher: PushFunction;
    }

    export namespace BooleanString {
        export const falseString = 'false';
        export const trueString = 'true';
    }
}
