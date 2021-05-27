/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemDetail, LitIvemId, TopShareholder } from 'src/adi/internal-api';
import { EnumInfoOutOfOrderError, ExternalError, JsonElement, JsonLoadError, Logger, MapKey } from 'src/sys/internal-api';
import { CallPut } from './call-put';

export abstract class TableRecordDefinition {
    public static readonly jsonTag_TypeId = 'TypeId';

    abstract mapKey: MapKey;

    constructor(readonly typeId: TableRecordDefinition.TypeId) { }

    dispose() {
        // available for descendants to release resources
    }

    abstract createCopy(): TableRecordDefinition;
    abstract sameAs(Other: TableRecordDefinition): boolean;
    abstract saveKeyToJson(element: JsonElement): void;
}

export namespace TableRecordDefinition {
    export const enum TypeId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        LitIvemDetail,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        LitIvemId,
        Feed,
        BrokerageAccount,
//        LitIvemIdBrokerageAccount,
        Order,
        Holding,
        Balances,
//        TmcDefinitionLeg,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        CallPut,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        TopShareholder
    }

    export namespace Type {
        type Id = TableRecordDefinition.TypeId;

        interface Info {
            readonly id: Id;
            // readonly interfaceType: Guid;
            readonly jsonValue: string;
        }

        type InfoObjects = { [id in keyof typeof TableRecordDefinition.TypeId]: Info };

        const infoObjects: InfoObjects = {
            LitIvemDetail: {
                id: TableRecordDefinition.TypeId.LitIvemDetail,
                jsonValue: 'LitIvemDetail',
            },
            LitIvemId: {
                id: TableRecordDefinition.TypeId.LitIvemId,
                jsonValue: 'LitIvemId',
            },
            Feed: {
                id: TableRecordDefinition.TypeId.Feed,
                jsonValue: 'Feed',
            },
            BrokerageAccount: {
                id: TableRecordDefinition.TypeId.BrokerageAccount,
                jsonValue: 'BrokerageAccount',
            },
            // LitIvemIdBrokerageAccount: {
            //     id: TableRecordDefinition.TypeId.LitIvemIdBrokerageAccount,
            //     jsonValue: 'LitIvemIdBrokerageAccount',
            // },
            Order: {
                id: TableRecordDefinition.TypeId.Order,
                jsonValue: 'Order',
            },
            Holding: {
                id: TableRecordDefinition.TypeId.Holding,
                jsonValue: 'Holding',
            },
            Balances: {
                id: TableRecordDefinition.TypeId.Balances,
                jsonValue: 'Balances',
            },
            // TmcDefinitionLeg: {
            //     id: TableRecordDefinition.TypeId.TmcDefinitionLeg,
            //     jsonValue: 'TmcDefinitionLeg',
            // },
            CallPut: {
                id: TableRecordDefinition.TypeId.CallPut,
                jsonValue: 'CallPut',
            },
            TopShareholder: {
                id: TableRecordDefinition.TypeId.TopShareholder,
                jsonValue: 'TopShareholder',
            },
        };

        const idCount = Object.keys(infoObjects).length;
        const infos = Object.values(infoObjects);

        export function staticConstructor() {
            for (let id = 0; id < idCount; id++) {
                if (id !== infos[id].id) {
                    throw new EnumInfoOutOfOrderError('TableRecordDefinition.TypeId', id, infos[id].toString());
                }
            }
        }

        export function idToJsonValue(id: Id): string {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(value: string): Id | undefined {
            const idx = infos.findIndex((info: Info) => info.jsonValue === value);
            return (idx < 0) ? undefined : idx as Id;
        }
    }

    export function hasLitIvemDetailInterface(definition: TableRecordDefinition): definition is LitIvemDetailTableRecordDefinition {
        return (definition as LitIvemDetailTableRecordDefinition).litIvemDetailInterfaceDescriminator !== undefined;
    }

    export function hasLitIvemIdInterface(definition: TableRecordDefinition): definition is LitIvemIdTableRecordDefinition {
        return (definition as LitIvemIdTableRecordDefinition).litIvemIdInterfaceDescriminator !== undefined;
    }

/*    export function hasPortfolioInterface(definition: ITableRecordDefinition): definition is IPortfolioTableRecordDefinition {
        return (definition as IPortfolioTableRecordDefinition).portfolioInterfaceDescriminator !== undefined;
    }*/

    // export function haslitItemIdBrokerageAccountInterface(definition: ITableRecordDefinition):
    //     definition is IBrokerageAccountTableRecordDefinition {
    //     return (definition as IBrokerageAccountTableRecordDefinition).brokerageAccountInterfaceDescriminator !== undefined;
    // }

    // export function hasOrderInterface(definition: TableRecordDefinition): definition is OrderTableRecordDefinition {
    //     return (definition as OrderTableRecordDefinition).orderInterfaceDescriminator !== undefined;
    // }

    // export function hasBalancesInterface(definition: TableRecordDefinition):
    //     definition is BalancesTableRecordDefinition {
    //     return (definition as BalancesTableRecordDefinition).accountCurrencyBalancesInterfaceDescriminator !== undefined;
    // }

    // export function hasTmcDefinitionLegInterface(definition: ITableRecordDefinition):
    //     definition is ITmcDefinitionLegTableRecordDefinition {
    //     return (definition as ITmcDefinitionLegTableRecordDefinition).tmcDefinitionLegInterfaceDescriminator !== undefined;
    // }

    export function hasCallPutInterface(definition: TableRecordDefinition): definition is CallPutTableRecordDefinition {
        return (definition as CallPutTableRecordDefinition).callPutInterfaceDescriminator !== undefined;
    }

    export function hasTopShareholderInterface(definition: TableRecordDefinition): definition is TopShareholderTableRecordDefinition {
        return (definition as TopShareholderTableRecordDefinition).topShareholderInterfaceDescriminator !== undefined;
    }
}

