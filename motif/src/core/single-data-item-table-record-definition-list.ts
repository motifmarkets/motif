/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataItem } from 'src/adi/internal-api';
import { RandomIdTableRecordDefinitionList } from './table-record-definition-list';

export abstract class SingleDataItemTableRecordDefinitionList extends RandomIdTableRecordDefinitionList {
    private _singleDataItem: DataItem;

    protected setSingleDataItem(value: DataItem) {
        this._singleDataItem = value;
    }

    get singleDataItem() { return this._singleDataItem; }
}
