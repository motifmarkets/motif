/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataRecordList, Feed } from 'src/adi/internal-api';
import { FeedTableRecordDefinitionList, tableDefinitionFactory, TableRecordDefinitionList } from 'src/core/internal-api';
import { Badness, Integer, MultiEvent } from 'src/sys/internal-api';
import { ContentFrame } from '../content-frame';
import { TableFrame } from '../table/table-frame';

export class FeedsFrame extends ContentFrame {
    private _tableFrame: TableFrame;
    private _recordList: DataRecordList<Feed>;
    private _recordListBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _componentAccess: FeedsFrame.ComponentAccess) {
        super();
    }

    initialise(tableFrame: TableFrame) {
        this._tableFrame = tableFrame;
        this._tableFrame.recordFocusEvent = (newRecordIndex) => this.handleRecordFocusEvent(newRecordIndex);
        this._tableFrame.requireDefaultTableDefinitionEvent = () => this.handleRequireDefaultTableDefinitionEvent();
        this._tableFrame.tableOpenEvent = (recordDefinitionList) => this.handleTableOpenEvent(recordDefinitionList);

        this.newTable(false);
    }

    override finalise() {
        this.checkUnsubscribeRecordListBadnessChangeEvent();
        super.finalise();
    }

    private handleRecordListBadnessChangeEvent() {
        const badness = this._recordList.badness;
        this._componentAccess.setBadness(badness);
    }

    private handleRecordFocusEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const feed = this._recordList.records[newRecordIndex];
            this.processFeedFocusChange(feed);
        }
    }

    private handleRequireDefaultTableDefinitionEvent() {
        return tableDefinitionFactory.createBrokerageAccount();
    }

    private handleTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
        this.checkUnsubscribeRecordListBadnessChangeEvent();
        const feedRecordDefinitionList = recordDefinitionList as FeedTableRecordDefinitionList;
        this._recordList = feedRecordDefinitionList.dataRecordList;
        this._recordListBadnessChangeSubscriptionId = this._recordList.subscribeBadnessChangeEvent(
            () => this.handleRecordListBadnessChangeEvent
        );
    }

    private checkUnsubscribeRecordListBadnessChangeEvent() {
        if (this._recordListBadnessChangeSubscriptionId !== undefined) {
            this._recordList.unsubscribeBadnessChangeEvent(this._recordListBadnessChangeSubscriptionId);
            this._recordListBadnessChangeSubscriptionId = undefined;
        }
    }

    private processFeedFocusChange(newFocusedFeed: Feed) {
        // not yet used
    }

    private newTable(keepCurrentLayout: boolean) {
        this.checkUnsubscribeRecordListBadnessChangeEvent();
        const tableDefinition = tableDefinitionFactory.createFeed();
        this._tableFrame.newPrivateTable(tableDefinition, keepCurrentLayout);
        this._componentAccess.hideBadnessWithVisibleDelay(Badness.notBad);
    }
}

export namespace FeedsFrame {
    export interface ComponentAccess {
        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }
}