export type TableRecordDefinitionArray = TableRecordDefinition[];

export class LitIvemDetailTableRecordDefinition extends TableRecordDefinition {
    private readonly _key: LitIvemDetail.Key;

    constructor(private readonly _litIvemDetail: LitIvemDetail) {
        super(TableRecordDefinition.TypeId.LitIvemDetail);
        this._key = this.litIvemDetail.key;
    }

    get key() { return this._key; }
    get mapKey() { return this.key.mapKey; }
    get litIvemDetail() { return this._litIvemDetail; }

    sameAs(other: TableRecordDefinition): boolean {
        if (!TableRecordDefinition.hasLitIvemDetailInterface(other)) {
            return false;
        } else {
            return this.sameLitIvemDetailAs(other);
        }
    }

    sameLitIvemDetailAs(other: LitIvemDetailTableRecordDefinition): boolean {
        return LitIvemId.isUndefinableEqual(this._key, other.key);
    }

    saveKeyToJson(element: JsonElement) {
        element.setJson(LitIvemDetailTableRecordDefinition.jsonTag_LitIvemId, this._litIvemDetail.litIvemId.toJson());
    }

    litIvemDetailInterfaceDescriminator() {
        // no code - descriminator for interface
    }

    createCopy(): TableRecordDefinition {
        return this.createLitIvemDetailCopy();
    }

    createLitIvemDetailCopy(): LitIvemDetailTableRecordDefinition {
        return new LitIvemDetailTableRecordDefinition(this._litIvemDetail);
    }
}

export namespace LitIvemDetailTableRecordDefinition {
    export const jsonTag_LitIvemId = 'LitIvemId';

    // export function tryCreateKeyFromJson(element: JsonElement) {
    //     return element.tryGetLitIvemId(jsonTag_LitIvemId);
    // }

    // export function tryCreateFromJson(element: JsonElement) {
    //     const litIvemId = tryCreateKeyFromJson(element);
    //     if (litIvemId === undefined) {
    //         return undefined;
    //     } else {
    //         return new LitIvemDetailTableRecordDefinition(litIvemId);
    //     }
    // }
}

