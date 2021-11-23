/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { nanoid } from 'nanoid';
import { StringId, Strings } from 'src/res/internal-api';
import {
    AssertInternalError,
    Badness,
    ComparableList,
    compareNumber,
    compareString,
    CorrectnessId,
    EnumInfoOutOfOrderError,
    Guid,
    Integer,
    JsonElement,
    Logger,
    MultiEvent,
    UsableListChangeTypeId
} from 'src/sys/internal-api';
import { BaseDirectory } from './base-directory';
import { TableRecordDefinition, TableRecordDefinitionArray } from './table-record-definition';

export abstract class TableRecordDefinitionList {
    modifiedEvent: TableRecordDefinitionList.ModifiedEventHandler;
    requestIsGroupSaveEnabledEvent: TableRecordDefinitionList.RequestIsGroupSaveEnabledEventHandler;

    protected _builtIn: boolean;
    protected _isUser: boolean;
    protected _changeDefinitionOrderAllowed: boolean;

    private _id: Guid;
    private _name: string;
    private _active: boolean;
    private _missing: boolean;

    private _correctnessId = Badness.Reason.idToCorrectnessId(Badness.inactive.reasonId);
    private _good = false;
    private _usable = false;
    private _badness = Badness.createCopy(Badness.inactive);
    private _setGoodBadTransactionId = 0;

    private _badnessChangeMultiEvent = new MultiEvent<TableRecordDefinitionList.BadnessChangeEventHandler>();
    private _listChangeMultiEvent = new MultiEvent<TableRecordDefinitionList.ListChangeEventHandler>();
    private _beforeRecDefinitionChangeMultiEvent = new MultiEvent<TableRecordDefinitionList.RecDefinitionChangeEventHandler>();
    private _afterRecDefinitionChangeMultiEvent = new MultiEvent<TableRecordDefinitionList.RecDefinitionChangeEventHandler>();

    constructor(private _typeId: TableRecordDefinitionList.TypeId) {

    }

    get id(): Guid { return this._id; }
    get name(): string { return this._name; }
    get builtIn(): boolean { return this._builtIn; }
    get isUser(): boolean { return this._isUser; }
    get typeId(): TableRecordDefinitionList.TypeId { return this._typeId; }
    get typeAsDisplay(): string { return this.getListTypeAsDisplay(); }
    get typeAsAbbr(): string { return this.getListTypeAsAbbr(); }

    get active(): boolean { return this._active; }

    get good(): boolean { return this._good; }
    get usable(): boolean { return this._usable; }
    get badness() { return this._badness; }

    get count(): Integer { return this.getCount(); }
    get AsArray(): TableRecordDefinitionArray { return this.getAsArray(); }

    get changeDefinitionOrderAllowed(): boolean { return this._changeDefinitionOrderAllowed; }
    get addDeleteDefinitionsAllowed(): boolean { return this.getAddDeleteDefinitionsAllowed(); }

