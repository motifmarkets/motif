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
    TopShareholderTableFieldSourceDefinition,
    TypedTableFieldSourceDefinition,
    TypedTableFieldSourceDefinitionFactory,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { LockOpenNotificationChannelTableFieldSourceDefinition } from './internal-api';
import { LockerScanAttachedNotificationChannelTableFieldSourceDefinition, ScanFieldEditorFrameTableFieldSourceDefinition } from './scan/internal-api';

export class TableFieldSourceDefinitionFactoryService implements TypedTableFieldSourceDefinitionFactory {
    create(typeId: TypedTableFieldSourceDefinition.TypeId): TypedTableFieldSourceDefinition {
        switch (typeId) {
            case TypedTableFieldSourceDefinition.TypeId.Feed:
                return new FeedTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.LitIvemId:
                return new LitIvemIdTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.RankedLitIvemId:
                return new RankedLitIvemIdTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail:
                return new LitIvemBaseDetailTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.LitIvemExtendedDetail:
                return new LitIvemExtendedDetailTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes:
                return new LitIvemAlternateCodesTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.MyxLitIvemAttributes:
                return new MyxLitIvemAttributesTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn:
                return new EditableGridLayoutDefinitionColumnTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.SecurityDataItem:
                return new SecurityDataItemTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.BrokerageAccount:
                return new BrokerageAccountTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.Order:
                return new OrderTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.Holding:
                return new HoldingTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.Balances:
                return new BalancesTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.CallPut:
                return new CallPutTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.CallSecurityDataItem:
                return new CallPutSecurityDataItemTableFieldSourceDefinition(CallOrPutId.Call);
            case TypedTableFieldSourceDefinition.TypeId.PutSecurityDataItem:
                return new CallPutSecurityDataItemTableFieldSourceDefinition(CallOrPutId.Put);
            case TypedTableFieldSourceDefinition.TypeId.TopShareholder:
                return new TopShareholderTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.Scan:
                return new ScanTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem:
                return new RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.GridField:
                return new GridFieldTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.ScanFieldEditorFrame:
                return new ScanFieldEditorFrameTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.LockerScanAttachedNotificationChannel:
                return new LockerScanAttachedNotificationChannelTableFieldSourceDefinition();
            case TypedTableFieldSourceDefinition.TypeId.LockOpenNotificationChannel:
                return new LockOpenNotificationChannelTableFieldSourceDefinition();

            default:
                throw new UnreachableCaseError('TFSDFSC25051', typeId);
        }
    }

    tryNameToId(name: string): TypedTableFieldSourceDefinition.TypeId | undefined {
        return TypedTableFieldSourceDefinition.Type.tryNameToId(name);
    }
}
