/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, SecurityDataItem } from 'src/adi/internal-api';
import { Guid, Logger } from 'src/sys/internal-api';
import { PortfolioTableRecordDefinitionList } from './portfolio-table-record-definition-list';
import { SecurityDataItemTableFieldDefinitionSource } from './security-data-item-table-field-definition-source';
import { SecurityDataItemTableValueSource } from './security-data-item-table-value-source';
import { TableDefinition } from './table-definition';
import { TableFieldList } from './table-field-list';
import { LitIvemIdTableRecordDefinition, TableRecordDefinition } from './table-record-definition';
import { TableValueList } from './table-value-list';

export class PortfolioTableDefinition extends TableDefinition {
    constructor(private _adi: AdiService, listOrId: PortfolioTableRecordDefinitionList | Guid) {
        super(listOrId);
        this.prepareFieldListAndDefaultLayout();
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList {
        const result = new TableValueList();
        const litIvemIdTableRecordDefinition = tableRecordDefinition as LitIvemIdTableRecordDefinition;
        const litIvemId = litIvemIdTableRecordDefinition.litIvemId;

        const source = new SecurityDataItemTableValueSource(result.fieldCount, litIvemId, this._adi);
        result.addSource(source);
        return result;
    }

    protected activate() { }
    protected deactivate() { }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const litIvemIdSecurityDefinitionSource =
            new SecurityDataItemTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(litIvemIdSecurityDefinitionSource);

        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.LitIvemId);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.Name);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.Last);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.BestBid);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.BestAsk);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.Volume);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.AskCount);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.AskQuantity);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.AskUndisclosed);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.AuctionPrice);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.AuctionQuantity);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.AuctionRemainder);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.CallOrPut);
        // this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.Class);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.Cfi);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.Close);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.ContractSize);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.Exchange);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.ExpiryDate);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.High);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.IsIndex);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.Low);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.Market);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.NumberOfTrades);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.Open);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.OpenInterest);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.QuotationBasis);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.Settlement);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.ShareIssue);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.StatusNote);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.StrikePrice);
        // addSecurityFieldToDefaultLayout(litIvemIdSecuritySourceDefinition, SecurityDataItem.FieldId.SubscriptionData);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.TradingMarkets);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.TradingState);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.TradingStateAllows);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.TradingStateReason);
        // addSecurityFieldToDefaultLayout(litIvemIdSecuritySourceDefinition, SecurityDataItem.FieldId.Trend, false);
        this.addSecurityFieldToDefaultLayout(litIvemIdSecurityDefinitionSource, SecurityDataItem.FieldId.ValueTraded);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addSecurityFieldToDefaultLayout(definitionSource: SecurityDataItemTableFieldDefinitionSource,
        fieldId: SecurityDataItem.FieldId, visible: boolean = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Portfolio standard layout: unsupported Field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}
