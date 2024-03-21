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
    CorrectnessBadness,
    EditableGridLayoutDefinitionColumnTableRecordSource,
    EditableGridLayoutDefinitionColumnTableRecordSourceDefinition,
    FeedTableRecordSource,
    FeedTableRecordSourceDefinition,
    GridFieldCustomHeadingsService,
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
    TextFormatterService,
    TopShareholderTableRecordSource,
    TopShareholderTableRecordSourceDefinition,
    TypedTableFieldSourceDefinitionCachingFactoryService,
    TypedTableRecordSource,
    TypedTableRecordSourceDefinition,
    TypedTableRecordSourceFactory,
    UnreachableCaseError,
    WatchmakerService
} from '@motifmarkets/motif-core';
import { LockOpenNotificationChannelListTableRecordSource, LockOpenNotificationChannelListTableRecordSourceDefinition } from './lock-open-notification-channels/internal-api';
import {
    ScanEditorAttachedNotificationChannelComparableListTableRecordSource,
    ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition,
    ScanFieldEditorFrameComparableListTableRecordSource,
    ScanFieldEditorFrameComparableListTableRecordSourceDefinition,
} from './scan/internal-api';

/** @public */
export class TableRecordSourceFactoryService implements TypedTableRecordSourceFactory {
    constructor(
        private readonly _adiService: AdiService,
        private readonly _symbolDetailCacheService: SymbolDetailCacheService,
        private readonly _rankedLitIvemIdListFactoryService: RankedLitIvemIdListFactoryService,
        private readonly _watchmakerService: WatchmakerService,
        private readonly _notificationChannelsService: NotificationChannelsService,
        private readonly _scansService: ScansService,
        private readonly _textFormatterService: TextFormatterService,
        private readonly _gridFieldCustomHeadingsService: GridFieldCustomHeadingsService,
        private readonly _tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
    ) { }

    create(definition: TypedTableRecordSourceDefinition): TypedTableRecordSource {
        switch (definition.typeId) {
            case TypedTableRecordSourceDefinition.TypeId.Null: throw new NotImplementedError('TRSFCFDN29984');
            case TypedTableRecordSourceDefinition.TypeId.LitIvemIdComparableList: return this.createLitIvemIdComparableList(definition);
            case TypedTableRecordSourceDefinition.TypeId.LitIvemDetailsFromSearchSymbols: return this.createLitIvemDetailFromSearchSymbols(definition);
            case TypedTableRecordSourceDefinition.TypeId.RankedLitIvemIdList: return this.createWatchlist(definition);
            case TypedTableRecordSourceDefinition.TypeId.MarketMovers: throw new NotImplementedError('TRSFCFDMM3820');
            case TypedTableRecordSourceDefinition.TypeId.Gics: throw new NotImplementedError('TRSFCFDG78783');
            case TypedTableRecordSourceDefinition.TypeId.ProfitIvemHolding: throw new NotImplementedError('TRSFCFDP18885');
            case TypedTableRecordSourceDefinition.TypeId.CashItemHolding: throw new NotImplementedError('TRSFCFDC20098');
            case TypedTableRecordSourceDefinition.TypeId.IntradayProfitLossSymbolRec: throw new NotImplementedError('TRSFCFDI11198');
            case TypedTableRecordSourceDefinition.TypeId.TmcDefinitionLegs: throw new NotImplementedError('TRSFCFDT99873');
            case TypedTableRecordSourceDefinition.TypeId.TmcLeg: throw new NotImplementedError('TRSFCFDT22852');
            case TypedTableRecordSourceDefinition.TypeId.TmcWithLegMatchingUnderlying: throw new NotImplementedError('TRSFCFDT75557');
            case TypedTableRecordSourceDefinition.TypeId.CallPutFromUnderlying: return this.createCallPutFromUnderlying(definition);
            case TypedTableRecordSourceDefinition.TypeId.HoldingAccountPortfolio: throw new NotImplementedError('TRSFCFDH22321');
            case TypedTableRecordSourceDefinition.TypeId.Feed: return this.createFeed(definition);
            case TypedTableRecordSourceDefinition.TypeId.BrokerageAccount: return this.createBrokerageAccount(definition);
            case TypedTableRecordSourceDefinition.TypeId.Order: return this.createOrder(definition);
            case TypedTableRecordSourceDefinition.TypeId.Holding: return this.createHolding(definition);
            case TypedTableRecordSourceDefinition.TypeId.Balances: return this.createBalances(definition);
            case TypedTableRecordSourceDefinition.TypeId.TopShareholder: return this.createTopShareholder(definition);
            case TypedTableRecordSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn: return this.createGridLayoutDefinitionColumnEditRecord(definition);
            case TypedTableRecordSourceDefinition.TypeId.Scan: return this.createScan(definition);
            case TypedTableRecordSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem: return this.createRankedLitIvemIdListDirectoryItem(definition);
            case TypedTableRecordSourceDefinition.TypeId.GridField: return this.createGridField(definition);
            case TypedTableRecordSourceDefinition.TypeId.ScanFieldEditorFrame: return this.createScanFieldEditorFrameComparableList(definition)
            case TypedTableRecordSourceDefinition.TypeId.ScanEditorAttachedNotificationChannel: return this.createScanEditorAttachedNotificationChannel(definition)
            case TypedTableRecordSourceDefinition.TypeId.LockOpenNotificationChannelList: return this.createLockOpenNotificationChannel(definition)
            default: throw new UnreachableCaseError('TDLFCFTID17742', definition.typeId);
        }
    }

