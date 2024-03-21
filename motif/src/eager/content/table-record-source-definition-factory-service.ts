/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    BalancesTableRecordSourceDefinition,
    BrokerageAccountGroup,
    BrokerageAccountGroupTableRecordSourceDefinition,
    BrokerageAccountTableRecordSourceDefinition,
    CallPutFromUnderlyingTableRecordSourceDefinition,
    Err,
    ErrorCode,
    FeedTableRecordSourceDefinition,
    GridField,
    GridFieldCustomHeadingsService,
    GridFieldTableRecordSourceDefinition,
    HoldingTableRecordSourceDefinition,
    IvemId,
    JsonElement,
    LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition,
    LitIvemId,
    LitIvemIdArrayRankedLitIvemIdListDefinition,
    LitIvemIdComparableListTableRecordSourceDefinition,
    LitIvemIdExecuteScanRankedLitIvemIdListDefinition,
    LockOpenListItem,
    NotImplementedError,
    Ok,
    OrderTableRecordSourceDefinition,
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinitionFactoryService,
    RankedLitIvemIdListDirectory,
    RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition,
    RankedLitIvemIdListTableRecordSourceDefinition,
    Result,
    ScanIdRankedLitIvemIdListDefinition,
    ScanTableRecordSourceDefinition,
    ScanTestTableRecordSourceDefinition,
    SearchSymbolsDataDefinition,
    TableFieldSourceDefinitionCachingFactoryService,
    TableRecordSourceDefinition,
    TopShareholderTableRecordSourceDefinition,
    TypedTableFieldSourceDefinition,
    TypedTableRecordSourceDefinition,
    TypedTableRecordSourceDefinitionFromJsonFactory,
    UiComparableList,
    UnreachableCaseError,
    WatchlistTableRecordSourceDefinition,
} from '@motifmarkets/motif-core';

/** @public */
export class TableRecordSourceDefinitionFactoryService implements TypedTableRecordSourceDefinitionFromJsonFactory {

    constructor(
        private readonly _litIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService,
        readonly gridFieldCustomHeadingsService: GridFieldCustomHeadingsService,
        readonly tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService<TypedTableFieldSourceDefinition.TypeId>,
    ) {
    }

