/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparisonResult } from '../sys/extension-api';
import { BrokerageAccountId } from './brokerage-account-id-api';

/** @public */
export interface BrokerageAccountGroup {
    readonly type: BrokerageAccountGroup.Type;
    readonly id: BrokerageAccountGroup.Id;

    isSingle(): boolean;
    isAll(): boolean;

    isEqualTo(other: BrokerageAccountGroup): boolean;
    compareTo(other: BrokerageAccountGroup): ComparisonResult;
}

/** @public */
export namespace BrokerageAccountGroup {
    export type Id = string;

    export const enum TypeEnum {
        Single = 'Single',
        All = 'All',
    }

    export type Type = keyof typeof TypeEnum;
}

/** @public */
export interface SingleBrokerageAccountGroup extends BrokerageAccountGroup {
    readonly accountId: BrokerageAccountId;
}

/** @public */
export interface AllBrokerageAccountGroup extends BrokerageAccountGroup {
}
