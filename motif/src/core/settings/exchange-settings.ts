import { ExchangeId, ExchangeInfo, SymbolField, SymbolFieldId } from 'adi-internal-api';
import { AssertInternalError } from 'sys-internal-api';
import { TypedKeyValueSettings } from './typed-key-value-settings';

export class ExchangeSettings {
    private _symbolSearchFieldIds: SymbolFieldId[];
    private _symbolNameFieldId: SymbolFieldId;

    private _infosObject: ExchangeSettings.InfosObject = {
        SymbolNameFieldId: { id: ExchangeSettings.Id.SymbolNameFieldId,
            name: 'symbolNameFieldId',
            defaulter: () => TypedKeyValueSettings.formatEnumString(
                SymbolField.idToJsonValue(ExchangeInfo.idToDefaultSymbolNameFieldId(this.exchangeId))
            ),
            getter: () => TypedKeyValueSettings.formatEnumString(SymbolField.idToJsonValue(this._symbolNameFieldId)),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                if (value.value === undefined) {
                    this._symbolNameFieldId = ExchangeInfo.idToDefaultSymbolNameFieldId(this.exchangeId);
                } else {
                    const id = SymbolField.tryJsonValueToId(value.value);
                    if (id === undefined) {
                        this._symbolNameFieldId = ExchangeInfo.idToDefaultSymbolNameFieldId(this.exchangeId);
                    } else {
                        this._symbolNameFieldId = id;
                    }
                }
            }
        },
        SymbolSearchFieldIds: { id: ExchangeSettings.Id.SymbolSearchFieldIds,
            name: 'symbolSearchFieldIds',
            defaulter: () => TypedKeyValueSettings.formatEnumArrayString(
                SymbolField.idArrayToJsonValue(ExchangeInfo.idToDefaultSymbolSearchFieldIds(this.exchangeId))
            ),
            getter: () => TypedKeyValueSettings.formatEnumArrayString(SymbolField.idArrayToJsonValue(this._symbolSearchFieldIds)),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                if (value.value === undefined) {
                    this._symbolSearchFieldIds = ExchangeInfo.idToDefaultSymbolSearchFieldIds(this.exchangeId).slice();
                } else {
                    const idArray = SymbolField.tryJsonValueToIdArray(value.value);
                    if (idArray === undefined) {
                        this._symbolSearchFieldIds = ExchangeInfo.idToDefaultSymbolSearchFieldIds(this.exchangeId).slice();
                    } else {
                        this._symbolSearchFieldIds = idArray;
                    }
                }
            }
        },
    };

    private readonly _infos = Object.values(this._infosObject);

    constructor(
        readonly exchangeId: ExchangeId,
        private readonly _settingChangedEventer: ExchangeSettings.SettingChangedEventer,
    ) {
        if (ExchangeSettings.idCount !== this._infos.length) {
            throw new AssertInternalError('EXCIC23331', `${ExchangeSettings.idCount} !== ${this._infos.length}`);
        } else {
            this._symbolSearchFieldIds = ExchangeInfo.idToDefaultSymbolSearchFieldIds(this.exchangeId).slice();
            this._symbolNameFieldId = ExchangeInfo.idToDefaultSymbolNameFieldId(this.exchangeId);
        }
    }

    get infos() { return this._infos; }

    get symbolNameFieldId() { return this._symbolNameFieldId; }
    set symbolNameFieldId(value: SymbolFieldId) {
        this._symbolNameFieldId = value;
        this._settingChangedEventer(ExchangeSettings.Id.SymbolNameFieldId);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get symbolSearchFieldIds() { return this._symbolSearchFieldIds; }
    set symbolSearchFieldIds(value: SymbolFieldId[]) {
        this._symbolSearchFieldIds = value;
        this._settingChangedEventer(ExchangeSettings.Id.SymbolSearchFieldIds);
    }
}

export namespace ExchangeSettings {
    export const enum Id {
        SymbolNameFieldId,
        SymbolSearchFieldIds,
    }

    export const idCount = 2;

    export type SettingChangedEventer = (this: void, id: Id) => void;

    export type InfosObject = { [id in keyof typeof Id]: TypedKeyValueSettings.Info };
}