    get missing(): boolean { return this._missing; }
    set missing(value: boolean) { this._missing = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get capacity(): Integer { return this.getCapacity(); }
    set capacity(value: Integer) { this.setCapacity(value); }

    getListTypeAsDisplay(): string {
        return TableRecordDefinitionList.Type.idToDisplay(this._typeId);
    }

    getListTypeAsAbbr(): string {
        return TableRecordDefinitionList.Type.idToAbbr(this._typeId);
    }

    loadFromJson(element: JsonElement) { // virtual;
        const jsonId = element.tryGetGuid(TableRecordDefinitionList.jsonTag_Id);
        if (jsonId !== undefined) {
            this._id = jsonId;
        } else {
            Logger.logError(`Error TRDLLFJI33858: ${TableRecordDefinitionList.Type.idToName(this._typeId)}: Generating new`);
            this._id = nanoid();
        }

        const jsonName = element.tryGetString(TableRecordDefinitionList.jsonTag_Name);
        if (jsonName !== undefined) {
            this._name = jsonName;
        } else {
            Logger.logError(`Error TRDLLFJN22995: ${TableRecordDefinitionList.Type.idToName(this._typeId)}: Naming unnamed`);
            this._name = Strings[StringId.Unnamed];
        }
    }

    saveToJson(element: JsonElement) { // virtual;
        element.setString(TableRecordDefinitionList.jsonTag_TypeId, TableRecordDefinitionList.Type.idToJson(this.typeId));
        element.setGuid(TableRecordDefinitionList.jsonTag_Id, this.id);
        element.setString(TableRecordDefinitionList.jsonTag_Name, this.name);
    }

    activate() { // virtual;
        this._active = true;
    }

    deactivate() { // virtual;
        // TableRecordDefinitionList can no longer be used after it is deactivated
        this._active = false;
    }

    clear() { // virtual;
        // no code
    }

    canAdd(value: TableRecordDefinition): boolean {
        return this.canAddArray([value]);
    }

    canAddArray(value: TableRecordDefinitionArray): boolean { // virtual;
        return false;
    }

    add(value: TableRecordDefinition): Integer {
        const addArrayResult = this.addArray([value]);
        return addArrayResult.index;
    }

    addArray(value: TableRecordDefinitionArray): TableRecordDefinitionList.AddArrayResult { // virtual;
        return {
            index: -1,
            count: 0
        };
    }

    setDefinition(idx: Integer, value: TableRecordDefinition) { // virtual;
        // no code
    }

    delete(idx: Integer) { // virtual;
        // no code
    }

    find(value: TableRecordDefinition): Integer | undefined {
        for (let i = 0; i < this.count; i++) {
            const definition = this.getDefinition(i);
            if (definition.sameAs(value)) {
                return i;
            }
        }

        return undefined;
    }

    compareListTypeTo(other: TableRecordDefinitionList) {
        return TableRecordDefinitionList.Type.compareId(this.typeId, other.typeId);
    }

    compareNameTo(other: TableRecordDefinitionList) {
        return compareString(this.name, other.name);
    }

    subscribeBadnessChangeEvent(handler: TableRecordDefinitionList.BadnessChangeEventHandler) {
        return this._badnessChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBadnessChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._badnessChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeListChangeEvent(handler: TableRecordDefinitionList.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeBeforeRecDefinitionChangeEvent(handler: TableRecordDefinitionList.RecDefinitionChangeEventHandler) {
        return this._beforeRecDefinitionChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBeforeRecDefinitionChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._beforeRecDefinitionChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeAfterRecDefinitionChangeEvent(handler: TableRecordDefinitionList.RecDefinitionChangeEventHandler) {
        return this._afterRecDefinitionChangeMultiEvent.subscribe(handler);
    }

    unsubscribeAfterRecDefinitionChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._afterRecDefinitionChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected notifyListChange(listChangeTypeId: UsableListChangeTypeId, recIdx: Integer, recCount: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, recIdx, recCount);
        }
    }

    protected checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, recIdx: Integer, recCount: Integer) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, recIdx, recCount);
        }
    }

    protected notifyBeforeRecDefinitionChange(recIdx: Integer) {
        const handlers = this._beforeRecDefinitionChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](recIdx);
        }
    }

    protected notifyAfterRecDefinitionChange(recIdx: Integer) {
        const handlers = this._afterRecDefinitionChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](recIdx);
        }
    }

    protected notifyModified() {
        if (this.modifiedEvent !== undefined) {
            this.modifiedEvent(this);
        }
    }

    protected requestIsGroupSaveEnabled(): boolean {
        return this.requestIsGroupSaveEnabledEvent();
    }

    protected setId(id: Guid) {
        this._id = id;
    }

    protected setName(name: string) {
        this._name = name;
    }

    protected processUsableChanged() {
        // available for override
    }

    protected setUsable(badness: Badness) {
        if (Badness.isUnusable(badness)) {
            throw new AssertInternalError('DISU100029484'); // must always be usable
        } else {
            this.setBadness(badness);
        }
    }

    protected setUnusable(badness: Badness) {
        if (Badness.isUsable(badness)) {
            throw new AssertInternalError('TRDLSB130003400'); // must always be bad
        } else {
            this.setBadness(badness);
        }
    }

    protected checkSetUnusable(badness: Badness) {
        if (badness.reasonId !== Badness.ReasonId.NotBad) {
            this.setBadness(badness);
        }
    }

    protected getAsArray(): TableRecordDefinitionArray {
        const result: TableRecordDefinitionArray = [];
        for (let i = 0; i < this.getCount(); i++) {
            result.push(this.getDefinition(i));
        }
        return result;
    }

    protected getAddDeleteDefinitionsAllowed(): boolean { // virtual;
        return false;
    }

    protected setGood() {
        if (!this._good) {
            const oldUsable = this._usable;
            this._good = true;
            this._usable = true;
            this._badness = {
                reasonId: Badness.ReasonId.NotBad,
                reasonExtra: '',
            } as const;
            const transactionId = ++this._setGoodBadTransactionId;
            if (!oldUsable) {
                this.processUsableChanged();
            }
            if (transactionId === this._setGoodBadTransactionId) {
                this.notifyBadnessChange();
            }
        }
    }    // setBadness can also make a DataItem good

    private notifyBadnessChange() {
        const handlers = this._badnessChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i]();
        }
    }

    private setBadness(badness: Badness) {
        if (Badness.isGood(badness)) {
            this.setGood();
        } else {
            const newReasonId = badness.reasonId;
            const newReasonExtra = badness.reasonExtra;
            if (newReasonId !== this._badness.reasonId || newReasonExtra !== this.badness.reasonExtra) {
                const oldUsable = this._usable;
                this._correctnessId = Badness.Reason.idToCorrectnessId(newReasonId);
                this._good = false;
                this._usable = this._correctnessId === CorrectnessId.Usable; // Cannot be Good
                this._badness = {
                    reasonId: newReasonId,
                    reasonExtra: newReasonExtra,
                } as const;
                const transactionId = ++this._setGoodBadTransactionId;
                if (oldUsable) {
                    this.processUsableChanged();
                }
                if (transactionId === this._setGoodBadTransactionId) {
                    this.notifyBadnessChange();
                }
            }
        }
    }

    abstract getDefinition(idx: Integer): TableRecordDefinition;

    protected abstract getCount(): Integer;
    protected abstract getCapacity(): Integer;
    protected abstract setCapacity(value: Integer): void;
}

