/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Badness, Integer, MultiEvent, UnreachableCaseError, UsableListChangeTypeId } from 'src/sys/internal-api';
import { BrokerageAccountsDataItem } from './brokerage-accounts-data-item';
import { BrokerageAccountsDataDefinition } from './common/internal-api';
import { DataItem } from './data-item';

export abstract class AllBrokerageAccountsListChangeDataItem extends DataItem {
    private _accountsDataItem: BrokerageAccountsDataItem;
    private _accountsListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _accountsBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    protected get accounts() { return this._accountsDataItem.records; }

    protected start() {
        const accountDataDefinition = new BrokerageAccountsDataDefinition();
        this._accountsDataItem = this.subscribeDataItem(accountDataDefinition) as BrokerageAccountsDataItem;
        this._accountsBadnessChangeSubscriptionId = this._accountsDataItem.subscribeBadnessChangeEvent(
            () => this.handleAccountsBadnessChangeEvent()
        );
        this._accountsListChangeSubscriptionId = this._accountsDataItem.subscribeListChangeEvent(
            (listChangeType, index, count) => this.handleAccountsListChangeEvent(listChangeType, index, count)
        );

        if (this._accountsDataItem.usable) {
            const allCount = this._accountsDataItem.count;
            if (allCount > 0) {
                this.processAccountsListChange(UsableListChangeTypeId.PreUsableAdd, 0, allCount);
            }
            this.processAccountsListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.processAccountsListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }

        super.start();
    }

    protected stop() {
        this.processAccountsClear();

        if (this._accountsDataItem !== undefined) {
            this._accountsDataItem.unsubscribeListChangeEvent(this._accountsListChangeSubscriptionId);
            this._accountsDataItem.unsubscribeBadnessChangeEvent(this._accountsBadnessChangeSubscriptionId);
            this.unsubscribeDataItem(this._accountsDataItem);
        }

        super.stop();
    }

    protected calculateUsabilityBadness() {
        if (!this._accountsDataItem.usable) {
            return this.createUnusableAccountsBadness();
        } else {
            return Badness.notBad;
        }
    }

    private handleAccountsBadnessChangeEvent() {
        if (!this._accountsDataItem.usable) {
            const badness = this.createUnusableAccountsBadness();
            this.setUnusable(badness);
        }
    }

    private handleAccountsListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        this.processAccountsListChange(listChangeTypeId, index, count);
    }

    private processAccountsListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                const unusablebadness = this.createUnusableAccountsBadness();
                this.setUnusable(unusablebadness);
                break;
            case UsableListChangeTypeId.PreUsableClear:
                this.processAccountsPreUsableClear();
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                this.processAccountsPreUsableAdd();
                break;
            case UsableListChangeTypeId.Usable:
                this.processAccountsUsable();
                break;
            case UsableListChangeTypeId.Insert:
                this.processAccountsInserted(index, count);
                break;
            case UsableListChangeTypeId.Remove:
                throw new AssertInternalError('ABADRDIPALCR11103888', this.definition.description);
            case UsableListChangeTypeId.Clear:
                this.processAccountsClear();
                break;
            default:
                throw new UnreachableCaseError('ABADRDIPALCD11103888', listChangeTypeId);
        }
    }

    private createUnusableAccountsBadness() {
        const accountsBadness = this._accountsDataItem.badness;
        const reasonExtra = Badness.generateText(accountsBadness);
        if (Badness.isError(accountsBadness)) {
            return {
                reasonId: Badness.ReasonId.BrokerageAccountsError,
                reasonExtra,
            };
        } else {
            return {
                reasonId: Badness.ReasonId.BrokerageAccountsWaiting,
                reasonExtra,
            };
        }
    }

    protected abstract processAccountsPreUsableClear(): void;
    protected abstract processAccountsPreUsableAdd(): void;
    protected abstract processAccountsClear(): void;
    protected abstract processAccountsInserted(index: Integer, count: Integer): void;
    protected abstract processAccountsUsable(): void;
}