    createCorrectnessState() {
        return new CorrectnessBadness();
    }

    private createLitIvemIdComparableList(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof LitIvemIdComparableListTableRecordSourceDefinition) {
            return new LitIvemIdComparableListTableRecordSource(
                this._adiService,
                this._symbolDetailCacheService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCLIICL21099');
        }
    }

    private createLitIvemDetailFromSearchSymbols(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition) {
            return new LitIvemDetailFromSearchSymbolsTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCLIIFSS21099');
        }
    }

    private createWatchlist(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof RankedLitIvemIdListTableRecordSourceDefinition) {
            return new RankedLitIvemIdListTableRecordSource(
                this._adiService,
                this._symbolDetailCacheService,
                this._rankedLitIvemIdListFactoryService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFCW21099');
        }
    }

    private createFeed(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof FeedTableRecordSourceDefinition) {
            return new FeedTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCF21099');
        }
    }

    private createBrokerageAccount(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof BrokerageAccountTableRecordSourceDefinition) {
            return new BrokerageAccountTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCBA21099');
        }
    }

    private createOrder(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof OrderTableRecordSourceDefinition) {
            return new OrderTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCO21099');
        }
    }

    private createHolding(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof HoldingTableRecordSourceDefinition) {
            return new HoldingTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCH21099');
        }
    }

    private createBalances(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof BalancesTableRecordSourceDefinition) {
            return new BalancesTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCB21099');
        }
    }

    private createCallPutFromUnderlying(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof CallPutFromUnderlyingTableRecordSourceDefinition) {
            return new CallPutFromUnderlyingTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCTS21099');
        }
    }

    private createTopShareholder(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof TopShareholderTableRecordSourceDefinition) {
            return new TopShareholderTableRecordSource(
                this._adiService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCTS21099');
        }
    }

    private createGridLayoutDefinitionColumnEditRecord(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof EditableGridLayoutDefinitionColumnTableRecordSourceDefinition) {
            return new EditableGridLayoutDefinitionColumnTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCGLDCER21099');
        }
    }

    private createScan(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof ScanTableRecordSourceDefinition) {
            return new ScanTableRecordSource(
                this._scansService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCS21099');
        }
    }

    private createRankedLitIvemIdListDirectoryItem(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition) {
            return new RankedLitIvemIdListDirectoryItemTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFCRLIILDI21099');
        }
    }

    private createGridField(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof GridFieldTableRecordSourceDefinition) {
            return new GridFieldTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition
            );
        } else {
            throw new AssertInternalError('TRSFSCGF21099');
        }
    }

    private createScanTest(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof ScanTestTableRecordSourceDefinition) {
            return new RankedLitIvemIdListTableRecordSource(
                this._adiService,
                this._symbolDetailCacheService,
                this._rankedLitIvemIdListFactoryService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFSCST21099');
        }
    }

    private createScanFieldEditorFrameComparableList(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof ScanFieldEditorFrameComparableListTableRecordSourceDefinition) {
            return new ScanFieldEditorFrameComparableListTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFSCSFEFCL21099');
        }
    }

    private createScanEditorAttachedNotificationChannel(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof ScanEditorAttachedNotificationChannelComparableListTableRecordSourceDefinition) {
            return new ScanEditorAttachedNotificationChannelComparableListTableRecordSource(
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFSCSEANC21099');
        }
    }

    private createLockOpenNotificationChannel(definition: TypedTableRecordSourceDefinition) {
        if (definition instanceof LockOpenNotificationChannelListTableRecordSourceDefinition) {
            return new LockOpenNotificationChannelListTableRecordSource(
                this._notificationChannelsService,
                this._textFormatterService,
                this._gridFieldCustomHeadingsService,
                this._tableFieldSourceDefinitionCachingFactoryService,
                this.createCorrectnessState(),
                definition,
            );
        } else {
            throw new AssertInternalError('TRSFSCLONC21099');
        }
    }
}
