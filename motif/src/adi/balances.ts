/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import Decimal from 'decimal.js-light';
import { RevRecordValueRecentChangeTypeId } from 'revgrid';
import { StringId, Strings } from 'src/res/internal-api';
import {
    AssertInternalError,
    CorrectnessId,
    EnumInfoOutOfOrderError,
    Integer,
    isDecimalEqual,
    isDecimalGreaterThan,
    JsonElement,
    MapKey,
    MultiEvent,
    UnreachableCaseError
} from 'src/sys/internal-api';
import { Account } from './account';
import { BrokerageAccountDataRecord } from './brokerage-account-data-record';
import {
    BrokerageAccountId, Currency, CurrencyId,
    ExchangeEnvironment, ExchangeEnvironmentId, ExchangeInfo,
    FieldDataTypeId
} from './common/internal-api';
import { DataRecord } from './data-record';

export class Balances implements BrokerageAccountDataRecord {
    private _netBalance = Balances.initialiseValue;
    private _trading = Balances.initialiseValue;
    private _nonTrading = Balances.initialiseValue;
    private _unfilledBuys = Balances.initialiseValue;
    private _margin = Balances.initialiseValue;

    private _mapKey: MapKey;

    private _changedMultiEvent = new MultiEvent<Balances.ChangedEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<Balances.FeedCorrectnessChangedEventHandler>();

    get accountId() { return this._account.id; }
    get environmentId() { return this._account.environmentId; }
    get currencyId() { return this._currencyId; }

    get netBalance() { return this._netBalance; }
    get trading() { return this._trading; }
    get nonTrading() { return this._nonTrading; }
    get unfilledBuys() { return this._unfilledBuys; }
    get margin() { return this._margin; }

    get correctnessId() { return this._correctnessId; }

    get mapKey() { return this._mapKey; }
    get accountMapKey() { return this._account.mapKey; }

    constructor(private readonly _account: Account,
        private readonly _currencyId: CurrencyId,
        private _correctnessId: CorrectnessId
    ) {
        this._mapKey = Balances.Key.generateMapKey(this.accountId, this.environmentId, this.currencyId);
    }

    dispose() {
        // no resources to release
    }

    createKey(): Balances.Key {
        return new Balances.Key(this.accountId, this.environmentId, this.currencyId);
    }

