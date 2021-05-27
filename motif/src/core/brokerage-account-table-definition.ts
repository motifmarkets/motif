/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, Feed } from 'src/adi/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { AssertInternalError, Logger } from 'src/sys/internal-api';
import { BrokerageAccountTableFieldDefinitionSource } from './brokerage-account-table-field-definition-source';
import { BrokerageAccountTableRecordDefinition } from './brokerage-account-table-record-definition';
import { BrokerageAccountTableRecordDefinitionList } from './brokerage-account-table-record-definition-list';
import { BrokerageAccountTableValueSource } from './brokerage-account-table-value-source';
import { FeedTableFieldDefinitionSource } from './feed-table-field-definition-source';
import { FeedTableValueSource } from './feed-table-value-source';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';
import { TableValueList } from './table-value-list';

export class BrokerageAccountTableDefinition extends SingleDataItemTableDefinition {

    private _brokerageAccountTableRecordDefinitionList: BrokerageAccountTableRecordDefinitionList;

    lockRecordDefinitionList(locker: TableRecordDefinitionList.ILocker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof BrokerageAccountTableRecordDefinitionList)) {
            throw new AssertInternalError('BATDLRDL87875340', list.name);
        } else {
            this._brokerageAccountTableRecordDefinitionList = list;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList {
        const result = new TableValueList();
        const brokerageAccountTableRecordDefinition = tableRecordDefinition as BrokerageAccountTableRecordDefinition;
        let account = brokerageAccountTableRecordDefinition.record;

        if (account === undefined) {
            const mapKey = brokerageAccountTableRecordDefinition.mapKey;
            account = this._brokerageAccountTableRecordDefinitionList.dataRecordList.getRecordByMapKey(mapKey);
        }

        if (account === undefined) {
            account = Account.createNotFoundAccount(brokerageAccountTableRecordDefinition.key as Account.Key);
        }

        const accountSource = new BrokerageAccountTableValueSource(result.fieldCount, account);
        result.addSource(accountSource);

        const feedSource = new FeedTableValueSource(result.fieldCount, account.tradingFeed);
        result.addSource(feedSource);
        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const brokerageAccountsDefinitionSource =
            new BrokerageAccountTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(brokerageAccountsDefinitionSource);

        const feedsDefinitionSource =
            new FeedTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(feedsDefinitionSource, Strings[StringId.FeedHeadingPrefix]);

        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.Id);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.Name);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.CurrencyId);
        this.addFeedFieldToDefaultLayout(feedsDefinitionSource, Feed.FieldId.StatusId);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addBrokerageAccountFieldToDefaultLayout(definitionSource: BrokerageAccountTableFieldDefinitionSource,
        fieldId: Account.FieldId, visible: boolean = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`BrokerageAccount layout: unsupported Field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
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
