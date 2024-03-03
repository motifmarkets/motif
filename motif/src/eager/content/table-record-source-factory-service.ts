/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    BalancesTableRecordSource,
    BalancesTableRecordSourceDefinition,
    BrokerageAccountTableRecordSource,
    BrokerageAccountTableRecordSourceDefinition,
    CallPutFromUnderlyingTableRecordSource,
    CallPutFromUnderlyingTableRecordSourceDefinition,
    EditableGridLayoutDefinitionColumnTableRecordSource,
    EditableGridLayoutDefinitionColumnTableRecordSourceDefinition,
    FeedTableRecordSource,
    FeedTableRecordSourceDefinition,
    GridFieldTableRecordSource,
    GridFieldTableRecordSourceDefinition,
    HoldingTableRecordSource,
    HoldingTableRecordSourceDefinition,
    LitIvemDetailFromSearchSymbolsTableRecordSource,
    LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition,
    LitIvemIdComparableListTableRecordSource,
    LitIvemIdComparableListTableRecordSourceDefinition,
    NotImplementedError,
    NotificationChannelsService,
    OrderTableRecordSource,
    OrderTableRecordSourceDefinition,
    RankedLitIvemIdListDirectoryItemTableRecordSource,
    RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition,
    RankedLitIvemIdListFactoryService,
    RankedLitIvemIdListTableRecordSource,
    RankedLitIvemIdListTableRecordSourceDefinition,
    ScanTableRecordSource,
    ScanTableRecordSourceDefinition,
    ScanTestTableRecordSourceDefinition,
    ScansService,
    SymbolDetailCacheService,
    TableRecordSource,
    TableRecordSourceDefinition,
    TableRecordSourceDefinitionFactoryService,
    TableRecordSourceFactory,
    TextFormatterService,
    TopShareholderTableRecordSource,
    TopShareholderTableRecordSourceDefinition,
    UnreachableCaseError,
    WatchmakerService,
} from '@motifmarkets/motif-core';
import { LockOpenNotificationChannelListTableRecordSource, LockOpenNotificationChannelListTableRecordSourceDefinition } from './lock-open-notification-channels/internal-api';
import { ScanEditorAttachedNotificationChannelComparableListTableRecordSource, ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition, ScanFieldEditorFrameComparableListTableRecordSource, ScanFieldEditorFrameComparableListTableRecordSourceDefinition } from './scan/internal-api';

/** @public */
export class TableRecordSourceFactoryService implements TableRecordSourceFactory {
    constructor(
        private readonly _adiService: AdiService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        private readonly _rankedLitIvemIdListFactoryService: RankedLitIvemIdListFactoryService,
        private readonly _watchmakerService: WatchmakerService,
        private readonly _notificationChannelsService: NotificationChannelsService,
        private readonly _scansService: ScansService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
    ) { }

    create(definition: TableRecordSourceDefinition): TableRecordSource {
        switch (definition.typeId) {
            case TableRecordSourceDefinition.TypeId.Null: throw new NotImplementedError('TRSFCFDN29984');
            case TableRecordSourceDefinition.TypeId.LitIvemIdComparableList: return this.createLitIvemIdComparableList(definition);
            case TableRecordSourceDefinition.TypeId.LitIvemDetailsFromSearchSymbols: return this.createLitIvemDetailFromSearchSymbols(definition);
            case TableRecordSourceDefinition.TypeId.Watchlist: return this.createWatchlist(definition);
            case TableRecordSourceDefinition.TypeId.MarketMovers: throw new NotImplementedError('TRSFCFDMM3820');
            case TableRecordSourceDefinition.TypeId.Gics: throw new NotImplementedError('TRSFCFDG78783');
            case TableRecordSourceDefinition.TypeId.ProfitIvemHolding: throw new NotImplementedError('TRSFCFDP18885');
            case TableRecordSourceDefinition.TypeId.CashItemHolding: throw new NotImplementedError('TRSFCFDC20098');
            case TableRecordSourceDefinition.TypeId.IntradayProfitLossSymbolRec: throw new NotImplementedError('TRSFCFDI11198');
            case TableRecordSourceDefinition.TypeId.TmcDefinitionLegs: throw new NotImplementedError('TRSFCFDT99873');
            case TableRecordSourceDefinition.TypeId.TmcLeg: throw new NotImplementedError('TRSFCFDT22852');
            case TableRecordSourceDefinition.TypeId.TmcWithLegMatchingUnderlying: throw new NotImplementedError('TRSFCFDT75557');
            case TableRecordSourceDefinition.TypeId.CallPutFromUnderlying: return this.createCallPutFromUnderlying(definition);
            case TableRecordSourceDefinition.TypeId.HoldingAccountPortfolio: throw new NotImplementedError('TRSFCFDH22321');
            case TableRecordSourceDefinition.TypeId.Feed: return this.createFeed(definition);
            case TableRecordSourceDefinition.TypeId.BrokerageAccount: return this.createBrokerageAccount(definition);
            case TableRecordSourceDefinition.TypeId.Order: return this.createOrder(definition);
            case TableRecordSourceDefinition.TypeId.Holding: return this.createHolding(definition);
            case TableRecordSourceDefinition.TypeId.Balances: return this.createBalances(definition);
            case TableRecordSourceDefinition.TypeId.TopShareholder: return this.createTopShareholder(definition);
            case TableRecordSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn: return this.createGridLayoutDefinitionColumnEditRecord(definition);
            case TableRecordSourceDefinition.TypeId.Scan: return this.createScan(definition);
            case TableRecordSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem: return this.createRankedLitIvemIdListDirectoryItem(definition);
            case TableRecordSourceDefinition.TypeId.GridField: return this.createGridField(definition);
            case TableRecordSourceDefinition.TypeId.ScanTest: return this.createScanTest(definition);
            case TableRecordSourceDefinition.TypeId.ScanFieldEditorFrame: return this.createScanFieldEditorFrameComparableList(definition)
            case TableRecordSourceDefinition.TypeId.ScanEditorAttachedNotificationChannel: return this.createScanEditorAttachedNotificationChannel(definition)
            case TableRecordSourceDefinition.TypeId.LockOpenNotificationChannelList: return this.createLockOpenNotificationChannel(definition)
            default: throw new UnreachableCaseError('TDLFCFTID17742', definition.typeId);
        }
    }

