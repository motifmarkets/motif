/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AllBrokerageAccountGroup,
    BrokerageAccountGroup,
    ExchangeId,
    ExchangeInfo,
    LitIvemDetail,
    MarketId,
    MarketInfo,
    SearchSymbolsDataDefinition,
    SymbolFieldId,
    SymbolsDataItem
} from 'src/adi/internal-api';
import {
    AssertInternalError,
    Badness,
    Integer,
    JsonElement,
    MultiEvent,
    UnreachableCaseError,
    UsableListChangeTypeId
} from 'src/sys/internal-api';
import { SingleDataItemTableRecordDefinitionList } from './single-data-item-table-record-definition-list';
import { SymbolsService } from './symbols-service';
import { LitIvemDetailTableRecordDefinition, TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';

export class SymbolsDataItemTableRecordDefinitionList extends SingleDataItemTableRecordDefinitionList {
    private static _constructCount = 0;

    private _dataDefinition: SearchSymbolsDataDefinition;
    private _exchangeId: ExchangeId | undefined;
    private _isFullDetail: boolean;

    private _list: LitIvemDetailTableRecordDefinition[] = [];

    private _dataItem: SymbolsDataItem;
    private _dataItemSubscribed = false;
    private _litIvemDetails: LitIvemDetail[];
    private _listChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    private _badnessChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    // setting accountId to undefined will return orders for all accounts
    constructor(
        private readonly _adi: AdiService,
        private readonly _symbolsService: SymbolsService
    ) {
        super(TableRecordDefinitionList.TypeId.SymbolsDataItem);
        this.setName(SymbolsDataItemTableRecordDefinitionList.baseName +
            (++SymbolsDataItemTableRecordDefinitionList._constructCount).toString(10));
        this._changeDefinitionOrderAllowed = true;
    }

    load(dataDefinition: SearchSymbolsDataDefinition) {
        this._dataDefinition = dataDefinition;
        this._exchangeId = this.calculateExchangeId(dataDefinition);
        this._isFullDetail = dataDefinition.fullSymbol;
    }

    get dataItem() { return this._dataItem; }
    get exchangeId() { return this._exchangeId; }
    get isFullDetail() { return this._isFullDetail; }

    getDefinition(idx: Integer): TableRecordDefinition {
        return this._list[idx];
    }

    override activate() {
        const definition = this._dataDefinition.createCopy();
        this._dataItem = this._adi.subscribe(definition) as SymbolsDataItem;
        this._dataItemSubscribed = true;
        super.setSingleDataItem(this._dataItem);
        this._litIvemDetails = this._dataItem.records;
        this._listChangeEventSubscriptionId = this.dataItem.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => this.handleDataItemListChangeEvent(listChangeTypeId, idx, count)
        );
        this._badnessChangeEventSubscriptionId = this._dataItem.subscribeBadnessChangeEvent(
            () => this.handleDataItemBadnessChangeEvent()
        );

        super.activate();

        if (this.dataItem.usable) {
            const newCount = this._litIvemDetails.length;
            if (newCount > 0) {
                this.processDataItemListChange(UsableListChangeTypeId.PreUsableAdd, 0, newCount);
            }
            this.processDataItemListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processDataItemListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    override deactivate() {
        // TableRecordDefinitionList can no longer be used after it is deactivated
        if (this.count > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, 0);
        }

        if (!this._dataItemSubscribed) {
            throw new AssertInternalError('BATRDLD4332', '');
        } else {
            this._dataItem.unsubscribeListChangeEvent(this._listChangeEventSubscriptionId);
            this._listChangeEventSubscriptionId = undefined;
            this._dataItem.unsubscribeBadnessChangeEvent(this._badnessChangeEventSubscriptionId);
            this._badnessChangeEventSubscriptionId = undefined;

            super.deactivate();

            this._adi.unsubscribe(this._dataItem);
            this._dataItemSubscribed = false;
        }
    }

    override loadFromJson(element: JsonElement) {
        super.loadFromJson(element);

        const requestElement = element.tryGetElement(SymbolsDataItemTableRecordDefinitionList.JsonName.request, 'STRDLLFJ21210098');
        const request = SymbolsDataItemTableRecordDefinitionList.tryCreateDataDefinitionFromJson(requestElement);
        if (request === undefined) {
            const defaultExchangeId = this._symbolsService.defaultExchangeId;
            const defaultMarketId = ExchangeInfo.idToDefaultMarketId(defaultExchangeId);
            this.load(SymbolsDataItemTableRecordDefinitionList.createDefaultDataDefinition(defaultExchangeId, defaultMarketId));
        } else {
            this.load(request);
        }
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const requestElement = element.newElement(SymbolsDataItemTableRecordDefinitionList.JsonName.request);
        SymbolsDataItemTableRecordDefinitionList.saveDataDefinitionToJson(this._dataDefinition, requestElement);
    }

    protected getCount() { return this._list.length; }
    protected getCapacity() { return this._list.length; }
    protected setCapacity(value: Integer) { /* no code */ }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this.count;
            if (count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    private handleDataItemListChangeEvent(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        this.processDataItemListChange(listChangeTypeId, idx, count);
    }

    private handleDataItemBadnessChangeEvent() {
        this.checkSetUnusable(this._dataItem.badness);
    }

    private calculateExchangeId(dataDefinition: SearchSymbolsDataDefinition) {
        let marketIdsExchangeId: ExchangeId | undefined;
        const marketIds = dataDefinition.marketIds;
        let marketIdsDefined: boolean;
        if (marketIds === undefined) {
            marketIdsDefined = false;
            marketIdsExchangeId = undefined;
        } else {
            const marketIdCount = marketIds.length;
            if (marketIdCount === 0) {
                marketIdsDefined = false;
                marketIdsExchangeId = undefined;
            } else {
                marketIdsDefined = true;
                marketIdsExchangeId = MarketInfo.idToExchangeId(marketIds[0]);
                // make sure they are all the same
                for (let i = 1; i < marketIdCount; i++) {
                    const elementExchangeId = MarketInfo.idToExchangeId(marketIds[i]);
                    if (elementExchangeId !== marketIdsExchangeId) {
                        marketIdsExchangeId = undefined;
                        break;
                    }
                }
            }
        }

        const dataDefinitionExchangeId = dataDefinition.exchangeId;
        const dataDefinitionExchangeIdDefined = dataDefinitionExchangeId !== undefined;

        let exchangeId: ExchangeId | undefined;
        if (marketIdsDefined) {
            if (!dataDefinitionExchangeIdDefined) {
                exchangeId = marketIdsExchangeId;
            } else {
                if (marketIdsExchangeId === dataDefinitionExchangeId) {
                    exchangeId = marketIdsExchangeId;
                } else {
                    exchangeId = undefined;
                }
            }
        } else {
            if (dataDefinitionExchangeIdDefined) {
                exchangeId = dataDefinitionExchangeId;
            } else {
                exchangeId = undefined;
            }
        }
        return exchangeId;
    }

    private insertRecordDefinition(idx: Integer, count: Integer) {
        if (count === 1) {
            const detail = this._litIvemDetails[idx];
            const definition = new LitIvemDetailTableRecordDefinition(detail);
            if (idx === this._list.length) {
                this._list.push(definition);
            } else {
                this._list.splice(idx, 0, definition);
            }
        } else {
            const definitions = new Array<LitIvemDetailTableRecordDefinition>(count);
            let insertArrayIdx = 0;
            for (let i = idx; i < idx + count; i++) {
                const record = this._litIvemDetails[i];
                definitions[insertArrayIdx++] = new LitIvemDetailTableRecordDefinition(record);
            }
            this._list.splice(idx, 0, ...definitions);
        }
    }

    private processDataItemListChange(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.setUnusable(this._dataItem.badness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.setUnusable(Badness.preUsableClear);
                this._list.length = 0;
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.setUnusable(Badness.preUsableAdd);
                this.insertRecordDefinition(idx, count);
                break;
            case UsableListChangeTypeId.Usable:
                this.setUsable(this._dataItem.badness);
                break;
            case UsableListChangeTypeId.Insert:
                this.insertRecordDefinition(idx, count);
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, idx, count);
                break;
            case UsableListChangeTypeId.Remove:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, count);
                this._list.splice(idx, count);
                break;
            case UsableListChangeTypeId.Clear:
                this.checkUsableNotifyListChange(UsableListChangeTypeId.Clear, idx, count);
                this._list.length = 0;
                break;
            default:
                throw new UnreachableCaseError('SDITRDLPDILC83372992', listChangeTypeId);
        }
    }
}