export namespace TableRecordDefinitionList {
    export const jsonTag_Id = 'Id';
    export const jsonTag_Name = 'Name';
    export const jsonTag_TypeId = 'ListTypeId';

    export const enum TypeId {
        Null,
        SymbolsDataItem,
        Portfolio,
        Group,
        MarketMovers,
        IvemIdServer,
        Gics,
        ProfitIvemHolding,
        CashItemHolding,
        IntradayProfitLossSymbolRec,
        TmcDefinitionLegs,
        TmcLeg,
        TmcWithLegMatchingUnderlying,
        CallPutFromUnderlying,
        HoldingAccountPortfolio,
        Feed,
        BrokerageAccount,
        Order,
        Holding,
        Balances,
        TopShareholder,
    }

    export interface AddArrayResult {
        index: Integer; // index of first element addeded
        count: Integer; // number of elements added
    }

    export namespace Type {
        export type Id = TableRecordDefinitionList.TypeId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly display: StringId;
            readonly abbr: StringId;
        }

        type InfoObjects = { [id in keyof typeof TypeId]: Info };

        const infoObjects: InfoObjects = {
            Null: {
                id: TableRecordDefinitionList.TypeId.Null,
                name: 'Null',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Null,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Null
            },
            SymbolsDataItem: {
                id: TableRecordDefinitionList.TypeId.SymbolsDataItem,
                name: 'Symbol',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Symbol,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Symbol
            },
            Portfolio: {
                id: TableRecordDefinitionList.TypeId.Portfolio,
                name: 'Portfolio',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Portfolio,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Portfolio
            },
            Group: {
                id: TableRecordDefinitionList.TypeId.Group,
                name: 'Group',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Group,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Group
            },
            MarketMovers: {
                id: TableRecordDefinitionList.TypeId.MarketMovers,
                name: 'MarketMovers',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_MarketMovers,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_MarketMovers
            },
            IvemIdServer: {
                id: TableRecordDefinitionList.TypeId.IvemIdServer,
                name: 'IvemIdServer',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_IvemIdServer,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_IvemIdServer
            },
            Gics: {
                id: TableRecordDefinitionList.TypeId.Gics,
                name: 'Gics',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Gics,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Gics
            },
            ProfitIvemHolding: {
                id: TableRecordDefinitionList.TypeId.ProfitIvemHolding,
                name: 'ProfitIvemHolding',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_ProfitIvemHolding,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_ProfitIvemHolding
            },
            CashItemHolding: {
                id: TableRecordDefinitionList.TypeId.CashItemHolding,
                name: 'CashItemHolding',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_CashItemHolding,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_CashItemHolding
            },
            IntradayProfitLossSymbolRec: {
                id: TableRecordDefinitionList.TypeId.IntradayProfitLossSymbolRec,
                name: 'IntradayProfitLossSymbolRec',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_IntradayProfitLossSymbolRec,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_IntradayProfitLossSymbolRec
            },
            TmcDefinitionLegs: {
                id: TableRecordDefinitionList.TypeId.TmcDefinitionLegs,
                name: 'TmcDefinitionLegs',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_TmcDefinitionLegs,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_TmcDefinitionLegs
            },
            TmcLeg: {
                id: TableRecordDefinitionList.TypeId.TmcLeg,
                name: 'TmcLeg',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_TmcLeg,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_TmcLeg
            },
            TmcWithLegMatchingUnderlying: {
                id: TableRecordDefinitionList.TypeId.TmcWithLegMatchingUnderlying,
                name: 'TmcWithLegMatchingUnderlying',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_TmcWithLegMatchingUnderlying,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_TmcWithLegMatchingUnderlying
            },
            CallPutFromUnderlying: {
                id: TableRecordDefinitionList.TypeId.CallPutFromUnderlying,
                name: 'EtoMatchingUnderlyingCallPut',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_EtoMatchingUnderlyingCallPut,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_EtoMatchingUnderlyingCallPut
            },
            HoldingAccountPortfolio: {
                id: TableRecordDefinitionList.TypeId.HoldingAccountPortfolio,
                name: 'HoldingAccountPortfolio',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_HoldingAccountPortfolio,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_HoldingAccountPortfolio
            },
            Feed: {
                id: TableRecordDefinitionList.TypeId.Feed,
                name: 'Feed',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Feed,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Feed
            },
            BrokerageAccount: {
                id: TableRecordDefinitionList.TypeId.BrokerageAccount,
                name: 'BrokerageAccount',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_BrokerageAccount,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_BrokerageAccount
            },
            Order: {
                id: TableRecordDefinitionList.TypeId.Order,
                name: 'Order',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Order,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Order
            },
            Holding: {
                id: TableRecordDefinitionList.TypeId.Holding,
                name: 'Holding',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Holding,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Holding
            },
            Balances: {
                id: TableRecordDefinitionList.TypeId.Balances,
                name: 'Balances',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Balances,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Balances
            },
            TopShareholder: {
                id: TableRecordDefinitionList.TypeId.TopShareholder,
                name: 'TopShareholder',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_TopShareholder,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_TopShareholder
            },
        };

