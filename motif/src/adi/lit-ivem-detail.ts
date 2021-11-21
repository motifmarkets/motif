/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import { EnumInfoOutOfOrderError, isUndefinableArrayEqualUniquely, MultiEvent } from 'src/sys/internal-api';
import {
    ExchangeId,
    FieldDataTypeId,
    IvemClassId,
    LitIvemAlternateCodes,
    LitIvemId,
    MarketId,
    SymbolsDataMessage,
    ZenithSubscriptionDataId
} from './common/internal-api';

export class LitIvemDetail {
    litIvemId: LitIvemId;
    ivemClassId: IvemClassId;
    subscriptionDataIds: ZenithSubscriptionDataId[];
    tradingMarketIds: MarketId[];
    name: string;
    exchangeId: ExchangeId;
    // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be here in future
    alternateCodes: LitIvemAlternateCodes;

    private _baseChangeEvent = new MultiEvent<LitIvemDetail.BaseChangeEventHandler>();

    // AlternateCodesFix: should be AddUpdateChange - review when AlternateCodes is moved from FullDetail to Detail
    constructor(change: SymbolsDataMessage.AddChange) {
        const litIvemId = change.litIvemId;
        let name: string;
        if (change.name !== undefined) {
            name = change.name;
        } else {
            // generate a name - need to improve this to better support TMCs and ETOs
            name = litIvemId.code;
        }

        this.litIvemId = change.litIvemId;
        this.ivemClassId = change.ivemClassId;
        this.subscriptionDataIds = change.subscriptionDataIds;
        this.tradingMarketIds = change.tradingMarketIds;
        this.name = name;
        this.exchangeId = change.exchangeId;
        const alternateCodes = change.alternateCodes;
        this.alternateCodes = alternateCodes === undefined ? {} : alternateCodes;
    }

    get key() { return this.litIvemId; }
    get code() { return this.litIvemId.code; }
    get marketId() { return this.litIvemId.litId; }
    get environmentId() { return this.litIvemId.environmentId; }
    get explicitEnvironmentId() { return this.litIvemId.explicitEnvironmentId; }

    // AlternateCodesFix: should be AddUpdateChange - review when AlternateCodes is moved from FullDetail to Detail
    update(change: SymbolsDataMessage.UpdateChange) {
        const changeableFieldCount = LitIvemDetail.BaseField.idCount - LitIvemDetail.Key.fieldCount;
        const changedFieldIds = new Array<LitIvemDetail.BaseField.Id>(changeableFieldCount); // won't include fields in key
        let changedCount = 0;

        let name: string;
        if (change.name !== undefined) {
            name = change.name;
        } else {
            // generate a name - need to improve this to better support TMCs and ETOs
            name = change.litIvemId.code;
        }

        if (change.ivemClassId !== this.ivemClassId) {
            this.ivemClassId = change.ivemClassId;
            changedFieldIds[changedCount++] = LitIvemDetail.BaseField.Id.IvemClassId;
        }
        if (!isUndefinableArrayEqualUniquely(change.subscriptionDataIds, this.subscriptionDataIds)) {
            this.subscriptionDataIds = change.subscriptionDataIds;
            changedFieldIds[changedCount++] = LitIvemDetail.BaseField.Id.SubscriptionDataIds;
        }
        if (!isUndefinableArrayEqualUniquely(change.tradingMarketIds, this.tradingMarketIds)) {
            this.tradingMarketIds = change.tradingMarketIds;
            changedFieldIds[changedCount++] = LitIvemDetail.BaseField.Id.TradingMarketIds;
        }
        if (name !== this.name) {
            this.name = name;
            changedFieldIds[changedCount++] = LitIvemDetail.BaseField.Id.Name;
        }
        if (change.exchangeId !== this.exchangeId) {
            this.exchangeId = change.exchangeId;
            changedFieldIds[changedCount++] = LitIvemDetail.BaseField.Id.ExchangeId;
        }

        const newAlternateCodes = change.alternateCodes;
        if (newAlternateCodes !== undefined) {
            if (newAlternateCodes === null) {
                if (this.alternateCodes !== undefined) {
                    this.alternateCodes = {};
                    changedFieldIds[changedCount++] = LitIvemDetail.BaseField.Id.AlternateCodes;
                }
            } else {
                if (!LitIvemAlternateCodes.isEqual(newAlternateCodes, this.alternateCodes)) {
                    this.alternateCodes = newAlternateCodes;
                    changedFieldIds[changedCount++] = LitIvemDetail.BaseField.Id.AlternateCodes;
                }
            }
        }

        if (changedCount >= 0) {
            changedFieldIds.length = changedCount;
            this.notifyBaseChange(changedFieldIds);
        }
    }