export namespace SymbolsDataItemTableRecordDefinitionList {
    export const baseName = 'SymbolDataItem';

    export namespace JsonName {
        export const request = 'request';
    }

    export const defaultAccountGroup: AllBrokerageAccountGroup = BrokerageAccountGroup.createAll();

    export function saveDataDefinitionToJson(dataDefinition: SearchSymbolsDataDefinition, element: JsonElement) {
        // throw new NotImplementedError('STRDLRSTJ3233992888');
    }

    export function tryCreateDataDefinitionFromJson(element: JsonElement | undefined) {
        return undefined;
        // throw new NotImplementedError('STRDLRTCFJ3233992888');
    }

    // export interface Request {
    //     typeId: Request.TypeId;
    // }

    // export namespace Request {
    //     export const enum TypeId {
    //         Query,
    //         Subscription,
    //     }

    //     export function createCopy(request: Request) {
    //         switch (request.typeId) {
    //             case TypeId.Query: return QueryRequest.createCopy(request as QueryRequest);
    //             case TypeId.Subscription: return SubscriptionRequest.createCopy(request as SubscriptionRequest);
    //             default:
    //                 throw new UnreachableCaseError('SDITRDLRCC59938812', request.typeId);
    //         }
    //     }

    //     export function saveToJson(request: Request, element: JsonElement) {
    //         // throw new NotImplementedError('STRDLRSTJ3233992888');
    //     }
    // }