    setListCorrectness(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    initialise() {
        const fieldCount = Balances.Field.idCount;
        const valueChanges = new Array<Balances.ValueChange>(fieldCount);
        let valueChangeCount = 0;
        for (let fieldId = 0; fieldId < Balances.Field.idCount; fieldId++) {
            if (Balances.Field.idIsValueChangeable(fieldId)) {
                const recentChangeTypeId = this.updateField(fieldId, Balances.initialiseValue);
                if (recentChangeTypeId) {
                    valueChanges[valueChangeCount++] = { fieldId, recentChangeTypeId };
                }
            }
        }
        if (valueChangeCount > 0) {
            valueChanges.length = valueChangeCount;
            this.notifyChanged(valueChanges);
        }
    }

    update(balanceValues: Balances.BalanceValue[], count: Integer) {
        const valueChanges = new Array<Balances.ValueChange>(count);
        let valueChangeCount = 0;
        for (let i = 0; i < count; i++) {
            const balanceValue = balanceValues[i];
            const fieldId = Balances.Field.tryBalanceTypeToId(balanceValue.type);
            if (fieldId === undefined) {
                // ignore for now.
            } else {
                const recentChangeTypeId = this.updateField(fieldId, balanceValue.amount);

                if (recentChangeTypeId !== undefined) {
                    valueChanges[valueChangeCount++] = { fieldId, recentChangeTypeId };
                }
            }
        }

        if (valueChangeCount > 0) {
            valueChanges.length = valueChangeCount;
            this.notifyChanged(valueChanges);
        }
    }

    subscribeChangedEvent(handler: Balances.ChangedEventHandler): MultiEvent.DefinedSubscriptionId {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: Balances.FeedCorrectnessChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyChanged(valueChanges: Balances.ValueChange[]) {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](valueChanges);
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }

    private updateField(fieldId: Balances.FieldId, amount: Decimal) {
        let recentChangeTypeId: RevRecordValueRecentChangeTypeId | undefined;
        switch (fieldId) {
            case Balances.FieldId.NetBalance:
                if (!isDecimalEqual(amount, this._netBalance)) {
                    recentChangeTypeId = isDecimalGreaterThan(amount, this._netBalance)
                        ? RevRecordValueRecentChangeTypeId.Increase
                        : RevRecordValueRecentChangeTypeId.Decrease;
                    this._netBalance = amount;
                }
                break;
            case Balances.FieldId.Trading:
                if (!isDecimalEqual(amount, this._trading)) {
                    recentChangeTypeId = isDecimalGreaterThan(amount, this._trading)
                        ? RevRecordValueRecentChangeTypeId.Increase
                        : RevRecordValueRecentChangeTypeId.Decrease;
                    this._trading = amount;
                }
                break;
            case Balances.FieldId.NonTrading:
                if (!isDecimalEqual(amount, this._nonTrading)) {
                    recentChangeTypeId = isDecimalGreaterThan(amount, this._nonTrading)
                        ? RevRecordValueRecentChangeTypeId.Increase
                        : RevRecordValueRecentChangeTypeId.Decrease;
                    this._nonTrading = amount;
                }
                break;
            case Balances.FieldId.UnfilledBuys:
                if (!isDecimalEqual(amount, this._unfilledBuys)) {
                    recentChangeTypeId = isDecimalGreaterThan(amount, this._unfilledBuys)
                        ? RevRecordValueRecentChangeTypeId.Increase
                        : RevRecordValueRecentChangeTypeId.Decrease;
                    this._unfilledBuys = amount;
                }
                break;
            case Balances.FieldId.Margin:
                if (!isDecimalEqual(amount, this._margin)) {
                    recentChangeTypeId = isDecimalGreaterThan(amount, this._margin)
                        ? RevRecordValueRecentChangeTypeId.Increase
                        : RevRecordValueRecentChangeTypeId.Decrease;
                    this._margin = amount;
                }
                break;
            case Balances.FieldId.AccountId:
            case Balances.FieldId.Currency:
                throw new AssertInternalError('ACBU56599344399');
            default:
                throw new UnreachableCaseError('ACBU545400393', fieldId);
        }
        return recentChangeTypeId;
    }
}

export namespace Balances {
    export type Id = string;
    export const initialiseValue = new Decimal(0);

    export interface BalanceValue {
        readonly type: string;
        amount: Decimal;
    }

    export type ChangedEventHandler = (valueChanges: ValueChange[]) => void;
    export type FeedCorrectnessChangedEventHandler = (this: void) => void;

    // NonTrading is your unbooked transactions
    // Trading is your Net Balance, less Unbooked, less Unfilled buys, plus Margin
    export const enum FieldId {
        AccountId,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        Currency,
        NetBalance,
        Trading,
        NonTrading,
        UnfilledBuys,
        Margin,
    }

    export namespace Field {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type Id = FieldId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly balanceType: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfoObject = { [id in keyof typeof FieldId]: Info };

        const infoObject: InfoObject = {
            AccountId: {
                id: FieldId.AccountId,
                name: 'AccountId',
                balanceType: '',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BalancesFieldDisplay_AccountId,
                headingId: StringId.BalancesFieldHeading_AccountId,
            },
            Currency: {
                id: FieldId.Currency,
                name: 'Currency',
                balanceType: '',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.BalancesFieldDisplay_CurrencyId,
                headingId: StringId.BalancesFieldHeading_CurrencyId,
            },
            NetBalance: {
                id: FieldId.NetBalance,
                name: 'NetBalance',
                balanceType: 'NetBalance',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.BalancesFieldDisplay_NetBalance,
                headingId: StringId.BalancesFieldHeading_NetBalance,
            },
            Trading: {
                id: FieldId.Trading,
                name: 'Trading',
                balanceType: 'Trading',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.BalancesFieldDisplay_Trading,
                headingId: StringId.BalancesFieldHeading_Trading,
            },
            NonTrading: {
                id: FieldId.NonTrading,
                name: 'NonTrading',
                balanceType: 'NonTrading',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.BalancesFieldDisplay_NonTrading,
                headingId: StringId.BalancesFieldHeading_NonTrading,
            },
            UnfilledBuys: {
                id: FieldId.UnfilledBuys,
                name: 'UnfilledBuys',
                balanceType: 'UnfilledBuys',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.BalancesFieldDisplay_UnfilledBuys,
                headingId: StringId.BalancesFieldHeading_UnfilledBuys,
            },
            Margin: {
                id: FieldId.Margin,
                name: 'Margin',
                balanceType: 'Margin',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.BalancesFieldDisplay_Margin,
                headingId: StringId.BalancesFieldHeading_Margin,
            },
        };

