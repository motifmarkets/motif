/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, Order } from 'src/adi/internal-api';
import { AssertInternalError, Guid, Logger } from 'src/sys/internal-api';
import { OrderTableFieldDefinitionSource } from './order-table-field-definition-source';
import { OrderTableRecordDefinition } from './order-table-record-definition';
import { OrderTableRecordDefinitionList } from './order-table-record-definition-list';
import { OrderTableValueSource } from './order-table-value-source';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';
import { TableValueList } from './table-value-list';

export class OrderTableDefinition extends SingleDataItemTableDefinition {

    private _orderTableRecordDefinitionList: OrderTableRecordDefinitionList;

    constructor(private _adi: AdiService, listOrId: OrderTableRecordDefinitionList | Guid) {
        super(listOrId);
    }

    override lockRecordDefinitionList(locker: TableRecordDefinitionList.ILocker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof OrderTableRecordDefinitionList)) {
            throw new AssertInternalError('OTDLRDL449388227');
        } else {
            this._orderTableRecordDefinitionList = list;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList {
        const result = new TableValueList();
        const orderTableRecordDefinition = tableRecordDefinition as OrderTableRecordDefinition;
        let order = orderTableRecordDefinition.record;

        if (order === undefined) {
            const mapKey = orderTableRecordDefinition.mapKey;
            order = this._orderTableRecordDefinitionList.dataRecordList.getRecordByMapKey(mapKey);
        }

        if (order === undefined) {
            order = Order.createNotFoundOrder(orderTableRecordDefinition.key as Order.Key);
        }

        const source = new OrderTableValueSource(result.fieldCount, order);
        result.addSource(source);
        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const ordersDefinitionSource = new OrderTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(ordersDefinitionSource);

        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.Id);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.UpdatedDate);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.Status);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.AccountId);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.Code);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.ExchangeId);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.SideId);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.LimitPrice);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.Quantity);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.ExecutedQuantity);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.StatusAllowIds);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.StatusReasonIds);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addOrderFieldToDefaultLayout(definitionSource: OrderTableFieldDefinitionSource,
        fieldId: Order.FieldId, visible: boolean = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Order standard layout: unsupported field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}
