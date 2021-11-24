/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer, SysTick, TUID } from 'sys-internal-api';
import {
    DataDefinition,
    DataItemId,
    DataItemRequestNr,
    DataMessages,
    PublisherSubscriptionDataDefinition,
    PublisherTypeId
} from './common/internal-api';

export abstract class Publisher {
    protected _publisherTypeId: PublisherTypeId;
    protected _id: Integer;
    protected _finaliseInitiated: boolean;

    private _batchSubscriptionChanges: boolean;

    constructor(publisherTypeId?: PublisherTypeId) {
        this._publisherTypeId = (publisherTypeId) ? publisherTypeId : this.getPublisherTypeId();
        this._id = TUID.getUID();
    }

    get publisherTypeId(): PublisherTypeId { return this._publisherTypeId; }
    get id(): Integer { return this._id; }
    get batchSubscriptionChanges(): boolean { return this._batchSubscriptionChanges; }
    set batchSubscriptionChanges(value: boolean) { this._batchSubscriptionChanges = value; }

    finalise(): boolean { // virtual
        // The Finalise function will be called when Pulse is shutting down.
        // Return TRUE to indicate this class and descendents are ready for shut down.
        // Return FALSE if this class is not yet ready for shut down. For example a
        // thread is still processing data.
        // Returning FALSE will block the shut down sequence for a limited period
        // of time. If blocked for too long, Pulse will force the shut down.
        this._finaliseInitiated = true;
        return true;
    }

    abstract getMessages(nowTickTime: SysTick.Time): DataMessages;

    abstract connect(
        dataItemId: DataItemId,
        dataItemRequestNr: DataItemRequestNr,
        dataDefinition: DataDefinition
    ): boolean;

    abstract disconnect(dataItemId: DataItemId): void;

    abstract subscribeDataItemId(dataItemId: DataItemId, dataDefinition: PublisherSubscriptionDataDefinition): boolean;
    abstract unsubscribeDataItemId(dataItemId: DataItemId): void;

    abstract activateDataItemId(dataItemId: DataItemId, dataItemRequestNr: DataItemRequestNr): void;

    protected abstract getPublisherTypeId(): PublisherTypeId;
}
