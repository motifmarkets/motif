/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, BrokerageAccountGroup, ExchangeInfo } from '@motifmarkets/motif-core';
import {
    AllBrokerageAccountGroup as AllBrokerageAccountGroupApi,
    BrokerageAccountGroup as BrokerageAccountGroupApi,
    BrokerageAccountGroupSvc,
    BrokerageAccountId as BrokerageAccountIdApi,
    SingleBrokerageAccountGroup as SingleBrokerageAccountGroupApi
} from '../../../api/extension-api';
import {
    AllBrokerageAccountGroupImplementation,
    BrokerageAccountGroupImplementation,
    ComparisonResultImplementation,
    SingleBrokerageAccountGroupImplementation
} from '../../exposed/internal-api';
import { SvcImplementation } from '../svc-implementation';

export class BrokerageAccountGroupSvcImplementation extends SvcImplementation implements BrokerageAccountGroupSvc {
    destroy() {

    }

    createAll(): AllBrokerageAccountGroupApi {
        const group = BrokerageAccountGroup.createAll();
        return new AllBrokerageAccountGroupImplementation(group);
    }

    createSingle(accountId: BrokerageAccountIdApi) {
        const key = new Account.Key(accountId, ExchangeInfo.getDefaultEnvironmentId());
        const group = BrokerageAccountGroup.createSingle(key);
        return new SingleBrokerageAccountGroupImplementation(group);
    }

    isSingle(groupApi: BrokerageAccountGroupApi): groupApi is SingleBrokerageAccountGroupApi {
        const actualGroup = BrokerageAccountGroupImplementation.fromApi(groupApi);
        return actualGroup.isSingle();
    }

    isEqual(left: BrokerageAccountGroupApi, right: BrokerageAccountGroupApi) {
        const actualLeft = BrokerageAccountGroupImplementation.fromApi(left);
        const actualRight = BrokerageAccountGroupImplementation.fromApi(right);
        return BrokerageAccountGroup.isEqual(actualLeft, actualRight);
    }

    isUndefinableEqual(left: BrokerageAccountGroupApi | undefined, right: BrokerageAccountGroupApi | undefined) {
        const actualLeft = left === undefined ? undefined : BrokerageAccountGroupImplementation.fromApi(left);
        const actualRight = right === undefined ? undefined : BrokerageAccountGroupImplementation.fromApi(right);
        return BrokerageAccountGroup.isUndefinableEqual(actualLeft, actualRight);
    }

    compare(left: BrokerageAccountGroupApi, right: BrokerageAccountGroupApi) {
        const actualLeft = BrokerageAccountGroupImplementation.fromApi(left);
        const actualRight = BrokerageAccountGroupImplementation.fromApi(right);
        const comparisonResult = BrokerageAccountGroup.compare(actualLeft, actualRight);
        return ComparisonResultImplementation.toApi(comparisonResult);
    }

    compareUndefinable(left: BrokerageAccountGroupApi | undefined, right: BrokerageAccountGroupApi | undefined) {
        const actualLeft = left === undefined ? undefined : BrokerageAccountGroupImplementation.fromApi(left);
        const actualRight = right === undefined ? undefined : BrokerageAccountGroupImplementation.fromApi(right);
        const comparisonResult = BrokerageAccountGroup.compareUndefinable(actualLeft, actualRight);
        return ComparisonResultImplementation.toApi(comparisonResult);
    }
}
