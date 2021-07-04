/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, LitIvemAlternateCodes, LitIvemDetail, LitIvemFullDetail, MyxLitIvemAttributes } from 'src/adi/internal-api';
import { AssertInternalError, Guid, Logger } from 'src/sys/internal-api';
import { LitIvemAlternateCodesTableFieldDefinitionSource } from './lit-ivem-alternate-codes-table-field-definition-source';
import { LitIvemAlternateCodesTableValueSource } from './lit-ivem-alternate-codes-table-value-source';
import { LitIvemBaseDetailTableFieldDefinitionSource } from './lit-ivem-base-detail-table-field-definition-source';
import { LitIvemBaseDetailTableValueSource } from './lit-ivem-base-detail-table-value-source';
import { LitIvemExtendedDetailTableFieldDefinitionSource } from './lit-ivem-extended-detail-table-field-definition-source';
import { LitIvemExtendedDetailTableValueSource } from './lit-ivem-extended-detail-table-value-source';
import { MyxLitIvemAttributesTableFieldDefinitionSource } from './myx-lit-ivem-attributes-table-field-definition-source';
import { MyxLitIvemAttributesTableValueSource } from './myx-lit-ivem-attributes-table-value-source';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { SymbolsDataItemTableRecordDefinitionList } from './symbols-data-item-table-record-definition-list';
import { TableFieldList } from './table-field-list';
import { LitIvemDetailTableRecordDefinition, TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';
import { TableValueList } from './table-value-list';

export class SymbolsDataItemTableDefinition extends SingleDataItemTableDefinition {

    private _symbolsDataItemTableRecordDefinitionList: SymbolsDataItemTableRecordDefinitionList;
    private _exchangeId: ExchangeId | undefined;
    private _isFullDetail: boolean;

    constructor(listOrId: SymbolsDataItemTableRecordDefinitionList | Guid) {
        super(listOrId);
    }

    override lockRecordDefinitionList(locker: TableRecordDefinitionList.ILocker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof SymbolsDataItemTableRecordDefinitionList)) {
            throw new AssertInternalError('SDITDL99577482779');
        } else {
            this._symbolsDataItemTableRecordDefinitionList = list;
            this._exchangeId = list.exchangeId;
            this._isFullDetail = list.isFullDetail;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition) {
        const result = new TableValueList();
        const litIvemDetailTableRecordDefinition = tableRecordDefinition as LitIvemDetailTableRecordDefinition;
        const litIvemDetail = litIvemDetailTableRecordDefinition.litIvemDetail;

        const dataItem = this._symbolsDataItemTableRecordDefinitionList.dataItem;

        const baseSource = new LitIvemBaseDetailTableValueSource(result.fieldCount, litIvemDetail, dataItem);
        result.addSource(baseSource);

        if (this._isFullDetail) {
            const litIvemFullDetail = litIvemDetail as LitIvemFullDetail;
            const extendedSource = new LitIvemExtendedDetailTableValueSource(result.fieldCount, litIvemFullDetail, dataItem);
            result.addSource(extendedSource);
            switch (this._exchangeId) {
                case ExchangeId.Myx:
                    const attributesSource = new MyxLitIvemAttributesTableValueSource(result.fieldCount, litIvemFullDetail, dataItem);
                    result.addSource(attributesSource);
                    break;
            }
            const altCodesSource = new LitIvemAlternateCodesTableValueSource(result.fieldCount, litIvemFullDetail, dataItem);
            result.addSource(altCodesSource);
        }
        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        this.addLitIvemBaseDetailFieldDefinitionSource();

        if (this._isFullDetail) {
            this.addLitIvemExtendedDetailFieldDefinitionSource();
            switch (this._exchangeId) {
                case ExchangeId.Myx:
                    this.addMyxLitIvemAttributesFieldDefinitionSource();
                    break;
            }
            this.addLitIvemAlternateCodesFieldDefinitionSource();
        }

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addLitIvemBaseDetailFieldDefinitionSource() {
        const definitionSource = new LitIvemBaseDetailTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(definitionSource);

        this.addLitIvemBaseDetailFieldToDefaultLayout(definitionSource, LitIvemDetail.BaseField.Id.Id);
        this.addLitIvemBaseDetailFieldToDefaultLayout(definitionSource, LitIvemDetail.BaseField.Id.Name);
        this.addLitIvemBaseDetailFieldToDefaultLayout(definitionSource, LitIvemDetail.BaseField.Id.Code);
        this.addLitIvemBaseDetailFieldToDefaultLayout(definitionSource, LitIvemDetail.BaseField.Id.MarketId);
        this.addLitIvemBaseDetailFieldToDefaultLayout(definitionSource, LitIvemDetail.BaseField.Id.ExchangeId);
        this.addLitIvemBaseDetailFieldToDefaultLayout(definitionSource, LitIvemDetail.BaseField.Id.TradingMarketIds);
    }

    private addLitIvemBaseDetailFieldToDefaultLayout(fieldDefinitionSource: LitIvemBaseDetailTableFieldDefinitionSource,
        fieldId: LitIvemDetail.BaseField.Id, visible: boolean = true) {
        if (!fieldDefinitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`SymbolsDataItemTableDefinition.LitIvemDetail layout: unsupported Field: ${fieldId}`);
        } else {
            const fieldName = fieldDefinitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }

    private addLitIvemExtendedDetailFieldDefinitionSource() {
        const definitionSource = new LitIvemExtendedDetailTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(definitionSource);

        this.addLitIvemExtendedDetailFieldToDefaultLayout(definitionSource, LitIvemFullDetail.ExtendedField.Id.IsIndex);
        this.addLitIvemExtendedDetailFieldToDefaultLayout(definitionSource, LitIvemFullDetail.ExtendedField.Id.Categories);
        this.addLitIvemExtendedDetailFieldToDefaultLayout(definitionSource, LitIvemFullDetail.ExtendedField.Id.CallOrPutId);
        this.addLitIvemExtendedDetailFieldToDefaultLayout(definitionSource, LitIvemFullDetail.ExtendedField.Id.ExerciseTypeId);
        this.addLitIvemExtendedDetailFieldToDefaultLayout(definitionSource, LitIvemFullDetail.ExtendedField.Id.StrikePrice);
        this.addLitIvemExtendedDetailFieldToDefaultLayout(definitionSource, LitIvemFullDetail.ExtendedField.Id.ExpiryDate);
        this.addLitIvemExtendedDetailFieldToDefaultLayout(definitionSource, LitIvemFullDetail.ExtendedField.Id.ContractSize);
        // this.addLitIvemExtendedDetailFieldToDefaultLayout(definitionSource, LitIvemFullDetail.ExtendedField.Id.DepthDirectionId);
    }

    private addLitIvemExtendedDetailFieldToDefaultLayout(fieldDefinitionSource: LitIvemExtendedDetailTableFieldDefinitionSource,
        fieldId: LitIvemFullDetail.ExtendedField.Id, visible: boolean = true) {
        if (!fieldDefinitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`SymbolsDataItemTableDefinition.LitIvemFullDetail layout: unsupported Field: ${fieldId}`);
        } else {
            const fieldName = fieldDefinitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }

    private addMyxLitIvemAttributesFieldDefinitionSource() {
        const definitionSource = new MyxLitIvemAttributesTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(definitionSource);

        this.addMyxLitIvemAttributesFieldToDefaultLayout(definitionSource, MyxLitIvemAttributes.Field.Id.MarketClassification);
        this.addMyxLitIvemAttributesFieldToDefaultLayout(definitionSource, MyxLitIvemAttributes.Field.Id.Category);
        this.addMyxLitIvemAttributesFieldToDefaultLayout(definitionSource, MyxLitIvemAttributes.Field.Id.Sector);
        this.addMyxLitIvemAttributesFieldToDefaultLayout(definitionSource, MyxLitIvemAttributes.Field.Id.SubSector);
        // this.addMyxLitIvemAttributesFieldToDefaultLayout(definitionSource, MyxLitIvemAttributes.Field.Id.MaxRSS);
        // this.addMyxLitIvemAttributesFieldToDefaultLayout(definitionSource, MyxLitIvemAttributes.Field.Id.DeliveryBasis);
        // this.addMyxLitIvemAttributesFieldToDefaultLayout(definitionSource, MyxLitIvemAttributes.Field.Id.Short);
        // this.addMyxLitIvemAttributesFieldToDefaultLayout(definitionSource, MyxLitIvemAttributes.Field.Id.ShortSuspended);
    }

    private addMyxLitIvemAttributesFieldToDefaultLayout(fieldDefinitionSource: MyxLitIvemAttributesTableFieldDefinitionSource,
        fieldId: MyxLitIvemAttributes.Field.Id, visible: boolean = true) {
        if (!fieldDefinitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`SymbolsDataItemTableDefinition.MyxLitIvemAttributes layout: unsupported Field: ${fieldId}`);
        } else {
            const fieldName = fieldDefinitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }

    private addLitIvemAlternateCodesFieldDefinitionSource() {
        const definitionSource = new LitIvemAlternateCodesTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(definitionSource);

        this.addLitIvemAlternateCodesFieldToDefaultLayout(definitionSource, LitIvemAlternateCodes.Field.Id.Ticker);
        this.addLitIvemAlternateCodesFieldToDefaultLayout(definitionSource, LitIvemAlternateCodes.Field.Id.Isin);
        this.addLitIvemAlternateCodesFieldToDefaultLayout(definitionSource, LitIvemAlternateCodes.Field.Id.Gics);
    }

    private addLitIvemAlternateCodesFieldToDefaultLayout(fieldDefinitionSource: LitIvemAlternateCodesTableFieldDefinitionSource,
        fieldId: LitIvemAlternateCodes.Field.Id, visible: boolean = true) {
        if (!fieldDefinitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`SymbolsDataItemTableDefinition.LitIvemAlternateCodes layout: unsupported Field: ${fieldId}`);
        } else {
            const fieldName = fieldDefinitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}
