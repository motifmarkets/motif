/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { StringId, Strings } from 'src/res/internal-api';
import {
    CorrectnessId,
    EnumInfoOutOfOrderError,
    ExternalError,
    Integer,
    isDecimalEqual,
    JsonElement,
    MapKey,
    MultiEvent,
    ZenithDataError
} from 'src/sys/internal-api';
import { Account } from './account';
import { BrokerageAccountDataRecord } from './brokerage-account-data-record';
import {
    BrokerageAccountId,
    Currency,
    CurrencyId,
    ExchangeEnvironment,
    ExchangeEnvironmentId,
    ExchangeId,
    ExchangeInfo,
    FieldDataTypeId,
    HoldingsDataMessage,
    IvemClassId,
    IvemId,
    LitIvemId
} from './common/internal-api';
import { DataRecord } from './data-record';

export class Holding implements BrokerageAccountDataRecord {
    private _exchangeId: ExchangeId;
    private _environmentId: ExchangeEnvironmentId;
    private _code: string;
    private readonly _accountId: BrokerageAccountId;
    private _styleId: IvemClassId;
    private _cost: Decimal;
    private _currencyId: CurrencyId | undefined;
    private _totalQuantity: Integer;
    private _totalAvailableQuantity: Integer;
    private _averagePrice: Decimal;

    private _mapKey: MapKey;

    private _changedMultiEvent = new MultiEvent<Holding.ChangedEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<Holding.CorrectnessChangedEventHandler>();

    get account() { return this._account; }

    get exchangeId() { return this._exchangeId; }
    get environmentId() { return this._environmentId; }
    get code() { return this._code; }
    get accountId() { return this._accountId; }
    get styleId() { return this._styleId; }
    get cost() { return this._cost; }
    get currencyId() { return this._currencyId; }
    get totalQuantity() { return this._totalQuantity; }
    get totalAvailableQuantity() { return this._totalAvailableQuantity; }
    get averagePrice() { return this._averagePrice; }

    get correctnessId() { return this._correctnessId; }

    get mapKey() {
        if (this._mapKey === undefined) {
            this._mapKey = Holding.Key.generateMapKey(this.exchangeId, this.code, this.accountId, this.environmentId);
        }
        return this._mapKey;
    }
    get accountMapKey() { return this._account.mapKey; }
    get defaultLitIvemId() {
        const defaultMarketId = ExchangeInfo.idToDefaultMarketId(this.exchangeId);
        if (defaultMarketId === undefined) {
            return undefined;
        } else {
            return LitIvemId.createFromCodeMarket(this.code, defaultMarketId);
        }
    }
    get ivemId() {
        return new IvemId(this.code, this.exchangeId);
    }

    constructor(private readonly _account: Account,
        changeData: HoldingsDataMessage.MarketChangeData,
        private _correctnessId: CorrectnessId
    ) {
        this._exchangeId = changeData.exchangeId;
        this._environmentId = changeData.environmentId;
        this._code = changeData.code;
        this._accountId = changeData.accountId;
        this._styleId = changeData.styleId;
        this._cost = changeData.cost;
        this._currencyId = changeData.currencyId;
        const changeMarketDetail = changeData.marketDetail;
        this._totalQuantity = changeMarketDetail.totalQuantity;
        this._totalAvailableQuantity = changeMarketDetail.totalAvailableQuantity;
        this._averagePrice = changeMarketDetail.averagePrice;
    }

    dispose() {
        // no resources to release
    }

    createKey() {
        return new Holding.Key(this.exchangeId, this.code, this.accountId, this.environmentId);
    }

