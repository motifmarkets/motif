/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, DataRecordList, Feed, FeedsDataDefinition, FeedsDataItem } from 'src/adi/internal-api';
import { DataRecordTableRecordDefinitionList } from './data-record-table-record-definition-list';
import { FeedTableRecordDefinition } from './feed-table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';

export class FeedTableRecordDefinitionList extends DataRecordTableRecordDefinitionList<Feed> {
    private static _constructCount = 0;

    constructor(private _adi: AdiService) {
        super(TableRecordDefinitionList.TypeId.Feed);
        this.setName(FeedTableRecordDefinitionList.createName());
        this._changeDefinitionOrderAllowed = true;
    }

    private static createName() {
        const constructCountAsStr = (++FeedTableRecordDefinitionList._constructCount).toString(10);
        return FeedTableRecordDefinitionList.baseName + constructCountAsStr;
    }

    protected subscribeList() {
        const definition = new FeedsDataDefinition();
        const dataItem = this._adi.subscribe(definition) as FeedsDataItem;
        super.setSingleDataItem(dataItem);
        return dataItem;
    }

    protected unsubscribeList(list: DataRecordList<Feed>) {
        this._adi.unsubscribe(this.singleDataItem);
    }

    protected createTableRecordDefinition(record: Feed) {
        return new FeedTableRecordDefinition(record);
    }
}

export namespace FeedTableRecordDefinitionList {
    export const baseName = 'Feed';
}
