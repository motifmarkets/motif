/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    BalancesTableFieldSourceDefinition,
    BrokerageAccountTableFieldSourceDefinition,
    CallOrPutId,
    CallPutSecurityDataItemTableFieldSourceDefinition,
    CallPutTableFieldSourceDefinition,
    EditableGridLayoutDefinitionColumnTableFieldSourceDefinition,
    FeedTableFieldSourceDefinition,
    GridFieldTableFieldSourceDefinition,
    HoldingTableFieldSourceDefinition,
    LitIvemAlternateCodesTableFieldSourceDefinition,
    LitIvemBaseDetailTableFieldSourceDefinition,
    LitIvemExtendedDetailTableFieldSourceDefinition,
    LitIvemIdTableFieldSourceDefinition,
    MyxLitIvemAttributesTableFieldSourceDefinition,
    OrderTableFieldSourceDefinition,
    RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition,
    RankedLitIvemIdTableFieldSourceDefinition,
    ScanTableFieldSourceDefinition,
    SecurityDataItemTableFieldSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionFactory,
    TopShareholderTableFieldSourceDefinition,
    UnreachableCaseError,
} from '@motifmarkets/motif-core';
import { LockOpenNotificationChannelTableFieldSourceDefinition } from './internal-api';
import { LockerScanAttachedNotificationChannelTableFieldSourceDefinition, ScanFieldEditorFrameTableFieldSourceDefinition } from './scan/internal-api';

export class TableFieldSourceDefinitionFactoryService implements TableFieldSourceDefinitionFactory {
    create(typeId: TableFieldSourceDefinition.TypeId): TableFieldSourceDefinition {
        switch (typeId) {
            case TableFieldSourceDefinition.TypeId.Feed:
                return new FeedTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.LitIvemId:
                return new LitIvemIdTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.RankedLitIvemId:
                return new RankedLitIvemIdTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.LitIvemBaseDetail:
                return new LitIvemBaseDetailTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail:
                return new LitIvemExtendedDetailTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes:
                return new LitIvemAlternateCodesTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes:
                return new MyxLitIvemAttributesTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn:
                return new EditableGridLayoutDefinitionColumnTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.SecurityDataItem:
                return new SecurityDataItemTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.BrokerageAccount:
                return new BrokerageAccountTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.Order:
                return new OrderTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.Holding:
                return new HoldingTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.Balances:
                return new BalancesTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.CallPut:
                return new CallPutTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.CallSecurityDataItem:
                return new CallPutSecurityDataItemTableFieldSourceDefinition(CallOrPutId.Call);
            case TableFieldSourceDefinition.TypeId.PutSecurityDataItem:
                return new CallPutSecurityDataItemTableFieldSourceDefinition(CallOrPutId.Put);
            case TableFieldSourceDefinition.TypeId.TopShareholder:
                return new TopShareholderTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.Scan:
                return new ScanTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem:
                return new RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.GridField:
                return new GridFieldTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame:
                return new ScanFieldEditorFrameTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel:
                return new LockerScanAttachedNotificationChannelTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.LockOpenNotificationChannel:
                return new LockOpenNotificationChannelTableFieldSourceDefinition();

            default:
                throw new UnreachableCaseError('TFSDFSC25051', typeId);
        }
    }
}
