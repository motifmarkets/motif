/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { OrderType, OrderTypeId, TimeInForce, TimeInForceId } from 'src/adi/internal-api';
import { AssertInternalError, Integer, parseIntStrict, parseNumberStrict } from 'src/sys/internal-api';

export namespace TypedKeyValueSettings {
    const _numberFormat = new Intl.NumberFormat(TypedKeyValueSettings.locale, { useGrouping: false });
    const _integerFormat = new Intl.NumberFormat(TypedKeyValueSettings.locale, { useGrouping: false,  maximumFractionDigits: 0 });

    // protected abstract get idCount(): Integer;

    // constructor(name: string) {
    //     this._numberFormat = new Intl.NumberFormat(TypedKeyValueSettings.locale, { useGrouping: false });
    //     this._integerFormat = new Intl.NumberFormat(TypedKeyValueSettings.locale, { useGrouping: false,  maximumFractionDigits: 0 });
    // }

    // load(element: JsonElement | undefined) {
    //     const count = this.idCount;
    //     for (let i = 0; i < count; i++) {
    //         const info = this.getInfo(i);
    //         const name = info.name;
    //         const jsonValue = element?.tryGetString(name, 'TKVSGL626262');
    //         const pushValue: TypedKeyValueSettings.PushValue = {
    //             info,
    //             value: jsonValue,
    //         };
    //         info.pusher(pushValue);
    //     }
    // }

    // override save(element: JsonElement) {
    //     super.save(element);
    //     const count = this.idCount;
    //     for (let i = 0; i < count; i++) {
    //         const info = this.getInfo(i);
    //         const name = info.name;
    //         const value = info.getter();
    //         element.setString(name, value);
    //     }
    // }

    export function formatString(value: string) {
        return value;
    }

    export function parseString(pushValue: TypedKeyValueSettings.PushValue) {
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

    export function formatChar(value: string) {
        if (value.length >= 2) {
            value = value[0];
        }
        return value;
    }

    export function parseChar(pushValue: TypedKeyValueSettings.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return parseDefaultChar(info);
        } else {
            const parsedValue = tryParseCharText(value);
            if (parsedValue === undefined) {
                return parseDefaultChar(info);
            } else {
                return parsedValue;
            }
        }
    }

    export function formatEnumString(value: string): TypedKeyValueSettings.EnumString {
        return value;
    }

    export function parseEnumString(pushValue: TypedKeyValueSettings.PushValue): TypedKeyValueSettings.EnumString {
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

    export function formatUndefinableEnumString(value: TypedKeyValueSettings.EnumString | undefined) {
        return value;
    }

    export function formatEnumArrayString(value: string): TypedKeyValueSettings.EnumString {
        return value;
    }

    export function parseEnumArrayString(pushValue: TypedKeyValueSettings.PushValue): TypedKeyValueSettings.EnumString {
        const { info, value } = pushValue;
        if (value !== undefined) {
            return value;
        } else {
            const defaultValue = info.defaulter();
            if (defaultValue === undefined) {
                throw new AssertInternalError('TKVSGPES233988');
            } else {
                return defaultValue;
            }
        }
    }

    export function formatBoolean(value: boolean) {
        return value ? TypedKeyValueSettings.BooleanString.trueString : TypedKeyValueSettings.BooleanString.falseString;
    }

    export function parseBoolean(pushValue: TypedKeyValueSettings.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return parseDefaultBoolean(info);
        } else {
            const parsedValue = tryParseBooleanText(value);
            if (parsedValue === undefined) {
                return parseDefaultBoolean(info);
            } else {
                return parsedValue;
            }
        }
    }

    export function formatInteger(value: Integer) {
        return _integerFormat.format(value);
    }

