/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, Holding } from 'src/adi/internal-api';
import { AssertInternalError, Guid, Logger } from 'src/sys/internal-api';
import { HoldingTableFieldDefinitionSource } from './holding-table-field-definition-source';
import { HoldingTableRecordDefinition } from './holding-table-record-definition';
import { HoldingTableRecordDefinitionList } from './holding-table-record-definition-list';
import { HoldingTableValueSource } from './holding-table-value-source';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';
import { TableValueList } from './table-value-list';

export class HoldingTableDefinition extends SingleDataItemTableDefinition {

    private _holdingTableRecordDefinitionList: HoldingTableRecordDefinitionList;

    constructor(private _adi: AdiService, listOrId: HoldingTableRecordDefinitionList | Guid) {
        super(listOrId);
    }

    lockRecordDefinitionList(locker: TableRecordDefinitionList.ILocker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof HoldingTableRecordDefinitionList)) {
            throw new AssertInternalError('HTDLRDL4339457277');
        } else {
            this._holdingTableRecordDefinitionList = list;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList {
        const result = new TableValueList();
        const holdingTableRecordDefinition = tableRecordDefinition as HoldingTableRecordDefinition;
        let holding = holdingTableRecordDefinition.record;

        if (holding === undefined) {
            const mapKey = holdingTableRecordDefinition.mapKey;
            holding = this._holdingTableRecordDefinitionList.dataRecordList.getRecordByMapKey(mapKey);
        }

        if (holding === undefined) {
            holding = Holding.createNotFoundHolding(holdingTableRecordDefinition.key as Holding.Key);
        }

        const source = new HoldingTableValueSource(result.fieldCount, holding);
        result.addSource(source);
        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const holdingsDefinitionSource = new HoldingTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(holdingsDefinitionSource);

        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.AccountId);
        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.ExchangeId);
        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.Code);
        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.TotalQuantity);
        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.TotalAvailableQuantity);
        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.AveragePrice);
        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.Cost);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addHoldingFieldToDefaultLayout(definitionSource: HoldingTableFieldDefinitionSource,
        fieldId: Holding.FieldId, visible: boolean = true): void {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Holding standard layout: unsupported field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}