    setListCorrectness(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    update(changeData: HoldingsDataMessage.MarketChangeData) {
        const changedFieldIds = new Array<Holding.FieldId>(Holding.Field.idCount);
        let changedIdx = 0;

        if (changeData.exchangeId !== this.exchangeId) {
            this._exchangeId = changeData.exchangeId;
            changedFieldIds[changedIdx++] = Holding.FieldId.ExchangeId;
        }

        if (changeData.code !== this.code) {
            this._code = changeData.code;
            changedFieldIds[changedIdx++] = Holding.FieldId.Code;
        }

        if (changeData.accountId !== this.accountId) {
            throw new ZenithDataError(ExternalError.Code.HU0882468723, JSON.stringify(changeData));
        }

        if (changeData.styleId !== this.styleId) {
            this._styleId = changeData.styleId;
            changedFieldIds[changedIdx++] = Holding.FieldId.StyleId;
        }

        if (this.cost === undefined || !isDecimalEqual(changeData.cost, this.cost)) {
            this._cost = changeData.cost; // from message so take Decimal object
            changedFieldIds[changedIdx++] = Holding.FieldId.Cost;
        }

        if (changeData.currencyId !== this.currencyId) {
            this._currencyId = changeData.currencyId;
            changedFieldIds[changedIdx++] = Holding.FieldId.Currency;
        }

        const changeMarketDetail = changeData.marketDetail;

        if (changeMarketDetail.totalQuantity !== this.totalQuantity) {
            this._totalQuantity = changeMarketDetail.totalQuantity;
            changedFieldIds[changedIdx++] = Holding.FieldId.TotalQuantity;
        }

        if (changeMarketDetail.totalAvailableQuantity !== this.totalAvailableQuantity) {
            this._totalAvailableQuantity = changeMarketDetail.totalAvailableQuantity;
            changedFieldIds[changedIdx++] = Holding.FieldId.TotalAvailableQuantity;
        }

        if (this.averagePrice === undefined || !isDecimalEqual(changeMarketDetail.averagePrice, this.averagePrice)) {
            this._averagePrice = changeMarketDetail.averagePrice; // from message so take Decimal object
            changedFieldIds[changedIdx++] = Holding.FieldId.AveragePrice;
        }

        if (changedIdx >= 0) {
            changedFieldIds.length = changedIdx;
            this.notifyChanged(changedFieldIds);
        }
    }

    subscribeChangedEvent(handler: Holding.ChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: Holding.CorrectnessChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyChanged(changedFieldIds: Holding.FieldId[]) {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](changedFieldIds);
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }
}

export namespace Holding {
    export type Id = string;
    export const NullId = '';

    export type ChangedEventHandler = (changedFieldIds: Holding.FieldId[]) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export const enum FieldId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        ExchangeId,
        Code,
        AccountId,
        StyleId,
        Cost,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        Currency,
        TotalQuantity,
        TotalAvailableQuantity,
        AveragePrice,
    }

    export namespace Field {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type Id = Holding.FieldId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfoObject = { [id in keyof typeof FieldId]: Info };

        const infoObject: InfoObject = {
            ExchangeId: {
                id: FieldId.ExchangeId,
                name: 'Exchange',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.HoldingFieldDisplay_ExchangeId,
                headingId: StringId.HoldingFieldHeading_ExchangeId,
            },
            Code: {
                id: FieldId.Code,
                name: 'Code',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.HoldingFieldDisplay_Code,
                headingId: StringId.HoldingFieldHeading_Code,
            },
            AccountId: {
                id: FieldId.AccountId,
                name: 'AccountId',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.HoldingFieldDisplay_AccountId,
                headingId: StringId.HoldingFieldHeading_AccountId,
            },
            StyleId: {
                id: FieldId.StyleId,
                name: 'Style',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.HoldingFieldDisplay_Style,
                headingId: StringId.HoldingFieldHeading_Style,
            },
            Cost: {
                id: FieldId.Cost,
                name: 'Cost',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.HoldingFieldDisplay_Cost,
                headingId: StringId.HoldingFieldHeading_Cost,
            },
            Currency: {
                id: FieldId.Currency,
                name: 'Currency',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.HoldingFieldDisplay_Currency,
                headingId: StringId.HoldingFieldHeading_Currency,
            },
            TotalQuantity: {
                id: FieldId.TotalQuantity,
                name: 'TotalQuantity',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.HoldingFieldDisplay_TotalQuantity,
                headingId: StringId.HoldingFieldHeading_TotalQuantity,
            },
            TotalAvailableQuantity: {
                id: FieldId.TotalAvailableQuantity,
                name: 'TotalAvailableQuantity',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.HoldingFieldDisplay_TotalAvailableQuantity,
                headingId: StringId.HoldingFieldHeading_TotalAvailableQuantity,
            },
            AveragePrice: {
                id: FieldId.AveragePrice,
                name: 'AveragePrice',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.HoldingFieldDisplay_AveragePrice,
                headingId: StringId.HoldingFieldHeading_AveragePrice,
            },
        };

        export const idCount = Object.keys(infoObject).length;
        const infos = Object.values(infoObject);

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }

        export function initialiseStaticField() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('OIODIFIS3885', outOfOrderIdx, infos[outOfOrderIdx].toString());
            }
        }
    }

    export class Key implements DataRecord.Key {
        static readonly JsonTag_ExchangeId = 'exchangeId';
        static readonly JsonTag_Code = 'code';
        static readonly JsonTag_AccountId = 'accountId';
        static readonly JsonTag_EnvironmentId = 'environmentId';

        private _mapKey: string;

        get mapKey() { return this._mapKey; }

        constructor(public exchangeId: ExchangeId,
            public code: string,
            public accountId: BrokerageAccountId,
            public environmentId: ExchangeEnvironmentId
        ) {
            this._mapKey = Key.generateMapKey(this.exchangeId, this.code, this.accountId, this.environmentId);
        }

        static createNull() {
            // will not match any valid holding
            return new Key(ExchangeId.Asx, '', '', ExchangeInfo.getDefaultEnvironmentId());
        }

        saveToJson(element: JsonElement, includeEnvironment: boolean = false) {
            element.setString(Key.JsonTag_ExchangeId, ExchangeInfo.idToJsonValue(this.exchangeId));
            element.setString(Key.JsonTag_Code, this.code);
            element.setString(Key.JsonTag_AccountId, this.accountId);
            if (includeEnvironment) {
                element.setString(Key.JsonTag_EnvironmentId, ExchangeEnvironment.idToJsonValue(this.environmentId));
            }
        }
    }

    export namespace Key {
        export function generateMapKey(exchangeId: ExchangeId,
            code: string,
            accountId: BrokerageAccountId,
            environmentId: ExchangeEnvironmentId): string {
            return `${code}|${accountId}|${ExchangeInfo.idToName(exchangeId)}|${environmentId}`;
        }

        export function isEqual(left: Key, right: Key) {
            return left.code === right.code &&
                left.accountId === right.accountId &&
                left.exchangeId === right.exchangeId &&
                left.environmentId === right.environmentId;
        }

        export function tryCreateFromJson(element: JsonElement) {
            const jsonExchangeString = element.tryGetString(Key.JsonTag_ExchangeId);
            if (jsonExchangeString === undefined) {
                return 'Undefined ExchangeId';
            } else {
                const exchangeId = ExchangeInfo.tryJsonValueToId(jsonExchangeString);
                if (exchangeId === undefined) {
                    return `Unknown ExchangeId: ${jsonExchangeString}`;
                } else {
                    const code = element.tryGetString(Key.JsonTag_Code);
                    if (code === undefined) {
                        return 'Undefined Code';
                    } else {
                        const accountId = element.tryGetString(Key.JsonTag_AccountId);
                        if (accountId === undefined) {
                            return 'Undefined Account';
                        } else {
                            const jsonEnvironmentString = element.tryGetString(Key.JsonTag_EnvironmentId);
                            if (jsonEnvironmentString === undefined) {
                                return new Key(exchangeId, code, accountId, ExchangeInfo.getDefaultEnvironmentId());
                            } else {
                                const environmentId = ExchangeEnvironment.tryJsonToId(jsonEnvironmentString);
                                if (environmentId === undefined) {
                                    return `Unknown EnvironmentId: ${jsonEnvironmentString}`;
                                } else {
                                    return new Key(exchangeId, code, accountId, environmentId);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    export function createNotFoundHolding(key: Holding.Key) {
        const accountKey = new Account.Key(key.accountId, key.environmentId);
        const marketDetail: HoldingsDataMessage.MarketChangeData.Detail = {
            totalQuantity: 0,
            totalAvailableQuantity: 0,
            averagePrice: new Decimal(0),
        };

        const msgData: HoldingsDataMessage.MarketChangeData = {
            exchangeId: key.exchangeId,
            environmentId: key.environmentId,
            code: key.code,
            accountId: key.accountId,
            styleId: IvemClassId.Market,
            cost: new Decimal(0),
            currencyId: Currency.nullCurrencyId,
            marketDetail,
        };

        const holding = new Holding(Account.createNotFoundAccount(accountKey),
            msgData,
            CorrectnessId.Error,
        );

        return holding;
    }

    export function initialiseStatic() {
        Field.initialiseStaticField();
    }
}

export namespace HoldingModule {
    export function initialiseStatic() {
        Holding.initialiseStatic();
    }
}