export class LitIvemIdTableRecordDefinition extends TableRecordDefinition {
    constructor(private _litIvemId: LitIvemId) {
        super(TableRecordDefinition.TypeId.LitIvemId);
    }

    get key() { return this._litIvemId; }
    get mapKey() { return this.key.mapKey; }
    get litIvemId() { return this._litIvemId; }

    sameAs(other: TableRecordDefinition): boolean {
        if (!TableRecordDefinition.hasLitIvemIdInterface(other)) {
            return false;
        } else {
            return this.sameLitIvemIdAs(other);
        }
    }

    sameLitIvemIdAs(other: LitIvemIdTableRecordDefinition): boolean {
        return LitIvemId.isUndefinableEqual(this._litIvemId, other.litIvemId);
    }

    saveKeyToJson(element: JsonElement) {
        element.setJson(LitIvemIdTableRecordDefinition.jsonTag_LitIvemId, this._litIvemId.toJson());
    }

    litIvemIdInterfaceDescriminator() {
        // no code - descriminator for interface
    }

    createCopy(): TableRecordDefinition {
        return this.createLitIvemIdCopy();
    }

    createLitIvemIdCopy(): LitIvemIdTableRecordDefinition {
        return new LitIvemIdTableRecordDefinition(this._litIvemId);
    }
}

export namespace LitIvemIdTableRecordDefinition {
    export const jsonTag_LitIvemId = 'LitIvemId';

    export function tryCreateKeyFromJson(element: JsonElement) {
        return LitIvemId.tryGetFromJsonElement(element, jsonTag_LitIvemId);
    }

    export function tryCreateFromJson(element: JsonElement) {
        const litIvemId = tryCreateKeyFromJson(element);
        if (litIvemId === undefined) {
            return undefined;
        } else {
            return new LitIvemIdTableRecordDefinition(litIvemId);
        }
    }
}

