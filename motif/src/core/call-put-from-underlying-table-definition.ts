/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, CallOrPutId, SecurityDataItem } from 'src/adi/internal-api';
import { AssertInternalError, Guid, Logger } from 'src/sys/internal-api';
import { CallPut } from './call-put';
import { CallPutFromUnderlyingTableRecordDefinitionList } from './call-put-from-underlying-table-record-definition-list';
import { CallPutSecurityDataItemTableFieldDefinitionSource } from './call-put-security-data-item-table-field-definition-source';
import { CallPutTableFieldDefinitionSource } from './call-put-table-field-definition-source';
import { CallPutTableValueSource } from './call-put-table-value-source';
import { SecurityDataItemTableValueSource } from './security-data-item-table-value-source';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { CallPutTableRecordDefinition, TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';
import { TableValueList } from './table-value-list';
import { UndefinedTableValueSource } from './undefined-table-value-source';

export class CallPutFromUnderlyingTableDefinition extends SingleDataItemTableDefinition {

    constructor(private _adi: AdiService, listOrId: CallPutFromUnderlyingTableRecordDefinitionList | Guid) {
        super(listOrId);
    }

    override lockRecordDefinitionList(locker: TableRecordDefinitionList.ILocker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof CallPutFromUnderlyingTableRecordDefinitionList)) {
            throw new AssertInternalError('BATDLRDL87875340', list.name);
        } else {
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList {
        const result = new TableValueList();
        const callPutTableRecordDefinition = tableRecordDefinition as CallPutTableRecordDefinition;
        const callPut = callPutTableRecordDefinition.callPut;

        const callPutSource = new CallPutTableValueSource(result.fieldCount, callPut);
        result.addSource(callPutSource);
        const callLitIvemId = callPut.callLitIvemId;
        if (callLitIvemId !== undefined) {
            const callLitIvemIdSource = new SecurityDataItemTableValueSource(result.fieldCount, callLitIvemId, this._adi);
            result.addSource(callLitIvemIdSource);
        } else {
            const undefinedValueArray = this.fieldList.createSourceUndefinedTableGridValueArray(1);
            const placeholderSource = new UndefinedTableValueSource(result.fieldCount, undefinedValueArray);
            result.addSource(placeholderSource);
        }

        const putLitIvemId = callPut.putLitIvemId;
        if (putLitIvemId !== undefined) {
            const putLitIvemIdSource = new SecurityDataItemTableValueSource(result.fieldCount, putLitIvemId, this._adi);
            result.addSource(putLitIvemIdSource);
        } else {
            const undefinedValueArray = this.fieldList.createSourceUndefinedTableGridValueArray(2);
            const placeholderSource = new UndefinedTableValueSource(result.fieldCount, undefinedValueArray);
            result.addSource(placeholderSource);
        }

        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const callPutDefinitionSource = new CallPutTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(callPutDefinitionSource);
        const callLitIvemDefinitionSource = new CallPutSecurityDataItemTableFieldDefinitionSource(TableFieldList.customHeadings,
            CallOrPutId.Call);
        this.fieldList.addSourceFromDefinition(callLitIvemDefinitionSource);
        const putLitIvemDefinition = new CallPutSecurityDataItemTableFieldDefinitionSource(TableFieldList.customHeadings,
            CallOrPutId.Put);
        this.fieldList.addSourceFromDefinition(putLitIvemDefinition);

        this.addSecurityFieldToDefaultLayout(callLitIvemDefinitionSource, SecurityDataItem.FieldId.BestBid);
        this.addSecurityFieldToDefaultLayout(callLitIvemDefinitionSource, SecurityDataItem.FieldId.BestAsk);
        this.addSecurityFieldToDefaultLayout(callLitIvemDefinitionSource, SecurityDataItem.FieldId.Last);
        this.addSecurityFieldToDefaultLayout(callLitIvemDefinitionSource, SecurityDataItem.FieldId.Open);
        this.addSecurityFieldToDefaultLayout(callLitIvemDefinitionSource, SecurityDataItem.FieldId.High);
        this.addSecurityFieldToDefaultLayout(callLitIvemDefinitionSource, SecurityDataItem.FieldId.Low);
        this.addSecurityFieldToDefaultLayout(callLitIvemDefinitionSource, SecurityDataItem.FieldId.Close);
        this.addSecurityFieldToDefaultLayout(callLitIvemDefinitionSource, SecurityDataItem.FieldId.Volume);

        this.addCallPutFieldToDefaultLayout(callPutDefinitionSource, CallPut.FieldId.ExercisePrice);
        this.addCallPutFieldToDefaultLayout(callPutDefinitionSource, CallPut.FieldId.ExpiryDate);
        this.addCallPutFieldToDefaultLayout(callPutDefinitionSource, CallPut.FieldId.LitId);
        this.addCallPutFieldToDefaultLayout(callPutDefinitionSource, CallPut.FieldId.CallLitIvemId);
        this.addCallPutFieldToDefaultLayout(callPutDefinitionSource, CallPut.FieldId.PutLitIvemId);

        this.addSecurityFieldToDefaultLayout(putLitIvemDefinition, SecurityDataItem.FieldId.BestBid);
        this.addSecurityFieldToDefaultLayout(putLitIvemDefinition, SecurityDataItem.FieldId.BestAsk);
        this.addSecurityFieldToDefaultLayout(putLitIvemDefinition, SecurityDataItem.FieldId.Last);
        this.addSecurityFieldToDefaultLayout(putLitIvemDefinition, SecurityDataItem.FieldId.Open);
        this.addSecurityFieldToDefaultLayout(putLitIvemDefinition, SecurityDataItem.FieldId.High);
        this.addSecurityFieldToDefaultLayout(putLitIvemDefinition, SecurityDataItem.FieldId.Low);
        this.addSecurityFieldToDefaultLayout(putLitIvemDefinition, SecurityDataItem.FieldId.Close);
        this.addSecurityFieldToDefaultLayout(putLitIvemDefinition, SecurityDataItem.FieldId.Volume);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addCallPutFieldToDefaultLayout(definitionSource: CallPutTableFieldDefinitionSource,
        fieldId: CallPut.FieldId, visible: boolean = true): void {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`CallPut standard layout: unsupported CallPUt field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }

    private addSecurityFieldToDefaultLayout(definitionSource: CallPutSecurityDataItemTableFieldDefinitionSource,
        fieldId: SecurityDataItem.FieldId, visible: boolean = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`CallPut standard layout: unsupported security field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}
