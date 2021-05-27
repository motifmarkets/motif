/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Logger, UnexpectedCaseError } from 'src/sys/internal-api';
import { DataChannel, DataChannelId, DataMessage, PublisherRequest, PublisherSubscription } from '../../../common/internal-api';
import { AccountsMessageConvert } from './accounts-message-convert';
import { AmendOrderMessageConvert } from './amend-order-message-convert';
import { BalancesMessageConvert } from './balances-message-convert';
import { CancelOrderMessageConvert } from './cancel-order-message-convert';
import { ChartHistoryMessageConvert } from './chart-history-message-convert';
import { DepthLevelsMessageConvert } from './depth-levels-message-convert';
import { DepthMessageConvert } from './depth-message-convert';
import { FeedsMessageConvert } from './feeds-message-convert';
import { FragmentsMessageConvert } from './fragments-message-convert';
import { HoldingsMessageConvert } from './holdings-message-convert';
import { MarketsMessageConvert } from './markets-message-convert';
import { MoveOrderMessageConvert } from './move-order-message-convert';
import { OrderAuditMessageConvert } from './order-audit-message-convert';
import { OrderRequestsMessageConvert } from './order-requests-message-convert';
import { OrderStatusesMessageConvert } from './order-statuses-message-convert';
import { OrdersMessageConvert } from './orders-message-convert';
import { PlaceOrderMessageConvert } from './place-order-message-convert';
import { QueryConfigureMessageConvert } from './query-configure-message-convert';
import { SecurityMessageConvert } from './security-message-convert';
import { ServerInfoMessageConvert } from './server-info-message-convert';
import { SymbolsMessageConvert } from './symbols-message-convert';
import { TradesMessageConvert } from './trades-message-convert';
import { TradingStatesMessageConvert as TradingStatesMessageConvert } from './trading-states-message-convert';
import { TransactionsMessageConvert } from './transactions-message-convert';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace ZenithMessageConvert {

    export function createRequestMessage(request: PublisherRequest): Zenith.MessageContainer {
        switch (request.subscription.dataDefinition.channelId) {
            case DataChannelId.ZenithQueryConfigure:    return QueryConfigureMessageConvert.createRequestMessage(request);
            case DataChannelId.ZenithServerInfo:        return ServerInfoMessageConvert.createRequestMessage(request);
            case DataChannelId.Feeds:                   return FeedsMessageConvert.createRequestMessage(request);
            case DataChannelId.TradingStates:           return TradingStatesMessageConvert.createRequestMessage(request);
            case DataChannelId.Markets:                 return MarketsMessageConvert.createRequestMessage(request);
            case DataChannelId.Symbols:                 return SymbolsMessageConvert.createRequestMessage(request);
            case DataChannelId.Security:                return SecurityMessageConvert.createRequestMessage(request);
            case DataChannelId.Depth:                   return DepthMessageConvert.createRequestMessage(request);
            case DataChannelId.DepthLevels:             return DepthLevelsMessageConvert.createRequestMessage(request);
            case DataChannelId.Trades:                  return TradesMessageConvert.createRequestMessage(request);
            case DataChannelId.ChartHistory:            return ChartHistoryMessageConvert.createRequestMessage(request);
            case DataChannelId.LowLevelTopShareholders: return FragmentsMessageConvert.createRequestMessage(request);
            case DataChannelId.BrokerageAccounts:       return AccountsMessageConvert.createRequestMessage(request);
            case DataChannelId.OrderStatuses:           return OrderStatusesMessageConvert.createRequestMessage(request);
            case DataChannelId.BrokerageAccountOrders:                  return OrdersMessageConvert.createRequestMessage(request);
            case DataChannelId.BrokerageAccountHoldings:                return HoldingsMessageConvert.createRequestMessage(request);
            case DataChannelId.BrokerageAccountBalances:                return BalancesMessageConvert.createRequestMessage(request);
            case DataChannelId.BrokerageAccountTransactions:            return TransactionsMessageConvert.createRequestMessage(request);
            case DataChannelId.OrderRequests:           return OrderRequestsMessageConvert.createRequestMessage(request);
            case DataChannelId.OrderAudit:              return OrderAuditMessageConvert.createRequestMessage(request);
            case DataChannelId.PlaceOrderRequest:       return PlaceOrderMessageConvert.createRequestMessage(request);
            case DataChannelId.AmendOrderRequest:       return AmendOrderMessageConvert.createRequestMessage(request);
            case DataChannelId.CancelOrderRequest:      return CancelOrderMessageConvert.createRequestMessage(request);
            case DataChannelId.MoveOrderRequest:        return MoveOrderMessageConvert.createRequestMessage(request);
            default:
                throw new AssertInternalError('ZMCCRD8777487773', DataChannel.idToName(request.subscription.dataDefinition.channelId));
        }
    }

    export function createDataMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id): DataMessage {
        try {
            switch (subscription.dataDefinition.channelId) {
                case DataChannelId.ZenithQueryConfigure: return QueryConfigureMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.ZenithServerInfo: return ServerInfoMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.Feeds: return FeedsMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.TradingStates: return TradingStatesMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.Markets: return MarketsMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.Symbols: return SymbolsMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.Security: return SecurityMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.Depth: return DepthMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.DepthLevels: return DepthLevelsMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.Trades: return TradesMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.ChartHistory: return ChartHistoryMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.LowLevelTopShareholders: return FragmentsMessageConvert.parseMessage(subscription, message);
                case DataChannelId.BrokerageAccounts: return AccountsMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.OrderStatuses: return OrderStatusesMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.BrokerageAccountOrders: return OrdersMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.BrokerageAccountHoldings: return HoldingsMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.BrokerageAccountBalances: return BalancesMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.BrokerageAccountTransactions: return TransactionsMessageConvert.parseMessage(subscription, message,
                    actionId);
                case DataChannelId.OrderRequests: return OrderRequestsMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.OrderAudit: return OrderAuditMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.PlaceOrderRequest: return PlaceOrderMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.AmendOrderRequest: return AmendOrderMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.CancelOrderRequest: return CancelOrderMessageConvert.parseMessage(subscription, message, actionId);
                case DataChannelId.MoveOrderRequest: return MoveOrderMessageConvert.parseMessage(subscription, message, actionId);
                default:
                    throw new UnexpectedCaseError('MZCCDM113355', subscription.dataDefinition.channelId.toString(10));
            }
        } catch (error) {
            // Failure to parse an incoming data message is a serious error and must be fixed ASAP.
            Logger.logError(`Zenith message parse error: "${error}" Message: ${message}`, 300);
            throw error;
        }

    }
}