/*class PortfolioTableRecordDefinition extends TableRecordDefinition
    implements IPortfolioTableRecordDefinition, ILitIvemIdTableRecordDefinition {

    private static readonly JsonTag_Quantity = 'Quantity';
    private static readonly JsonTag_UnitCost = 'UnitCost';
    private static readonly JsonTag_TotalCost = 'TotalCost';
    private static readonly JsonTag_StopLoss = 'StopLoss';
    private static readonly JsonTag_StopGain = 'StopGain';
    private static readonly JsonTag_LitIvemId = 'LitIvemId';

    private _quantity: Int64 | undefined;
    private _unitCost: Decimal | undefined;
    private _totalCost: Decimal | undefined;
    private _stopLoss: Decimal | undefined;
    private _stopGain: Decimal | undefined;

    private _litIvemId = LitIvemId.nullId;

    static createFromLitIvemIdDefinition(definition: ILitIvemIdTableRecordDefinition): PortfolioTableRecordDefinition {
        const result = new PortfolioTableRecordDefinition();
        result.litIvemId = definition.litIvemId;
        return result;
    }

    constructor() {
        super(TableRecordDefinition.TypeId.Portfolio);
    }

    // WatchItemDefinition

    createCopy(): ITableRecordDefinition {
        const result = new PortfolioTableRecordDefinition();
        result.assign(this);
        return result;
    }

    assign(other: PortfolioTableRecordDefinition) {
        super.assign(other);
        this._quantity = other.quantity;
        this._unitCost = other.unitCost;
        this._totalCost = other.totalCost;
        this._stopLoss = other.stopLoss;
        this._stopGain = other.stopGain;
        this._litIvemId = other.litIvemId;
    }

    sameAs(other: ITableRecordDefinition): boolean {
        if (TableRecordDefinition.hasLitIvemIdInterface(other) && this.sameLitIvemIdAs(other)) {
            return true;
        } else {
            if (TableRecordDefinition.hasPortfolioInterface(other) && this.samePortfolioAs(other)) {
                return true;
            } else {
                return false;
            }
        }
    }

    loadFromJson(Element: JsonElement) {
        this._quantity = Element.tryGetNumber(PortfolioTableRecordDefinition.JsonTag_Quantity);
        this._stopGain = Element.tryGetDecimal(PortfolioTableRecordDefinition.JsonTag_StopGain);
        this._stopLoss = Element.tryGetDecimal(PortfolioTableRecordDefinition.JsonTag_StopLoss);
        this._totalCost = Element.tryGetDecimal(PortfolioTableRecordDefinition.JsonTag_TotalCost);
        this._unitCost = Element.tryGetDecimal(PortfolioTableRecordDefinition.JsonTag_UnitCost);
        const loadedLitIvemId = Element.tryGetLitIvemId(PortfolioTableRecordDefinition.JsonTag_LitIvemId);
        if (loadedLitIvemId === undefined) {
            this._litIvemId = LitIvemId.nullId;
        } else {
            this._litIvemId = loadedLitIvemId;
        }
    }

    saveToJson(Element: JsonElement) {
        super.saveToJson(Element);
        if (this._quantity !== undefined) {
            Element.setNumber(PortfolioTableRecordDefinition.JsonTag_Quantity, this._quantity);
        }
        if (this._stopGain !== undefined) {
            Element.setDecimal(PortfolioTableRecordDefinition.JsonTag_StopGain, this._stopGain);
        }
        if (this._stopLoss !== undefined) {
            Element.setDecimal(PortfolioTableRecordDefinition.JsonTag_StopLoss, this._stopLoss);
        }
        if (this._totalCost !== undefined) {
            Element.setDecimal(PortfolioTableRecordDefinition.JsonTag_TotalCost, this._totalCost);
        }
        if (this._unitCost !== undefined) {
            Element.setDecimal(PortfolioTableRecordDefinition.JsonTag_UnitCost, this._unitCost);
        }
        Element.setLitIvemId(PortfolioTableRecordDefinition.JsonTag_LitIvemId, this._litIvemId);
    }

    // LitIvemId interface
    litIvemIdInterfaceDescriminator() {
        // no code
    }

    get litIvemId(): LitIvemId {
        return this._litIvemId;
    }

    set litIvemId(value: LitIvemId) {
        this._litIvemId = value;
    }

    createLitIvemIdCopy(): ILitIvemIdTableRecordDefinition {
        const result = new LitIvemIdTableRecordDefinition();
        result._litIvemId = this._litIvemId;
        return result;
    }

    sameLitIvemIdAs(other: ILitIvemIdTableRecordDefinition): boolean {
        return LitIvemId.isSameNullable(this._litIvemId, other.litIvemId);
    }

    // Portfolio
    portfolioInterfaceDescriminator() {
        // no code
    }

    get quantity(): Int64 | undefined {
        return this._quantity;
    }
    get unitCost(): Decimal | undefined {
        return this._unitCost;
    }
    get totalCost(): Decimal | undefined {
        return this._totalCost;
    }
    get stopLoss(): Decimal | undefined {
        return this._stopLoss;
    }
    get stopGain(): Decimal | undefined {
        return this._stopGain;
    }

    set quantity(value: Int64 | undefined) {
        this._quantity = value;
    }
    set unitCost(value: Decimal | undefined) {
        this._unitCost = value;
    }
    set totalCost(value: Decimal | undefined) {
        this._totalCost = value;
    }
    set stopLoss(value: Decimal | undefined) {
        this._stopLoss = value;
    }
    set stopGain(value: Decimal | undefined) {
        this._stopGain = value;
    }

    clearQuantity() {
        this._quantity = undefined;
    }
    clearUnitCost() {
        this._unitCost = undefined;
    }
    clearTotalCost() {
        this._totalCost = undefined;
    }
    clearStopLoss() {
        this._stopLoss = undefined;
    }
    clearStopGain() {
        this._stopGain = undefined;
    }

    samePortfolioAs(other: IPortfolioTableRecordDefinition): boolean {
        return this._quantity === other.quantity
            &&
            this._unitCost === other.unitCost
            &&
            this._totalCost === other.totalCost
            &&
            this._stopLoss === other.stopLoss
            &&
            this._stopGain === other.stopGain;
    }
}*/

