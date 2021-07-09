/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'src/res/internal-api';
import { AssertInternalError, Badness, ComparisonResult, UnreachableCaseError } from 'src/sys/internal-api';
import { SubscribabilityExtent, SubscribabilityExtentId } from './common/internal-api';
import { PublisherSubscriptionDataItem } from './publisher-subscription-data-item';

export abstract class SubscribabilityExtentSubscriptionDataItem extends PublisherSubscriptionDataItem {
    private _subscribabilityExtentId = SubscribabilityExtentId.None;
    private _subscribableOnline = false;

    protected setSubscribabilityExtent(value: SubscribabilityExtentId) {
        if (value !== this._subscribabilityExtentId) {
            const extentChange = SubscribabilityExtent.compare(value, this._subscribabilityExtentId);
            const extentIncreased = extentChange === ComparisonResult.LeftGreaterThanRight;
            this._subscribabilityExtentId = value;
            this._subscribableOnline = SubscribabilityExtent.isOnline(value);
            this.processChanged(extentIncreased);
        }
    }

    protected override processPublisherCameOnline() {
        if (this._subscribableOnline) {
            // Cannot be online before publisher
            throw new AssertInternalError('SESDIPPCOFN76888544092');
        } else {
            // Do NOT call super.processPublisherCameOnline().  Activation will occur when becomes subscribable
            const badness = this.calculateUsabilityBadness(); // should be unusable
            this.setSubscribabilityIncreaseWaitingStateId(badness);
        }
    }

    protected override tryInitiateSubscribabilityIncreaseRetryWaiting(badness: Badness) {
        const initiated = super.tryInitiateSubscribabilityIncreaseRetryWaiting(badness);
        if (initiated) {
            return true;
        } else {
            switch (this._subscribabilityExtentId) {
                case SubscribabilityExtentId.None:
                    const noneIncreaseReasonExtra = Strings[StringId.SubscribabilityIncreaseRetry_FromExtentNone];
                    const noneBadness = this.createSubscribabilityExtentIncreaseWaitingBadness(noneIncreaseReasonExtra);
                    this.setSubscribabilityIncreaseWaitingStateId(noneBadness);
                    return true;

                case SubscribabilityExtentId.Some:
                    const someIncreaseReasonExtra = Strings[StringId.SubscribabilityIncreaseRetry_FromExtentSome];
                    const someBadness = this.createSubscribabilityExtentIncreaseWaitingBadness(someIncreaseReasonExtra);
                    this.setSubscribabilityIncreaseWaitingStateId(someBadness);
                    return true;

                case SubscribabilityExtentId.All:
                    return false;

                default:
                    throw new UnreachableCaseError('SESDIISIR06668399923', this._subscribabilityExtentId);
            }
        }
    }

    private processChanged(extentIncreased: boolean) {
        if (extentIncreased) {
            this.checkSubscribabilityIncreaseWaitingActivate();
            this.trySetUsable();
        } else {
            if (!this._subscribableOnline) {
                const badness = this.calculateUsabilityBadness();
                this.setUnusable(badness);
            }
        }
    }

    private createSubscribabilityExtentIncreaseWaitingBadness(increaseReasonExtra: string) {
        const badness = this.calculateUsabilityBadness();
        const reasonExtra = (badness.reasonExtra === '') ? increaseReasonExtra : `${badness.reasonExtra}: ${increaseReasonExtra}`;
        const result: Badness = {
            reasonId: badness.reasonId,
            reasonExtra,
        };
        return result;
    }
}
