import { ExchangeId, SearchSymbolsDataDefinition } from 'src/adi/internal-api';
import { AssertInternalError } from 'src/sys/internal-api';
import { TypedKeyValueSettings } from './typed-key-value-settings';

export class ExchangeSettings {
    constructor(
        readonly exchangeId: ExchangeId,
        private readonly _settingChangedEventer: ExchangeSettings.SettingChangedEventer,
    ) {
        if (ExchangeSettings.idCount !== this.infos.length) {
            throw new AssertInternalError('EXCIC23331', `${ExchangeSettings.idCount} !== ${this.infos.length}`);
        }
    }

    get symbolNameFieldId() { return this._symbolNameFieldId; }
    set symbolNameFieldId(value: SearchSymbolsDataDefinition.FieldId) { this._symbolNameFieldId = value;
        this._settingChangedEventer(ExchangeSettings.Id.SymbolNameFieldId);
    }

    get symbolSearchFieldIds() { return this._symbolSearchFieldIds; }
    set symbolSearchFieldIds(value: SearchSymbolsDataDefinition.FieldId[]) { this._symbolSearchFieldIds = value;
        this._settingChangedEventer(ExchangeSettings.Id.SymbolSearchFieldIds);
    }

    private _symbolNameFieldId = ExchangeSettings.Default.symbolNameFieldId;
    private _symbolSearchFieldIds = ExchangeSettings.Default.symbolSearchFieldIds;

    private _infosObject: ExchangeSettings.InfosObject = {
        SymbolNameFieldId: { id: ExchangeSettings.Id.SymbolNameFieldId,
            name: 'symbolNameFieldId',
            defaulter: () => TypedKeyValueSettings.formatEnumString(
                SearchSymbolsDataDefinition.Field.idToJsonValue(ExchangeSettings.Default.symbolNameFieldId)
            ),
            getter: () => TypedKeyValueSettings.formatEnumString(SearchSymbolsDataDefinition.Field.idToJsonValue(this._symbolNameFieldId)),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                if (value.value === undefined) {
                    this._symbolNameFieldId = ExchangeSettings.Default.symbolNameFieldId;
                } else {
                    const id = SearchSymbolsDataDefinition.Field.tryJsonValueToId(value.value);
                    if (id === undefined) {
                        this._symbolNameFieldId = ExchangeSettings.Default.symbolNameFieldId;
                    } else {
                        this._symbolNameFieldId = id;
                    }
                }
            }
        },
        SymbolSearchFieldIds: { id: ExchangeSettings.Id.SymbolSearchFieldIds,
            name: 'symbolSearchFieldIds',
            defaulter: () => TypedKeyValueSettings.formatEnumArrayString(
                SearchSymbolsDataDefinition.Field.idArrayToJsonValue(ExchangeSettings.Default.symbolSearchFieldIds)
            ),
            getter: () => TypedKeyValueSettings.formatEnumArrayString(SearchSymbolsDataDefinition.Field.idArrayToJsonValue(this._symbolSearchFieldIds)),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                if (value.value === undefined) {
                    this._symbolSearchFieldIds = ExchangeSettings.Default.symbolSearchFieldIds;
                } else {
                    const idArray = SearchSymbolsDataDefinition.Field.tryJsonValueToIdArray(value.value);
                    if (idArray === undefined) {
                        this._symbolSearchFieldIds = ExchangeSettings.Default.symbolSearchFieldIds;
                    } else {
                        this._symbolSearchFieldIds = idArray;
                    }
                }
            }
        },
    }

    readonly infos = Object.values(this._infosObject);
}

export namespace ExchangeSettings {
    export const enum Id {
        SymbolNameFieldId,
        SymbolSearchFieldIds,
    }

    export const idCount = 2;

    export const AllowableSymbolSearchFieldIds = [
        SearchSymbolsDataDefinition.FieldId.Code,
        SearchSymbolsDataDefinition.FieldId.Name,
        SearchSymbolsDataDefinition.FieldId.Ticker,
    ];

    export const AllowableSymbolNameFieldIds = [
        SearchSymbolsDataDefinition.FieldId.Name,
        SearchSymbolsDataDefinition.FieldId.Ticker,
    ];

    export type SettingChangedEventer = (this: void, id: Id) => void;

    export type InfosObject = { [id in keyof typeof Id]: TypedKeyValueSettings.Info };

    export namespace Default {
        export const symbolNameFieldId = SearchSymbolsDataDefinition.FieldId.Name;
        export const symbolSearchFieldIds = [SearchSymbolsDataDefinition.FieldId.Code, SearchSymbolsDataDefinition.FieldId.Name];
    }
}
