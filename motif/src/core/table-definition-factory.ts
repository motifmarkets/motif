/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, BrokerageAccountGroup, IvemId, LitIvemId } from 'src/adi/internal-api';
import { AssertInternalError, Guid, Integer, JsonElement, Logger, UnexpectedCaseError, UnreachableCaseError } from 'src/sys/internal-api';
import { BalancesTableDefinition } from './balances-table-definition';
import { BalancesTableRecordDefinitionList } from './balances-table-record-definition-list';
import { BrokerageAccountTableDefinition } from './brokerage-account-table-definition';
import { BrokerageAccountTableRecordDefinitionList } from './brokerage-account-table-record-definition-list';
import { CallPutFromUnderlyingTableDefinition } from './call-put-from-underlying-table-definition';
import { CallPutFromUnderlyingTableRecordDefinitionList } from './call-put-from-underlying-table-record-definition-list';
import { FeedTableDefinition } from './feed-table-definition';
import { FeedTableRecordDefinitionList } from './feed-table-record-definition-list';
import { HoldingTableDefinition } from './holding-table-definition';
import { HoldingTableRecordDefinitionList } from './holding-table-record-definition-list';
import { OrderTableDefinition } from './order-table-definition';
import { OrderTableRecordDefinitionList } from './order-table-record-definition-list';
import { PortfolioTableDefinition } from './portfolio-table-definition';
import { PortfolioTableRecordDefinitionList } from './portfolio-table-record-definition-list';
import { SymbolsDataItemTableDefinition } from './symbols-data-item-table-definition';
import { SymbolsDataItemTableRecordDefinitionList } from './symbols-data-item-table-record-definition-list';
import { TableDefinition } from './table-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';
import { tableRecordDefinitionListDirectory } from './table-record-definition-list-directory';
import { tableRecordDefinitionListFactory } from './table-record-definition-list-factory';
import { TopShareholderTableDefinition } from './top-shareholder-table-definition';
import { TopShareholderTableRecordDefinitionList } from './top-shareholder-table-record-definition-list';

export class TableDefinitionFactory {
    constructor(private _adi: AdiService) { }