        export const idCount = Object.keys(infoObject).length;
        const infos = Object.values(infoObject);

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToBalanceType(id: Id) {
            return infos[id].balanceType;
        }

        export function tryBalanceTypeToId(value: string): FieldId | undefined {
            for (let id = 0; id < idCount; id++) {
                const info = infos[id];
                if (value === info.balanceType) {
                    return id;
                }
            }
            return undefined;
        }

        export function idIsValueChangeable(id: Id) {
            return infos[id].balanceType.length !== 0;
        }

        export function idToFieldDataTypeId(id: FieldId) {
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
                throw new EnumInfoOutOfOrderError('ACBFISF222923323', outOfOrderIdx, infos[outOfOrderIdx].toString());
            }
        }
    }

    export class Key implements DataRecord.Key {
        static readonly JsonTag_AccountId = 'accountId';
        static readonly JsonTag_EnvironmentId = 'environmentId';
        static readonly JsonTag_CurrencyId = 'currencyId';

        private _mapKey: string;

        get mapKey() { return this._mapKey; }

        constructor(public accountId: BrokerageAccountId,
            public environmentId: ExchangeEnvironmentId,
            public currencyId: CurrencyId,
        ) {
            this._mapKey = Key.generateMapKey(this.accountId, this.environmentId, this.currencyId);
        }

        static createNull() {
            // will not match any valid holding
            return new Key('', ExchangeInfo.getDefaultEnvironmentId(), CurrencyId.Aud);
        }

        saveToJson(element: JsonElement, includeEnvironment: boolean = false) {
            element.setString(Key.JsonTag_CurrencyId, Currency.idToJsonValue(this.currencyId));
            element.setString(Key.JsonTag_AccountId, this.accountId);
            if (includeEnvironment) {
                element.setString(Key.JsonTag_EnvironmentId, ExchangeEnvironment.idToJsonValue(this.environmentId));
            }
        }

        get generateMapKey() {
            return this._mapKey;
        }
    }

    export namespace Key {
        export function generateMapKey(accountId: BrokerageAccountId,
            environmentId: ExchangeEnvironmentId,
            currencyId: CurrencyId) {
            return `${accountId}|${Currency.idToName(currencyId)}|${environmentId}`;
        }

        export function isEqual(left: Key, right: Key) {
            return left.accountId === right.accountId &&
                left.currencyId === right.currencyId &&
                left.environmentId === right.environmentId;
        }

        export function tryCreateFromJson(element: JsonElement) {
            const jsonCurrencyString = element.tryGetString(Key.JsonTag_CurrencyId);
            if (jsonCurrencyString === undefined) {
                return 'Undefined CurrencyId';
            } else {
                const currencyId = Currency.tryJsonValueToId(jsonCurrencyString);
                if (currencyId === undefined) {
                    return `Unknown CurrencyId: ${jsonCurrencyString}`;
                } else {
                        const accountId = element.tryGetString(Key.JsonTag_AccountId);
                    if (accountId === undefined) {
                        return 'Undefined Account';
                    } else {
                        const jsonEnvironmentString = element.tryGetString(Key.JsonTag_EnvironmentId);
                        if (jsonEnvironmentString === undefined) {
                            return new Key(accountId, ExchangeInfo.getDefaultEnvironmentId(), currencyId);
                        } else {
                            const environmentId = ExchangeEnvironment.tryJsonToId(jsonEnvironmentString);
                            if (environmentId === undefined) {
                                return `Unknown EnvironmentId: ${jsonEnvironmentString}`;
                            } else {
                                return new Key(accountId, environmentId, currencyId);
                            }
                        }
                    }
                }
            }
        }
    }

    export interface ValueChange {
        fieldId: FieldId;
        recentChangeTypeId: RevRecordValueRecentChangeTypeId | undefined;
    }

    export function createNotFoundBalances(key: Balances.Key) {
        const accountKey = new Account.Key(key.accountId, key.environmentId);
        const balances = new Balances(Account.createNotFoundAccount(accountKey),
            Currency.nullCurrencyId,
            CorrectnessId.Error,
        );
        return balances;
    }

    export function initialiseStatic() {
        Field.initialiseStaticField();
    }
}

export namespace BalancesModule {
    export function initialiseStatic() {
        Balances.initialiseStatic();
    }
}
