/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, AssertInternalError, ExternalError, ZenithDataError } from 'sys-internal-api';
import {
    LowLevelTopShareholdersDataDefinition,
    PublisherRequest,
    PublisherSubscription,
    TLowLevelTopShareholdersDataMessage,
    TopShareholder
} from '../../../common/internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace FragmentsMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof LowLevelTopShareholdersDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('FCRM5120125583399', definition.description);
        }
    }

    function createPublishMessage(definition: LowLevelTopShareholdersDataDefinition) {
        const litIvemId = definition.litIvemId;
        const marketId = litIvemId.litId;
        const exchangeEnvironmentId = litIvemId.environmentId;
        const zenithMarket = ZenithConvert.EnvironmentedMarket.fromId(marketId, exchangeEnvironmentId);

        let tradingDate: Zenith.DateTimeIso8601 | undefined;
        if (definition.tradingDate === undefined) {
            tradingDate = undefined;
        } else {
            tradingDate = ZenithConvert.Date.DateTimeIso8601.fromDate(definition.tradingDate);
        }

        const result: Zenith.FragmentsController.QueryFragments.Fundamentals_TopShareholders.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Fragments,
            Topic: Zenith.FragmentsController.TopicName.QueryFragments,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Market: zenithMarket,
                Code: definition.litIvemId.code,
                Fragments: [{ Name: Zenith.FragmentsController.QueryFragments.Fundamentals_TopShareholders.fragmentName }],
                TradingDate: tradingDate,
            },
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer) {
        assert(message.Controller === 'Fragments', 'ID:77306133821');
        assert((message.Topic === 'QueryFragments') as boolean, 'ID:77406133832');

        const respMessage = message as Zenith.FragmentsController.QueryFragments.Fundamentals_TopShareholders.QueryPayloadMessageContainer;
        const data = respMessage.Data;
        if (data !== undefined) {
            const dataMessage = new TLowLevelTopShareholdersDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            dataMessage.topShareholdersInfo = parseData(data);
            return dataMessage;

        } else {
            throw new ZenithDataError(ExternalError.Code.FCFPM399285,
                message.TransactionID === undefined ? 'undefined tranId' : message.TransactionID.toString(10));
        }
    }

    function parseData(
        data: Zenith.FragmentsController.QueryFragments.Fundamentals_TopShareholders.FragmentData): TopShareholder[] {
        const result: TopShareholder[] = [];

        const attrName = Zenith.FragmentsController.QueryFragments.Fundamentals_TopShareholders.fragmentName;

        if (Array.isArray(data[attrName])) {
            for (let index = 0; index < data[attrName].length; index++) {
                const shareholder = parseShareholderInfo(data[attrName][index]);
                result.push(shareholder);
            }
        }

        return result;
    }

    function parseShareholderInfo(info: Zenith.FragmentsController.QueryFragments.Fundamentals_TopShareholders.TopShareholder) {
        const result = new TopShareholder();
        result.name = info.Name;
        result.designation = info.Designation;
        result.holderKey = info.HolderKey;
        result.sharesHeld = info.SharesHeld;
        result.totalShareIssue = info.TotalShreIssue;
        return result;
    }
}