    private createLitIvemIdComparableList(definition: TableRecordSourceDefinition) {
        if (definition instanceof LitIvemIdComparableListTableRecordSourceDefinition) {
            return new LitIvemIdComparableListTableRecordSource(
                this._adiService,
                this._symbolDetailCacheService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCLIICL21099');
        }
    }

    private createLitIvemDetailFromSearchSymbols(definition: TableRecordSourceDefinition) {
        if (definition instanceof LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition) {
            return new LitIvemDetailFromSearchSymbolsTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCLIIFSS21099');
        }
    }

    private createWatchlist(definition: TableRecordSourceDefinition) {
        if (definition instanceof RankedLitIvemIdListTableRecordSourceDefinition) {
            return new RankedLitIvemIdListTableRecordSource(
                this._adiService,
                this._symbolDetailCacheService,
                this._rankedLitIvemIdListFactoryService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFCW21099');
        }
    }

    private createFeed(definition: TableRecordSourceDefinition) {
        if (definition instanceof FeedTableRecordSourceDefinition) {
            return new FeedTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCF21099');
        }
    }

    private createBrokerageAccount(definition: TableRecordSourceDefinition) {
        if (definition instanceof BrokerageAccountTableRecordSourceDefinition) {
            return new BrokerageAccountTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCBA21099');
        }
    }

    private createOrder(definition: TableRecordSourceDefinition) {
        if (definition instanceof OrderTableRecordSourceDefinition) {
            return new OrderTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCO21099');
        }
    }

    private createHolding(definition: TableRecordSourceDefinition) {
        if (definition instanceof HoldingTableRecordSourceDefinition) {
            return new HoldingTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCH21099');
        }
    }

    private createBalances(definition: TableRecordSourceDefinition) {
        if (definition instanceof BalancesTableRecordSourceDefinition) {
            return new BalancesTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCB21099');
        }
    }

    private createCallPutFromUnderlying(definition: TableRecordSourceDefinition) {
        if (definition instanceof CallPutFromUnderlyingTableRecordSourceDefinition) {
            return new CallPutFromUnderlyingTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCTS21099');
        }
    }

    private createTopShareholder(definition: TableRecordSourceDefinition) {
        if (definition instanceof TopShareholderTableRecordSourceDefinition) {
            return new TopShareholderTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCTS21099');
        }
    }

    private createGridLayoutDefinitionColumnEditRecord(definition: TableRecordSourceDefinition) {
        if (definition instanceof EditableGridLayoutDefinitionColumnTableRecordSourceDefinition) {
            return new EditableGridLayoutDefinitionColumnTableRecordSource(
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCGLDCER21099');
        }
    }

    private createScan(definition: TableRecordSourceDefinition) {
        if (definition instanceof ScanTableRecordSourceDefinition) {
            return new ScanTableRecordSource(
                this._scansService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCS21099');
        }
    }

    private createRankedLitIvemIdListDirectoryItem(definition: TableRecordSourceDefinition) {
        if (definition instanceof RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition) {
            return new RankedLitIvemIdListDirectoryItemTableRecordSource(
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCRLIILDI21099');
        }
    }

    private createGridField(definition: TableRecordSourceDefinition) {
        if (definition instanceof GridFieldTableRecordSourceDefinition) {
            return new GridFieldTableRecordSource(
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition
            );
        } else {
            throw new AssertInternalError('TRSFSCGF21099');
        }
    }

    private createScanTest(definition: TableRecordSourceDefinition) {
        if (definition instanceof ScanTestTableRecordSourceDefinition) {
            return new RankedLitIvemIdListTableRecordSource(
                this._adiService,
                this._symbolDetailCacheService,
                this._rankedLitIvemIdListFactoryService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFSCST21099');
        }
    }

    private createScanFieldEditorFrameComparableList(definition: TableRecordSourceDefinition) {
        if (definition instanceof ScanFieldEditorFrameComparableListTableRecordSourceDefinition) {
            return new ScanFieldEditorFrameComparableListTableRecordSource(
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFSCSFEFCL21099');
        }
    }

    private createScanEditorAttachedNotificationChannel(definition: TableRecordSourceDefinition) {
        if (definition instanceof ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition) {
            return new ScanEditorAttachedNotificationChannelComparableListTableRecordSource(
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFSCSEANC21099');
        }
    }

    private createLockOpenNotificationChannel(definition: TableRecordSourceDefinition) {
        if (definition instanceof LockOpenNotificationChannelListTableRecordSourceDefinition) {
            return new LockOpenNotificationChannelListTableRecordSource(
                this._notificationChannelsService,
                this._textFormatterService,
                this._tableRecordSourceDefinitionFactoryService,
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFSCLONC21099');
        }
    }
}
