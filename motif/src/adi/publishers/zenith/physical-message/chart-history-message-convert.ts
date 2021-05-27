/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, ZenithDataError } from 'src/sys/internal-api';
import {
    ChartHistoryDataMessage,
    PublisherRequest,
    PublisherSubscription,
    QueryChartHistoryDataDefinition
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';


export namespace ChartHistoryMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof QueryChartHistoryDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('CHOMCCRM55583399', definition.description);
        }
    }

    function createPublishMessage(definition: QueryChartHistoryDataDefinition) {
        const litIvemId = definition.litIvemId;
        const marketId = litIvemId.litId;
        const exchangeEnvironmentId = litIvemId.environmentId;
        const period = ZenithConvert.ChartHistory.Period.fromChartIntervalId(definition.intervalId);
        let fromDate: Zenith.DateTimeIso8601 | undefined;
        if (definition.fromDate === undefined) {
            fromDate = undefined;
        } else {
            fromDate = ZenithConvert.Date.DateTimeIso8601.fromDate(definition.fromDate);
        }
        let toDate: Zenith.DateTimeIso8601 | undefined;
        if (definition.toDate === undefined) {
            toDate = undefined;
        } else {
            toDate = ZenithConvert.Date.DateTimeIso8601.fromDate(definition.toDate);
        }

        const result: Zenith.MarketController.ChartHistory.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Market,
            Topic: Zenith.MarketController.TopicName.QueryChartHistory,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Code: definition.litIvemId.code,
                Market: ZenithConvert.EnvironmentedMarket.fromId(marketId, exchangeEnvironmentId),
                Count: definition.count,
                Period: period,
                FromDate: fromDate,
                ToDate: toDate,
            }
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
            actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== Zenith.MessageContainer.Controller.Market) {
            throw new ZenithDataError(ExternalError.Code.CHMCPMC588329999199, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ExternalError.Code.CHMCPMA2233498, actionId.toString());
            } else {
                if (message.Topic !== Zenith.MarketController.TopicName.QueryChartHistory) {
                    throw new ZenithDataError(ExternalError.Code.CHMCPMT2233498, message.Topic);
                } else {
                    const historyMsg = message as Zenith.MarketController.ChartHistory.PayloadMessageContainer;

                    const dataMessage = new ChartHistoryDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    dataMessage.records = parseData(historyMsg.Data);
                    return dataMessage;
                }
            }
        }
    }

    function parseData(payloadRecords: Zenith.MarketController.ChartHistory.Record[]): ChartHistoryDataMessage.Record[] {
        const count = payloadRecords.length;
        const records = new Array<ChartHistoryDataMessage.Record>(count);
        for (let i = 0; i < count; i++) {
            const payloadRecord = payloadRecords[i];
            const dateTime = ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(payloadRecord.Date);
            if (dateTime === undefined) {
                throw new ZenithDataError(ExternalError.Code.CHMCPD87777354332, payloadRecord.Date);
            } else {
                const record: ChartHistoryDataMessage.Record = {
                    dateTime,
                    open: payloadRecord.Open,
                    high: payloadRecord.High,
                    low: payloadRecord.Low,
                    close: payloadRecord.Close,
                    volume: payloadRecord.Volume,
                    trades: payloadRecord.Trades,
                };

                records[i] = record;
            }
        }

        return records;
    }
}