        export const count = Object.keys(infoObjects).length;

        const infos = Object.values(infoObjects);

        export function idToName(id: Id): string {
            return infos[id].name;
        }

        export function idToJson(id: Id): string {
            return idToName(id);
        }

        export function tryNameToId(nameValue: string): Id | undefined {
            const upperNameValue = nameValue.toUpperCase();
            const idx = infos.findIndex((info: Info) => info.name.toUpperCase() === upperNameValue);
            return idx === -1 ? undefined : infos[idx].id;
        }

        export function tryJsonToId(name: string): Id | undefined {
            return tryNameToId(name);
        }

        export function idToDisplay(id: Id): string {
            return Strings[infos[id].display];
        }

        export function idToAbbr(id: Id): string {
            return Strings[infos[id].abbr];
        }

        export function compareId(left: Id, right: Id): Integer {
            return compareNumber(left, right);
        }

        export function initialiseStaticTableRecordDefinitionListListType() {
            const outOfOrderIdx = infos.findIndex((infoRec: Info, index: Integer) => infoRec.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('TRDLLTINLT388', outOfOrderIdx, `${infos[outOfOrderIdx].name}`);
            }
        }
    }

    export interface ILocker extends BaseDirectory.Entry.ISubscriber {
        lockerInterfaceDescriminator(): void;
        getLockerName(): string;
    }

    export class Opener {
        constructor(private _name: string) { }
    }

    export interface TryCreateResult {
        success: boolean;
        list: TableRecordDefinitionList | undefined;
        errorCode: string | undefined;
        errorText: string | undefined;
    }

    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId,
        itemIdx: Integer, itemCount: Integer) => void;
    export type RecDefinitionChangeEventHandler = (this: void, itemIdx: Integer) => void;
    export type BadnessChangeEventHandler = (this: void) => void;
    export type ModifiedEventHandler = (this: void, list: TableRecordDefinitionList) => void;
    export type RequestIsGroupSaveEnabledEventHandler = (this: void) => boolean;

    export function getTypeIdFromJson(element: JsonElement) {
        const typeIdJson = element.tryGetString(jsonTag_TypeId, 'TRDLGTIFJS22298');
        if (typeIdJson === undefined) {
            return Logger.logPersistError('TRDLGTIFJU994223213');
        } else {
            const typeId = Type.tryJsonToId(typeIdJson);
            if (typeId === undefined) {
                return Logger.logPersistError('TRDLGTIFJT994223213');
            } else {
                return typeId;
            }
        }
    }

    export function initialiseStaticTableRecordDefinitionList() {
        Type.initialiseStaticTableRecordDefinitionListListType();
    }
}