    createLitIvemIdFromSearchSymbols(dataDefinition: SearchSymbolsDataDefinition) {
        return new LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
            dataDefinition,
        );
    }

    createLitIvemIdComparableList(list: UiComparableList<LitIvemId>) {
        return new LitIvemIdComparableListTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
            list,
        );
    }

    createRankedLitIvemIdList(definition: RankedLitIvemIdListDefinition) {
        switch (definition.typeId) {
            case RankedLitIvemIdListDefinition.TypeId.LitIvemIdExecuteScan:
                if (definition instanceof LitIvemIdExecuteScanRankedLitIvemIdListDefinition) {
                    return new ScanTestTableRecordSourceDefinition(
                        this.gridFieldCustomHeadingsService,
                        this.tableFieldSourceDefinitionCachingFactoryService,
                        definition,
                    );
                } else {
                    throw new AssertInternalError('TRSDFSCRLIILLIIES44456', definition.typeId.toString());
                }
            case RankedLitIvemIdListDefinition.TypeId.ScanId:
            case RankedLitIvemIdListDefinition.TypeId.LitIvemIdArray:
                return new WatchlistTableRecordSourceDefinition(
                    this.gridFieldCustomHeadingsService,
                    this.tableFieldSourceDefinitionCachingFactoryService,
                    definition as (LitIvemIdArrayRankedLitIvemIdListDefinition | ScanIdRankedLitIvemIdListDefinition),
                );
            case RankedLitIvemIdListDefinition.TypeId.WatchmakerListId:
                throw new NotImplementedError('TRSDFSCRLIILWLI44456');
            default:
                throw new UnreachableCaseError('TRSDFSCRLIILD44456', definition.typeId);
        }
    }

    createCallPutFromUnderlying(underlyingIvemId: IvemId) {
        return new CallPutFromUnderlyingTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
            underlyingIvemId
        );
    }

    createFeed() {
        return new FeedTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
        );
    }

    createBrokerageAccount() {
        return new BrokerageAccountTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
        );
    }

    createOrder(brokerageAccountGroup: BrokerageAccountGroup) {
        return new OrderTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
            brokerageAccountGroup,
        );
    }

    createHolding(brokerageAccountGroup: BrokerageAccountGroup) {
        return new HoldingTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
            brokerageAccountGroup,
        );
    }

    createBalances(brokerageAccountGroup: BrokerageAccountGroup) {
        return new BalancesTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
            brokerageAccountGroup,
        );
    }

    createTopShareholder(
        litIvemId: LitIvemId,
        tradingDate: Date | undefined,
        compareToTradingDate: Date | undefined
    ) {
        return new TopShareholderTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
            litIvemId,
            tradingDate,
            compareToTradingDate,
        );
    }

    createGridField(gridFieldArray: GridField[]) {
        return new GridFieldTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
            gridFieldArray,
        );
    }

    createScan() {
        return new ScanTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
        );
    }

    createRankedLitIvemIdListDirectoryItem(rankedLitIvemIdListDirectory: RankedLitIvemIdListDirectory) {
        return new RankedLitIvemIdListDirectoryItemTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
            rankedLitIvemIdListDirectory,
        );
    }

    createScanTest(listDefinition: LitIvemIdExecuteScanRankedLitIvemIdListDefinition) {
        return new ScanTestTableRecordSourceDefinition(
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionCachingFactoryService,
            listDefinition,
        );
    }

    // createLitIvemIdComparableList(list: UiComparableList<LitIvemId>) {
    //     return new LitIvemIdComparableListTableRecordSourceDefinition(
    //         this.gridFieldCustomHeadingsService,
    //         this.tableFieldSourceDefinitionCachingFactoryService,
    //         list,
    //     );
    // }

    tryCreateFromJson(element: JsonElement): Result<TypedTableRecordSourceDefinition> {
        const typeIdNameResult = TableRecordSourceDefinition.tryGetTypeIdNameFromJson(element);
        if (typeIdNameResult.isErr()) {
            return typeIdNameResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_TryGetTypeIdFromJson);
        } else {
            const typeIdName = typeIdNameResult.value;
            const typeId = TypedTableRecordSourceDefinition.Type.tryJsonToId(typeIdName);
            if (typeId === undefined) {
                return new Err(`${ErrorCode.TableRecordSourceDefinitionFactoryService_TypeIdNameIsInvalid}: ${typeIdName}`);
            } else {
                const definitionResult = this.tryCreateFromJsonAndTypeId(element, typeId);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_TryCreateFromJson_Definition);
                } else {
                    const definition = definitionResult.value;
                    return new Ok(definition);
                }
            }
        }
    }

    private tryCreateFromJsonAndTypeId(element: JsonElement, typeId: TypedTableRecordSourceDefinition.TypeId): Result<TypedTableRecordSourceDefinition> {
        switch (typeId) {
            case TypedTableRecordSourceDefinition.TypeId.Null:
                throw new NotImplementedError('TRSDFTCTFJN29984');
            case TypedTableRecordSourceDefinition.TypeId.LitIvemDetailsFromSearchSymbols: {
                const definitionResult = LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition.tryCreateDataDefinitionFromJson(element);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_LitIvemDetailsFromSearchSymbols_DataDefinitionCreateError);
                } else {
                    const definition = this.createLitIvemIdFromSearchSymbols(definitionResult.value);
                    return new Ok(definition);
                }
            }
            case TypedTableRecordSourceDefinition.TypeId.LitIvemIdComparableList: {
                const definitionResult = LitIvemIdComparableListTableRecordSourceDefinition.tryCreateListFromElement(element);
                if (definitionResult.isErr()) {
                    return definitionResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_LitIvemIdComparableList_CreateListError);
                } else {
                    const definition = this.createLitIvemIdComparableList(definitionResult.value);
                    return new Ok(definition);
                }
            }
            case TypedTableRecordSourceDefinition.TypeId.RankedLitIvemIdList: {
                const rankedLitIvemIdListDefinitionResult = RankedLitIvemIdListTableRecordSourceDefinition.tryCreateDefinition(
                    this._litIvemIdListDefinitionFactoryService,
                    element
                );
                if (rankedLitIvemIdListDefinitionResult.isErr()) {
                    const errorCode = ErrorCode.TableRecordSourceDefinitionFactoryService_Watchlist_DefinitionOrNamedExplicitReferenceIsInvalid;
                    return rankedLitIvemIdListDefinitionResult.createOuter(errorCode);
                } else {
                    const rankedLitIvemIdListDefinition = rankedLitIvemIdListDefinitionResult.value;

                    switch (rankedLitIvemIdListDefinition.typeId) {
                        case RankedLitIvemIdListDefinition.TypeId.LitIvemIdArray: {
                            const definition = new WatchlistTableRecordSourceDefinition(
                                this.gridFieldCustomHeadingsService,
                                this.tableFieldSourceDefinitionCachingFactoryService,
                                rankedLitIvemIdListDefinition as LitIvemIdArrayRankedLitIvemIdListDefinition
                            )
                            return new Ok(definition);
                        }
                        case RankedLitIvemIdListDefinition.TypeId.WatchmakerListId:
                            throw new NotImplementedError('TRSDFSRLIILWLII78783');
                        case RankedLitIvemIdListDefinition.TypeId.ScanId:
                            throw new NotImplementedError('TRSDFSRLIILSI78783');
                        case RankedLitIvemIdListDefinition.TypeId.LitIvemIdExecuteScan: {
                            const definition = this.createScanTest(rankedLitIvemIdListDefinition as LitIvemIdExecuteScanRankedLitIvemIdListDefinition);
                            return new Ok(definition);
                        }
                        default:
                            throw new UnreachableCaseError('TRSDFSRLIILU78783', rankedLitIvemIdListDefinition.typeId);
                    }
                }
            }
            case TypedTableRecordSourceDefinition.TypeId.MarketMovers:
                throw new NotImplementedError('TRSDFTCTFJMM3820');
            case TypedTableRecordSourceDefinition.TypeId.Gics:
                throw new NotImplementedError('TRSDFTCTFJG78783');
            case TypedTableRecordSourceDefinition.TypeId.ProfitIvemHolding:
                throw new NotImplementedError('TRSDFTCTFJP18885');
            case TypedTableRecordSourceDefinition.TypeId.CashItemHolding:
                throw new NotImplementedError('TRSDFTCTFJC20098');
            case TypedTableRecordSourceDefinition.TypeId.IntradayProfitLossSymbolRec:
                throw new NotImplementedError('TRSDFTCTFJI11198');
            case TypedTableRecordSourceDefinition.TypeId.TmcDefinitionLegs:
                throw new NotImplementedError('TRSDFTCTFJT99873');
            case TypedTableRecordSourceDefinition.TypeId.TmcLeg:
                throw new NotImplementedError('TRSDFTCTFJT22852');
            case TypedTableRecordSourceDefinition.TypeId.TmcWithLegMatchingUnderlying:
                throw new NotImplementedError('TRSDFTCTFJT75557');
            case TypedTableRecordSourceDefinition.TypeId.CallPutFromUnderlying: {
                const underlyingIvemIdResult = CallPutFromUnderlyingTableRecordSourceDefinition.tryGetUnderlyingIvemIdFromJson(element);
                if (underlyingIvemIdResult.isErr()) {
                    return underlyingIvemIdResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_CallPutFromUnderlying_UnderlyingIvemIdIsInvalid);
                } else {
                    const definition = this.createCallPutFromUnderlying(underlyingIvemIdResult.value);
                    return new Ok(definition);
                }
            }
            case TypedTableRecordSourceDefinition.TypeId.HoldingAccountPortfolio:
                throw new NotImplementedError('TRSDFTCTFJH22321');
            case TypedTableRecordSourceDefinition.TypeId.Feed: {
                const definition = this.createFeed();
                return new Ok(definition);
            }
            case TypedTableRecordSourceDefinition.TypeId.BrokerageAccount: {
                const definition = this.createBrokerageAccount();
                return new Ok(definition);
            }
            case TypedTableRecordSourceDefinition.TypeId.Order: {
                const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
                const definition = this.createOrder(group);
                return new Ok(definition);
            }
            case TypedTableRecordSourceDefinition.TypeId.Holding: {
                const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
                const definition = this.createHolding(group);
                return new Ok(definition);
            }
            case TypedTableRecordSourceDefinition.TypeId.Balances: {
                const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
                const definition = this.createBalances(group);
                return new Ok(definition);
            }
            case TypedTableRecordSourceDefinition.TypeId.TopShareholder: {
                const createParametersResult = TopShareholderTableRecordSourceDefinition.tryGetCreateParametersFromJson(element);
                if (createParametersResult.isErr()) {
                    return createParametersResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_TopShareholder_CreateParametersError);
                } else {
                    const { litIvemId, tradingDate, compareToTradingDate } = createParametersResult.value;
                    const definition = this.createTopShareholder(litIvemId, tradingDate, compareToTradingDate);
                    return new Ok(definition);
                }
            }
            case TypedTableRecordSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn: {
                throw new AssertInternalError('TRSDFSTCTFJEGLDC45550', 'outside');
            }
            case TypedTableRecordSourceDefinition.TypeId.Scan: {
                const definition = this.createScan();
                return new Ok(definition);
            }
            case TypedTableRecordSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem: {
                // currently not supported
                const locker: LockOpenListItem.Locker = {
                    lockerName: 'Unsupport JSON TableRecordSourceDefinition'
                };
                const emptyRankedLitItemListDirectory = new RankedLitIvemIdListDirectory([], locker);
                const definition = this.createRankedLitIvemIdListDirectoryItem(emptyRankedLitItemListDirectory);
                return new Ok(definition);
            }
            case TypedTableRecordSourceDefinition.TypeId.GridField: {
                const definition = this.createGridField([]); // persistence not implemented
                return new Ok(definition);
            }
            case TypedTableRecordSourceDefinition.TypeId.ScanFieldEditorFrame: {
                throw new AssertInternalError('TRSDFSTCTFJSFEF45550', 'outside');
            }
            case TypedTableRecordSourceDefinition.TypeId.ScanEditorAttachedNotificationChannel: {
                throw new AssertInternalError('TRSDFSTCTFJSEANC45550', 'outside');
            }
            case TypedTableRecordSourceDefinition.TypeId.LockOpenNotificationChannelList: {
                throw new AssertInternalError('TRSDFSTCTFLONCL45550', 'outside');
            }
            default:
                throw new UnreachableCaseError('TDLFCFTID17742', typeId);
        }
    }
}
