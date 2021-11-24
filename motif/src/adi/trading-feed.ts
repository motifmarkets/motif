/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from 'res-internal-api';
import { AssertInternalError, Badness, Correctness, CorrectnessId, EnumInfoOutOfOrderError, Integer } from 'sys-internal-api';
import { FeedId, FeedStatusId, FieldDataTypeId, OrderStatuses } from './common/internal-api';
import { DataItem } from './data-item';
import { Feed } from './feed';
import { OrderStatusesFetcher } from './order-statuses-fetcher';

export class TradingFeed extends Feed {
    private _orderStatuses: OrderStatuses = [];
    private _orderStatusesFetcher: OrderStatusesFetcher | undefined;

    get orderStatusesBadness() { return this._orderStatusesFetcher === undefined ? Badness.notBad : this._orderStatusesFetcher.badness; }
    get orderStatuses() { return this._orderStatuses; }
    get orderStatusCount(): Integer | undefined { return this._orderStatuses === undefined ? undefined : this._orderStatuses.length; }

    initialise(subscribeDateItemFtn: DataItem.SubscribeDataItemFtn,
        unsubscribeDateItemFtn: DataItem.UnsubscribeDataItemFtn
    ) {
        this._orderStatusesFetcher = new OrderStatusesFetcher(this.id, subscribeDateItemFtn, unsubscribeDateItemFtn);
        if (this._orderStatusesFetcher.completed) {
            // Query so this should never occur
            this.processOrderStatusesFetchingCompleted();
        } else {
            this._orderStatusesFetcher.correctnessChangedEvent = () => this.handleOrderStatusesFetcherCorrectnessChangedEvent();
            this.updateCorrectness();
        }
    }

    override dispose() {
        this.checkDisposeOrderStatusesFetcher();
        super.dispose();
    }

    protected override calculateCorrectnessId() {
        let correctnessId = super.calculateCorrectnessId();
        if (this._orderStatusesFetcher !== undefined) {
            correctnessId = Correctness.merge2Ids(correctnessId, this._orderStatusesFetcher.correctnessId);
        }
        return correctnessId;
    }

    private handleOrderStatusesFetcherCorrectnessChangedEvent() {
        const fetcher = this._orderStatusesFetcher;
        if (fetcher === undefined) {
            throw new AssertInternalError('TFHOSFCCE123688399993');
        } else {
            if (fetcher.completed) {
                this.processOrderStatusesFetchingCompleted();
            } else {
                this.updateCorrectness();
            }
        }
    }

    private checkDisposeOrderStatusesFetcher() {
        if (this._orderStatusesFetcher !== undefined) {
            this._orderStatusesFetcher.finalise();
            this._orderStatusesFetcher = undefined;
        }
    }

    private processOrderStatusesFetchingCompleted() {
        const fetcher = this._orderStatusesFetcher;
        if (fetcher === undefined) {
            throw new AssertInternalError('TFPOSFC23688399993');
        } else {
            if (Correctness.idIsUsable(fetcher.correctnessId)) {
                this._orderStatuses = fetcher.orderStatuses;
                this.checkDisposeOrderStatusesFetcher();
            }
            this.updateCorrectness();
        }
    }
}

export namespace TradingFeed {
    export type BecameUsableEventHandler = (this: void) => void;

    export const enum TradingFieldId {
        Id,
        EnvironmentId,
        StatusId,
        OrderStatusCount,
    }

    export namespace TradingField {
        interface Info {
            readonly id: TradingFieldId;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
       }

        type InfosObject = { [id in keyof typeof TradingFieldId]: Info };
        const infosObject: InfosObject = {
            Id: {
                id: TradingFieldId.Id,
                name: 'FieldId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.FeedFieldDisplay_FeedId,
                headingId: StringId.FeedFieldHeading_FeedId,
            },
            EnvironmentId: {
                id: TradingFieldId.EnvironmentId,
                name: 'EnvironmentId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.FeedFieldDisplay_EnvironmentId,
                headingId: StringId.FeedFieldHeading_EnvironmentId,
            },
            StatusId: {
                id: TradingFieldId.StatusId,
                name: 'StatusId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.FeedFieldDisplay_StatusId,
                headingId: StringId.FeedFieldHeading_StatusId,
            },
            OrderStatusCount: {
                id: TradingFieldId.OrderStatusCount,
                name: 'OrderStatusCount',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.TradingFeedFieldDisplay_OrderStatusCount,
                headingId: StringId.TradingFeedFieldHeading_OrderStatusCount,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialiseField() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('TradingFeed.FieldId', outOfOrderIdx, infos[outOfOrderIdx].toString());
            }
        }

        export function idToName(id: TradingFieldId) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: TradingFieldId) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: TradingFieldId) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: TradingFieldId) {
            return Strings[idToDisplayId(id)];
        }

        export function idToHeadingId(id: TradingFieldId) {
            return infos[id].headingId;
        }

        export function idToHeading(id: TradingFieldId) {
            return Strings[idToHeadingId(id)];
        }
    }

    export const nullFeed = new TradingFeed(
        FeedId.Null,
        undefined,
        FeedStatusId.Impaired,
        CorrectnessId.Error,
    );
}