/*
class LitIvemIdBrokerageAccountTableRecordDefinition
    extends TableRecordDefinition
    implements ILitIvemIdBrokerageAccountTableRecordDefinition, ILitIvemIdTableRecordDefinition, IBrokerageAccountTableRecordDefinition {

    private static readonly JsonTag_LitIvemId = 'LitIvemId';
    private static readonly JsonTag_AccountId = 'AccountId';

    _litIvemId = LitIvemId.nullId;
    _accountId = BrokerageAccountId.Null;

    litIvemIdInterfaceDescriminator() {
        // no code
    }

    litIvemIdBrokerageAccountInterfaceDescriminator() {
        // no code
    }

    brokerageAccountInterfaceDescriminator() {
        // no code
    }

    createCopy(): ITableRecordDefinition {
        const result = new LitIvemIdBrokerageAccountTableRecordDefinition();
        result.assign(this);
        return result;
    }

    assign(other: LitIvemIdBrokerageAccountTableRecordDefinition) {
        super.assign(other);
        this._litIvemId = other.litIvemId;
        this._accountId = other.accountId;
    }

    sameAs(other: ITableRecordDefinition): boolean {
        if (!TableRecordDefinition.hasLitIvemIdInterface(other)) {
            return false;
        } else {
            if (!this.sameLitIvemIdAs(other)) {
                return false;
            } else {
                if (!TableRecordDefinition.hasBrokerageAccountInterface(other)) {
                    return false;
                } else {
                    return this.sameBrokerageAccountAs(other);
                }
            }
        }
    }

    loadFromJson(Element: JsonElement) {
        const loadedLitIvemId = Element.tryGetLitIvemId(LitIvemIdBrokerageAccountTableRecordDefinition.JsonTag_LitIvemId);
        if (loadedLitIvemId === undefined) {
            this._litIvemId = LitIvemId.nullId;
        } else {
            this._litIvemId = loadedLitIvemId;
        }

        const accountIdJson = Element.tryGetString(LitIvemIdBrokerageAccountTableRecordDefinition.JsonTag_AccountId);
        if (accountIdJson === undefined) {
            this._accountId = BrokerageAccountId.Null;
        } else {
            this._accountId = accountIdJson;
        }
    }

    saveToJson(Element: JsonElement) {
        Element.setLitIvemId(LitIvemIdBrokerageAccountTableRecordDefinition.JsonTag_LitIvemId, this._litIvemId);
        Element.setString(LitIvemIdBrokerageAccountTableRecordDefinition.JsonTag_AccountId, this._accountId);
    }

    getLitIvemId(): LitIvemId {
        return this._litIvemId;
    }

    setLitIvemId(value: LitIvemId) {
        this._litIvemId = value;
    }

    getAccountId(): BrokerageAccountId {
        return this._accountId;
    }

    setAccountId(value: BrokerageAccountId) {
        this._accountId = value;
    }

    constructor() {
        super(TableRecordDefinition.TypeId.LitIvemIdBrokerageAccount);
    }

    get litIvemId(): LitIvemId {
        return this._litIvemId;
    }

    get accountId(): BrokerageAccountId {
        return this._accountId;
    }

    createLitIvemIdCopy(): ILitIvemIdTableRecordDefinition {
        const result = new LitIvemIdTableRecordDefinition();
        result._litIvemId = this._litIvemId;
        return result;
    }

    sameLitIvemIdAs(other: ILitIvemIdTableRecordDefinition): boolean {
        return LitIvemId.isSameNullable(this._litIvemId, other.litIvemId);
    }

    createBrokerageAccountCopy(): IBrokerageAccountTableRecordDefinition {
        const result = new BrokerageAccountTableRecordDefinition();
        result._accountId = this._accountId;
        return result;
    }

    sameBrokerageAccountAs(other: IBrokerageAccountTableRecordDefinition): boolean {
        return BrokerageAccountId.isEqual(this._accountId, other.accountId);
    }
}

class TmcDefinitionLegTableRecordDefinition
    extends TableRecordDefinition
    implements ITmcDefinitionLegTableRecordDefinition, ILitIvemIdTableRecordDefinition {

    accessor: TmcCalculatedPrices;
    orderPad: OrderPad;
    legIndex: Integer;

    tmcDefinitionLegInterfaceDescriminator() {
        // no code
    }

    litIvemIdInterfaceDescriminator() {
        // no code
    }

    createCopy(): ITableRecordDefinition {
        const result = new TmcDefinitionLegTableRecordDefinition();
        result.assign(this);
        return result;
    }

    assign(other: TmcDefinitionLegTableRecordDefinition) {
        super.assign(other);
        this.accessor = other.accessor;
        this.orderPad = other.orderPad;
        this.legIndex = other.legIndex;
    }

    createLitIvemIdCopy(): ILitIvemIdTableRecordDefinition {
        const result = new LitIvemIdTableRecordDefinition();
        result._litIvemId = this.litIvemId;
        return result;
    }

    sameAs(other: ITableRecordDefinition): boolean {
        if (!TableRecordDefinition.hasLitIvemIdInterface(other)) {
            return false;
        } else {
            if (!this.sameLitIvemIdAs(other)) {
                return false;
            } else {
                if (!TableRecordDefinition.hasTmcDefinitionLegInterface(other)) {
                    return false;
                } else {
                    return this.sameTmcDefinitionLegAs(other);
                }
            }
        }
    }

    sameLitIvemIdAs(other: ILitIvemIdTableRecordDefinition): boolean {
        return LitIvemId.isSameNullable(this.litIvemId, other.litIvemId);
    }

    sameTmcDefinitionLegAs(other: ITmcDefinitionLegTableRecordDefinition): boolean {
        return this.accessor === other.accessor &&
            this.orderPad === other.orderPad &&
            this.legIndex === other.legIndex;
    }

    loadFromJson(Element: JsonElement) {
        // no code
    }

    getAccessor(): TmcCalculatedPrices {
        return this.accessor;
    }

    setAccessor(value: TmcCalculatedPrices) {
        this.accessor = value;
    }

    getOrderPad(): OrderPad {
        return this.orderPad;
    }

    setOrderPad(value: OrderPad) {
        this.orderPad = value;
    }

    getLegIndex(): Integer {
        return this.legIndex;
    }

    setLegIndex(value: Integer) {
        this.legIndex = value;
    }

    get litIvemId(): LitIvemId {
        // return this.orderPad.getTmcLegLitIvemId(this.legIndex);
        return LitIvemId.nullId;
    }

    set litIvemId(value: LitIvemId) {
        throw new AssertInternalError('TRDSLID37996');
    }

    constructor() {
        super(TableRecordDefinition.TypeId.TmcDefinitionLeg);
    }
}*/