export class TableRecordDefinitionListList extends ComparableList<TableRecordDefinitionList> {
    compareName(leftIdx: Integer, rightIdx: Integer): Integer {
        const leftList = this.getItem(leftIdx);
        const rightList = this.getItem(rightIdx);
        return leftList.compareNameTo(rightList);
    }

    compareListType(leftIdx: Integer, rightIdx: Integer): Integer {
        const leftList = this.getItem(leftIdx);
        const rightList = this.getItem(rightIdx);
        return leftList.compareListTypeTo(rightList);
    }

    find(name: string, ignoreCase: boolean): Integer | undefined {
        return ignoreCase ? this.findIgnoreCase(name) : this.findCaseSensitive(name);
    }

    findCaseSensitive(name: string): Integer | undefined {
        for (let i = 0; i < this.count; i++) {
            const list = this.getItem(i);
            if (list.name === name) {
                return i;
            }
        }
        return undefined;
    }

    findIgnoreCase(name: string): Integer | undefined {
        const upperName = name.toUpperCase();
        for (let i = 0; i < this.count; i++) {
            const list = this.getItem(i);
            if (list.name.toUpperCase() === upperName) {
                return i;
            }
        }
        return undefined;
    }
}

export abstract class RandomIdTableRecordDefinitionList extends TableRecordDefinitionList {
    constructor(typeId: TableRecordDefinitionList.TypeId) {
        super(typeId);
        const randomId = nanoid();
        this.setId(randomId);
    }
}

export abstract class NonrandomIdTableRecordDefinitionList extends TableRecordDefinitionList {

}

export abstract class BuiltInTableRecordDefinitionList extends NonrandomIdTableRecordDefinitionList {
    constructor(typeId: TableRecordDefinitionList.TypeId) {
        super(typeId);
        this._builtIn = true;
    }
}

export abstract class UserTableRecordDefinitionList extends NonrandomIdTableRecordDefinitionList {
    constructor(typeId: TableRecordDefinitionList.TypeId) {
        super(typeId);
        this._isUser = true;
    }

    setIdAndName(id: Guid, name: string) {
        super.setId(id);
        super.setName(name);
    }
}

export class NullTableRecordDefinitionList extends BuiltInTableRecordDefinitionList {
    private static readonly className = 'Null';

    constructor() {
        super(TableRecordDefinitionList.TypeId.Null);
    }

    getDefinition(idx: Integer): TableRecordDefinition {
        throw new Error('NullWatchItemDefinitionList.getDefinition: not callable');
    }

    protected getCount() { return 0; }
    protected getCapacity() { return 0; }
    protected setCapacity(value: Integer) { /* no code */ }
}

export abstract class ServerTableRecordDefinitionList extends BuiltInTableRecordDefinitionList {
    private _serverListName: string;

    get serverListName() { return this._serverListName; }

    setBuiltInParams(id: Guid, name: string, serverListName: string) {
        this.setId(id);
        this.setName(name);
        this._serverListName = serverListName;
    }
}

export namespace TableRecordDefinitionListModule {
    export function initialiseStatic() {
        TableRecordDefinitionList.initialiseStaticTableRecordDefinitionList();
    }
}