    // export interface QueryRequest extends Request {
    //     typeId: Request.TypeId.Query;

    //     searchText: string;
    //     showFull: boolean;

    //     exchangeId: ExchangeId | undefined;
    //     marketIds: readonly MarketId[] | undefined;
    //     cfi: string | undefined;
    //     fieldIds: readonly SymbolFieldId[] | undefined;
    //     isPartial: boolean | undefined;
    //     isCaseSensitive: boolean | undefined;
    //     preferExact: boolean | undefined;
    //     startIndex: Integer | undefined;
    //     count: Integer | undefined;
    // }

    // export namespace QueryRequest {
    //     export function createCopy(request: QueryRequest) {
    //         const result: QueryRequest = {
    //             typeId: Request.TypeId.Query,
    //             searchText: request.searchText,
    //             showFull: request.showFull,
    //             exchangeId: request.exchangeId,
    //             marketIds: request.marketIds,
    //             cfi: request.cfi,
    //             fieldIds: request.fieldIds,
    //             isPartial: request.isPartial,
    //             isCaseSensitive: request.isCaseSensitive,
    //             preferExact: request.preferExact,
    //             startIndex: request.startIndex,
    //             count: request.count,
    //         };

    //         return result;
    //     }
    // }

    // export interface SubscriptionRequest extends Request {
    //     typeId: Request.TypeId.Subscription;

    //     marketId: MarketId;
    //     classId: IvemClassId;
    // }

    // export namespace SubscriptionRequest {
    //     export function createCopy(request: SubscriptionRequest) {
    //         const result: SubscriptionRequest = {
    //             typeId: Request.TypeId.Subscription,
    //             marketId: request.marketId,
    //             classId: request.classId,
    //         };

    //         return result;
    //     }
    // }

    export function createDefaultCondition() {
        const defaultCondition: SearchSymbolsDataDefinition.Condition = {
            text: '',
            fieldIds: [SymbolFieldId.Code],
            isCaseSensitive: false,
        };

        return defaultCondition;
    }

    export function createDefaultDataDefinition(defaultExchangeId: ExchangeId, defaultMarketId: MarketId) {
        const condition = createDefaultCondition();
        const result = new SearchSymbolsDataDefinition();
        result.conditions = [condition];
        result.exchangeId = defaultExchangeId;
        result.marketIds = [defaultMarketId];
        result.cfi = '';
        result.preferExact = false;
        result.fullSymbol = false;
        result.count = 200;

        return result;
    }
}
