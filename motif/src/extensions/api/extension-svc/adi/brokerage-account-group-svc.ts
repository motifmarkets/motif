/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AllBrokerageAccountGroup,
    BrokerageAccountGroup,
    BrokerageAccountId,
    ComparisonResult,
    SingleBrokerageAccountGroup
} from '../../exposed/extension-api';

/** @public */
export interface BrokerageAccountGroupSvc {
    createAll(): AllBrokerageAccountGroup;
    createSingle(accountId: BrokerageAccountId): SingleBrokerageAccountGroup;

    isSingle(group: BrokerageAccountGroup): group is SingleBrokerageAccountGroup;

    isEqual(left: BrokerageAccountGroup, right: BrokerageAccountGroup): boolean;
    isUndefinableEqual(left: BrokerageAccountGroup | undefined, right: BrokerageAccountGroup | undefined): boolean;

    compare(left: BrokerageAccountGroup, right: BrokerageAccountGroup): ComparisonResult;
    compareUndefinable(left: BrokerageAccountGroup | undefined, right: BrokerageAccountGroup | undefined): ComparisonResult;
}
