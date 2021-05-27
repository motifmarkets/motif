/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Feed } from 'src/adi/internal-api';
import { AssertInternalError, Logger } from 'src/sys/internal-api';
import { FeedTableFieldDefinitionSource } from './feed-table-field-definition-source';
import { FeedTableRecordDefinition } from './feed-table-record-definition';
import { FeedTableRecordDefinitionList } from './feed-table-record-definition-list';
import { FeedTableValueSource } from './feed-table-value-source';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';
import { TableValueList } from './table-value-list';

export class FeedTableDefinition extends SingleDataItemTableDefinition {

    private _feedTableRecordDefinitionList: FeedTableRecordDefinitionList;

    lockRecordDefinitionList(locker: TableRecordDefinitionList.ILocker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof FeedTableRecordDefinitionList)) {
            throw new AssertInternalError('FTDLRDL87875340', list.name);
        } else {
            this._feedTableRecordDefinitionList = list;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList {
        const result = new TableValueList();
        const feedTableRecordDefinition = tableRecordDefinition as FeedTableRecordDefinition;
        let feed = feedTableRecordDefinition.record;

        if (feed === undefined) {
            const mapKey = feedTableRecordDefinition.mapKey;
            feed = this._feedTableRecordDefinitionList.dataRecordList.getRecordByMapKey(mapKey);
        }

        if (feed === undefined) {
            feed = Feed.createNotFoundFeed(feedTableRecordDefinition.key as Feed.Key);
        }

        const feedSource = new FeedTableValueSource(result.fieldCount, feed);
        result.addSource(feedSource);
        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const feedsDefinitionSource =
            new FeedTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(feedsDefinitionSource);

        this.addFeedFieldToDefaultLayout(feedsDefinitionSource, Feed.FieldId.Name);
        this.addFeedFieldToDefaultLayout(feedsDefinitionSource, Feed.FieldId.ClassId);
        this.addFeedFieldToDefaultLayout(feedsDefinitionSource, Feed.FieldId.StatusId);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addFeedFieldToDefaultLayout(definitionSource: FeedTableFieldDefinitionSource,
        fieldId: Feed.FieldId, visible: boolean = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Feed layout: unsupported Field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}
