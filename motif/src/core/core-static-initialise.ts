/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BalancesTableFieldDefinitionSource } from './balances-table-field-definition-source';
import { BrokerageAccountTableFieldDefinitionSource } from './brokerage-account-table-field-definition-source';
import { CallPutModule } from './call-put';
import { CallPutTableFieldDefinitionSource } from './call-put-table-field-definition-source';
import { ChartHistoryIntervalModule } from './chart-history-interval';
import { ColorSchemeModule } from './color-scheme';
import { ColorSchemePreset } from './color-scheme-preset';
import { InternalCommandModule } from './command/internal-api';
import { FeedTableFieldDefinitionSource } from './feed-table-field-definition-source';
import { HistorySequencerModule } from './history-sequencer';
import { HoldingTableFieldDefinitionSource } from './holding-table-field-definition-source';
import { IntervalHistorySequencerModule } from './interval-history-sequencer';
import { LitIvemAlternateCodesTableFieldDefinitionSource } from './lit-ivem-alternate-codes-table-field-definition-source';
import { LitIvemBaseDetailTableFieldDefinitionSource } from './lit-ivem-base-detail-table-field-definition-source';
import { LitIvemExtendedDetailTableFieldDefinitionSource } from './lit-ivem-extended-detail-table-field-definition-source';
import { LitIvemIdPriceVolumeSequenceHistoryModule } from './lit-ivem-id-price-volume-sequence-history';
import { MotifServicesServiceModule } from './motif-services-service';
import { MyxLitIvemAttributesTableFieldDefinitionSource } from './myx-lit-ivem-attributes-table-field-definition-source';
import { OrderPadModule } from './order-pad';
import { OrderTableFieldDefinitionSource } from './order-table-field-definition-source';
import { SecurityDataItemTableFieldDefinitionSource } from './security-data-item-table-field-definition-source';
import { MasterSettingsModule } from './settings/master-settings';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinitionListModule } from './table-record-definition-list';
import { TopShareholderTableFieldDefinitionSource } from './top-shareholder-table-field-definition-source';

export namespace CoreStaticInitialise {
    export function initialise() {
        MasterSettingsModule.initialiseStatic();
        ColorSchemeModule.initialiseStatic();
        ColorSchemePreset.initialiseStatic();
        CallPutModule.initialiseStatic();
        FeedTableFieldDefinitionSource.initialiseStatic();
        LitIvemBaseDetailTableFieldDefinitionSource.initialiseStatic();
        LitIvemExtendedDetailTableFieldDefinitionSource.initialiseStatic();
        MyxLitIvemAttributesTableFieldDefinitionSource.initialiseStatic();
        LitIvemAlternateCodesTableFieldDefinitionSource.initialiseStatic();
        SecurityDataItemTableFieldDefinitionSource.initialiseStatic();
        BrokerageAccountTableFieldDefinitionSource.initialiseStatic();
        OrderTableFieldDefinitionSource.initialiseStatic();
        HoldingTableFieldDefinitionSource.initialiseStatic();
        BalancesTableFieldDefinitionSource.initialiseStatic();
        TopShareholderTableFieldDefinitionSource.initialiseStatic();
        CallPutTableFieldDefinitionSource.initialiseStatic();
        TableFieldList.initialiseStatic();
        TableRecordDefinitionListModule.initialiseStatic();
        ChartHistoryIntervalModule.initialiseStatic();
        MotifServicesServiceModule.initialiseStatic();
        HistorySequencerModule.initialiseStatic();
        IntervalHistorySequencerModule.initialiseStatic();
        LitIvemIdPriceVolumeSequenceHistoryModule.initialiseStatic();
        OrderPadModule.initialiseStatic();
        InternalCommandModule.initialiseStatic();
    }
}
