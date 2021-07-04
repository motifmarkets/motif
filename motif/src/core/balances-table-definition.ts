/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, Balances } from 'src/adi/internal-api';
import { AssertInternalError, Guid, Logger } from 'src/sys/internal-api';
import { BalancesTableFieldDefinitionSource } from './balances-table-field-definition-source';
import { BalancesTableRecordDefinition } from './balances-table-record-definition';
import { BalancesTableRecordDefinitionList } from './balances-table-record-definition-list';
import { BalancesTableValueSource } from './balances-table-value-source';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';
import { TableValueList } from './table-value-list';

export class BalancesTableDefinition extends SingleDataItemTableDefinition {

    private _balancesTableRecordDefinitionList: BalancesTableRecordDefinitionList;

    constructor(private _adi: AdiService, listOrId: BalancesTableRecordDefinitionList | Guid) {
        super(listOrId);
    }

    override lockRecordDefinitionList(locker: TableRecordDefinitionList.ILocker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof BalancesTableRecordDefinitionList)) {
            throw new AssertInternalError('ACBTDLRDL100119537');
        } else {
            this._balancesTableRecordDefinitionList = list;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList {
        const result = new TableValueList();
        const balancesTableRecordDefinition = tableRecordDefinition as BalancesTableRecordDefinition;
        let balances = balancesTableRecordDefinition.record;

        if (balances === undefined) {
            const mapKey = balancesTableRecordDefinition.mapKey;
            balances = this._balancesTableRecordDefinitionList.dataRecordList.getRecordByMapKey(mapKey);
        }

        if (balances === undefined) {
            balances = Balances.createNotFoundBalances(balancesTableRecordDefinition.key as Balances.Key);
        }

        const source = new BalancesTableValueSource(result.fieldCount, balances);
        result.addSource(source);
        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const definitionSource = new BalancesTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(definitionSource);

        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.AccountId);
        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.Currency);
        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.NetBalance);
        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.Trading);
        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.NonTrading);
        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.UnfilledBuys);
        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.Margin);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addBalancesFieldToDefaultLayout(definitionSource: BalancesTableFieldDefinitionSource,
        fieldId: Balances.FieldId, visible: boolean = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Balances standard layout: unsupported field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}
