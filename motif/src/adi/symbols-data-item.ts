/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, ExternalError, FeedError, Integer, MultiEvent, UnreachableCaseError, UsableListChangeTypeId } from 'src/sys/internal-api';
import {
    AurcChangeTypeId,
    DataDefinition,
    DataMessage,
    DataMessageTypeId,
    LitIvemId,
    SearchSymbolsDataDefinition,
    SymbolsDataMessage
} from './common/internal-api';
import { LitIvemFullDetail as LitIvemFullDetail } from './lit-ivem-full-detail';
import { PublisherSubscriptionDataItem } from './publisher-subscription-data-item';

export class SymbolsDataItem extends PublisherSubscriptionDataItem {
    private _query: boolean;

    private _records: SymbolsDataItem.Record[] = [];

    private _listChangeMultiEvent = new MultiEvent<SymbolsDataItem.ListChangeEventHandler>();
    private _recordChangeMultiEvent = new MultiEvent<SymbolsDataItem.RecordChangeEventHandler>();

    constructor(definition: DataDefinition) {
        super(definition);

        this._query = definition instanceof SearchSymbolsDataDefinition;
    }

    get query() { return this._query; }
    get querySymbolsDefinition() { return this.definition as SearchSymbolsDataDefinition; }
    get records() { return this._records; }

    override processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.Symbols) {
            super.processMessage(msg);
        } else {
            assert(msg instanceof SymbolsDataMessage, 'ID:7203122950');
            const typedMsg = msg as SymbolsDataMessage;

            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                const changes = typedMsg.changes;
                if (changes === undefined) {

                } else {
                    this.processChanges(changes);
                }
            } finally {
                this.endUpdate();
            }
        }
    }

    subscribeListChangeEvent(handler: SymbolsDataItem.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeRecordChangeEvent(handler: SymbolsDataItem.RecordChangeEventHandler) {
        return this._recordChangeMultiEvent.subscribe(handler);
    }

    unsubscribeRecordChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._recordChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected override processSubscriptionPreOnline() { // virtual
        if (this._records.length > 0) {
            this.beginUpdate();
            try {
                this.notifyUpdateChange();
                this.clearList();
            } finally {
                this.endUpdate();
            }
        }
    }

    protected override processUsableChanged() {
        if (this.usable) {
            this.notifyListChange(UsableListChangeTypeId.PreUsableClear, 0, 0);
            const count = this._records.length;
            if (count > 0) {
                this.notifyListChange(UsableListChangeTypeId.PreUsableAdd, 0, count);
            }
            this.notifyListChange(UsableListChangeTypeId.Usable, 0, 0);
        } else {
            this.notifyListChange(UsableListChangeTypeId.Unusable, 0, 0);
        }
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }

    private checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, index, count);
        }
    }

    private notifyRecordChange(index: Integer) {
        const handlers = this._recordChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](index);
        }
    }

    private indexOfLitIvemId(litIvemId: LitIvemId) {
        for (let i = 0; i < this._records.length; i++) {
            const recLitIvemId = this._records[i].litIvemId;
            if (LitIvemId.isEqual(recLitIvemId, litIvemId)) {
                return i;
            }
        }
        return -1;
    }

    private clearList() {
        const count = this._records.length;
        if (count > 0) {
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Clear, 0, count);
            this._records.length = 0;
        }
    }

    private removeRecord(litIvemId: LitIvemId) {
        const idx = this.indexOfLitIvemId(litIvemId);
        if (idx < 0) {
            throw new FeedError(ExternalError.Code.SDIRR119119887772, litIvemId.name);
        } else {
            this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, idx, 1);
            this._records.splice(idx, 1);
        }
    }

    private updateRecord(change: SymbolsDataMessage.UpdateChange) {
        const litIvemId = change.litIvemId;
        const idx = this.indexOfLitIvemId(litIvemId);
        if (idx < 0) {
            throw new FeedError(ExternalError.Code.SDIUR119119887772, litIvemId.name);
        } else {
            const record = this._records[idx];
            this.notifyRecordChange(idx);
            record.update(change);
            this.notifyRecordChange(idx);
        }
    }

    private addRange(msgChanges: readonly SymbolsDataMessage.Change[],
        rangeStartIdx: Integer, count: Integer
    ) {
        const addStartIdx = this._records.length;
        this._records.length += count;
        let addIdx = addStartIdx;
        for (let i = rangeStartIdx; i < rangeStartIdx + count; i++) {
            const change = msgChanges[i] as SymbolsDataMessage.AddChange;
            this._records[addIdx++] = new LitIvemFullDetail(change);
        }
        this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, addStartIdx, count);
    }

    private checkAddRange(msgChanges: readonly SymbolsDataMessage.Change[],
        rangeStartIdx: Integer, rangeEndPlusOneIdx: Integer) {
        if (rangeStartIdx >= 0) {
            const count = rangeEndPlusOneIdx - rangeStartIdx;
            this.addRange(msgChanges, rangeStartIdx, count);
        }
        return -1;
    }

    private processChanges(changes: readonly SymbolsDataMessage.Change[]) {
        let addStartMsgIdx = -1;

        for (let index = 0; index < changes.length; index++) {
            const change = changes[index];
            switch (change.typeId) {
                case AurcChangeTypeId.Clear:
                    this.clearList();
                    addStartMsgIdx = -1;
                    break;
                case AurcChangeTypeId.Remove:
                    addStartMsgIdx = this.checkAddRange(changes, addStartMsgIdx, index);
                    const removeChange = change as SymbolsDataMessage.RemoveChange;
                    const litIvemId = removeChange.litIvemId;
                    this.removeRecord(litIvemId);
                    break;
                case AurcChangeTypeId.Update:
                    addStartMsgIdx = this.checkAddRange(changes, addStartMsgIdx, index);
                    const updateChange = change as SymbolsDataMessage.UpdateChange;
                    this.updateRecord(updateChange);
                    break;
                case AurcChangeTypeId.Add:
                    if (addStartMsgIdx < 0) {
                        addStartMsgIdx = index;
                    }
                    break;
                default:
                    throw new UnreachableCaseError('SDIPC10910910933', change.typeId);
            }
        }

        this.checkAddRange(changes, addStartMsgIdx, changes.length);
    }
}

export namespace SymbolsDataItem {
    export type Record = LitIvemFullDetail;

    export type ListChangeEventHandler = (this: void, listChangeType: UsableListChangeTypeId, index: Integer, count: Integer) => void;
    export type RecordChangeEventHandler = (this: void, index: Integer) => void;
}