    export function parseInteger(pushValue: TypedKeyValueSettings.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined || value === '') {
            return parseDefaultInteger(info);
        } else {
            const parsedValue = tryParseIntegerText(value);
            if (parsedValue === undefined) {
                return parseDefaultInteger(info);
            } else {
                return parsedValue;
            }
        }
    }

    export function formatUndefinableInteger(value: Integer | undefined) {
        if (value === undefined) {
            return '';
        } else {
            return _integerFormat.format(value);
        }
    }

    export function parseUndefinableInteger(pushValue: TypedKeyValueSettings.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return parseDefaultUndefinableInteger(info);
        } else {
            if (value === '') {
                return undefined;
            } else {
                const parsedValue = tryParseIntegerText(value);
                if (parsedValue === undefined) {
                    return parseDefaultUndefinableInteger(info);
                } else {
                    return parsedValue;
                }
            }
        }
    }

    export function formatNumber(value: number) {
        return _numberFormat.format(value);
    }

    export function parseNumber(pushValue: TypedKeyValueSettings.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return parseDefaultNumber(info);
        } else {
            const parsedValue = tryParseNumberText(value);
            if (parsedValue === undefined) {
                return parseDefaultNumber(info);
            } else {
                return parsedValue;
            }
        }
    }

    export function formatUndefinableOrderTypeId(value: OrderTypeId | undefined) {
        if (value === undefined) {
            return '';
        } else {
            return OrderType.idToJsonValue(value);
        }
    }

    export function parseUndefinableOrderTypeId(pushValue: TypedKeyValueSettings.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return parseDefaultUndefinableOrderTypeId(info);
        } else {
            if (value === '') {
                return undefined;
            } else {
                const parsedValue = OrderType.tryJsonValueToId(value);
                if (parsedValue === undefined) {
                    return parseDefaultUndefinableOrderTypeId(info);
                } else {
                    return parsedValue;
                }
            }
        }
    }

    export function formatUndefinableTimeInForceId(value: TimeInForceId | undefined) {
        if (value === undefined) {
            return '';
        } else {
            return TimeInForce.idToJsonValue(value);
        }
    }

    export function parseUndefinableTimeInForceId(pushValue: TypedKeyValueSettings.PushValue) {
        const { info, value } = pushValue;
        if (value === undefined) {
            return parseDefaultUndefinableTimeInForceId(info);
        } else {
            if (value === '') {
                return undefined;
            } else {
                const parsedValue = TimeInForce.tryJsonValueToId(value);
                if (parsedValue === undefined) {
                    return parseDefaultUndefinableTimeInForceId(info);
                } else {
                    return parsedValue;
                }
            }
        }
    }

    function tryParseCharText(value: string) {
        switch (value.length) {
            case 0: return undefined;
            case 1: return value;
            default: return value[0];
        }
    }

    function parseDefaultChar(info: TypedKeyValueSettings.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined) {
            throw new AssertInternalError('TKVSGPDBD222982342', defaultValueText);
        } else {
            const parsedDefaultValue = tryParseCharText(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDBP222982342', defaultValueText);
            }
        }
    }

    function tryParseBooleanText(value: string) {
        switch (value) {
            case TypedKeyValueSettings.BooleanString.falseString: return false;
            case TypedKeyValueSettings.BooleanString.trueString: return true;
            default: return undefined;
        }
    }

    function parseDefaultBoolean(info: TypedKeyValueSettings.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined) {
            throw new AssertInternalError('TKVSGPDBD222982342', defaultValueText);
        } else {
            const parsedDefaultValue = tryParseBooleanText(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDBP222982342', defaultValueText);
            }
        }
    }

    function tryParseIntegerText(value: string) {
        return parseIntStrict(value);
    }

    function parseDefaultInteger(info: TypedKeyValueSettings.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined) {
            throw new AssertInternalError('TKVSGPDID199534775', defaultValueText);
        } else {
            const parsedDefaultValue = tryParseIntegerText(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDIP199534775', defaultValueText);
            }
        }
    }

    function parseDefaultUndefinableInteger(info: TypedKeyValueSettings.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined || defaultValueText === '') {
            return undefined;
        } else {
            const parsedDefaultValue = tryParseIntegerText(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDI199534775', defaultValueText);
            }
        }
    }

    function tryParseNumberText(value: string) {
        return parseNumberStrict(value);
    }

    function parseDefaultNumber(info: TypedKeyValueSettings.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined) {
            throw new AssertInternalError('TKVSGPDND121200934', defaultValueText);
        } else {
            const parsedDefaultValue = tryParseNumberText(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDNP121200934', defaultValueText);
            }
        }
    }

    function parseDefaultUndefinableNumber(info: TypedKeyValueSettings.Info) {
        const defaultValueText = info.defaulter();
        if (defaultValueText === undefined || defaultValueText === '') {
            return undefined;
        } else {
            const parsedDefaultValue = tryParseNumberText(defaultValueText);
            if (parsedDefaultValue !== undefined) {
                return parsedDefaultValue;
            } else {
                throw new AssertInternalError('TKVSGPDNP121200934', defaultValueText);
            }
        }
    }

    function parseDefaultUndefinableOrderTypeId(info: TypedKeyValueSettings.Info) {
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

    function parseDefaultUndefinableTimeInForceId(info: TypedKeyValueSettings.Info) {
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
}

export namespace TypedKeyValueSettings {
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
