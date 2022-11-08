/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Badness, Feed,
    FeedTableRecordDefinitionList,
    Integer, KeyedCorrectnessRecordList, MultiEvent,
    TableRecordDefinitionList,
    TablesService
} from '@motifmarkets/motif-core';
import { ContentFrame } from '../content-frame';
import { GridFrame } from '../table/grid-frame';

export class FeedsFrame extends ContentFrame {
    private _tableFrame: GridFrame;
    private _recordList: KeyedCorrectnessRecordList<Feed>;
    private _recordListBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _componentAccess: FeedsFrame.ComponentAccess, private readonly _tablesService: TablesService) {
        super();
    }

    initialise(tableFrame: GridFrame) {
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
        return this._tablesService.definitionFactory.createBrokerageAccount();
    }

    private handleTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
        this.checkUnsubscribeRecordListBadnessChangeEvent();
        const feedRecordDefinitionList = recordDefinitionList as FeedTableRecordDefinitionList;
        this._recordList = feedRecordDefinitionList.recordList;
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
        const tableDefinition = this._tablesService.definitionFactory.createFeed();
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
