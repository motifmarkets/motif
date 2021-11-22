/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account } from './account';
import { AdiService } from './adi-service';
import { BrokerageAccountsDataItem } from './brokerage-accounts-data-item';
import { BrokerageAccountId, BrokerageAccountsDataDefinition } from './common/internal-api';
import { DataItemIncubator } from './data-item-incubator';

export class BrokerageAccountIncubator {
    private _dataItem: BrokerageAccountsDataItem;
    private _brokerageAccountsDataItemIncubator: DataItemIncubator<BrokerageAccountsDataItem>;

    private _resolveFtn: BrokerageAccountIncubator.ResolveFtn | undefined;
    private _rejectFtn: BrokerageAccountIncubator.RejectFtn | undefined;

    constructor(private _adi: AdiService) {
        this._brokerageAccountsDataItemIncubator = new DataItemIncubator(this._adi);
    }

    get incubating() {
        return this._brokerageAccountsDataItemIncubator.incubating;
    }

    initialise() {
        const brokerageAccountsDefinition = new BrokerageAccountsDataDefinition();
        this._brokerageAccountsDataItemIncubator.initiateSubscribeIncubation(brokerageAccountsDefinition);
    }

    finalise() {
        this._brokerageAccountsDataItemIncubator.finalise();
    }

    incubate(accountId: BrokerageAccountId) {
        if (this._dataItem !== undefined) {
            // ready - no incubation necessary
            const result: BrokerageAccountIncubator.CancellableAccount = {
                cancelled: false,
                account: this._dataItem.getAccountById(accountId)
            } as const;
            return result;
        } else {
            if (this._brokerageAccountsDataItemIncubator.incubating) {
                return this.incubateInitialised(accountId);
            } else {
                this.initialise();
                return this.incubateInitialised(accountId);
            }
        }
    }

    cancel() {
        const result: BrokerageAccountIncubator.CancellableAccount = {
            cancelled: true,
            account: undefined
        } as const;
        this.checkResolve(result);
    }

    private checkResolve(result: BrokerageAccountIncubator.CancellableAccount) {
        if (this._resolveFtn) {
            this._resolveFtn(result);
            this._resolveFtn = undefined;
            this._rejectFtn = undefined;
        }
    }

    private checkReject(reason: string) {
        if (this._rejectFtn) {
            this._rejectFtn(reason);
            this._resolveFtn = undefined;
            this._rejectFtn = undefined;
        }
    }

    private assignThenFunctions(resolveFtn: BrokerageAccountIncubator.ResolveFtn,
                                rejectFtn: BrokerageAccountIncubator.RejectFtn) {
        // cancel previous - if any
        const result: BrokerageAccountIncubator.CancellableAccount = {
            cancelled: true,
            account: undefined
        } as const;
        this.checkResolve(result);

        // assign
        this._resolveFtn = resolveFtn;
        this._rejectFtn = rejectFtn;
    }

    private incubateInitialised(accountId: BrokerageAccountId) {
        // waiting for DataItem
        const promiseOrDataItem = this._brokerageAccountsDataItemIncubator.getInitiatedDataItemSubscriptionOrPromise();
        if (promiseOrDataItem === undefined) {
            const result: BrokerageAccountIncubator.CancellableAccount = {
                cancelled: true,
                account: undefined
            } as const;
            return result;
        } else {
            if (this._brokerageAccountsDataItemIncubator.isDataItem(promiseOrDataItem)) {
                // should not happen as we already know we are incubating
                this._dataItem = promiseOrDataItem;
                const result: BrokerageAccountIncubator.CancellableAccount = {
                    cancelled: false,
                    account: this._dataItem.getAccountById(accountId)
                } as const;
                return result;
            } else {
                // still waiting - assign then for DataItemIncubator
                promiseOrDataItem.then(
                    // incubating finished
                    (dataItem) => {
                        let result: BrokerageAccountIncubator.CancellableAccount;
                        if (dataItem === undefined) {
                            // cancelled
                            result = { cancelled: true, account: undefined } as const;
                        } else {
                            this._dataItem = dataItem;
                            result = { cancelled: false, account: this._dataItem.getAccountById(accountId) } as const;
                        }
                        this.checkResolve(result);
                    },
                    (reason) => {
                        this.checkReject(reason);
                    }
                );
                return new Promise<BrokerageAccountIncubator.CancellableAccount>(
                    (resolve, reject) => this.assignThenFunctions(resolve, reject)
                );
            }
        }
    }
}

export namespace BrokerageAccountIncubator {
    export interface CancellableAccount {
        cancelled: boolean;
        account: Account | undefined;
    }
    export type ResolveFtn = (this: void, cancellableAccount: CancellableAccount ) => void;
    export type RejectFtn = (this: void, reason: string) => void;

    export function isCancellableAccount(promiseOrCancellableAccount: CancellableAccount | Promise<CancellableAccount>):
        promiseOrCancellableAccount is CancellableAccount {
        const assumedCancellabelAccount = promiseOrCancellableAccount as CancellableAccount;
        return assumedCancellabelAccount.cancelled !== undefined || assumedCancellabelAccount.account !== undefined;
    }
}