export class CallPutTableRecordDefinition extends TableRecordDefinition {
    private static readonly JsonTag_CallPutKey = 'CallPutKey';

    private _key: CallPut.Key;

    constructor(private _callPut: CallPut) {
        super(TableRecordDefinition.TypeId.CallPut);
        this._key = this._callPut.createKey();
    }

    get callPut() { return this._callPut; }
    get key() { return this._key; }
    get mapKey() { return this.key.mapKey; }

    callPutInterfaceDescriminator() {
        // no code
    }

    createCopy(): TableRecordDefinition {
        return this.createCallPutCopy();
    }

    sameAs(other: TableRecordDefinition): boolean {
        if (!TableRecordDefinition.hasCallPutInterface(other)) {
            return false;
        } else {
            return this.sameCallPutAs(other);
        }
    }

    loadFromJson(element: JsonElement) {
        const keyElement = element.tryGetElement(CallPutTableRecordDefinition.JsonTag_CallPutKey, 'CallPut Table Definition Record Key');
        if (keyElement === undefined) {
            throw new JsonLoadError(ExternalError.Code.CallPutTableRecordDefinitionLoadFromJsonKeyUndefined);
        } else {
            const keyOrError = CallPut.Key.tryCreateFromJson(keyElement);
            if (typeof keyOrError === 'object') {
                this._key = keyOrError;
            } else {
                throw new JsonLoadError(ExternalError.Code.CallPutTableRecordDefinitionLoadFromJsonKeyError);
            }
        }
    }