    createFromRecordDefinitionList(list: TableRecordDefinitionList): TableDefinition {
        switch (list.typeId) {
            case TableRecordDefinitionList.TypeId.Null:
                throw new UnexpectedCaseError('TSFCRDLN11156', `${list.typeId}`);
            case TableRecordDefinitionList.TypeId.SymbolsDataItem:
                return this.createSymbolsDataItemFromRecordDefinitionList(list as SymbolsDataItemTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.Portfolio:
                return this.createPortfolioFromRecordDefinitionList(list as PortfolioTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.Group:
            case TableRecordDefinitionList.TypeId.MarketMovers:
            case TableRecordDefinitionList.TypeId.IvemIdServer:
            case TableRecordDefinitionList.TypeId.Gics:
            case TableRecordDefinitionList.TypeId.ProfitIvemHolding:
            case TableRecordDefinitionList.TypeId.CashItemHolding:
            case TableRecordDefinitionList.TypeId.IntradayProfitLossSymbolRec:
            case TableRecordDefinitionList.TypeId.TmcDefinitionLegs:
            case TableRecordDefinitionList.TypeId.TmcLeg:
            case TableRecordDefinitionList.TypeId.TmcWithLegMatchingUnderlying:
            case TableRecordDefinitionList.TypeId.HoldingAccountPortfolio:
                throw new UnexpectedCaseError('TSFCRDLM11156', `${list.typeId}`);
            case TableRecordDefinitionList.TypeId.Feed:
                return this.createFeedFromRecordDefinitionList(list as FeedTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.BrokerageAccount:
                return this.createBrokerageAccountFromRecordDefinitionList(list as BrokerageAccountTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.Order:
                return this.createOrderFromRecordDefinitionList(list as OrderTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.Holding:
                return this.createHoldingFromRecordDefinitionList(list as HoldingTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.Balances:
                return this.createBalancesFromRecordDefinitionList(list as BalancesTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.CallPutFromUnderlying:
                return this.createCallPutFromUnderlyingFromRecordDefinitionList(list as CallPutFromUnderlyingTableRecordDefinitionList);
            case TableRecordDefinitionList.TypeId.TopShareholder:
                return this.createTopShareholderFromRecordDefinitionList(list as TopShareholderTableRecordDefinitionList);
            default:
                throw new UnreachableCaseError('TSFCFRDLD23236', list.typeId);
        }
    }

    createFromTableRecordDefinitionListDirectoryIndex(id: Guid, idx: Integer): TableDefinition {
        const list = tableRecordDefinitionListDirectory.getList(idx);
        switch (list.typeId) {
            case TableRecordDefinitionList.TypeId.Null:
                throw new UnexpectedCaseError('TSFCRDLN11156', `${list.typeId}`);
            case TableRecordDefinitionList.TypeId.SymbolsDataItem:
                return this.createSymbolsDataItemFromId(id);
            case TableRecordDefinitionList.TypeId.Portfolio:
                return this.createPortfolioFromId(id);
            case TableRecordDefinitionList.TypeId.Group:
            case TableRecordDefinitionList.TypeId.MarketMovers:
            case TableRecordDefinitionList.TypeId.IvemIdServer:
            case TableRecordDefinitionList.TypeId.Gics:
            case TableRecordDefinitionList.TypeId.ProfitIvemHolding:
            case TableRecordDefinitionList.TypeId.CashItemHolding:
            case TableRecordDefinitionList.TypeId.IntradayProfitLossSymbolRec:
            case TableRecordDefinitionList.TypeId.TmcDefinitionLegs:
            case TableRecordDefinitionList.TypeId.TmcLeg:
            case TableRecordDefinitionList.TypeId.TmcWithLegMatchingUnderlying:
            case TableRecordDefinitionList.TypeId.CallPutFromUnderlying:
            case TableRecordDefinitionList.TypeId.HoldingAccountPortfolio:
                throw new UnexpectedCaseError('TSFCRDLM11156', `${list.typeId}`);
            case TableRecordDefinitionList.TypeId.Feed:
                return this.createFeedFromId(id);
            case TableRecordDefinitionList.TypeId.BrokerageAccount:
                return this.createBrokerageAccountFromId(id);
            case TableRecordDefinitionList.TypeId.Order:
                return this.createOrderFromId(id);
            case TableRecordDefinitionList.TypeId.Holding:
                return this.createHoldingFromId(id);
            case TableRecordDefinitionList.TypeId.Balances:
                return this.createBalancesFromId(id);
            case TableRecordDefinitionList.TypeId.CallPutFromUnderlying:
                return this.createCallPutFromUnderlyingFromId(id);
            case TableRecordDefinitionList.TypeId.TopShareholder:
                return this.createTopShareholderFromId(id);
            default:
                throw new UnreachableCaseError('TSFCFRDLD23236', list.typeId);
        }
    }

    createFromTableRecordDefinitionListDirectoryId(id: Guid, locker: TableRecordDefinitionList.ILocker): TableDefinition {
        const idx = tableRecordDefinitionListDirectory.lockId(id, locker);
        if (idx === undefined) {
            throw new AssertInternalError('TSFCFTRDLI20091', id);
        } else {
            try {
                return this.createFromTableRecordDefinitionListDirectoryIndex(id, idx);
            } finally {
                tableRecordDefinitionListDirectory.unlockEntry(idx, locker);
            }
        }
    }

    tryCreateFromJson(element: JsonElement) {
        const privateElement = element.tryGetElement(TableDefinition.jsonTag_PrivateTableRecordDefinitionList, 'TSGTRDLTIFJS87599');

        let definition: TableDefinition | undefined;
        if (privateElement !== undefined) {
            definition = this.tryCreateFromTableRecordDefinitionListJson(privateElement);
        } else {
            definition = this.tryCreateFromDirectoryIdJson(element);
        }

        if (definition !== undefined) {
            definition.loadFromJson(element);
        }

        return definition;
    }

    createSymbolsDataItem(request: SymbolsDataItemTableRecordDefinitionList.Request) {
        const list = tableRecordDefinitionListFactory.createUnloadedSymbolsDataItem();
        list.load(request);
        return this.createSymbolsDataItemFromRecordDefinitionList(list);
    }

    createSymbolsDataItemFromRecordDefinitionList(list: SymbolsDataItemTableRecordDefinitionList) {
        return new SymbolsDataItemTableDefinition(list);
    }

    createSymbolsDataItemFromId(id: Guid) {
        return new SymbolsDataItemTableDefinition(id);
    }

    createPortfolio() {
        const list = tableRecordDefinitionListFactory.createUnloadedPortfolio();
        // nothing to load
        return this.createPortfolioFromRecordDefinitionList(list);
    }

    createPortfolioFromRecordDefinitionList(list: PortfolioTableRecordDefinitionList) {
        return new PortfolioTableDefinition(this._adi, list);
    }

    createPortfolioFromId(id: Guid) {
        return new PortfolioTableDefinition(this._adi, id);
    }

    createFeed() {
        const list = tableRecordDefinitionListFactory.createUnloadedFeed();
        // nothing to load
        return this.createFeedFromRecordDefinitionList(list);
    }

    createFeedFromRecordDefinitionList(list: FeedTableRecordDefinitionList) {
        return new FeedTableDefinition(list);
    }

    createFeedFromId(id: Guid) {
        return new FeedTableDefinition(id);
    }

    createBrokerageAccount() {
        const list = tableRecordDefinitionListFactory.createUnloadedBrokerageAccount();
        // nothing to load
        return this.createBrokerageAccountFromRecordDefinitionList(list);
    }

    createBrokerageAccountFromRecordDefinitionList(list: BrokerageAccountTableRecordDefinitionList) {
        return new BrokerageAccountTableDefinition(list);
    }

    createBrokerageAccountFromId(id: Guid) {
        return new BrokerageAccountTableDefinition(id);
    }

    createOrder(group: BrokerageAccountGroup) {
        const list = tableRecordDefinitionListFactory.createUnloadedOrder();
        list.load(group);
        return this.createOrderFromRecordDefinitionList(list);
    }

    createOrderFromRecordDefinitionList(list: OrderTableRecordDefinitionList) {
        return new OrderTableDefinition(this._adi, list);
    }

    createOrderFromId(id: Guid) {
        return new OrderTableDefinition(this._adi, id);
    }

    createHolding(group: BrokerageAccountGroup) {
        const list = tableRecordDefinitionListFactory.createUnloadedHolding();
        list.load(group);
        return this.createHoldingFromRecordDefinitionList(list);
    }

    createHoldingFromRecordDefinitionList(list: HoldingTableRecordDefinitionList) {
        return new HoldingTableDefinition(this._adi, list);
    }

    createHoldingFromId(id: Guid) {
        return new HoldingTableDefinition(this._adi, id);
    }

    createBalances(group: BrokerageAccountGroup) {
        const list = tableRecordDefinitionListFactory.createUnloadedBalances();
        list.load(group);
        return this.createBalancesFromRecordDefinitionList(list);
    }

    createBalancesFromRecordDefinitionList(list: BalancesTableRecordDefinitionList) {
        return new BalancesTableDefinition(this._adi, list);
    }

    createBalancesFromId(id: Guid) {
        return new BalancesTableDefinition(this._adi, id);
    }

    createCallPutFromUnderlying(underlyingIvemId: IvemId) {
        const list = tableRecordDefinitionListFactory.createUnloadedCallPutFromUnderlying();
        list.load(underlyingIvemId);
        return this.createCallPutFromUnderlyingFromRecordDefinitionList(list);
    }

    createCallPutFromUnderlyingFromRecordDefinitionList(list: CallPutFromUnderlyingTableRecordDefinitionList) {
        return new CallPutFromUnderlyingTableDefinition(this._adi, list);
    }

    createCallPutFromUnderlyingFromId(id: Guid) {
        return new CallPutFromUnderlyingTableDefinition(this._adi, id);
    }

    createTopShareholder(litIvemId: LitIvemId, tradingDate: Date | undefined, compareToTradingDate: Date | undefined) {
        const list = tableRecordDefinitionListFactory.createUnloadedTopShareholder();
        list.load(litIvemId, tradingDate, compareToTradingDate);
        return this.createTopShareholderFromRecordDefinitionList(list);
    }

    createTopShareholderFromRecordDefinitionList(list: TopShareholderTableRecordDefinitionList) {
        return new TopShareholderTableDefinition(list);
    }

    createTopShareholderFromId(id: Guid) {
        return new TopShareholderTableDefinition(id);
    }

    private tryCreateFromTableRecordDefinitionListJson(element: JsonElement) {
        const list = tableRecordDefinitionListFactory.tryCreateFromJson(element);
        if (list === undefined) {
            return undefined;
        } else {
            return this.createFromRecordDefinitionList(list);
        }
    }

    private tryCreateFromDirectoryIdJson(element: JsonElement) {
        let idx: Integer = -1;
        let id = element.tryGetGuid(TableDefinition.jsonTag_TableRecordDefinitionListId, 'TSFTCFDIJG33389');
        if (id === undefined) {
            Logger.logPersistError('TSFTCFDIJIU39875');
        } else {
            idx = tableRecordDefinitionListDirectory.indexOfId(id);
            if (idx < 0) {
                Logger.logPersistError('TSFTCFDIJII32321');
            }
        }

        if (idx < 0) {
            // could not find via Id - try with Type and Name
            const typeIdJson = element.tryGetString(TableDefinition.jsonTag_TableRecordDefinitionListType, 'TSFTCFDIJS20098');
            if (typeIdJson === undefined) {
                Logger.logPersistError('TSFTCFDIJU39875', element.stringify());
            } else {
                const typeId = TableRecordDefinitionList.Type.tryJsonToId(typeIdJson);
                if (typeId === undefined) {
                    Logger.logPersistError('TSFTCFDIJT78791', typeIdJson);
                } else {
                    const name = element.tryGetString(TableDefinition.jsonTag_TableRecordDefinitionListType, 'TSFTCFDIJJN99872');
                    if (name === undefined) {
                        Logger.logPersistError('TSFTCFDIJU09871', element.stringify());
                    } else {
                        idx = tableRecordDefinitionListDirectory.indexOfListTypeAndName(typeId, name);
                        if (idx < 0) {
                            Logger.logPersistError('TSFTCFDIJUX21213', `"${typeIdJson}", "${name}"`);
                        } else {
                            const list = tableRecordDefinitionListDirectory.getList(idx);
                            id = list.id;
                        }
                    }
                }
            }
        }

        if (idx < 0 || id === undefined) {
            return undefined;
        } else {
            return this.createFromTableRecordDefinitionListDirectoryIndex(id, idx);
        }
    }
}

export namespace TableDefinitionFactory {
    // export interface TryCreateResult {
    //     success: boolean;
    //     source: TableDefinition | undefined;
    //     errorCode: string | undefined;
    //     errorText: string | undefined;
    // }
}

export let tableDefinitionFactory: TableDefinitionFactory;

export function setTableDefinitionFactory(value: TableDefinitionFactory) {
    tableDefinitionFactory = value;
}
