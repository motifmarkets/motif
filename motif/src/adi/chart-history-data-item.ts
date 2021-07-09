/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, AssertInternalError, defined, Integer, SourceTzOffsetDateTime } from 'src/sys/internal-api';
import {
    ChartHistoryDataMessage,
    ChartIntervalId,
    DataDefinition,
    DataMessage,
    DataMessageTypeId,
    LitIvemId,
    QueryChartHistoryDataDefinition
} from './common/internal-api';
import { PublisherSubscriptionDataItem } from './publisher-subscription-data-item';

export class ChartHistoryDataItem extends PublisherSubscriptionDataItem {

    private _litIvemId: LitIvemId;
    private _intervalId: ChartIntervalId;
    private _requestCount: Integer | undefined;
    private _fromDate: Date | undefined;
    private _toDate: Date | undefined;

    private _records: ChartHistoryDataItem.Record[] = [];

    get litIvemId() { return this._litIvemId; }
    get intervalId() { return this._intervalId; }
    get requestCount() { return this._requestCount; }
    get fromDate() { return this._fromDate; }
    get toDate() { return this._toDate; }

    get records() { return this._records; }
    public get count() { return this._records.length; }

    constructor(definition: DataDefinition) {
        super(definition);

        if (!(definition instanceof QueryChartHistoryDataDefinition)) {
            throw new AssertInternalError('CHDIC699389434', definition.description);
        } else {
            this._litIvemId = definition.litIvemId;
            this._requestCount = definition.count;
            this._intervalId = definition.intervalId;
            this._fromDate = definition.fromDate;
            this._toDate = definition.toDate;
        }
    }

    override processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.ChartHistory) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                this.advisePublisherResponseUpdateReceived();
                this.notifyUpdateChange();
                assert(msg instanceof ChartHistoryDataMessage, 'ID:7613102851');
                this.processChartHistoryDataMessage(msg as ChartHistoryDataMessage);
            } finally {
                this.endUpdate();
            }
        }
    }

    protected override processSubscriptionPreOnline() {
        if (this._records.length > 0) {
            this.beginUpdate();
            try {
                this.notifyUpdateChange();
                this._records.length = 0;
            } finally {
                this.endUpdate();
            }
        }
    }

    private isSortOrderOk(): boolean {
        if (this._records.length === 0) {
            return true;
        } else {
            let dateTime = this._records[0].dateTime;
            for (const record of this._records) {
                if (record.dateTime < dateTime) {
                    console.error('Out of order', record.dateTime);
                    return false;
                } else {
                    dateTime = record.dateTime;
                }
            }
            return true;
        }
    }


    private isTradingValuesDefined(record: ChartHistoryDataMessage.Record): boolean {
        if (!defined(record.open)) { return false; }
        if (!defined(record.high)) { return false; }
        if (!defined(record.low)) { return false; }
        if (!defined(record.close)) { return false; }
        if (!defined(record.volume)) { return false; }
        return true;
    }

    private createRecord(msgRecord: ChartHistoryDataMessage.Record) {
        if (msgRecord.close === undefined) {
            return undefined;
        } else {
            const close = msgRecord.close;

            const open = msgRecord.open !== undefined ? msgRecord.open : close;
            const high = msgRecord.high ? msgRecord.high : close;
            const low = msgRecord.low ? msgRecord.low : close;
            const volume = msgRecord.volume ? msgRecord.volume : 0;

            const record: ChartHistoryDataItem.Record = {
                dateTime: msgRecord.dateTime,
                open,
                high,
                low,
                close: msgRecord.close,
                volume,
                trades: msgRecord.trades,
            };

            return record;
        }
    }

    private processChartHistoryDataMessage(msg: ChartHistoryDataMessage) {
        const msgRecords = msg.records;
        if (this._records.length !== 0) {
            throw new AssertInternalError('CHDIPCHDM6583333958', this._records.length.toString(10));
        } else {
            const count = msgRecords.length;
            this._records.length = count;
            let idx = 0;
            for (let i = count - 1; i >= 0; i--) {
                const msgRecord = msgRecords[i];
                const record = this.createRecord(msgRecord);
                if (record !== undefined) {
                    this._records[idx++] = record;
                }
            }

            this._records.length = idx;
        }
    }
}


export namespace ChartHistoryDataItem {
    export interface Record {
        dateTime: SourceTzOffsetDateTime;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: Integer;
        trades: Integer | undefined;
    }
}