    subscribeBaseChangeEvent(handler: LitIvemDetail.BaseChangeEventHandler) {
        return this._baseChangeEvent.subscribe(handler);
    }

    unsubscribeBaseChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._baseChangeEvent.unsubscribe(subscriptionId);
    }

    private notifyBaseChange(changedFieldIds: LitIvemDetail.BaseField.Id[]) {
        const handlers = this._baseChangeEvent.copyHandlers();
        for (const handler of handlers) {
            handler(changedFieldIds);
        }
    }
}

export namespace LitIvemDetail {
    export type BaseChangeEventHandler = (this: void, changedFieldIds: BaseField.Id[]) => void;

    export namespace BaseField {
        export const enum Id {
            Id,
            Code,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            MarketId,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            IvemClassId,
            SubscriptionDataIds,
            TradingMarketIds,
            Name,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            ExchangeId,
            AlternateCodes,
        }

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof Id]: Info };

        const infosObject: InfosObject = {
            Id: {
                id: Id.Id,
                name: 'Id',
                dataTypeId: FieldDataTypeId.LitIvemId,
                displayId: StringId.BaseLitIvemDetailDisplay_Id,
                headingId: StringId.BaseLitIvemDetailHeading_Id,
            },
            Code: {
                id: Id.Code,
                name: 'Code',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BaseLitIvemDetailDisplay_Code,
                headingId: StringId.BaseLitIvemDetailHeading_Code,
            },
            MarketId: {
                id: Id.MarketId,
                name: 'MarketId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.BaseLitIvemDetailDisplay_MarketId,
                headingId: StringId.BaseLitIvemDetailHeading_MarketId,
            },
            IvemClassId: {
                id: Id.IvemClassId,
                name: 'IvemClassId',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BaseLitIvemDetailDisplay_IvemClassId,
                headingId: StringId.BaseLitIvemDetailHeading_IvemClassId,
            },
            SubscriptionDataIds: {
                id: Id.SubscriptionDataIds,
                name: 'SubscriptionDataIds',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BaseLitIvemDetailDisplay_SubscriptionDataIds,
                headingId: StringId.BaseLitIvemDetailHeading_SubscriptionDataIds,
            },
            TradingMarketIds: {
                id: Id.TradingMarketIds,
                name: 'TradingMarketIds',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BaseLitIvemDetailDisplay_TradingMarketIds,
                headingId: StringId.BaseLitIvemDetailHeading_TradingMarketIds,
            },
            Name: {
                id: Id.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BaseLitIvemDetailDisplay_Name,
                headingId: StringId.BaseLitIvemDetailHeading_Name,
            },
            ExchangeId: {
                id: Id.ExchangeId,
                name: 'ExchangeId',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.BaseLitIvemDetailDisplay_ExchangeId,
                headingId: StringId.BaseLitIvemDetailHeading_ExchangeId,
            },
            AlternateCodes: {
                id: Id.AlternateCodes,
                name: 'AlternateCodes',
                dataTypeId: FieldDataTypeId.Object,
                displayId: StringId.BaseLitIvemDetailDisplay_AlternateCodes,
                headingId: StringId.BaseLitIvemDetailHeading_AlternateCodes,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export const allNames = new Array<string>(idCount);

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (infos[id].id !== id) {
                    throw new EnumInfoOutOfOrderError('LitIvemDetail.Field', id, infos[id].name);
                } else {
                    allNames[id] = idToName(id);
                }
            }
        }

        export function idToName(id: Id): string {
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
    }

    export type Key = LitIvemId;

    export namespace Key {
        export const fieldCount = 3;
    }
}

export namespace LitIvemDetailModule {
    export function initialiseStatic() {
        LitIvemDetail.BaseField.initialise();
    }
}
