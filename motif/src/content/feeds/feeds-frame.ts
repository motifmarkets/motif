/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Badness,
    Feed,
    FeedTableRecordSource,
    GridSourceDefinition,
    GridSourceOrNamedReferenceDefinition,
    Integer,
    KeyedCorrectnessList,
    LockOpenListItem,
    MultiEvent, TableRecordSourceDefinitionFactoryService
} from '@motifmarkets/motif-core';
import { ContentFrame } from '../content-frame';
import { GridSourceFrame } from '../grid-source/internal-api';

export class FeedsFrame extends ContentFrame {
    private _gridSourceFrame: GridSourceFrame;
    private _recordSource: FeedTableRecordSource;
    private _recordList: KeyedCorrectnessList<Feed>;
    private _recordListBadnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private _componentAccess: FeedsFrame.ComponentAccess,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        private readonly _opener: LockOpenListItem.Opener,
    ) {
        super();
    }

    initialise(gridSourceFrame: GridSourceFrame) {
        this._gridSourceFrame = gridSourceFrame;
        this._gridSourceFrame.opener = this._opener;
        this._gridSourceFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex);

        const gridSourceOrNamedReferenceDefinition = this.createDefaultGridSourceOrNamedReferenceDefinition();
        this.tryOpenGridSource(gridSourceOrNamedReferenceDefinition);
    }

    override finalise() {
        this.checkUnsubscribeRecordListBadnessChangeEvent();
        super.finalise();
    }

    private handleRecordListBadnessChangeEvent() {
        const badness = this._recordList.badness;
        this._componentAccess.setBadness(badness);
    }

    private handleRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const feed = this._recordList.records[newRecordIndex];
            this.processFeedFocusChange(feed);
        }
    }

    private checkUnsubscribeRecordListBadnessChangeEvent() {
        if (this._recordListBadnessChangeSubscriptionId !== undefined) {
            this._recordList.unsubscribeBadnessChangeEvent(this._recordListBadnessChangeSubscriptionId);
            this._recordListBadnessChangeSubscriptionId = undefined;
        }
    }

    private createGridSourceOrNamedReferenceDefinition() {
        const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createFeed();
        const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
        return new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
    }

    private createDefaultGridSourceOrNamedReferenceDefinition() {
        return this.createGridSourceOrNamedReferenceDefinition();
    }

    private tryOpenGridSource(definition: GridSourceOrNamedReferenceDefinition) {
        this.checkUnsubscribeRecordListBadnessChangeEvent();
        const gridSourceOrNamedReference = this._gridSourceFrame.tryOpenGridSource(definition, false);
        if (gridSourceOrNamedReference !== undefined) {
            const table = this._gridSourceFrame.openedTable;
            this._recordSource = table.recordSource as FeedTableRecordSource;
            this._recordList = this._recordSource.recordList;
            this._recordListBadnessChangeSubscriptionId = this._recordList.subscribeBadnessChangeEvent(
                () => this.handleRecordListBadnessChangeEvent()
            );
        }
        this._componentAccess.hideBadnessWithVisibleDelay(Badness.notBad);
    }

    private processFeedFocusChange(newFocusedFeed: Feed) {
        // not yet used
    }
}

export namespace FeedsFrame {
    export interface ComponentAccess {
        setBadness(value: Badness): void;
        hideBadnessWithVisibleDelay(badness: Badness): void;
    }
}
