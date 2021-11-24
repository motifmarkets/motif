/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'res-internal-api';
import { RevRecordValueRecentChangeTypeId } from 'revgrid';
import { Correctness, CorrectnessId, EnumInfoOutOfOrderError, Integer, JsonElement, MapKey, MultiEvent } from 'sys-internal-api';
import {
    BrokerageAccountId,
    Currency,
    CurrencyId,
    ExchangeEnvironment,
    ExchangeEnvironmentId,
    ExchangeInfo,
    FeedStatus,
    FieldDataTypeId
} from './common/internal-api';
import { DataRecord } from './data-record';
import { TradingFeed } from './trading-feed';

export class Account implements DataRecord {
    private _upperId: string;
    private _upperName: string;
    private _mapKey: MapKey;

    private _usable = false;
    private _correctnessId = CorrectnessId.Suspect;

    private _tradingFeedCorrectnessChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _tradingFeedStatusChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _changeEvent = new MultiEvent<Account.ChangeEventHandler>();
    private _correctnessChangedEvent = new MultiEvent<Account.CorrectnessChangedEventHandler>();

    constructor(private _id: Account.Id,
        private _name: string,
        private _environmentId: ExchangeEnvironmentId,
        private _currencyId: CurrencyId,
        private _tradingFeed: TradingFeed,
        private _listCorrectnessId: CorrectnessId,
    ) {
        this._upperId = this._id.toUpperCase();
        this._upperName = this._name.toUpperCase();
        // Need to get FeedStatus correctness information from TradingFeed as TradingFeed correctness not availabe from DataItem
        this._tradingFeedCorrectnessChangedSubscriptionId = this._tradingFeed.subscribeCorrectnessChangedEvent(
            () => this.updateCorrectness()
        );
        this._tradingFeedStatusChangedSubscriptionId = this._tradingFeed.subscribeStatusChangedEvent(
            () => this.updateCorrectness()
        );
        this.updateCorrectness();
    }

    get id() { return this._id; }
    get upperId() { return this._upperId; }
    get name() { return this._name; }
    get upperName() { return this._upperName; }
    get environmentId() { return this._environmentId; }
    get tradingFeed() { return this._tradingFeed; }
    get currencyId() { return this._currencyId; }

    get usable() { return this._usable; }
    get correctnessId() { return this._correctnessId; }

    get mapKey() {
        if (this._mapKey === undefined) {
            this._mapKey = Account.Key.generateMapKey(this.id, this.environmentId);
        }
        return this._mapKey;
    }

    dispose() {
        this._tradingFeed.unsubscribeCorrectnessChangedEvent(this._tradingFeedCorrectnessChangedSubscriptionId);
        this._tradingFeed.unsubscribeStatusChangedEvent(this._tradingFeedStatusChangedSubscriptionId);
    }

    createKey(): Account.Key {
        return new Account.Key(this.id, this.environmentId);
    }

    setListCorrectness(value: CorrectnessId) {
        this._listCorrectnessId = value;
        this.updateCorrectness();
    }

    change(name: string | undefined, currencyId: CurrencyId | undefined) {
        const valueChanges = new Array<Account.ValueChange>(Account.Field.idCount - Account.Key.fieldCount); // won't include fields in key
        let changedCount = 0;
        if (name !== undefined && name !== this.name) {
            this._name = name;
            this._upperName = name.toUpperCase();
            valueChanges[changedCount++] = {
                fieldId: Account.FieldId.Name,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update
            };
        }
        if (currencyId !== undefined && currencyId !== this.currencyId) {
            this._currencyId = currencyId;
            valueChanges[changedCount++] = {
                fieldId: Account.FieldId.CurrencyId,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update
            };
        }

        if (changedCount >= 0) {
            valueChanges.length = changedCount;
            this.notifyChange(valueChanges);
        }
    }

    subscribeChangeEvent(handler: Account.ChangeEventHandler) {
        return this._changeEvent.subscribe(handler);
    }

    unsubscribeChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changeEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: Account.CorrectnessChangedEventHandler) {
        return this._correctnessChangedEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedEvent.unsubscribe(subscriptionId);
    }

    private notifyChange(valueChanges: Account.ValueChange[]) {
        const handlers = this._changeEvent.copyHandlers();
        for (const handler of handlers) {
            handler(valueChanges);
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private updateCorrectness() {
        // Note that there is not any FeedBrokerageAccountDataItem
        // BrokerageAccountDataItem correctness only takes into account Authority Feed - not Trading Feed
        // It is possible to get Trading Feed status from either Account messages or TradingFeed
        // Use TradingFeed status so all accounts are simultaneously updated if Trading Feed changes
        // Need to make sure that TradingFeed is usable.  This ensures that it also takes into account OrderStatuses being ready

        let correctnessId: CorrectnessId;
        if (this._tradingFeed.usable) {
            const tradingFeedStatusCorrectnessId = FeedStatus.idToCorrectnessId(this._tradingFeed.statusId);
            correctnessId = Correctness.merge2Ids(this._listCorrectnessId, tradingFeedStatusCorrectnessId);
        } else {
            correctnessId = Correctness.merge2Ids(this._listCorrectnessId, this._tradingFeed.correctnessId);
        }

        if (correctnessId !== this._correctnessId) {
            this._correctnessId = correctnessId;
            this._usable = Correctness.idIsUsable(correctnessId);
            this.notifyCorrectnessChanged();
        }
    }
}

export namespace Account {
    export type Id = BrokerageAccountId;
    export const NullId = '';

    export function isEqual(left: Account, right: Account): boolean {
        return BrokerageAccountId.isEqual(left.id, right.id);
    }

    export const enum FieldId {
        Id,
        EnvironmentId,
        Name,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        CurrencyId,
    }

    export interface ValueChange {
        fieldId: FieldId;
        recentChangeTypeId: RevRecordValueRecentChangeTypeId;
    }

    export type ChangeEventHandler = (this: void, valueChanges: Account.ValueChange[]) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export namespace Field {
        interface Info {
            readonly id: FieldId;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfoObjects = { [id in keyof typeof FieldId]: Info };

        const infoObjects: InfoObjects = {
            Id: {
                id: FieldId.Id,
                name: 'Id',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BrokerageAccountFieldDisplay_Code,
                headingId: StringId.BrokerageAccountFieldHeading_Code,
            },
            EnvironmentId: {
                id: FieldId.EnvironmentId,
                name: 'EnvironmentId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.BrokerageAccountFieldDisplay_EnvironmentId,
                headingId: StringId.BrokerageAccountFieldHeading_EnvironmentId,
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BrokerageAccountFieldDisplay_Name,
                headingId: StringId.BrokerageAccountFieldHeading_Name,
            },
            // FeedName: {
            //     id: FieldId.FeedName,
            //     name: 'FeedName',
            //     dataTypeId: FieldDataTypeId.String,
            //     displayId: StringId.BrokerageAccountFieldDisplay_TradingFeedName,
            //     headingId: StringId.BrokerageAccountFieldHeading_TradingFeedName,
            // },
            // FeedStatusId: {
            //     id: FieldId.FeedStatusId,
            //     name: 'FeedStatusId',
            //     dataTypeId: FieldDataTypeId.Enumeration,
            //     displayId: StringId.BrokerageAccountFieldDisplay_FeedStatusId,
            //     headingId: StringId.BrokerageAccountFieldHeading_FeedStatusId,
            // },
            CurrencyId: {
                id: FieldId.CurrencyId,
                name: 'CurrencyId',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BrokerageAccountFieldDisplay_CurrencyId,
                headingId: StringId.BrokerageAccountFieldHeading_CurrencyId,
            },
        };

        export const idCount = Object.keys(infoObjects).length;
        const infos = Object.values(infoObjects);

        export function idToName(id: FieldId) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: FieldId) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: FieldId) {
            return infos[id].displayId;
        }

        export function idToHeadingId(id: FieldId) {
            return infos[id].headingId;
        }

        export function idToHeading(id: FieldId) {
            return Strings[idToHeadingId(id)];
        }

        export function initialiseField() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('BrokerageAccountsDataItem.FieldId', outOfOrderIdx, infos[outOfOrderIdx].toString());
            }
        }
    }

    export class Key implements DataRecord.Key {
        static readonly JsonTag_Id = 'id';
        static readonly JsonTag_EnvironmentId = 'environmentId';

        private _mapKey: MapKey;

        constructor(private _id: Account.Id, private _environmentId: ExchangeEnvironmentId) {
            this._mapKey = Key.generateMapKey(this.id, this.environmentId);
        }

        get id() { return this._id; }
        get environmentId() { return this._environmentId; }
        get mapKey() { return this._mapKey; }

        static createNull() {
            // will not match any valid holding
            return new Key(Account.NullId, ExchangeEnvironmentId.Demo);
        }

        compareTo(other: Key) {
            const result = BrokerageAccountId.compare(this.id, other.id);
            if (result === 0) {
                return ExchangeEnvironment.compareId(this.environmentId, other.environmentId);
            } else {
                return result;
            }
        }

        saveToJson(element: JsonElement, includeEnvironment: boolean = false) {
            element.setString(Key.JsonTag_Id, this.id);
            if (includeEnvironment) {
                element.setString(Key.JsonTag_EnvironmentId, ExchangeEnvironment.idToJsonValue(this.environmentId));
            }
        }
    }

    export namespace Key {
        export const fieldCount = 2; // uses 2 fields: id and environmentId

        export function generateMapKey(id: string, environmentId: ExchangeEnvironmentId): MapKey {
            return ExchangeEnvironment.idToCode(environmentId) + '|' + id;
        }

        export function toString(accountId: Account.Id): string {
            return accountId;
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function isEqual(left: Key, right: Key) {
            return left.id === right.id &&
                left.environmentId === right.environmentId;
        }

        export function tryCreateFromJson(element: JsonElement) {
            const jsonId = element.tryGetString(Key.JsonTag_Id);
            if (jsonId === undefined) {
                return 'Undefined Id';
            } else {
                const jsonEnvironmentString = element.tryGetString(Key.JsonTag_EnvironmentId);
                if (jsonEnvironmentString === undefined) {
                    return new Key(jsonId, ExchangeInfo.getDefaultEnvironmentId());
                } else {
                    const environmentId = ExchangeEnvironment.tryJsonToId(jsonEnvironmentString);
                    if (environmentId === undefined) {
                        return `Unknown EnvironmentId: ${jsonEnvironmentString}`;
                    } else {
                        return new Key(jsonId, environmentId);
                    }
                }
            }
        }
    }

    export function createNotFoundAccount(key: Account.Key) {
        const account = new Account(key.id,
            `<${Strings[StringId.BrokerageAccountNotFound]}!>`,
            key.environmentId,
            Currency.nullCurrencyId,
            TradingFeed.nullFeed,
            CorrectnessId.Error,
        );
        return account;
    }
}