    saveKeyToJson(element: JsonElement) {
        this._key.saveToJson(element);
    }

    createCallPutCopy(): CallPutTableRecordDefinition {
        return new CallPutTableRecordDefinition(this._callPut);
    }

    sameCallPutAs(other: CallPutTableRecordDefinition): boolean {
        return CallPut.Key.isEqual(this._key, other.key);
    }
}

export namespace CallPutTableRecordDefinition {
    export function tryCreateKeyFromJson(element: JsonElement) {
        const keyOrError = CallPut.Key.tryCreateFromJson(element);
        if (typeof keyOrError === 'object') {
            return keyOrError;
        } else {
            Logger.logConfigError('TRDBCPTRD11198', keyOrError);
            return undefined;
        }
    }

    export function tryCreateStringKeyFromJson(element: JsonElement) {
        const key = tryCreateKeyFromJson(element);
        if (key === undefined) {
            return undefined;
        } else {
            return key.mapKey;
        }
    }
}

export class TopShareholderTableRecordDefinition extends TableRecordDefinition {

    private static readonly JsonTag_TopShareholderKey = 'TopShareholderKey';

    private _key: TopShareholder.Key;

    constructor(private _topShareholder: TopShareholder) {
        super(TableRecordDefinition.TypeId.TopShareholder);
        this._key = this._topShareholder.createKey();
    }

    get topShareholder() { return this._topShareholder; }
    get key() { return this._key; }
    get mapKey() { return this.key.mapKey; }

    topShareholderInterfaceDescriminator() {
        // no code
    }

    createCopy(): TableRecordDefinition {
        return this.createTopShareholderCopy();
    }

    sameAs(other: TableRecordDefinition): boolean {
        if (!TableRecordDefinition.hasTopShareholderInterface(other)) {
            return false;
        } else {
            return this.sameTopShareholderAs(other);
        }
    }

    loadFromJson(element: JsonElement) {
        const keyElement = element.tryGetElement(TopShareholderTableRecordDefinition.JsonTag_TopShareholderKey,
            'TopShareholder Table Definition Record Key');
        if (keyElement === undefined) {
            throw new JsonLoadError(ExternalError.Code.TopShareholderTableRecordDefinitionLoadFromJsonKeyUndefined);
        } else {
            const keyOrError = TopShareholder.Key.tryCreateFromJson(keyElement);
            if (typeof keyOrError === 'object') {
                this._key = keyOrError;
            } else {
                throw new JsonLoadError(ExternalError.Code.TopShareholderTableRecordDefinitionLoadFromJsonKeyError);
            }
        }
    }

    saveKeyToJson(element: JsonElement) {
        this._key.saveToJson(element);
    }

    createTopShareholderCopy(): TopShareholderTableRecordDefinition {
        return new TopShareholderTableRecordDefinition(this._topShareholder);
    }

    sameTopShareholderAs(other: TopShareholderTableRecordDefinition): boolean {
        return TopShareholder.Key.isEqual(this._key, other.key);
    }
}

export namespace TopShareholderTableRecordDefinition {
    export function tryCreateKeyFromJson(element: JsonElement) {
        const keyOrError = TopShareholder.Key.tryCreateFromJson(element);
        if (typeof keyOrError === 'object') {
            return keyOrError;
        } else {
            Logger.logConfigError('TRDBTSTRD73373', keyOrError);
            return undefined;
        }
    }

    export function tryCreateStringKeyFromJson(element: JsonElement) {
        const key = tryCreateKeyFromJson(element);
        if (key === undefined) {
            return undefined;
        } else {
            return key.mapKey;
        }
    }
}
