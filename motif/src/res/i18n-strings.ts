/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

export const enum StringId {
    InternalError,
    PersistError,
    AssertInternalError,
    UndefinedVariableInternalError,
    TypeInternalError,
    UnreachableCaseInternalError,
    UnexpectedCaseInternalError,
    NotImplementedInternalError,
    UnexpectedTypeInternalError,
    EnumInfoOutOfOrderInternalError,
    ExternalError,
    JsonLoadExternalError,
    ConfigExternalError,
    DataExternalError,
    FeedExternalError,
    ZenithDataExternalError,
    ZenithUnexpectedCaseExternalError,
    ZenithDataStateExternalError,
    MotifServicesExternalError,
    ExtensionExternalError,
    ApiExternalError,
    QueryParamExternalError,
    RangeError,
    ArraySizeOverflow,
    ValueNotFound,
    Unknown,
    UnknownDisplayString,
    Ok,
    Cancel,
    Yes,
    No,
    True,
    False,
    Show,
    For,
    On,
    From,
    To,
    Not,
    Blank,
    // eslint-disable-next-line id-blacklist
    Undefined,
    Visible,
    Offline,
    Online,
    SignedOut,
    SignInAgain,
    Version,
    Service,
    Restart,
    UnstableRestartRequired,
    StableRestartRequired,
    ErrorCount,
    Hide,
    CopyToClipboard,
    InsufficientCharacters,
    CircularDependency,
    NotInitialised,
    Missing,
    Disabled,
    Prerequisite,
    Waiting,
    Error,
    NoErrors,
    Editing,
    Invalid,
    InvalidIntegerString,
    UnsupportedValue,
    NotObject,
    InvalidObject,
    NotString,
    InvalidString,
    NotNumber,
    InvalidNumber,
    NotBoolean,
    InvalidBoolean,
    InvalidDate,
    InvalidJsonObject,
    InvalidJsonText,
    NotArray,
    InvalidObjectArray,
    InvalidStringArray,
    InvalidNumberArray,
    InvalidBooleanArray,
    InvalidJsonObjectArray,
    InvalidAnyJsonValueTypeArray,
    DecimalNotJsonString,
    InvalidDecimal,
    IvemIdNotJsonString,
    InvalidIvemIdJson,
    LitIvemIdNotJsonObject,
    InvalidLitIvemIdJson,
    UiEntryError,
    ValueRequired,
    CodeMissing,
    SymbolSourceDoesNotHaveDefaultMarket,
    MarketDoesNotSupportExchange,
    InvalidExchange,
    InvalidMarket,
    MarketCodeNotFoundInRic,
    CodeNotFoundInRic,
    UnsupportedMarketCodeInRic,
    AllBrokerageAccounts,
    BrokerageAccountNotFound,
    BrokerageAccountNotMatched,
    TopShareholdersOnlySupportNzx,
    GroupOrdersByPriceLevel,
    SessionEndedAsLoggedInElsewhere,
    MotifServicesResponseStatusError,
    MotifServicesResponsePayloadError,
    MotifServicesFetchError,
    InvalidFilterXrefs,
    RollUpDepthCaption,
    RollUpDepthToPriceLevelsTitle,
    ExpandDepthCaption,
    ExpandDepthToOrdersTitle,
    FilterDepthCaption,
    FilterDepthToXrefsTitle,
    SpecifyDepthFilterXrefsTitle,
    BidDepth,
    AskDepth,
    KickedOff,
    NotReadable,
    PriceRemainder,
    Query,
    Subscribe,
    Subscription,
    Fields,
    Source,
    Exchange,
    Market,
    Markets,
    ServerInformation,
    Class,
    Cfi,
    Partial,
    Exact,
    Full,
    Options,
    Page,
    Of,
    Seconds,
    Watchlist,
    Trades,
    Trading,
    NoTable,
    DeleteWatchlist,
    CannotDeleteWatchlist,
    CannotDeletePrivateList,
    CannotDeleteBuiltinList,
    DeleteList,
    CannotDeleteList,
    TableJsonMissingFieldlist,
    List,
    None,
    QuestionMark,
    New,
    Private,
    Shared,
    Unnamed,
    Index,
    Undisclosed,
    Physical,
    ExecuteCommandTitle,
    ApplySymbolCaption,
    ApplySymbolTitle,
    SelectColumnsCaption,
    SelectColumnsTitle,
    AutoSizeColumnWidthsCaption,
    AutoSizeColumnWidthsTitle,
    SymbolEditTitle,
    ToggleSearchTermNotExchangedMarketProcessedCaption,
    ToggleSearchTermNotExchangedMarketProcessedTitle,
    SelectAccountTitle,
    ToggleSymbolLinkingCaption,
    ToggleSymbolLinkingTitle,
    ToggleAccountLinkingCaption,
    ToggleAccountLinkingTitle,
    BuyOrderPadCaption,
    BuyOrderPadTitle,
    SellOrderPadCaption,
    SellOrderPadTitle,
    AmendOrderPadCaption,
    AmendOrderPadTitle,
    CancelOrderPadCaption,
    CancelOrderPadTitle,
    MoveOrderPadCaption,
    MoveOrderPadTitle,
    BackgroundColor,
    ForegroundColor,
    OpenColorSchemeTitle,
    SaveColorSchemeCaption,
    SaveColorSchemeToADifferentNameTitle,
    ManageColorSchemesTitle,
    BrokerageAccountIdInputPlaceholderText,
    FeedHeadingPrefix,
    TypingPauseWaiting,
    SearchRequiresAtLeast,
    Characters,
    InvalidSymbol,
    FetchingSymbolDetails,
    SymbolNotFound,
    NoMatchingSymbolsOrNamesFound,
    Layout_InvalidJson,
    Layout_SchemaNotDefinedLoadingDefault,
    Layout_SchemaIncompatibleLoadingDefault,
    Layout_GoldenNotDefinedLoadingDefault,
    SecurityFieldDisplay_Symbol,
    SecurityFieldHeading_Symbol,
    SecurityFieldDisplay_Code,
    SecurityFieldHeading_Code,
    SecurityFieldDisplay_Market,
    SecurityFieldHeading_Market,
    SecurityFieldDisplay_Exchange,
    SecurityFieldHeading_Exchange,
    SecurityFieldDisplay_Name,
    SecurityFieldHeading_Name,
    SecurityFieldDisplay_Class,
    SecurityFieldHeading_Class,
    SecurityFieldDisplay_Cfi,
    SecurityFieldHeading_Cfi,
    SecurityFieldDisplay_TradingState,
    SecurityFieldHeading_TradingState,
    SecurityFieldDisplay_TradingStateAllows,
    SecurityFieldHeading_TradingStateAllows,
    SecurityFieldDisplay_TradingStateReason,
    SecurityFieldHeading_TradingStateReason,
    SecurityFieldDisplay_TradingMarkets,
    SecurityFieldHeading_TradingMarkets,
    SecurityFieldDisplay_IsIndex,
    SecurityFieldHeading_IsIndex,
    SecurityFieldDisplay_ExpiryDate,
    SecurityFieldHeading_ExpiryDate,
    SecurityFieldDisplay_StrikePrice,
    SecurityFieldHeading_StrikePrice,
    SecurityFieldDisplay_CallOrPut,
    SecurityFieldHeading_CallOrPut,
    SecurityFieldDisplay_ContractSize,
    SecurityFieldHeading_ContractSize,
    SecurityFieldDisplay_SubscriptionData,
    SecurityFieldHeading_SubscriptionData,
    SecurityFieldDisplay_QuotationBasis,
    SecurityFieldHeading_QuotationBasis,
    SecurityFieldDisplay_Open,
    SecurityFieldHeading_Open,
    SecurityFieldDisplay_High,
    SecurityFieldHeading_High,
    SecurityFieldDisplay_Low,
    SecurityFieldHeading_Low,
    SecurityFieldDisplay_Close,
    SecurityFieldHeading_Close,
    SecurityFieldDisplay_Settlement,
    SecurityFieldHeading_Settlement,
    SecurityFieldDisplay_Last,
    SecurityFieldHeading_Last,
    SecurityFieldDisplay_Trend,
    SecurityFieldHeading_Trend,
    SecurityFieldDisplay_BestAsk,
    SecurityFieldHeading_BestAsk,
    SecurityFieldDisplay_AskCount,
    SecurityFieldHeading_AskCount,
    SecurityFieldDisplay_AskQuantity,
    SecurityFieldHeading_AskQuantity,
    SecurityFieldDisplay_AskUndisclosed,
    SecurityFieldHeading_AskUndisclosed,
    SecurityFieldDisplay_BestBid,
    SecurityFieldHeading_BestBid,
    SecurityFieldDisplay_BidCount,
    SecurityFieldHeading_BidCount,
    SecurityFieldDisplay_BidQuantity,
    SecurityFieldHeading_BidQuantity,
    SecurityFieldDisplay_BidUndisclosed,
    SecurityFieldHeading_BidUndisclosed,
    SecurityFieldDisplay_NumberOfTrades,
    SecurityFieldHeading_NumberOfTrades,
    SecurityFieldDisplay_Volume,
    SecurityFieldHeading_Volume,
    SecurityFieldDisplay_AuctionPrice,
    SecurityFieldHeading_AuctionPrice,
    SecurityFieldDisplay_AuctionQuantity,
    SecurityFieldHeading_AuctionQuantity,
    SecurityFieldDisplay_AuctionRemainder,
    SecurityFieldHeading_AuctionRemainder,
    SecurityFieldDisplay_VWAP,
    SecurityFieldHeading_VWAP,
    SecurityFieldDisplay_ValueTraded,
    SecurityFieldHeading_ValueTraded,
    SecurityFieldDisplay_OpenInterest,
    SecurityFieldHeading_OpenInterest,
    SecurityFieldDisplay_ShareIssue,
    SecurityFieldHeading_ShareIssue,
    SecurityFieldDisplay_StatusNote,
    SecurityFieldHeading_StatusNote,
    TableRecordDefinitionList_ListTypeDisplay_Null,
    TableRecordDefinitionList_ListTypeAbbr_Null,
    TableRecordDefinitionList_ListTypeDisplay_Symbol,
    TableRecordDefinitionList_ListTypeAbbr_Symbol,
    TableRecordDefinitionList_ListTypeDisplay_Portfolio,
    TableRecordDefinitionList_ListTypeAbbr_Portfolio,
    TableRecordDefinitionList_ListTypeDisplay_Group,
    TableRecordDefinitionList_ListTypeAbbr_Group,
    TableRecordDefinitionList_ListTypeDisplay_MarketMovers,
    TableRecordDefinitionList_ListTypeAbbr_MarketMovers,
    TableRecordDefinitionList_ListTypeDisplay_IvemIdServer,
    TableRecordDefinitionList_ListTypeAbbr_IvemIdServer,
    TableRecordDefinitionList_ListTypeDisplay_Gics,
    TableRecordDefinitionList_ListTypeAbbr_Gics,
    TableRecordDefinitionList_ListTypeDisplay_ProfitIvemHolding,
    TableRecordDefinitionList_ListTypeAbbr_ProfitIvemHolding,
    TableRecordDefinitionList_ListTypeDisplay_CashItemHolding,
    TableRecordDefinitionList_ListTypeAbbr_CashItemHolding,
    TableRecordDefinitionList_ListTypeDisplay_IntradayProfitLossSymbolRec,
    TableRecordDefinitionList_ListTypeAbbr_IntradayProfitLossSymbolRec,
    TableRecordDefinitionList_ListTypeDisplay_TmcDefinitionLegs,
    TableRecordDefinitionList_ListTypeAbbr_TmcDefinitionLegs,
    TableRecordDefinitionList_ListTypeDisplay_TmcLeg,
    TableRecordDefinitionList_ListTypeAbbr_TmcLeg,
    TableRecordDefinitionList_ListTypeDisplay_TmcWithLegMatchingUnderlying,
    TableRecordDefinitionList_ListTypeAbbr_TmcWithLegMatchingUnderlying,
    TableRecordDefinitionList_ListTypeDisplay_EtoMatchingUnderlyingCallPut,
    TableRecordDefinitionList_ListTypeAbbr_EtoMatchingUnderlyingCallPut,
    TableRecordDefinitionList_ListTypeDisplay_HoldingAccountPortfolio,
    TableRecordDefinitionList_ListTypeAbbr_HoldingAccountPortfolio,
    TableRecordDefinitionList_ListTypeDisplay_Feed,
    TableRecordDefinitionList_ListTypeAbbr_Feed,
    TableRecordDefinitionList_ListTypeDisplay_BrokerageAccount,
    TableRecordDefinitionList_ListTypeAbbr_BrokerageAccount,
    TableRecordDefinitionList_ListTypeDisplay_Order,
    TableRecordDefinitionList_ListTypeAbbr_Order,
    TableRecordDefinitionList_ListTypeDisplay_Holding,
    TableRecordDefinitionList_ListTypeAbbr_Holding,
    TableRecordDefinitionList_ListTypeDisplay_Balances,
    TableRecordDefinitionList_ListTypeAbbr_Balances,
    TableRecordDefinitionList_ListTypeDisplay_TopShareholder,
    TableRecordDefinitionList_ListTypeAbbr_TopShareholder,
    ExchangeAbbreviatedDisplay_Asx,
    ExchangeFullDisplay_Asx,
    ExchangeAbbreviatedDisplay_Cxa,
    ExchangeFullDisplay_Cxa,
    ExchangeAbbreviatedDisplay_Nsx,
    ExchangeFullDisplay_Nsx,
    ExchangeAbbreviatedDisplay_Nzx,
    ExchangeFullDisplay_Nzx,
    ExchangeAbbreviatedDisplay_Calastone,
    ExchangeFullDisplay_Calastone,
    ExchangeAbbreviatedDisplay_Ptx,
    ExchangeFullDisplay_Ptx,
    ExchangeAbbreviatedDisplay_Fnsx,
    ExchangeFullDisplay_Fnsx,
    ExchangeAbbreviatedDisplay_Myx,
    ExchangeFullDisplay_Myx,
    ExchangeAbbreviatedDisplay_AsxCxa,
    ExchangeFullDisplay_AsxCxa,
    ExchangeEnvironmentDisplay_Production,
    ExchangeEnvironmentDisplay_DelayedProduction,
    ExchangeEnvironmentDisplay_Demo,
    FeedDisplay_Null,
    FeedDisplay_Authority_Trading,
    FeedDisplay_Authority_Watchlist,
    FeedDisplay_Trading_Motif,
    FeedDisplay_Trading_Malacca,
    FeedDisplay_Market_AsxBookBuild,
    FeedDisplay_Market_AsxPureMatch,
    FeedDisplay_Market_AsxTradeMatch,
    FeedDisplay_Market_AsxCentrePoint,
    FeedDisplay_Market_AsxVolumeMatch,
    FeedDisplay_Market_ChixAustLimit,
    FeedDisplay_Market_ChixAustFarPoint,
    FeedDisplay_Market_ChixAustMarketOnClose,
    FeedDisplay_Market_ChixAustNearPoint,
    FeedDisplay_Market_ChixAustMidPoint,
    FeedDisplay_Market_SimVenture,
    FeedDisplay_Market_Nsx,
    FeedDisplay_Market_SouthPacific,
    FeedDisplay_Market_Nzfox,
    FeedDisplay_Market_Nzx,
    FeedDisplay_Market_MyxNormal,
    FeedDisplay_Market_MyxDirectBusiness,
    FeedDisplay_Market_MyxIndex,
    FeedDisplay_Market_MyxOddLot,
    FeedDisplay_Market_MyxBuyIn,
    FeedDisplay_Market_Calastone,
    FeedDisplay_Market_AsxCxa,
    FeedDisplay_Market_Ptx,
    FeedDisplay_Market_Fnsx,
    FeedDisplay_News_Asx,
    FeedDisplay_News_Nsx,
    FeedDisplay_News_Nzx,
    FeedDisplay_News_Myx,
    FeedDisplay_News_Ptx,
    FeedDisplay_News_Fnsx,
    MarketDisplay_MixedMarket,
    MarketDisplay_MyxNormal,
    MarketDisplay_MyxOddLot,
    MarketDisplay_MyxBuyIn,
    MarketDisplay_MyxDirectBusiness,
    MarketDisplay_MyxIndex,
    MarketDisplay_AsxBookBuild,
    MarketDisplay_AsxPureMatch,
    MarketDisplay_AsxPureMatchDemo,
    MarketDisplay_AsxTradeMatch,
    MarketDisplay_AsxTradeMatchDelayed,
    MarketDisplay_AsxTradeMatchDemo,
    MarketDisplay_AsxCentrePoint,
    MarketDisplay_AsxVolumeMatch,
    MarketDisplay_ChixAustLimit,
    MarketDisplay_ChixAustLimitDemo,
    MarketDisplay_ChixAustFarPoint,
    MarketDisplay_ChixAustMarketOnClose,
    MarketDisplay_ChixAustNearPoint,
    MarketDisplay_ChixAustMidPoint,
    MarketDisplay_SimVenture,
    MarketDisplay_Nsx,
    MarketDisplay_NsxDemo,
    MarketDisplay_SouthPacific,
    MarketDisplay_Nzfox,
    MarketDisplay_Nzx,
    MarketDisplay_NzxDemo,
    MarketDisplay_Calastone,
    MarketDisplay_PtxDemo,
    MarketDisplay_AsxCxa,
    MarketDisplay_AsxCxaDemo,
    MarketDisplay_Ptx,
    MarketDisplay_Fnsx,
    IvemClass_Unknown,
    IvemClass_Market,
    IvemClass_ManagedFund,
    MarketBoardIdDisplay_MixedMarket,
    MarketBoardIdDisplay_AsxBookBuild,
    MarketBoardIdDisplay_AsxCentrePoint,
    MarketBoardIdDisplay_AsxTradeMatch,
    MarketBoardIdDisplay_AsxTradeMatchAgric,
    MarketBoardIdDisplay_AsxTradeMatchAus,
    MarketBoardIdDisplay_AsxTradeMatchDerivatives,
    MarketBoardIdDisplay_AsxTradeMatchEquity1,
    MarketBoardIdDisplay_AsxTradeMatchEquity2,
    MarketBoardIdDisplay_AsxTradeMatchEquity3,
    MarketBoardIdDisplay_AsxTradeMatchEquity4,
    MarketBoardIdDisplay_AsxTradeMatchEquity5,
    MarketBoardIdDisplay_AsxTradeMatchIndex,
    MarketBoardIdDisplay_AsxTradeMatchIndexDerivatives,
    MarketBoardIdDisplay_AsxTradeMatchInterestRate,
    MarketBoardIdDisplay_AsxTradeMatchPrivate,
    MarketBoardIdDisplay_AsxTradeMatchQuoteDisplayBoard,
    MarketBoardIdDisplay_AsxTradeMatchPractice,
    MarketBoardIdDisplay_AsxTradeMatchWarrants,
    MarketBoardIdDisplay_AsxPureMatch,
    MarketBoardIdDisplay_AsxPureMatchEquity1,
    MarketBoardIdDisplay_AsxPureMatchEquity2,
    MarketBoardIdDisplay_AsxPureMatchEquity3,
    MarketBoardIdDisplay_AsxPureMatchEquity4,
    MarketBoardIdDisplay_AsxPureMatchEquity5,
    MarketBoardIdDisplay_AsxVolumeMatch,
    MarketBoardIdDisplay_ChixAustFarPoint,
    MarketBoardIdDisplay_ChixAustLimit,
    MarketBoardIdDisplay_ChixAustMarketOnClose,
    MarketBoardIdDisplay_ChixAustMidPoint,
    MarketBoardIdDisplay_ChixAustNearPoint,
    MarketBoardIdDisplay_NsxMain,
    MarketBoardIdDisplay_NsxCommunityBanks,
    MarketBoardIdDisplay_NsxIndustrial,
    MarketBoardIdDisplay_NsxDebt,
    MarketBoardIdDisplay_NsxMiningAndEnergy,
    MarketBoardIdDisplay_NsxCertifiedProperty,
    MarketBoardIdDisplay_NsxProperty,
    MarketBoardIdDisplay_NsxRestricted,
    MarketBoardIdDisplay_SimVenture,
    MarketBoardIdDisplay_SouthPacificStockExchangeEquities,
    MarketBoardIdDisplay_SouthPacificStockExchangeRestricted,
    MarketBoardIdDisplay_NzxMainBoard,
    MarketBoardIdDisplay_NzxNXT,
    MarketBoardIdDisplay_NzxSpec,
    MarketBoardIdDisplay_NzxFonterraShareholders,
    MarketBoardIdDisplay_NzxIndex,
    MarketBoardIdDisplay_NzxDebt,
    MarketBoardIdDisplay_NzxAlternate,
    MarketBoardIdDisplay_NzxDerivativeFutures,
    MarketBoardIdDisplay_NzxDerivativeOptions,
    MarketBoardIdDisplay_NzxIndexFutures,
    MarketBoardIdDisplay_NzxFxDerivativeOptions,
    MarketBoardIdDisplay_NzxFxDerivativeFutures,
    MarketBoardIdDisplay_NzxFxEquityOptions,
    MarketBoardIdDisplay_NzxFxIndexFutures,
    MarketBoardIdDisplay_NzxFxMilkOptions,
    MarketBoardIdDisplay_MyxNormal,
    MarketBoardIdDisplay_MyxDirectBusinessTransaction,
    MarketBoardIdDisplay_MyxIndex,
    MarketBoardIdDisplay_MyxBuyIn,
    MarketBoardIdDisplay_MyxOddLot,
    MarketBoardIdDisplay_Ptx,
    MarketBoardIdDisplay_Fnsx,
    CallOrPutDisplay_Call,
    CallOrPutDisplay_Put,
    ZenithSubscriptionDataDisplay_Asset,
    ZenithSubscriptionDataDisplay_Trades,
    ZenithSubscriptionDataDisplay_Depth,
    ZenithSubscriptionDataDisplay_DepthFull,
    ZenithSubscriptionDataDisplay_DepthShort,
    CurrencyCode_Aud,
    CurrencySymbol_Aud,
    CurrencyCode_Usd,
    CurrencySymbol_Usd,
    CurrencyCode_Myr,
    CurrencySymbol_Myr,
    BrokerageAccountFieldDisplay_Code,
    BrokerageAccountFieldHeading_Code,
    BrokerageAccountFieldDisplay_EnvironmentId,
    BrokerageAccountFieldHeading_EnvironmentId,
    BrokerageAccountFieldDisplay_Name,
    BrokerageAccountFieldHeading_Name,
    BrokerageAccountFieldDisplay_FeedStatusId,
    BrokerageAccountFieldHeading_FeedStatusId,
    BrokerageAccountFieldDisplay_TradingFeedName,
    BrokerageAccountFieldHeading_TradingFeedName,
    BrokerageAccountFieldDisplay_CurrencyId,
    BrokerageAccountFieldHeading_CurrencyId,
    OrderFieldDisplay_Id,
    OrderFieldHeading_Id,
    OrderFieldDisplay_AccountId,
    OrderFieldHeading_AccountId,
    OrderFieldDisplay_ExternalID,
    OrderFieldHeading_ExternalID,
    OrderFieldDisplay_DepthOrderID,
    OrderFieldHeading_DepthOrderID,
    OrderFieldDisplay_Status,
    OrderFieldHeading_Status,
    OrderFieldDisplay_StatusAllowIds,
    OrderFieldHeading_StatusAllowIds,
    OrderFieldDisplay_StatusReasonIds,
    OrderFieldHeading_StatusReasonIds,
    OrderFieldDisplay_Market,
    OrderFieldHeading_Market,
    OrderFieldDisplay_TradingMarket,
    OrderFieldHeading_TradingMarket,
    OrderFieldDisplay_Currency,
    OrderFieldHeading_Currency,
    OrderFieldDisplay_EstimatedBrokerage,
    OrderFieldHeading_EstimatedBrokerage,
    OrderFieldDisplay_CurrentBrokerage,
    OrderFieldHeading_CurrentBrokerage,
    OrderFieldDisplay_EstimatedTax,
    OrderFieldHeading_EstimatedTax,
    OrderFieldDisplay_CurrentTax,
    OrderFieldHeading_CurrentTax,
    OrderFieldDisplay_CurrentValue,
    OrderFieldHeading_CurrentValue,
    OrderFieldDisplay_CreatedDate,
    OrderFieldHeading_CreatedDate,
    OrderFieldDisplay_UpdatedDate,
    OrderFieldHeading_UpdatedDate,
    OrderFieldDisplay_Style,
    OrderFieldHeading_Style,
    OrderFieldDisplay_Children,
    OrderFieldHeading_Children,
    OrderFieldDisplay_ExecutedQuantity,
    OrderFieldHeading_ExecutedQuantity,
    OrderFieldDisplay_AveragePrice,
    OrderFieldHeading_AveragePrice,
    OrderFieldDisplay_TriggerType,
    OrderFieldHeading_TriggerType,
    OrderFieldDisplay_TriggerValue,
    OrderFieldHeading_TriggerValue,
    OrderFieldDisplay_TriggerExtraParams,
    OrderFieldHeading_TriggerExtraParams,
    OrderFieldDisplay_TrailingStopLossConditionType,
    OrderFieldHeading_TrailingStopLossConditionType,
    OrderFieldDisplay_Exchange,
    OrderFieldHeading_Exchange,
    OrderFieldDisplay_Environment,
    OrderFieldHeading_Environment,
    OrderFieldDisplay_Code,
    OrderFieldHeading_Code,
    OrderFieldDisplay_Side,
    OrderFieldHeading_Side,
    OrderFieldDisplay_DetailsStyle,
    OrderFieldHeading_DetailsStyle,
    OrderFieldDisplay_BrokerageSchedule,
    OrderFieldHeading_BrokerageSchedule,
    OrderFieldDisplay_DetailsType,
    OrderFieldHeading_DetailsType,
    OrderFieldDisplay_LimitPrice,
    OrderFieldHeading_LimitPrice,
    OrderFieldDisplay_Quantity,
    OrderFieldHeading_Quantity,
    OrderFieldDisplay_HiddenQuantity,
    OrderFieldHeading_HiddenQuantity,
    OrderFieldDisplay_MinimumQuantity,
    OrderFieldHeading_MinimumQuantity,
    OrderFieldDisplay_DetailsTimeInForce,
    OrderFieldHeading_DetailsTimeInForce,
    OrderFieldDisplay_DetailsExpiryDate,
    OrderFieldHeading_DetailsExpiryDate,
    OrderFieldDisplay_DetailsUnitType,
    OrderFieldHeading_DetailsUnitType,
    OrderFieldDisplay_DetailsUnitAmount,
    OrderFieldHeading_DetailsUnitAmount,
    OrderFieldDisplay_DetailsCurrency,
    OrderFieldHeading_DetailsCurrency,
    OrderFieldDisplay_DetailsPhysicalDelivery,
    OrderFieldHeading_DetailsPhysicalDelivery,
    OrderFieldDisplay_RouteAlgorithm,
    OrderFieldHeading_RouteAlgorithm,
    OrderFieldDisplay_RouteMarket,
    OrderFieldHeading_RouteMarket,
    FeedStatusDisplay_Unknown,
    FeedStatusDisplay_Initialising,
    FeedStatusDisplay_Active,
    FeedStatusDisplay_Closed,
    FeedStatusDisplay_Inactive,
    FeedStatusDisplay_Impaired,
    FeedStatusDisplay_Expired,
    FeedClassDisplay_Authority,
    FeedClassDisplay_Market,
    FeedClassDisplay_News,
    FeedClassDisplay_Trading,
    SubscribabilityExtentDisplay_None,
    SubscribabilityExtentDisplay_Some,
    SubscribabilityExtentDisplay_All,
    DataCorrectnessDisplay_Good,
    DataCorrectnessDisplay_Suspect,
    DataCorrectnessDisplay_Error,
    Trend_None,
    Trend_Up,
    Trend_Down,
    BidAskSideDisplay_Bid,
    BidAskSideDisplay_Ask,
    SideDisplay_Buy,
    SideDisplay_Sell,
    SideDisplay_BuyMinus,
    SideDisplay_SellPlus,
    SideDisplay_SellShort,
    SideDisplay_SellShortExempt,
    SideDisplay_Undisclosed,
    SideDisplay_Cross,
    SideDisplay_CrossShort,
    SideDisplay_CrossShortExempt,
    SideDisplay_AsDefined,
    SideDisplay_Opposite,
    SideDisplay_Subscribe,
    SideDisplay_Redeem,
    SideDisplay_Lend,
    SideDisplay_Borrow,
    EquityOrderTypeDisplay_Limit,
    EquityOrderTypeDisplay_Best,
    EquityOrderTypeDisplay_Market,
    EquityOrderTypeDisplay_MarketToLimit,
    EquityOrderTypeDisplay_Unknown,
    TimeInForceDisplay_Day,
    TimeInForceDisplay_GoodTillCancel,
    TimeInForceDisplay_AtTheOpening,
    TimeInForceDisplay_FillAndKill,
    TimeInForceDisplay_FillOrKill,
    TimeInForceDisplay_AllOrNone,
    TimeInForceDisplay_GoodTillCrossing,
    TimeInForceDisplay_GoodTillDate,
    TimeInForceDisplay_AtTheClose,
    OrderPriceUnitTypeDisplay_Currency,
    OrderPriceUnitTypeDisplay_Units,
    OrderRouteAlgorithmDisplay_Market,
    OrderRouteAlgorithmDisplay_BestMarket,
    OrderRouteAlgorithmDisplay_Fix,
    OrderConditionTypeDisplay_Immediate,
    OrderConditionTypeDisplay_StopLoss,
    OrderConditionTypeDisplay_TrailingStopLoss,
    TrailingStopLossOrderConditionTypeDisplay_Price,
    TrailingStopLossOrderConditionTypeDisplay_Percent,
    HoldingFieldDisplay_ExchangeId,
    HoldingFieldHeading_ExchangeId,
    HoldingFieldDisplay_Code,
    HoldingFieldHeading_Code,
    HoldingFieldDisplay_AccountId,
    HoldingFieldHeading_AccountId,
    HoldingFieldDisplay_Style,
    HoldingFieldHeading_Style,
    HoldingFieldDisplay_Cost,
    HoldingFieldHeading_Cost,
    HoldingFieldDisplay_Currency,
    HoldingFieldHeading_Currency,
    HoldingFieldDisplay_TotalQuantity,
    HoldingFieldHeading_TotalQuantity,
    HoldingFieldDisplay_TotalAvailableQuantity,
    HoldingFieldHeading_TotalAvailableQuantity,
    HoldingFieldDisplay_AveragePrice,
    HoldingFieldHeading_AveragePrice,
    TopShareholderFieldDisplay_Name,
    TopShareholderFieldHeading_Name,
    TopShareholderFieldDisplay_Designation,
    TopShareholderFieldHeading_Designation,
    TopShareholderFieldDisplay_HolderKey,
    TopShareholderFieldHeading_HolderKey,
    TopShareholderFieldDisplay_SharesHeld,
    TopShareholderFieldHeading_SharesHeld,
    TopShareholderFieldDisplay_TotalShareIssue,
    TopShareholderFieldHeading_TotalShareIssue,
    TopShareholderFieldDisplay_SharesChanged,
    TopShareholderFieldHeading_SharesChanged,
    FeedFieldDisplay_FeedId,
    FeedFieldHeading_FeedId,
    FeedFieldDisplay_EnvironmentId,
    FeedFieldHeading_EnvironmentId,
    FeedFieldDisplay_StatusId,
    FeedFieldHeading_StatusId,
    FeedFieldDisplay_Name,
    FeedFieldHeading_Name,
    FeedFieldDisplay_ClassId,
    FeedFieldHeading_ClassId,
    TradingFeedFieldDisplay_OrderStatusCount,
    TradingFeedFieldHeading_OrderStatusCount,
    MarketFieldDisplay_MarketId,
    MarketFieldHeading_MarketId,
    MarketFieldDisplay_FeedStatusId,
    MarketFieldHeading_FeedStatusId,
    MarketFieldDisplay_TradingDate,
    MarketFieldHeading_TradingDate,
    MarketFieldDisplay_MarketTime,
    MarketFieldHeading_MarketTime,
    MarketFieldDisplay_Status,
    MarketFieldHeading_Status,
    MarketFieldDisplay_AllowIds,
    MarketFieldHeading_AllowIds,
    MarketFieldDisplay_ReasonId,
    MarketFieldHeading_ReasonId,
    MarketFieldDisplay_TradingMarkets,
    MarketFieldHeading_TradingMarkets,
    DepthStyleDisplay_Full,
    DepthStyleDisplay_Short,
    TradingStateAllowDisplay_OrderPlace,
    TradingStateAllowDisplay_OrderAmend,
    TradingStateAllowDisplay_OrderCancel,
    TradingStateAllowDisplay_OrderMove,
    TradingStateAllowDisplay_Match,
    TradingStateAllowDisplay_ReportCancel,
    TradingStateReasonDisplay_Unknown,
    TradingStateReasonDisplay_Normal,
    TradingStateReasonDisplay_Suspend,
    TradingStateReasonDisplay_TradingHalt,
    TradingStateReasonDisplay_NewsRelease,
    OrderStatusAllowDisplay_Trade,
    OrderStatusAllowDisplay_Amend,
    OrderStatusAllowDisplay_Cancel,
    OrderStatusAllowDisplay_Move,
    OrderStatusReasonDisplay_Unknown,
    OrderStatusReasonDisplay_Normal,
    OrderStatusReasonDisplay_Manual,
    OrderStatusReasonDisplay_Abnormal,
    OrderStatusReasonDisplay_Waiting,
    OrderStatusReason_Completed,
    TopShareholdersInputModeDisplay_Today,
    TopShareholdersInputModeDescription_Today,
    TopShareholdersInputModeDisplay_Historical,
    TopShareholdersInputModeDescription_Historical,
    TopShareholdersInputModeDisplay_Compare,
    TopShareholdersInputModeDescription_Compare,
    TopShareholdersInputModeDisplay_Details,
    TopShareholdersInputModeDescription_Details,
    TopShareholdersSymbolTitle,
    TopShareholdersTodayModeCaption,
    TopShareholdersTodayModeTitle,
    TopShareholdersHistoricalModeCaption,
    TopShareholdersHistoricalModeTitle,
    TopShareholdersCompareModeCaption,
    TopShareholdersCompareModeTitle,
    TopShareholdersDetailsModeCaption,
    TopShareholdersDetailsModeTitle,
    TopShareholdersHistoricalDate,
    TopShareholdersHistory,
    TopShareholdersInvalidHistory,
    TopShareholdersCompareFromDate,
    TopShareholdersCompareToDate,
    TopShareholdersCompare,
    TopShareholdersInvalidCompare,
    Top100Shareholders,
    WatchlistSymbolInputTitle,
    WatchlistSymbolButtonTitle,
    WatchlistDeleteSymbolCaption,
    WatchlistDeleteSymbolTitle,
    NewWatchlistCaption,
    NewWatchlistTitle,
    OpenWatchlistCaption,
    OpenWatchlistTitle,
    SaveWatchlistCaption,
    SaveWatchlistTitle,
    GridLayoutEditorCancelSearchCaption,
    GridLayoutEditorCancelSearchTitle,
    GridLayoutEditorSearchNextCaption,
    GridLayoutEditorSearchNextTitle,
    GridLayoutEditorSearchInputTitle,
    GridLayoutEditorMoveUpCaption,
    GridLayoutEditorMoveUpTitle,
    GridLayoutEditorMoveTopCaption,
    GridLayoutEditorMoveTopTitle,
    GridLayoutEditorMoveDownCaption,
    GridLayoutEditorMoveDownTitle,
    GridLayoutEditorMoveBottomCaption,
    GridLayoutEditorMoveBottomTitle,
    GridLayoutEditorShowAllRadioCaption,
    GridLayoutEditorShowAllRadioTitle,
    GridLayoutEditorShowVisibleRadioCaption,
    GridLayoutEditorShowVisibleRadioTitle,
    GridLayoutEditorShowHiddenRadioCaption,
    GridLayoutEditorShowHiddenRadioTitle,
    CallPutFieldDisplay_ExercisePrice,
    CallPutFieldHeading_ExercisePrice,
    CallPutFieldDisplay_ExpiryDate,
    CallPutFieldHeading_ExpiryDate,
    CallPutFieldDisplay_LitId,
    CallPutFieldHeading_LitId,
    CallPutFieldDisplay_CallLitIvemId,
    CallPutFieldHeading_CallLitIvemId,
    CallPutFieldDisplay_PutLitIvemId,
    CallPutFieldHeading_PutLitIvemId,
    CallPutFieldDisplay_ContractMultiplier,
    CallPutFieldHeading_ContractMultiplier,
    CallPutFieldDisplay_ExerciseTypeId,
    CallPutFieldHeading_ExerciseTypeId,
    CallPutFieldDisplay_UnderlyingIvemId,
    CallPutFieldHeading_UnderlyingIvemId,
    CallPutFieldDisplay_UnderlyingIsIndex,
    CallPutFieldHeading_UnderlyingIsIndex,
    ExerciseTypeDisplay_American,
    ExerciseTypeDisplay_European,
    EtoPriceQuotationSymbolInputTitle,
    EtoPriceQuotationApplySymbolCaption,
    EtoPriceQuotationApplySymbolTitle,
    TradeAffects_None,
    TradeAffects_Price,
    TradeAffects_Volume,
    TradeAffects_Vwap,
    TradeAttribute_OffMarketTrade,
    TradeAttribute_PlaceholderTrade,
    TradeAttribute_Cancel,
    SettingCaption_FontFamily,
    SettingTitle_FontFamily,
    SettingCaption_FontSize,
    SettingTitle_FontSize,
    SettingCaption_Symbol_DefaultExchange,
    SettingTitle_Symbol_DefaultExchange,
    SettingCaption_Symbol_ExchangeHideMode,
    SettingTitle_Symbol_ExchangeHideMode,
    SettingCaption_Symbol_DefaultMarketHidden,
    SettingTitle_Symbol_DefaultMarketHidden,
    SettingCaption_Symbol_MarketCodeAsLocalWheneverPossible,
    SettingTitle_Symbol_MarketCodeAsLocalWheneverPossible,
    SettingCaption_Format_NumberGroupingActive,
    SettingTitle_Format_NumberGroupingActive,
    SettingCaption_Format_MinimumPriceFractionDigitsCount,
    SettingTitle_Format_MinimumPriceFractionDigitsCount,
    SettingCaption_Format_24Hour,
    SettingTitle_Format_24Hour,
    SettingCaption_Format_DateTimeTimezoneModeId,
    SettingTitle_Format_DateTimeTimezoneModeId,
    SettingCaption_Master_SettingsProfile,
    SettingTitle_Master_SettingsProfile,
    SettingCaption_Grid_HorizontalLinesVisible,
    SettingTitle_Grid_HorizontalLinesVisible,
    SettingCaption_Grid_VerticalLinesVisible,
    SettingTitle_Grid_VerticalLinesVisible,
    SettingCaption_Grid_HorizontalLineWeight,
    SettingTitle_Grid_HorizontalLineWeight,
    SettingCaption_Grid_VerticalLineWeight,
    SettingTitle_Grid_VerticalLineWeight,
    SettingCaption_Grid_CellPadding,
    SettingTitle_Grid_CellPadding,
    SettingCaption_Grid_AddHighlightDuration,
    SettingTitle_Grid_AddHighlightDuration,
    SettingCaption_Grid_UpdateHighlightDuration,
    SettingTitle_Grid_UpdateHighlightDuration,
    SettingCaption_Grid_FocusedRowColored,
    SettingTitle_Grid_FocusedRowColored,
    SettingCaption_Grid_FocusedRowBordered,
    SettingTitle_Grid_FocusedRowBordered,
    SettingCaption_Grid_FocusedRowBorderWidth,
    SettingTitle_Grid_FocusedRowBorderWidth,
    SettingCaption_Grid_HorizontalScrollbarWidth,
    SettingTitle_Grid_HorizontalScrollbarWidth,
    SettingCaption_Grid_VerticalScrollbarWidth,
    SettingTitle_Grid_VerticalScrollbarWidth,
    SettingCaption_Grid_ScrollbarMargin,
    SettingTitle_Grid_ScrollbarMargin,
    SettingCaption_Grid_ScrollbarsOverlayAllowed,
    SettingTitle_Grid_ScrollbarsOverlayAllowed,
    SettingCaption_OrderPad_ReviewEnabled,
    SettingTitle_OrderPad_ReviewEnabled,
    SettingCaption_OrderPad_DefaultOrderTypeId,
    SettingTitle_OrderPad_DefaultOrderTypeId,
    DefaultOrderTypeIdNotSpecified,
    SettingCaption_OrderPad_DefaultTimeInForceId,
    SettingTitle_OrderPad_DefaultTimeInForceId,
    DefaultTimeInForceIdNotSpecified,
    ColorGridHeading_ItemId,
    ColorGridHeading_Name,
    ColorGridHeading_Display,
    ColorGridHeading_ItemBkgdColorText,
    ColorGridHeading_ResolvedBkgdColorText,
    ColorGridHeading_ItemForeColorText,
    ColorGridHeading_ResolvedForeColorText,
    ColorGridHeading_ItemBkgdColor,
    ColorGridHeading_ResolvedBkgdColor,
    ColorGridHeading_ItemForeColor,
    ColorGridHeading_ResolvedForeColor,
    ColorGridHeading_NotHasBkgd,
    ColorGridHeading_NotHasFore,
    ColorGridHeading_Readability,
    ColorGridHeading_IsReadable,
    LogLevel_Info,
    LogLevel_Warning,
    LogLevel_Error,
    LogLevel_Severe,
    LogLevel_Debug,
    ZenithPublisherStateDisplay_ConnectionSubscription,
    ZenithPublisherStateDisplay_ReconnectDelay,
    ZenithPublisherStateDisplay_ConnectPending,
    ZenithPublisherStateDisplay_Connect,
    ZenithPublisherStateDisplay_AuthFetch,
    ZenithPublisherStateDisplay_SocketOpen,
    ZenithPublisherStateDisplay_ZenithTokenFetch,
    ZenithPublisherStateDisplay_ZenithTokenInterval,
    ZenithPublisherStateDisplay_ZenithTokenRefresh,
    ZenithPublisherStateDisplay_SocketClose,
    ZenithPublisherStateDisplay_Finalised,
    ZenithPublisherReconnectReasonDisplay_ConnectionSubscription,
    ZenithPublisherReconnectReasonDisplay_PassportTokenFailure,
    ZenithPublisherReconnectReasonDisplay_SocketOpenFailure,
    ZenithPublisherReconnectReasonDisplay_ZenithTokenFetchFailure,
    ZenithPublisherReconnectReasonDisplay_UnexpectedSocketClose,
    ZenithPublisherReconnectReasonDisplay_SocketClose,
    ZenithPublisherReconnectReasonDisplay_Timeout,
    SessionManagerStateDisplay_NotStarted,
    SessionManagerStateDisplay_Starting,
    SessionManagerStateDisplay_Online,
    SessionManagerStateDisplay_Offline,
    SessionManagerStateDisplay_Finalising,
    SessionManagerStateDisplay_Finalised,
    ColorSettingsItemStateDisplay_Never,
    ColorSettingsItemStateDisplay_Inherit,
    ColorSettingsItemStateDisplay_Value,
    OrderPadFieldDisplay_RequestType,
    OrderPadFieldDisplay_ProductIdentificationType,
    OrderPadFieldDisplay_AccountId,
    OrderPadFieldDisplay_BrokerageAccountsDataItemReady,
    OrderPadFieldDisplay_BrokerageCode,
    OrderPadFieldDisplay_BrokerageScheduleDataItemReady,
    OrderPadFieldDisplay_AccountDefaultBrokerageCode,
    OrderPadFieldDisplay_BrokerageCodeListReady,
    OrderPadFieldDisplay_LinkId,
    OrderPadFieldDisplay_Brokerage,
    OrderPadFieldDisplay_ExpiryDate,
    OrderPadFieldDisplay_InstructionTime,
    OrderPadFieldDisplay_SymbolAndSource,
    OrderPadFieldDisplay_SymbolPriceStepSegmentsDataItemReady,
    OrderPadFieldDisplay_Srn,
    OrderPadFieldDisplay_LocateReqd,
    OrderPadFieldDisplay_Algo,
    OrderPadFieldDisplay_VisibleQuantity,
    OrderPadFieldDisplay_MinimumQuantity,
    OrderPadFieldDisplay_ExecutionInstructions,
    OrderPadFieldDisplay_OrderType,
    OrderPadFieldDisplay_TriggerTypeId,
    OrderPadFieldDisplay_Previewed,
    OrderPadFieldDisplay_TotalQuantity,
    OrderPadFieldDisplay_OrigRequestId,
    OrderPadFieldDisplay_OrderGivenBy,
    OrderPadFieldDisplay_OrderGiversDataItemReady,
    OrderPadFieldDisplay_OrderTakenBy,
    OrderPadFieldDisplay_LimitValue,
    OrderPadFieldDisplay_LimitUnit,
    OrderPadFieldDisplay_TriggerValue,
    OrderPadFieldDisplay_TriggerUnit,
    OrderPadFieldDisplay_TriggerField,
    OrderPadFieldDisplay_TriggerMovement,
    OrderPadFieldDisplay_Side,
    OrderPadFieldDisplay_RoaNoAdvice,
    OrderPadFieldDisplay_RoaNotes,
    OrderPadFieldDisplay_SoaRequired,
    OrderPadFieldDisplay_RoaMethod,
    OrderPadFieldDisplay_RoaJustification,
    OrderPadFieldDisplay_RoaDeclarations,
    OrderPadFieldDisplay_RoaDeclarationDefinitionsDataItemReady,
    OrderPadFieldDisplay_Tax,
    OrderPadFieldDisplay_TimeInForce,
    OrderPadFieldDisplay_TmcLegCount,
    OrderPadFieldDisplay_TmcLeg0SymbolAndSource,
    OrderPadFieldDisplay_TmcLeg0Ratio,
    OrderPadFieldDisplay_TmcLeg0BuyOrSell,
    OrderPadFieldDisplay_TmcLeg1SymbolAndSource,
    OrderPadFieldDisplay_TmcLeg1Ratio,
    OrderPadFieldDisplay_TmcLeg1BuyOrSell,
    OrderPadFieldDisplay_TmcLeg2SymbolAndSource,
    OrderPadFieldDisplay_TmcLeg2Ratio,
    OrderPadFieldDisplay_TmcLeg2BuyOrSell,
    OrderPadFieldDisplay_TmcLeg3SymbolAndSource,
    OrderPadFieldDisplay_TmcLeg3Ratio,
    OrderPadFieldDisplay_TmcLeg3BuyOrSell,
    OrderPadFieldDisplay_TmcMaxLegRatioCommonFactor,
    OrderPadFieldDisplay_OmsServiceOnline,
    OrderPadFieldDisplay_Status,
    OrderPadFieldDisplay_CurrentOmsOrderId,
    OrderPadFieldDisplay_WorkOmsOrderId,
    OrderPadFieldDisplay_LoadedLeavesQuantity,
    OrderPadFieldDisplay_AccountTradePermissions,
    OrderPadFieldDisplay_ExistingOrderId,
    OrderPadFieldDisplay_DestinationAccount,
    OrderPadFieldStatusReasonDescription_Unknown,
    OrderPadFieldStatusReasonDescription_Initial,
    OrderPadFieldStatusReasonDescription_ValueRequired,
    OrderPadFieldStatusReasonDescription_ValueNotRequired,
    OrderPadFieldStatusReasonDescription_OmsServiceNotOnline,
    OrderPadFieldStatusReasonDescription_NegativeValueNotAllowed,
    OrderPadFieldStatusReasonDescription_ZeroOrNegativeValueNotAllowed,
    OrderPadFieldStatusReasonDescription_InvalidQuantityForDestination,
    OrderPadFieldStatusReasonDescription_InvalidAccountId,
    OrderPadFieldStatusReasonDescription_AccountNoLongerAvailable,
    OrderPadFieldStatusReasonDescription_AccountFeedStatus_Initialising,
    OrderPadFieldStatusReasonDescription_AccountFeedStatus_Closed,
    OrderPadFieldStatusReasonDescription_AccountFeedStatus_Inactive,
    OrderPadFieldStatusReasonDescription_AccountFeedStatus_Impaired,
    OrderPadFieldStatusReasonDescription_AccountFeedStatus_Expired,
    OrderPadFieldStatusReasonDescription_SymbolNotFound,
    OrderPadFieldStatusReasonDescription_WorkOrdersNotAllowed,
    OrderPadFieldStatusReasonDescription_ViewWorkOrdersNotAllowed,
    OrderPadFieldStatusReasonDescription_NotBackOfficeScreens,
    OrderPadFieldStatusReasonDescription_NotCanSelectBrokerage,
    OrderPadFieldStatusReasonDescription_Place,
    OrderPadFieldStatusReasonDescription_Amend,
    OrderPadFieldStatusReasonDescription_Cancel,
    OrderPadFieldStatusReasonDescription_Move,
    OrderPadFieldStatusReasonDescription_NotMove,
    OrderPadFieldStatusReasonDescription_Work,
    OrderPadFieldStatusReasonDescription_NotWork,
    OrderPadFieldStatusReasonDescription_Linked,
    OrderPadFieldStatusReasonDescription_NotIceberg,
    OrderPadFieldStatusReasonDescription_AmendLinked,
    OrderPadFieldStatusReasonDescription_AccountIdNotValid,
    OrderPadFieldStatusReasonDescription_AccountDoesNotHaveDefaultBrokerageCode,
    OrderPadFieldStatusReasonDescription_NotManualBrokerageCode,
    OrderPadFieldStatusReasonDescription_RetrievingAccount,
    OrderPadFieldStatusReasonDescription_BrokerageScheduleDataItemNotReady,
    OrderPadFieldStatusReasonDescription_BrokerageCodeListNotReady,
    OrderPadFieldStatusReasonDescription_BrokerageCodeNotInSchedule,
    OrderPadFieldStatusReasonDescription_ForceWorkOrder,
    OrderPadFieldStatusReasonDescription_NotLimitOrderType,
    OrderPadFieldStatusReasonDescription_MarketAndStopOrderTypeAreAlwaysFillOrKill,
    OrderPadFieldStatusReasonDescription_RoaDeclarationDefinitionsDataItemNotReady,
    OrderPadFieldStatusReasonDescription_PriceNotOnStep,
    OrderPadFieldStatusReasonDescription_NotRoaEnabled,
    OrderPadFieldStatusReasonDescription_RoaNoAdvice,
    OrderPadFieldStatusReasonDescription_IvemId,
    OrderPadFieldStatusReasonDescription_TriggerType,
    OrderPadFieldStatusReasonDescription_TriggerTypeNotDefined,
    OrderPadFieldStatusReasonDescription_ImmediateTriggerType,
    OrderPadFieldStatusReasonDescription_SymbolPriceStepSegmentsDataItemNotReady,
    OrderPadFieldStatusReasonDescription_LeafSymbolSourceNotSupported,
    OrderPadFieldStatusReasonDescription_RootSymbolSourceNotSupported,
    OrderPadFieldStatusReasonDescription_SymbolsNotAvailable,
    OrderPadFieldStatusReasonDescription_RetrievingSymbolDetail,
    OrderPadFieldStatusReasonDescription_RetrieveSymbolDetailError,
    OrderPadFieldStatusReasonDescription_SymbolNotOk,
    OrderPadFieldStatusReasonDescription_RetrievePriceStepperError,
    OrderPadFieldStatusReasonDescription_RetrievingPriceStepper,
    OrderPadFieldStatusReasonDescription_PriceOrSegmentsNotAvailable,
    OrderPadFieldStatusReasonDescription_TradingNotPermissioned,
    OrderPadFieldStatusReasonDescription_AsxOrderAlgosNotPermissioned,
    OrderPadFieldStatusReasonDescription_StopOrderRequestsNotPermissioned,
    OrderPadFieldStatusReasonDescription_ProductIdentificationType,
    OrderPadFieldStatusReasonDescription_NotUsedInTmc,
    OrderPadFieldStatusReasonDescription_TmcOnlySupportNewRequestType,
    OrderPadFieldStatusReasonDescription_OnlyUsedInTmc,
    OrderPadFieldStatusReasonDescription_TmcLegCountNotSpecified,
    OrderPadFieldStatusReasonDescription_BeyondTmcLegCount,
    OrderPadFieldStatusReasonDescription_OrderTypeNotSpecified,
    OrderPadFieldStatusReasonDescription_AlgoNotSpecified,
    OrderPadFieldStatusReasonDescription_ValueMustNotExceedMaxTmcLegRatio,
    OrderPadFieldStatusReasonDescription_NotAllTmcLegRatiosValid,
    OrderPadFieldStatusReasonDescription_TmcMaxLegRatioCommonFactorNotOne,
    OrderPadFieldStatusReasonDescription_OnlySellStopAllowed,
    OrderPadFieldStatusReasonDescription_NotSupportedByOrderType,
    OrderPadFieldStatusReasonDescription_NotSupportedBySymbol,
    OrderPadFieldStatusReasonDescription_TimeInForceNotSpecified,
    OrderPadFieldStatusReasonDescription_TodayOrFutureDateRequired,
    OrderPadFieldStatusReasonDescription_TimeInForceDoesNotRequireDate,
    OrderPadFieldStatusReasonDescription_AsxEtoTmcSymbolMissingUnderlyingIsIndex,
    OrderPadFieldStatusReasonDescription_SymbolHasNoRoutes,
    OrderPadFieldStatusReasonDescription_RouteNotAvailableForSymbol,
    OrderPadFieldStatusReasonDescription_TmcNotInAsxTmcMarket,
    OrderPadFieldStatusReasonDescription_Snapshot,
    OrderPadFieldStatusReasonDescription_ValueOutOfRange,
    OrderPadFieldStatusReasonDescription_MyxSymbolIsMissingBoardLotSize,
    OrderPadFieldStatusReasonDescription_SideNotValid,
    OrderPadFieldStatusReasonDescription_BuyNotPermissioned,
    OrderPadFieldStatusReasonDescription_SellNotPermissioned,
    OrderPadFieldStatusReasonDescription_QuantityNotAMultiple,
    OrderPadFieldStatusReasonDescription_OrderNotFound,
    OrderPadFieldStatusReasonDescription_OrderCannotBeAmended,
    OrderPadFieldStatusReasonDescription_OrderCannotBeCancelled,
    OrderTriggerTypeDisplay_Immediate,
    OrderTriggerTypeDisplay_Price,
    OrderTriggerTypeDisplay_TrailingPrice,
    OrderTriggerTypeDisplay_PercentageTrailingPrice,
    OrderTriggerTypeDisplay_Overnight,
    OrderTriggerTypeAbbreviation_Immediate,
    OrderTriggerTypeAbbreviation_Price,
    OrderTriggerTypeAbbreviation_TrailingPrice,
    OrderTriggerTypeAbbreviation_PercentageTrailingPrice,
    OrderTriggerTypeAbbreviation_Overnight,
    OrderRequestTypeDisplay_Place,
    OrderRequestTypeDisplay_Amend,
    OrderRequestTypeDisplay_Cancel,
    OrderRequestTypeDisplay_Move,
    OrderRequestResultDisplay_Success,
    OrderRequestResultDisplay_Error,
    OrderRequestResultDisplay_Incomplete,
    OrderRequestResultDisplay_Invalid,
    OrderRequestResultDisplay_Rejected,
    OrderRequestErrorCodeDisplay_Unknown,
    OrderRequestErrorCodeDisplay_Account,
    OrderRequestErrorCodeDisplay_Account_DailyNet,
    OrderRequestErrorCodeDisplay_Account_DailyGross,
    OrderRequestErrorCodeDisplay_Authority,
    OrderRequestErrorCodeDisplay_Connection,
    OrderRequestErrorCodeDisplay_Details,
    OrderRequestErrorCodeDisplay_Error,
    OrderRequestErrorCodeDisplay_Exchange,
    OrderRequestErrorCodeDisplay_Internal,
    OrderRequestErrorCodeDisplay_Internal_NotFound,
    OrderRequestErrorCodeDisplay_Order,
    OrderRequestErrorCodeDisplay_Operation,
    OrderRequestErrorCodeDisplay_Retry,
    OrderRequestErrorCodeDisplay_Route,
    OrderRequestErrorCodeDisplay_Route_Algorithm,
    OrderRequestErrorCodeDisplay_Route_Market,
    OrderRequestErrorCodeDisplay_Route_Symbol,
    OrderRequestErrorCodeDisplay_Status,
    OrderRequestErrorCodeDisplay_Style,
    OrderRequestErrorCodeDisplay_Submitted,
    OrderRequestErrorCodeDisplay_Symbol,
    OrderRequestErrorCodeDisplay_Symbol_Authority,
    OrderRequestErrorCodeDisplay_Symbol_Status,
    OrderRequestErrorCodeDisplay_TotalValue_Balance,
    OrderRequestErrorCodeDisplay_TotalValue_Maximum,
    OrderRequestErrorCodeDisplay_ExpiryDate,
    OrderRequestErrorCodeDisplay_HiddenQuantity,
    OrderRequestErrorCodeDisplay_HiddenQuantity_Symbol,
    OrderRequestErrorCodeDisplay_LimitPrice,
    OrderRequestErrorCodeDisplay_LimitPrice_Distance,
    OrderRequestErrorCodeDisplay_LimitPrice_Given,
    OrderRequestErrorCodeDisplay_LimitPrice_Maximum,
    OrderRequestErrorCodeDisplay_LimitPrice_Missing,
    OrderRequestErrorCodeDisplay_MinimumQuantity,
    OrderRequestErrorCodeDisplay_MinimumQuantity_Symbol,
    OrderRequestErrorCodeDisplay_OrderType,
    OrderRequestErrorCodeDisplay_OrderType_Market,
    OrderRequestErrorCodeDisplay_OrderType_Status,
    OrderRequestErrorCodeDisplay_OrderType_Symbol,
    OrderRequestErrorCodeDisplay_Side,
    OrderRequestErrorCodeDisplay_Side_Maximum,
    OrderRequestErrorCodeDisplay_TotalQuantity,
    OrderRequestErrorCodeDisplay_TotalQuantity_Minimum,
    OrderRequestErrorCodeDisplay_TotalQuantity_Holdings,
    OrderRequestErrorCodeDisplay_Validity,
    OrderRequestErrorCodeDisplay_Validity_Symbol,
    OrderRequestErrorCodeDisplay_VisibleQuantity,
    OrderRequestErrorCodeDisplay_TotalQuantity_Maximum,
    OrderRequestErrorCodeDisplay_UnitType,
    OrderRequestErrorCodeDisplay_UnitAmount,
    OrderRequestErrorCodeDisplay_Currency,
    OrderRequestErrorCodeDisplay_Flags_PDS,
    OrderPadAccountCaption,
    OrderPadSideTitle_Buy,
    OrderPadSideTitle_Sell,
    OrderPadSideTitle_SellShort,
    OrderPadSideTitle,
    OrderPadSideCaption,
    OrderPadSymbolTitle,
    OrderPadSymbolCaption,
    OrderPadRouteTitle,
    OrderPadTotalQuantityTitle,
    OrderPadTotalQuantityCaption,
    OrderPadOrderTypeTitle_Market,
    OrderPadOrderTypeTitle_MarketToLimit,
    OrderPadOrderTypeTitle_Limit,
    OrderPadOrderTypeTitle_MarketAtBest,
    OrderPadOrderTypeTitle,
    OrderPadOrderTypeCaption,
    OrderPadLimitValueTitle,
    OrderPadLimitValueCaption,
    OrderPadLimitUnitTitle,
    OrderPadTriggerTypeTitle_Immediate,
    OrderPadTriggerTypeTitle_Price,
    OrderPadTriggerTypeTitle_TrailingPrice,
    OrderPadTriggerTypeTitle_PercentageTrailingPrice,
    OrderPadTriggerTypeTitle_Overnight,
    OrderPadTriggerTitle,
    OrderPadTriggerCaption,
    OrderPadTriggerValueTitle,
    OrderPadTriggerValueCaption,
    OrderPadTriggerFieldTitle_Last,
    OrderPadTriggerFieldTitle_BestBid,
    OrderPadTriggerFieldTitle_BestAsk,
    OrderPadTriggerFieldTitle,
    OrderPadTriggerFieldCaption,
    OrderApiTriggerMovementTitle_None,
    OrderApiTriggerMovementTitle_Up,
    OrderApiTriggerMovementTitle_Down,
    OrderPadTriggerMovementTitle,
    OrderPadTriggerMovementCaption,
    OrderPadTimeInForceTitle_Day,
    OrderPadTimeInForceTitle_GoodTillCancel,
    OrderPadTimeInForceTitle_AtTheOpening,
    OrderPadTimeInForceTitle_FillAndKill,
    OrderPadTimeInForceTitle_FillOrKill,
    OrderPadTimeInForceTitle_AllOrNone,
    OrderPadTimeInForceTitle_GoodTillCrossing,
    OrderPadTimeInForceTitle_GoodTillDate,
    OrderPadTimeInForceTitle_AtTheClose,
    OrderPadTimeInForceTitle,
    OrderPadTimeInForceCaption,
    OrderPadExpiryDateTitle,
    OrderPadExpiryDateCaption,
    OrderPadExistingOrderIdTitle,
    OrderPadExistingOrderIdCaption,
    OrderPadDestinationAccountTitle,
    OrderPadDestinationAccountCaption,
    OrderPadErrorsCaption,
    OrderRequest_PrimaryCaption,
    OrderRequest_PrimaryTitle,
    OrderRequest_ReviewZenithMessageActiveCaption,
    OrderRequest_ReviewZenithMessageActiveTitle,
    OrderRequest_NewCaption,
    OrderRequest_NewTitle,
    OrderRequest_NewAmendPossibleFlagChar,
    OrderRequest_BackCaption,
    OrderRequest_BackTitle,
    OrderRequest_ReviewCaption,
    OrderRequest_ReviewTitle,
    OrderRequest_SendCaption,
    OrderRequest_SendTitle,
    SymbolCache_UnresolvedRequestTimedOut,
    OrderRequestResultStatusDisplay_Waiting,
    OrderRequestResultStatusDisplay_CommunicateError,
    OrderRequestResultStatusDisplay_Success,
    OrderRequestResultStatusDisplay_Error,
    OrderRequestResultStatusDisplay_Incomplete,
    OrderRequestResultStatusDisplay_Invalid,
    OrderRequestResultStatusDisplay_Rejected,
    OrderRequestResultTitle_Status,
    OrderRequestResultCaption_Status,
    OrderRequestResultTitle_OrderId,
    OrderRequestResultCaption_OrderId,
    OrderRequestResultTitle_Errors,
    OrderRequestResultCaption_Errors,
    ColorSelector_ItemColorTypeCaption,
    ColorSelector_ItemColorTypeTitle,
    ColorSelector_OpaqueCaption,
    ColorSelector_OpaqueTitle,
    ColorSelector_TransparentCaption,
    ColorSelector_TransparentTitle,
    ColorSelector_UseInheritedCaption,
    ColorSelector_UseInheritedTitle,
    ColorSelector_LightenCaption,
    ColorSelector_LightenTitle,
    ColorSelector_DarkenCaption,
    ColorSelector_DarkenTitle,
    ColorSelector_BrightenCaption,
    ColorSelector_BrightenTitle,
    ColorSelector_ComplementCaption,
    ColorSelector_ComplementTitle,
    ColorSelector_SaturateCaption,
    ColorSelector_SaturateTitle,
    ColorSelector_DesaturateCaption,
    ColorSelector_DesaturateTitle,
    ColorSelector_SpinCaption,
    ColorSelector_SpinTitle,
    ColorSelector_CopyCaption,
    ColorSelector_CopyTitle,
    ColorItemProperties_ReadabilityTitle,
    ColorItemProperties_ReadabilityCaption,
    ApplicationEnvironmentSelectorDisplay_Default,
    ApplicationEnvironmentSelectorTitle_Default,
    ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment,
    ApplicationEnvironmentSelectorTitle_ExchangeEnvironment,
    ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment_Demo,
    ApplicationEnvironmentSelectorTitle_ExchangeEnvironment_Demo,
    ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment_Delayed,
    ApplicationEnvironmentSelectorTitle_ExchangeEnvironment_Delayed,
    ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment_Production,
    ApplicationEnvironmentSelectorTitle_ExchangeEnvironment_Production,
    ApplicationEnvironmentSelectorDisplay_Test,
    ApplicationEnvironmentSelectorTitle_Test,
    ApplicationEnvironmentDisplay_Default,
    ApplicationEnvironmentTitle_Default,
    ApplicationEnvironmentDisplay_ExchangeEnvironment_Demo,
    ApplicationEnvironmentTitle_ExchangeEnvironment_Demo,
    ApplicationEnvironmentDisplay_ExchangeEnvironment_Delayed,
    ApplicationEnvironmentTitle_ExchangeEnvironment_Delayed,
    ApplicationEnvironmentDisplay_ExchangeEnvironment_Production,
    ApplicationEnvironmentTitle_ExchangeEnvironment_Production,
    ApplicationEnvironmentDisplay_Test,
    ApplicationEnvironmentTitle_Test,
    SymbolExchangeHideModeDisplay_Never,
    SymbolExchangeHideModeDescription_Never,
    SymbolExchangeHideModeDisplay_Default,
    SymbolExchangeHideModeDescription_Default,
    SymbolExchangeHideModeDisplay_WheneverPossible,
    SymbolExchangeHideModeDescription_WheneverPossible,
    BalancesFieldDisplay_AccountId,
    BalancesFieldHeading_AccountId,
    BalancesFieldDisplay_CurrencyId,
    BalancesFieldHeading_CurrencyId,
    BalancesFieldDisplay_NetBalance,
    BalancesFieldHeading_NetBalance,
    BalancesFieldDisplay_Trading,
    BalancesFieldHeading_Trading,
    BalancesFieldDisplay_NonTrading,
    BalancesFieldHeading_NonTrading,
    BalancesFieldDisplay_UnfilledBuys,
    BalancesFieldHeading_UnfilledBuys,
    BalancesFieldDisplay_Margin,
    BalancesFieldHeading_Margin,
    BaseLitIvemDetailDisplay_Id,
    BaseLitIvemDetailHeading_Id,
    BaseLitIvemDetailDisplay_Code,
    BaseLitIvemDetailHeading_Code,
    BaseLitIvemDetailDisplay_MarketId,
    BaseLitIvemDetailHeading_MarketId,
    BaseLitIvemDetailDisplay_IvemClassId,
    BaseLitIvemDetailHeading_IvemClassId,
    BaseLitIvemDetailDisplay_SubscriptionDataIds,
    BaseLitIvemDetailHeading_SubscriptionDataIds,
    BaseLitIvemDetailDisplay_TradingMarketIds,
    BaseLitIvemDetailHeading_TradingMarketIds,
    BaseLitIvemDetailDisplay_Name,
    BaseLitIvemDetailHeading_Name,
    BaseLitIvemDetailDisplay_ExchangeId,
    BaseLitIvemDetailHeading_ExchangeId,
    ExtendedLitIvemDetailDisplay_DepthDirectionId,
    ExtendedLitIvemDetailHeading_DepthDirectionId,
    ExtendedLitIvemDetailDisplay_IsIndex,
    ExtendedLitIvemDetailHeading_IsIndex,
    ExtendedLitIvemDetailDisplay_ExpiryDate,
    ExtendedLitIvemDetailHeading_ExpiryDate,
    ExtendedLitIvemDetailDisplay_StrikePrice,
    ExtendedLitIvemDetailHeading_StrikePrice,
    ExtendedLitIvemDetailDisplay_ExerciseTypeId,
    ExtendedLitIvemDetailHeading_ExerciseTypeId,
    ExtendedLitIvemDetailDisplay_CallOrPutId,
    ExtendedLitIvemDetailHeading_CallOrPutId,
    ExtendedLitIvemDetailDisplay_ContractSize,
    ExtendedLitIvemDetailHeading_ContractSize,
    ExtendedLitIvemDetailDisplay_AlternateCodes,
    ExtendedLitIvemDetailHeading_AlternateCodes,
    ExtendedLitIvemDetailDisplay_Attributes,
    ExtendedLitIvemDetailHeading_Attributes,
    ExtendedLitIvemDetailDisplay_TmcLegs,
    ExtendedLitIvemDetailHeading_TmcLegs,
    ExtendedLitIvemDetailDisplay_Categories,
    ExtendedLitIvemDetailHeading_Categories,
    MyxLitIvemAttributesDisplay_Category,
    MyxLitIvemAttributesHeading_Category,
    MyxLitIvemAttributesDisplay_MarketClassification,
    MyxLitIvemAttributesHeading_MarketClassification,
    MyxLitIvemAttributesDisplay_DeliveryBasis,
    MyxLitIvemAttributesHeading_DeliveryBasis,
    MyxLitIvemAttributesDisplay_MaxRSS,
    MyxLitIvemAttributesHeading_MaxRSS,
    MyxLitIvemAttributesDisplay_Sector,
    MyxLitIvemAttributesHeading_Sector,
    MyxLitIvemAttributesDisplay_Short,
    MyxLitIvemAttributesHeading_Short,
    MyxLitIvemAttributesDisplay_ShortSuspended,
    MyxLitIvemAttributesHeading_ShortSuspended,
    MyxLitIvemAttributesDisplay_SubSector,
    MyxLitIvemAttributesHeading_SubSector,
    LitIvemAlternateCodeDisplay_Ticker,
    LitIvemAlternateCodeHeading_Ticker,
    LitIvemAlternateCodeDisplay_Gics,
    LitIvemAlternateCodeHeading_Gics,
    LitIvemAlternateCodeDisplay_Isin,
    LitIvemAlternateCodeHeading_Isin,
    LitIvemAlternateCodeDisplay_Ric,
    LitIvemAlternateCodeHeading_Ric,
    LitIvemAlternateCodeDisplay_Base,
    LitIvemAlternateCodeHeading_Base,
    DepthDirectionDisplay_BidBelowAsk,
    DepthDirectionDisplay_AskBelowBid,
    MyxMarketClassificationDisplay_Main,
    MyxMarketClassificationDisplay_Ace,
    MyxMarketClassificationDisplay_Etf,
    MyxMarketClassificationDisplay_Strw,
    MyxMarketClassificationDisplay_Bond,
    MyxMarketClassificationDisplay_Leap,
    MyxShortSellTypeDisplay_RegulatedShortSelling,
    MyxShortSellTypeDisplay_ProprietaryDayTrading,
    MyxShortSellTypeDisplay_IntraDayShortSelling,
    MyxShortSellTypeDisplay_ProprietaryShortSelling,
    MyxCategoryDisplay_Foreign,
    MyxCategoryDisplay_Sharia,
    MyxDeliveryBasisDisplay_BuyingInT0,
    MyxDeliveryBasisDisplay_DesignatedBasisT1,
    MyxDeliveryBasisDisplay_ReadyBasisT2,
    MyxDeliveryBasisDisplay_ImmediateBasisT1,
    QuerySymbolsDataDefinitionFieldDisplay_Code,
    QuerySymbolsDataDefinitionFieldDescription_Code,
    QuerySymbolsDataDefinitionFieldDisplay_Name,
    QuerySymbolsDataDefinitionFieldDescription_Name,
    QuerySymbolsDataDefinitionFieldDisplay_Ticker,
    QuerySymbolsDataDefinitionFieldDescription_Ticker,
    QuerySymbolsDataDefinitionFieldDisplay_Gics,
    QuerySymbolsDataDefinitionFieldDescription_Gics,
    QuerySymbolsDataDefinitionFieldDisplay_Isin,
    QuerySymbolsDataDefinitionFieldDescription_Isin,
    QuerySymbolsDataDefinitionFieldDisplay_Base,
    QuerySymbolsDataDefinitionFieldDescription_Base,
    QuerySymbolsDataDefinitionFieldDisplay_Ric,
    QuerySymbolsDataDefinitionFieldDescription_Ric,
    SymbolsDitemControlTitle_QueryOrSubscribe,
    SymbolsDitemControlCaption_QueryOrSubscribe,
    SymbolsDitemControlTitle_Exchange,
    SymbolsDitemControlCaption_Exchange,
    SymbolsDitemControlTitle_Markets,
    SymbolsDitemControlCaption_Markets,
    SymbolsDitemControlTitle_Cfi,
    SymbolsDitemControlCaption_Cfi,
    SymbolsDitemControlTitle_Fields,
    SymbolsDitemControlCaption_Fields,
    SymbolsDitemControlTitle_Partial,
    SymbolsDitemControlCaption_Partial,
    SymbolsDitemControlTitle_PreferExact,
    SymbolsDitemControlCaption_PreferExact,
    SymbolsDitemControlTitle_ShowFull,
    SymbolsDitemControlCaption_ShowFull,
    SymbolsDitemControlTitle_PageSize,
    SymbolsDitemControlCaption_PageSize,
    SymbolsDitemControlTitle_Search,
    SymbolsDitemControlCaption_Search,
    SymbolsDitemControlTitle_Query,
    SymbolsDitemControlCaption_Query,
    SymbolsDitemControlTitle_SubscribeMarket,
    SymbolsDitemControlCaption_SubscribeMarket,
    SymbolsDitemControlTitle_Class,
    SymbolsDitemControlCaption_Class,
    SymbolsDitemControlTitle_Subscribe,
    SymbolsDitemControlCaption_Subscribe,
    SymbolsDitemControlTitle_QuerySearchDescription,
    SymbolsDitemControlCaption_QuerySearchDescription,
    SymbolsDitemControlTitle_SubscriptionSearchDescription,
    SymbolsDitemControlCaption_SubscriptionSearchDescription,
    SymbolsDitemControlTitle_NextPage,
    SymbolsDitemControlCaption_NextPage,
    SymbolsDitemQueryOrSubscribeDescription_Query,
    SymbolsDitemQueryOrSubscribeDescription_Subscription,
    DayTradesGridHeading_Id,
    DayTradesGridHeading_Price,
    DayTradesGridHeading_Quantity,
    DayTradesGridHeading_Time,
    DayTradesGridHeading_FlagIds,
    DayTradesGridHeading_TrendId,
    DayTradesGridHeading_BidAskSideId,
    DayTradesGridHeading_AffectsIds,
    DayTradesGridHeading_ConditionCodes,
    DayTradesGridHeading_BuyDepthOrderId,
    DayTradesGridHeading_BuyBroker,
    DayTradesGridHeading_BuyCrossRef,
    DayTradesGridHeading_SellDepthOrderId,
    DayTradesGridHeading_SellBroker,
    DayTradesGridHeading_SellCrossRef,
    DayTradesGridHeading_MarketId,
    DayTradesGridHeading_RelatedId,
    DayTradesGridHeading_Attributes,
    DayTradesGridHeading_RecordType,
    SubscribabilityIncreaseRetry_FromExtentNone,
    SubscribabilityIncreaseRetry_FromExtentSome,
    SubscribabilityIncreaseRetry_ReIncrease,
    BadnessReasonId_NotBad,
    BadnessReasonId_Inactive,
    BadnessReasonId_PublisherSubscriptionError_Internal_Error,
    BadnessReasonId_PublisherSubscriptionError_Offlined_Suspect,
    BadnessReasonId_PublisherSubscriptionError_Offlined_Error,
    BadnessReasonId_PublisherSubscriptionError_Timeout_Suspect,
    BadnessReasonId_PublisherSubscriptionError_Timeout_Error,
    BadnessReasonId_PublisherSubscriptionError_UserNotAuthorised_Error,
    BadnessReasonId_PublisherSubscriptionError_PublishRequestError_Suspect,
    BadnessReasonId_PublisherSubscriptionError_PublishRequestError_Error,
    BadnessReasonId_PublisherSubscriptionError_SubRequestError_Suspect,
    BadnessReasonId_PublisherSubscriptionError_SubRequestError_Error,
    BadnessReasonId_PublisherSubscriptionError_DataError_Suspect,
    BadnessReasonId_PublisherSubscriptionError_DataError_Error,
    BadnessReasonId_PublisherServerWarning,
    BadnessReasonId_PublisherServerError,
    BadnessReasonId_PublisherSubscription_NeverSubscribed,
    BadnessReasonId_PublisherSubscription_PublisherOnlineWaiting,
    BadnessReasonId_PublisherSubscription_PublisherOfflining,
    BadnessReasonId_PublisherSubscription_ResponseWaiting,
    BadnessReasonId_PublisherSubscription_SynchronisationWaiting,
    BadnessReasonId_PublisherSubscription_Synchronised,
    BadnessReasonId_PublisherSubscription_UnsubscribedSynchronised,
    BadnessReasonId_PreGood_Clear,
    BadnessReasonId_PreGood_Add,
    BadnessReasonId_ConnectionOffline,
    BadnessReasonId_FeedsWaiting,
    BadnessReasonId_FeedsError,
    BadnessReasonId_FeedWaiting,
    BadnessReasonId_FeedError,
    BadnessReasonId_FeedNotAvailable,
    BadnessReasonId_NoAuthorityFeed,
    BadnessReasonId_MarketsWaiting,
    BadnessReasonId_MarketsError,
    BadnessReasonId_MarketWaiting,
    BadnessReasonId_MarketError,
    BadnessReasonId_MarketNotAvailable,
    BadnessReasonId_BrokerageAccountsWaiting,
    BadnessReasonId_BrokerageAccountsError,
    BadnessReasonId_BrokerageAccountWaiting,
    BadnessReasonId_BrokerageAccountError,
    BadnessReasonId_BrokerageAccountNotAvailable,
    BadnessReasonId_OrderStatusesError,
    BadnessReasonId_FeedStatus_Unknown,
    BadnessReasonId_FeedStatus_Initialising,
    BadnessReasonId_FeedStatus_Impaired,
    BadnessReasonId_FeedStatus_Expired,
    BadnessReasonId_Reading,
    BadnessReasonId_SymbolMatching_None,
    BadnessReasonId_SymbolMatching_Ambiguous,
    BadnessReasonId_SymbolOkWaitingForData,
    BadnessReasonId_DataRetrieving,
    BadnessReasonId_MarketTradingStatesRetrieving,
    BadnessReasonId_OrderStatusesFetching,
    BadnessReasonId_BrokerageAccountDataListsIncubating,
    BadnessReasonId_OneOrMoreAccountsInError,
    BadnessReasonId_ResourceWarnings,
    BadnessReasonId_ResourceErrors,
    BadnessReasonId_StatusWarnings,
    BadnessReasonId_StatusRetrieving,
    BadnessReasonId_StatusErrors,
    SourceTzOffsetDateTimeTimezoneModeDisplay_Utc,
    SourceTzOffsetDateTimeTimezoneModeDescription_Utc,
    SourceTzOffsetDateTimeTimezoneModeDisplay_Local,
    SourceTzOffsetDateTimeTimezoneModeDescription_Local,
    SourceTzOffsetDateTimeTimezoneModeDisplay_Source,
    SourceTzOffsetDateTimeTimezoneModeDescription_Source,
    ChartHistoryIntervalUnitDisplay_Trade,
    ChartHistoryIntervalUnitDisplay_Millisecond,
    ChartHistoryIntervalUnitDisplay_Day,
    ChartHistoryIntervalUnitDisplay_Week,
    ChartHistoryIntervalUnitDisplay_Month,
    ChartHistoryIntervalUnitDisplay_Year,
    ChartHistoryIntervalPresetDisplay_Trade,
    ChartHistoryIntervalPresetDisplay_OneSecond,
    ChartHistoryIntervalPresetDisplay_OneMinute,
    ChartHistoryIntervalPresetDisplay_FiveMinutes,
    ChartHistoryIntervalPresetDisplay_FifteenMinutes,
    ChartHistoryIntervalPresetDisplay_ThirtyMinutes,
    ChartHistoryIntervalPresetDisplay_Hourly,
    ChartHistoryIntervalPresetDisplay_Daily,
    ChartHistoryIntervalPresetDisplay_Weekly,
    ChartHistoryIntervalPresetDisplay_Monthly,
    ChartHistoryIntervalPresetDisplay_Quarterly,
    ChartHistoryIntervalPresetDisplay_Yearly,
    ChartHistoryIntervalPresetDisplay_Custom,
    ChartIntervalDisplay_OneMinute,
    ChartIntervalDisplay_FiveMinutes,
    ChartIntervalDisplay_FifteenMinutes,
    ChartIntervalDisplay_ThirtyMinutes,
    ChartIntervalDisplay_OneDay,
    LitIvemIdPriceVolumeSequenceHistoryResourceDisplay_ChartHistory,
    LitIvemIdPriceVolumeSequenceHistoryResourceDisplay_Trades,
    LitIvemIdPriceVolumeSequenceHistoryResourceDisplay_Security,
    DayTradesDataItemRecordTypeIdDisplay_Trade,
    DayTradesDataItemRecordTypeIdDisplay_Canceller,
    DayTradesDataItemRecordTypeIdDisplay_Cancelled,
    InternalCommandDisplay_Null,
    InternalCommandDisplay_ChildMenu,
    InternalCommandDisplay_MenuDivider,
    DitemCommandDisplay_ToggleSecurityLinking,
    DitemCommandDisplay_SetSecurityLinking,
    DitemCommandDisplay_ToggleAccountLinking,
    DitemCommandDisplay_SetAccountLinking,
    MenuDisplay_Price,
    MenuAccessKey_Price,
    MenuDisplay_Trading,
    MenuAccessKey_Trading,
    MenuDisplay_Commands,
    MenuAccessKey_Commands,
    MenuDisplay_Tools,
    MenuAccessKey_Tools,
    MenuDisplay_Help,
    MenuAccessKey_Help,
    DitemMenuDisplay_Placeholder,
    DitemMenuDisplay_Extensions,
    DitemMenuDisplay_Symbols,
    DitemMenuDisplay_DepthAndTrades,
    DitemMenuDisplay_Watchlist,
    DitemMenuDisplay_Depth,
    DitemMenuDisplay_NewsHeadlines,
    DitemMenuDisplay_NewsBody,
    DitemMenuDisplay_TopShareholders,
    DitemMenuDisplay_Status,
    DitemMenuDisplay_Trades,
    DitemMenuDisplay_OrderRequest,
    DitemMenuDisplay_BrokerageAccounts,
    DitemMenuDisplay_Orders,
    DitemMenuDisplay_Holdings,
    DitemMenuDisplay_Balances,
    DitemMenuDisplay_Settings,
    DitemMenuDisplay_EtoPriceQuotation,
    DitemMenuDisplay_OrderRequest_Buy,
    DitemMenuDisplay_OrderRequest_Sell,
    Desktop_SaveLayoutCaption,
    Desktop_ResetLayoutCaption,
    Desktop_SignOutCaption,
    ZenithWebsocketCloseCodeId_NormalClosure,
    ZenithWebsocketCloseCodeId_GoingAway,
    ZenithWebsocketCloseCodeId_ProtocolError,
    ZenithWebsocketCloseCodeId_UnsupportedData,
    ZenithWebsocketCloseCodeId_NoStatusReceived,
    ZenithWebsocketCloseCodeId_AbnormalClosure,
    ZenithWebsocketCloseCodeId_InvalidFramePayloadData,
    ZenithWebsocketCloseCodeId_PolicyViolation,
    ZenithWebsocketCloseCodeId_MessageTooBig,
    ZenithWebsocketCloseCodeId_MissingExtension,
    ZenithWebsocketCloseCodeId_ServerError,
    ZenithWebsocketCloseCodeId_ServerRestart,
    ZenithWebsocketCloseCodeId_TryAgainLater,
    ZenithWebsocketCloseCodeId_BadGateway,
    ZenithWebsocketCloseCodeId_TlsHandshake,
    ZenithWebsocketCloseCodeId_Session,
    NotCurrentVersion_NotRunningCurrentVersion,
    NotCurrentVersion_CurrentCaption,
    NotCurrentVersion_RunningCaption,
    NotCurrentVersion_ClickButtonToAttemptLoadCurrentText,
    NotCurrentVersion_ReloadAppCaption,
    NotCurrentVersion_MoreInfo,
    Extensions_ExtensionNotInstalledOrEnabled,
    Extensions_LocalDesktopNotLoaded,
    Extensions_ExtensionDidNotCreateComponent,
    Extensions_DownloadTimeout,
    Extensions_ExtensionInstallCaption,
    Extensions_ExtensionUninstallCaption,
    Extensions_ExtensionEnableCaption,
    Extensions_ExtensionDisableCaption,
    Extensions_AvailableExtensionsHeadingCaption,
    Extensions_InstalledExtensionsHeadingCaption,
    PlaceholderDitem_ComponentStateNotSpecified,
    PlaceholderDitem_ComponentStateIsInvalid,
    PlaceholderDitem_ComponentIsNotAvailable,
    PlaceholderDitem_PlaceheldExtensionPublisherCaption,
    PlaceholderDitem_PlaceheldExtensionNameCaption,
    PlaceholderDitem_PlaceheldConstructionMethodCaption,
    PlaceholderDitem_PlaceheldComponentTypeNameCaption,
    PlaceholderDitem_PlaceheldComponentStateCaption,
    PlaceholderDitem_PlaceheldReasonCaption,
    PlaceholderDitem_InvalidCaption,
    ExtensionPublisherTypeId_Display_Invalid,
    ExtensionPublisherTypeId_Abbreviation_Invalid,
    ExtensionPublisherTypeId_Display_Builtin,
    ExtensionPublisherTypeId_Abbreviation_Builtin,
    ExtensionPublisherTypeId_Display_User,
    ExtensionPublisherTypeId_Abbreviation_User,
    ExtensionPublisherTypeId_Display_Organisation,
    ExtensionPublisherTypeId_Abbreviation_Organisation,
    ExtensionId_PersistableIsNotSpecified,
    ExtensionId_PublisherTypeIsNotSpecified,
    ExtensionId_PublisherTypeIsInvalid,
    ExtensionId_PublisherIsNotSpecified,
    ExtensionId_PublisherIsInvalid,
    ExtensionId_ExtensionNameIsNotSpecified,
    ExtensionId_ExtensionNameIsInvalid,
    DitemComponent_PersistableIsNotSpecified,
    DitemComponent_ConstructionMethodIsNotSpecified,
    DitemComponent_ConstructionMethodIsInvalid,
    DitemComponent_ComponentTypeIsNotSpecified,
    DitemComponent_ComponentTypeIsInvalid,
    ExtensionInfo_VersionIsNotSpecified,
    ExtensionInfo_VersionIsInvalid,
    ExtensionInfo_ApiVersionIsNotSpecified,
    ExtensionInfo_ApiVersionIsInvalid,
    ExtensionInfo_ShortDescriptionIsNotSpecified,
    ExtensionInfo_ShortDescriptionIsInvalid,
    ExtensionInfo_LongDescriptionIsNotSpecified,
    ExtensionInfo_LongDescriptionIsInvalid,
    ExtensionInfo_UrlPathIsNotSpecified,
    ExtensionInfo_UrlPathIsInvalid,
}

export namespace I18nStrings {
    // Languages
    const enum LanguageId {
        English
    }

    const DefaultLanguageId = LanguageId.English;

    interface Language {
        readonly id: LanguageId;
        readonly code: string;
    }

    const EnglishCode = 'en';

    const Languages: Language[] = [
        { id: LanguageId.English, code: EnglishCode },
    ];

    interface Translations {
        en: string;
    }

    interface Rec {
        readonly id: StringId;
        readonly translations: Translations;
    }

    type recsObject = { [id in keyof typeof StringId]: Rec };

    /* eslint-disable max-len */
    const recsObject: recsObject = {
        InternalError: {
            id: StringId.InternalError, translations: {
                en: 'Internal Error',
            }
        },
        PersistError: {
            id: StringId.PersistError, translations: {
                en: 'Persist Error',
            }
        },
        AssertInternalError: {
            id: StringId.AssertInternalError, translations: {
                en: 'Internal A Error',
            }
        },
        UndefinedVariableInternalError: {
            id: StringId.UndefinedVariableInternalError, translations: {
                en: 'Internal UV Error',
            }
        },
        TypeInternalError: {
            id: StringId.TypeInternalError, translations: {
                en: 'Internal T Error',
            }
        },
        UnreachableCaseInternalError: {
            id: StringId.UnreachableCaseInternalError, translations: {
                en: 'Internal URC Error',
            }
        },
        UnexpectedCaseInternalError: {
            id: StringId.UnexpectedCaseInternalError, translations: {
                en: 'Internal UEC Error',
            }
        },
        NotImplementedInternalError: {
            id: StringId.NotImplementedInternalError, translations: {
                en: 'Internal NI Error',
            }
        },
        UnexpectedTypeInternalError: {
            id: StringId.UnexpectedTypeInternalError, translations: {
                en: 'Internal UT Error',
            }
        },
        EnumInfoOutOfOrderInternalError: {
            id: StringId.EnumInfoOutOfOrderInternalError, translations: {
                en: 'Internal EO Error',
            }
        },
        ExternalError: {
            id: StringId.ExternalError, translations: {
                en: 'External Error',
            }
        },
        JsonLoadExternalError: {
            id: StringId.JsonLoadExternalError, translations: {
                en: 'Zenith JSON Error',
            }
        },
        ConfigExternalError: {
            id: StringId.ConfigExternalError, translations: {
                en: 'Configuration Error',
            }
        },
        DataExternalError: {
            id: StringId.DataExternalError, translations: {
                en: 'Data Error',
            }
        },
        FeedExternalError: {
            id: StringId.FeedExternalError, translations: {
                en: 'Feed Error',
            }
        },
        ZenithDataExternalError: {
            id: StringId.ZenithDataExternalError, translations: {
                en: 'Zenith Data Error',
            }
        },
        ZenithUnexpectedCaseExternalError: {
            id: StringId.ZenithUnexpectedCaseExternalError, translations: {
                en: 'Zenith UC Error',
            }
        },
        ZenithDataStateExternalError: {
            id: StringId.ZenithDataStateExternalError, translations: {
                en: 'Zenith Data State Error',
            }
        },
        MotifServicesExternalError: {
            id: StringId.MotifServicesExternalError, translations: {
                en: 'Motif Services Error',
            }
        },
        ExtensionExternalError: {
            id: StringId.ExtensionExternalError, translations: {
                en: 'Extension Error',
            }
        },
        ApiExternalError: {
            id: StringId.ApiExternalError, translations: {
                en: 'API Error',
            }
        },
        QueryParamExternalError: {
            id: StringId.QueryParamExternalError, translations: {
                en: 'Query Param Error',
            }
        },
        RangeError: {
            id: StringId.RangeError, translations: {
                en: 'range error: value',
            }
        },
        ArraySizeOverflow: {
            id: StringId.ArraySizeOverflow, translations: {
                en: 'array size overflow: value',
            }
        },
        ValueNotFound: {
            id: StringId.ValueNotFound, translations: {
                en: 'Value not found',
            }
        },
        Unknown: {
            id: StringId.Unknown, translations: {
                en: 'Unknown',
            }
        },
        UnknownDisplayString: {
            id: StringId.UnknownDisplayString, translations: {
                en: '???',
            }
        },
        Ok: {
            id: StringId.Ok, translations: {
                en: 'Ok',
            }
        },
        Cancel: {
            id: StringId.Cancel, translations: {
                en: 'Cancel',
            }
        },
        Yes: {
            id: StringId.Yes, translations: {
                en: 'yes',
            }
        },
        No: {
            id: StringId.No, translations: {
                en: 'no',
            }
        },
        True: {
            id: StringId.True, translations: {
                en: 'true',
            }
        },
        False: {
            id: StringId.False, translations: {
                en: 'false',
            }
        },
        Show: {
            id: StringId.Show, translations: {
                en: 'show',
            }
        },
        For: {
            id: StringId.For, translations: {
                en: 'for',
            }
        },
        On: {
            id: StringId.On, translations: {
                en: 'on',
            }
        },
        From: {
            id: StringId.From, translations: {
                en: 'from',
            }
        },
        To: {
            id: StringId.To, translations: {
                en: 'to',
            }
        },
        Not: {
            id: StringId.Not, translations: {
                en: 'Not',
            }
        },
        Blank: {
            id: StringId.Blank, translations: {
                en: 'Blank',
            }
        },
        // eslint-disable-next-line id-blacklist
        Undefined: {
            id: StringId.Undefined, translations: {
                en: 'Undefined',
            }
        },
        Visible: {
            id: StringId.Visible, translations: {
                en: 'Visible',
            }
        },
        Offline: {
            id: StringId.Offline, translations: {
                en: 'Offline',
            }
        },
        Online: {
            id: StringId.Online, translations: {
                en: 'Online',
            }
        },
        SignedOut: {
            id: StringId.SignedOut, translations: {
                en: 'Signed out',
            }
        },
        SignInAgain: {
            id: StringId.SignInAgain, translations: {
                en: 'Signed in again',
            }
        },
        Version: {
            id: StringId.Version, translations: {
                en: 'Version',
            }
        },
        Service: {
            id: StringId.Service, translations: {
                en: 'Service',
            }
        },
        Restart: {
            id: StringId.Restart, translations: {
                en: 'Restart',
            }
        },
        UnstableRestartRequired: {
            id: StringId.UnstableRestartRequired, translations: {
                en: 'Motif may be unstable! Click "Restart" to begin new session',
            }
        },
        StableRestartRequired: {
            id: StringId.StableRestartRequired, translations: {
                en: 'Restart required due to user action',
            }
        },
        ErrorCount: {
            id: StringId.ErrorCount, translations: {
                en: 'Error count',
            }
        },
        Hide: {
            id: StringId.Hide, translations: {
                en: 'Hide',
            }
        },
        CopyToClipboard: {
            id: StringId.CopyToClipboard, translations: {
                en: 'Copy to clipboard',
            }
        },
        InsufficientCharacters: {
            id: StringId.InsufficientCharacters, translations: {
                en: 'Insufficient Characters',
            }
        },
        CircularDependency: {
            id: StringId.CircularDependency, translations: {
                en: 'Circular Dependency',
            }
        },
        NotInitialised: {
            id: StringId.NotInitialised, translations: {
                en: 'Not Initialised',
            }
        },
        Missing: {
            id: StringId.Missing, translations: {
                en: 'Missing',
            }
        },
        Disabled: {
            id: StringId.Disabled, translations: {
                en: 'Disabled',
            }
        },
        Prerequisite: {
            id: StringId.Prerequisite, translations: {
                en: 'Prerequisite',
            }
        },
        Waiting: {
            id: StringId.Waiting, translations: {
                en: 'Waiting',
            }
        },
        Error: {
            id: StringId.Error, translations: {
                en: 'Error',
            }
        },
        NoErrors: {
            id: StringId.NoErrors, translations: {
                en: 'No Errors',
            }
        },
        Editing: {
            id: StringId.Editing, translations: {
                en: 'Editing',
            }
        },
        Invalid: {
            id: StringId.Invalid, translations: {
                en: 'Invalid',
            }
        },
        InvalidIntegerString: {
            id: StringId.InvalidIntegerString, translations: {
                en: 'Invalid integer string',
            }
        },
        UnsupportedValue: {
            id: StringId.UnsupportedValue, translations: {
                en: 'Unsupported Value',
            }
        },
        NotObject: {
            id: StringId.NotObject, translations: {
                en: 'Not Object',
            }
        },
        InvalidObject: {
            id: StringId.InvalidObject, translations: {
                en: 'Invalid Object',
            }
        },
        NotString: {
            id: StringId.NotString, translations: {
                en: 'Not String',
            }
        },
        InvalidString: {
            id: StringId.InvalidString, translations: {
                en: 'Invalid String',
            }
        },
        NotNumber: {
            id: StringId.NotNumber, translations: {
                en: 'Not Number',
            }
        },
        InvalidNumber: {
            id: StringId.InvalidNumber, translations: {
                en: 'Invalid Number',
            }
        },
        NotBoolean: {
            id: StringId.NotBoolean, translations: {
                en: 'Not Boolean',
            }
        },
        InvalidBoolean: {
            id: StringId.InvalidBoolean, translations: {
                en: 'Invalid Boolean',
            }
        },
        InvalidDate: {
            id: StringId.InvalidDate, translations: {
                en: 'Invalid Date',
            }
        },
        InvalidJsonObject: {
            id: StringId.InvalidJsonObject, translations: {
                en: 'Invalid JSON Object',
            }
        },
        InvalidJsonText: {
            id: StringId.InvalidJsonText, translations: {
                en: 'Invalid JSON Text',
            }
        },
        NotArray: {
            id: StringId.NotArray, translations: {
                en: 'Not Array',
            }
        },
        InvalidObjectArray: {
            id: StringId.InvalidObjectArray, translations: {
                en: 'Invalid Object Array',
            }
        },
        InvalidStringArray: {
            id: StringId.InvalidStringArray, translations: {
                en: 'Invalid String Array',
            }
        },
        InvalidNumberArray: {
            id: StringId.InvalidNumberArray, translations: {
                en: 'Invalid Number Array',
            }
        },
        InvalidBooleanArray: {
            id: StringId.InvalidBooleanArray, translations: {
                en: 'Invalid Boolean Array',
            }
        },
        InvalidJsonObjectArray: {
            id: StringId.InvalidJsonObjectArray, translations: {
                en: 'Invalid JSON Object Array',
            }
        },
        InvalidAnyJsonValueTypeArray: {
            id: StringId.InvalidAnyJsonValueTypeArray, translations: {
                en: 'Invalid AnyJsonValueType Array',
            }
        },
        DecimalNotJsonString: {
            id: StringId.DecimalNotJsonString, translations: {
                en: 'Decimal is not JSON string',
            }
        },
        InvalidDecimal: {
            id: StringId.InvalidDecimal, translations: {
                en: 'Invalid Decimal',
            }
        },
        IvemIdNotJsonString: {
            id: StringId.IvemIdNotJsonString, translations: {
                en: 'IvemId is not JSON string',
            }
        },
        InvalidIvemIdJson: {
            id: StringId.InvalidIvemIdJson, translations: {
                en: 'Invalid IvemId JSON',
            }
        },
        LitIvemIdNotJsonObject: {
            id: StringId.LitIvemIdNotJsonObject, translations: {
                en: 'LitIvemId is not JSON object',
            }
        },
        InvalidLitIvemIdJson: {
            id: StringId.InvalidLitIvemIdJson, translations: {
                en: 'Invalid LitIvemId JSON',
            }
        },
        UiEntryError: {
            id: StringId.UiEntryError, translations: {
                en: 'UI entry error',
            }
        },
        ValueRequired: {
            id: StringId.ValueRequired, translations: {
                en: 'Value required',
            }
        },
        CodeMissing: {
            id: StringId.CodeMissing, translations: {
                en: 'Code missing',
            }
        },
        SymbolSourceDoesNotHaveDefaultMarket: {
            id: StringId.SymbolSourceDoesNotHaveDefaultMarket, translations: {
                en: 'Exchange does not have a default market',
            }
        },
        MarketDoesNotSupportExchange: {
            id: StringId.MarketDoesNotSupportExchange, translations: {
                en: 'Market does not support Exchange',
            }
        },
        InvalidExchange: {
            id: StringId.InvalidExchange, translations: {
                en: 'Invalid Exchange',
            }
        },
        InvalidMarket: {
            id: StringId.InvalidMarket, translations: {
                en: 'Invalid Market',
            }
        },
        MarketCodeNotFoundInRic: {
            id: StringId.MarketCodeNotFoundInRic, translations: {
                en: 'Market code not found in RIC',
            }
        },
        CodeNotFoundInRic: {
            id: StringId.CodeNotFoundInRic, translations: {
                en: 'Security code not found in RIC',
            }
        },
        UnsupportedMarketCodeInRic: {
            id: StringId.UnsupportedMarketCodeInRic, translations: {
                en: 'Unsupport market code in RIC',
            }
        },
        AllBrokerageAccounts: {
            id: StringId.AllBrokerageAccounts, translations: {
                en: 'All Accounts',
            }
        },
        BrokerageAccountNotFound: {
            id: StringId.BrokerageAccountNotFound, translations: {
                en: 'Account not found',
            }
        },
        BrokerageAccountNotMatched: {
            id: StringId.BrokerageAccountNotMatched, translations: {
                en: 'Account not matched',
            }
        },
        TopShareholdersOnlySupportNzx: {
            id: StringId.TopShareholdersOnlySupportNzx, translations: {
                en: 'Top Shareholders only supports NZX',
            }
        },
        GroupOrdersByPriceLevel: {
            id: StringId.GroupOrdersByPriceLevel, translations: {
                en: 'Group Orders by Price Level',
            }
        },
        SessionEndedAsLoggedInElsewhere: {
            id: StringId.SessionEndedAsLoggedInElsewhere, translations: {
                en: 'Session ended as logged in elsewhere',
            }
        },
        MotifServicesResponseStatusError: {
            id: StringId.MotifServicesResponseStatusError, translations: {
                en: 'MotifServices Response Status Error',
            }
        },
        MotifServicesResponsePayloadError: {
            id: StringId.MotifServicesResponsePayloadError, translations: {
                en: 'MotifServices Response Payload Error',
            }
        },
        MotifServicesFetchError: {
            id: StringId.MotifServicesFetchError, translations: {
                en: 'MotifServices Fetch Error',
            }
        },
        InvalidFilterXrefs: {
            id: StringId.InvalidFilterXrefs, translations: {
                en: 'Invalid filter cross references',
            }
        },
        RollUpDepthCaption: {
            id: StringId.RollUpDepthCaption, translations: {
                en: 'Roll up',
            }
        },
        RollUpDepthToPriceLevelsTitle: {
            id: StringId.RollUpDepthToPriceLevelsTitle, translations: {
                en: 'Roll up to price levels\nHold shift to only roll up new price levels',
            }
        },
        ExpandDepthCaption: {
            id: StringId.ExpandDepthCaption, translations: {
                en: 'Expand',
            }
        },
        ExpandDepthToOrdersTitle: {
            id: StringId.ExpandDepthToOrdersTitle, translations: {
                en: 'Expand to orders\nHold shift to only expand new price levels to orders',
            }
        },
        FilterDepthCaption: {
            id: StringId.FilterDepthCaption, translations: {
                en: 'Filter',
            }
        },
        FilterDepthToXrefsTitle: {
            id: StringId.FilterDepthToXrefsTitle, translations: {
                en: 'Only show price levels and orders with specified cross references',
            }
        },
        SpecifyDepthFilterXrefsTitle: {
            id: StringId.SpecifyDepthFilterXrefsTitle, translations: {
                en: 'Filtered in cross references (separate with commas)\nLeave empty to show all cross references',
            }
        },
        BidDepth: {
            id: StringId.BidDepth, translations: {
                en: 'Bid Depth',
            }
        },
        AskDepth: {
            id: StringId.AskDepth, translations: {
                en: 'Ask Depth',
            }
        },
        KickedOff: {
            id: StringId.KickedOff, translations: {
                en: 'Kicked Off',
            }
        },
        NotReadable: {
            id: StringId.NotReadable, translations: {
                en: 'Not readable',
            }
        },
        PriceRemainder: {
            id: StringId.PriceRemainder, translations: {
                en: 'rem',
            }
        },
        Query: {
            id: StringId.Query, translations: {
                en: 'Query',
            }
        },
        Subscribe: {
            id: StringId.Subscribe, translations: {
                en: 'Subscribe',
            }
        },
        Subscription: {
            id: StringId.Subscription, translations: {
                en: 'Subscription',
            }
        },
        Fields: {
            id: StringId.Fields, translations: {
                en: 'Fields',
            }
        },
        Source: {
            id: StringId.Source, translations: {
                en: 'Source',
            }
        },
        Exchange: {
            id: StringId.Exchange, translations: {
                en: 'Exchange',
            }
        },
        Market: {
            id: StringId.Market, translations: {
                en: 'Market',
            }
        },
        Markets: {
            id: StringId.Markets, translations: {
                en: 'Markets',
            }
        },
        ServerInformation: {
            id: StringId.ServerInformation, translations: {
                en: 'Server Info',
            }
        },
        Class: {
            id: StringId.Class, translations: {
                en: 'Class',
            }
        },
        Cfi: {
            id: StringId.Cfi, translations: {
                en: 'CFI',
            }
        },
        Partial: {
            id: StringId.Partial, translations: {
                en: 'Partial',
            }
        },
        Exact: {
            id: StringId.Exact, translations: {
                en: 'Exact',
            }
        },
        Full: {
            id: StringId.Full, translations: {
                en: 'Full',
            }
        },
        Options: {
            id: StringId.Options, translations: {
                en: 'Options',
            }
        },
        Page: {
            id: StringId.Page, translations: {
                en: 'Page',
            }
        },
        Of: {
            id: StringId.Of, translations: {
                en: 'of',
            }
        },
        Seconds: {
            id: StringId.Seconds, translations: {
                en: 'seconds',
            }
        },
        Watchlist: {
            id: StringId.Watchlist, translations: {
                en: 'Watchlist',
            }
        },
        Trades: {
            id: StringId.Trades, translations: {
                en: 'Trades',
            }
        },
        Trading: {
            id: StringId.Trading, translations: {
                en: 'Trading',
            }
        },
        NoTable: {
            id: StringId.NoTable, translations: {
                en: 'No Watchlist',
            }
        },
        DeleteWatchlist: {
            id: StringId.DeleteWatchlist, translations: {
                en: 'Delete Watchlist',
            }
        },
        CannotDeleteWatchlist: {
            id: StringId.CannotDeleteWatchlist, translations: {
                en: 'Cannot delete Watchlist',
            }
        },
        CannotDeletePrivateList: {
            id: StringId.CannotDeletePrivateList, translations: {
                en: 'Cannot delete private list',
            }
        },
        CannotDeleteBuiltinList: {
            id: StringId.CannotDeleteBuiltinList, translations: {
                en: 'Cannot delete builtin list',
            }
        },
        DeleteList: {
            id: StringId.DeleteList, translations: {
                en: 'Delete list',
            }
        },
        CannotDeleteList: {
            id: StringId.CannotDeleteList, translations: {
                en: 'Cannot delete list',
            }
        },
        TableJsonMissingFieldlist: {
            id: StringId.TableJsonMissingFieldlist, translations: {
                en: 'Table JSON Missing Field List',
            }
        },
        List: {
            id: StringId.List, translations: {
                en: 'List',
            }
        },
        None: {
            id: StringId.None, translations: {
                en: 'None',
            }
        },
        QuestionMark: {
            id: StringId.QuestionMark, translations: {
                en: '?',
            }
        },
        New: {
            id: StringId.New, translations: {
                en: 'New',
            }
        },
        Private: {
            id: StringId.Private, translations: {
                en: 'Private',
            }
        },
        Shared: {
            id: StringId.Shared, translations: {
                en: 'Shared',
            }
        },
        Unnamed: {
            id: StringId.Unnamed, translations: {
                en: 'Unnamed',
            }
        },
        Index: {
            id: StringId.Index, translations: {
                en: 'Index',
            }
        },
        Undisclosed: {
            id: StringId.Undisclosed, translations: {
                en: 'Undisclosed',
            }
        },
        Physical: {
            id: StringId.Physical, translations: {
                en: 'Physical',
            }
        },
        ExecuteCommandTitle: {
            id: StringId.ExecuteCommandTitle, translations: {
                en: 'Execute Command'
            }
        },
        ApplySymbolCaption: {
            id: StringId.ApplySymbolCaption, translations: {
                en: 'Apply symbol',
            }
        },
        ApplySymbolTitle: {
            id: StringId.ApplySymbolTitle, translations: {
                en: 'Apply symbol',
            }
        },
        SelectColumnsCaption: {
            id: StringId.SelectColumnsCaption, translations: {
                en: 'Select Columns',
            }
        },
        SelectColumnsTitle: {
            id: StringId.SelectColumnsTitle, translations: {
                en: 'Select Columns',
            }
        },
        AutoSizeColumnWidthsCaption: {
            id: StringId.AutoSizeColumnWidthsCaption, translations: {
                en: 'Column widths',
            }
        },
        AutoSizeColumnWidthsTitle: {
            id: StringId.AutoSizeColumnWidthsTitle, translations: {
                en: 'Auto size column widths (Hold down shift to widen only)',
            }
        },
        SymbolEditTitle: {
            id: StringId.SymbolEditTitle, translations: {
                en: 'Enter symbol',
            }
        },
        ToggleSearchTermNotExchangedMarketProcessedCaption: {
            id: StringId.ToggleSearchTermNotExchangedMarketProcessedCaption, translations: {
                en: 'No exchange/market processing'
            }
        },
        ToggleSearchTermNotExchangedMarketProcessedTitle: {
            id: StringId.ToggleSearchTermNotExchangedMarketProcessedTitle, translations: {
                en: 'Toggle search term does not include exchange or market'
            }
        },
        SelectAccountTitle: {
            id: StringId.SelectAccountTitle, translations: {
                en: 'Select account',
            }
        },
        ToggleSymbolLinkingCaption: {
            id: StringId.ToggleSymbolLinkingCaption, translations: {
                en: 'Symbol link',
            }
        },
        ToggleSymbolLinkingTitle: {
            id: StringId.ToggleSymbolLinkingTitle, translations: {
                en: 'Toggle symbol linking',
            }
        },
        ToggleAccountLinkingCaption: {
            id: StringId.ToggleAccountLinkingCaption, translations: {
                en: 'Account link',
            }
        },
        ToggleAccountLinkingTitle: {
            id: StringId.ToggleAccountLinkingTitle, translations: {
                en: 'Toggle account linking',
            }
        },
        BuyOrderPadCaption: {
            id: StringId.BuyOrderPadCaption, translations: {
                en: 'Buy ...',
            }
        },
        BuyOrderPadTitle: {
            id: StringId.BuyOrderPadTitle, translations: {
                en: 'Display a buy order pad',
            }
        },
        SellOrderPadCaption: {
            id: StringId.SellOrderPadCaption, translations: {
                en: 'Sell ...',
            }
        },
        SellOrderPadTitle: {
            id: StringId.SellOrderPadTitle, translations: {
                en: 'Display a sell order pad',
            }
        },
        AmendOrderPadCaption: {
            id: StringId.AmendOrderPadCaption, translations: {
                en: 'Amend ...',
            }
        },
        AmendOrderPadTitle: {
            id: StringId.AmendOrderPadTitle, translations: {
                en: 'Display an amend order pad for focused order',
            }
        },
        CancelOrderPadCaption: {
            id: StringId.CancelOrderPadCaption, translations: {
                en: 'Cancel ...',
            }
        },
        CancelOrderPadTitle: {
            id: StringId.CancelOrderPadTitle, translations: {
                en: 'Display a cancel order pad for focused order',
            }
        },
        MoveOrderPadCaption: {
            id: StringId.MoveOrderPadCaption, translations: {
                en: 'Move ...',
            }
        },
        MoveOrderPadTitle: {
            id: StringId.MoveOrderPadTitle, translations: {
                en: 'Display a move order pad for focused order',
            }
        },
        BackgroundColor: {
            id: StringId.BackgroundColor, translations: {
                en: 'Background Color',
            }
        },
        ForegroundColor: {
            id: StringId.ForegroundColor, translations: {
                en: 'Foreground Color',
            }
        },
        OpenColorSchemeTitle: {
            id: StringId.OpenColorSchemeTitle, translations: {
                en: 'Open another color scheme',
            }
        },
        SaveColorSchemeCaption: {
            id: StringId.SaveColorSchemeCaption, translations: {
                en: 'Save color scheme',
            }
        },
        SaveColorSchemeToADifferentNameTitle: {
            id: StringId.SaveColorSchemeToADifferentNameTitle, translations: {
                en: 'Save color scheme to another name.',
            }
        },
        ManageColorSchemesTitle: {
            id: StringId.ManageColorSchemesTitle, translations: {
                en: 'Manage all color schemes',
            }
        },
        BrokerageAccountIdInputPlaceholderText: {
            id: StringId.BrokerageAccountIdInputPlaceholderText, translations: {
                en: 'Account',
            }
        },
        FeedHeadingPrefix: {
            id: StringId.FeedHeadingPrefix, translations: {
                en: 'Feed ',
            }
        },
        TypingPauseWaiting: {
            id: StringId.TypingPauseWaiting, translations: {
                en: 'Waiting for typing pause',
            }
        },
        SearchRequiresAtLeast: {
            id: StringId.SearchRequiresAtLeast, translations: {
                en: 'Search requires at least',
            }
        },
        Characters: {
            id: StringId.Characters, translations: {
                en: 'characters',
            }
        },
        InvalidSymbol: {
            id: StringId.InvalidSymbol, translations: {
                en: 'Invalid symbol',
            }
        },
        FetchingSymbolDetails: {
            id: StringId.FetchingSymbolDetails, translations: {
                en: 'Fetching symbol details',
            }
        },
        SymbolNotFound: {
            id: StringId.SymbolNotFound, translations: {
                en: 'Symbol not found',
            }
        },
        NoMatchingSymbolsOrNamesFound: {
            id: StringId.NoMatchingSymbolsOrNamesFound, translations: {
                en: 'No matching symbols or names found',
            }
        },
        Layout_InvalidJson: {
            id: StringId.Layout_InvalidJson, translations: {
                en: 'Invalid Json',
            }
        },
        Layout_SchemaNotDefinedLoadingDefault: {
            id: StringId.Layout_SchemaNotDefinedLoadingDefault, translations: {
                en: 'Layout schema not defined. Loading default',
            }
        },
        Layout_SchemaIncompatibleLoadingDefault: {
            id: StringId.Layout_SchemaIncompatibleLoadingDefault, translations: {
                en: 'Incompatible layout schema. Loading default',
            }
        },
        Layout_GoldenNotDefinedLoadingDefault: {
            id: StringId.Layout_GoldenNotDefinedLoadingDefault, translations: {
                en: 'Layout golden not defined. Loading default',
            }
        },
        SecurityFieldDisplay_Symbol: {
            id: StringId.SecurityFieldDisplay_Symbol, translations: {
                en: 'Symbol',
            }
        },
        SecurityFieldHeading_Symbol: {
            id: StringId.SecurityFieldHeading_Symbol, translations: {
                en: 'Symbol',
            }
        },
        SecurityFieldDisplay_Code: {
            id: StringId.SecurityFieldDisplay_Code, translations: {
                en: 'Code',
            }
        },
        SecurityFieldHeading_Code: {
            id: StringId.SecurityFieldHeading_Code, translations: {
                en: 'Code',
            }
        },
        SecurityFieldDisplay_Market: {
            id: StringId.SecurityFieldDisplay_Market, translations: {
                en: 'Market',
            }
        },
        SecurityFieldHeading_Market: {
            id: StringId.SecurityFieldHeading_Market, translations: {
                en: 'Market',
            }
        },
        SecurityFieldDisplay_Exchange: {
            id: StringId.SecurityFieldDisplay_Exchange, translations: {
                en: 'Exchange',
            }
        },
        SecurityFieldHeading_Exchange: {
            id: StringId.SecurityFieldHeading_Exchange, translations: {
                en: 'Exchange',
            }
        },
        SecurityFieldDisplay_Name: {
            id: StringId.SecurityFieldDisplay_Name, translations: {
                en: 'Name',
            }
        },
        SecurityFieldHeading_Name: {
            id: StringId.SecurityFieldHeading_Name, translations: {
                en: 'Name',
            }
        },
        SecurityFieldDisplay_Class: {
            id: StringId.SecurityFieldDisplay_Class, translations: {
                en: 'Class',
            }
        },
        SecurityFieldHeading_Class: {
            id: StringId.SecurityFieldHeading_Class, translations: {
                en: 'Class',
            }
        },
        SecurityFieldDisplay_Cfi: {
            id: StringId.SecurityFieldDisplay_Cfi, translations: {
                en: 'CFI',
            }
        },
        SecurityFieldHeading_Cfi: {
            id: StringId.SecurityFieldHeading_Cfi, translations: {
                en: 'CFI',
            }
        },
        SecurityFieldDisplay_TradingState: {
            id: StringId.SecurityFieldDisplay_TradingState, translations: {
                en: 'Trading State',
            }
        },
        SecurityFieldHeading_TradingState: {
            id: StringId.SecurityFieldHeading_TradingState, translations: {
                en: 'State',
            }
        },
        SecurityFieldDisplay_TradingStateAllows: {
            id: StringId.SecurityFieldDisplay_TradingStateAllows, translations: {
                en: 'Trading State Allows',
            }
        },
        SecurityFieldHeading_TradingStateAllows: {
            id: StringId.SecurityFieldHeading_TradingStateAllows, translations: {
                en: 'State Allows',
            }
        },
        SecurityFieldDisplay_TradingStateReason: {
            id: StringId.SecurityFieldDisplay_TradingStateReason, translations: {
                en: 'Trading State Reason',
            }
        },
        SecurityFieldHeading_TradingStateReason: {
            id: StringId.SecurityFieldHeading_TradingStateReason, translations: {
                en: 'State Reason',
            }
        },
        SecurityFieldDisplay_TradingMarkets: {
            id: StringId.SecurityFieldDisplay_TradingMarkets, translations: {
                en: 'Trading Markets',
            }
        },
        SecurityFieldHeading_TradingMarkets: {
            id: StringId.SecurityFieldHeading_TradingMarkets, translations: {
                en: 'TradingMarkets',
            }
        },
        SecurityFieldDisplay_IsIndex: {
            id: StringId.SecurityFieldDisplay_IsIndex, translations: {
                en: 'Is Index',
            }
        },
        SecurityFieldHeading_IsIndex: {
            id: StringId.SecurityFieldHeading_IsIndex, translations: {
                en: 'IsIndex',
            }
        },
        SecurityFieldDisplay_ExpiryDate: {
            id: StringId.SecurityFieldDisplay_ExpiryDate, translations: {
                en: 'Expiry Date',
            }
        },
        SecurityFieldHeading_ExpiryDate: {
            id: StringId.SecurityFieldHeading_ExpiryDate, translations: {
                en: 'Expiry',
            }
        },
        SecurityFieldDisplay_StrikePrice: {
            id: StringId.SecurityFieldDisplay_StrikePrice, translations: {
                en: 'Strike Price',
            }
        },
        SecurityFieldHeading_StrikePrice: {
            id: StringId.SecurityFieldHeading_StrikePrice, translations: {
                en: 'StrikePrice',
            }
        },
        SecurityFieldDisplay_CallOrPut: {
            id: StringId.SecurityFieldDisplay_CallOrPut, translations: {
                en: 'Call/Put',
            }
        },
        SecurityFieldHeading_CallOrPut: {
            id: StringId.SecurityFieldHeading_CallOrPut, translations: {
                en: 'C/P',
            }
        },
        SecurityFieldDisplay_ContractSize: {
            id: StringId.SecurityFieldDisplay_ContractSize, translations: {
                en: 'Contract Size',
            }
        },
        SecurityFieldHeading_ContractSize: {
            id: StringId.SecurityFieldHeading_ContractSize, translations: {
                en: 'Contract Size',
            }
        },
        SecurityFieldDisplay_SubscriptionData: {
            id: StringId.SecurityFieldDisplay_SubscriptionData, translations: {
                en: 'Subscription Data',
            }
        },
        SecurityFieldHeading_SubscriptionData: {
            id: StringId.SecurityFieldHeading_SubscriptionData, translations: {
                en: 'SubscriptionData',
            }
        },
        SecurityFieldDisplay_QuotationBasis: {
            id: StringId.SecurityFieldDisplay_QuotationBasis, translations: {
                en: 'Quotation Basis',
            }
        },
        SecurityFieldHeading_QuotationBasis: {
            id: StringId.SecurityFieldHeading_QuotationBasis, translations: {
                en: 'Basis',
            }
        },
        SecurityFieldDisplay_Open: {
            id: StringId.SecurityFieldDisplay_Open, translations: {
                en: 'Open',
            }
        },
        SecurityFieldHeading_Open: {
            id: StringId.SecurityFieldHeading_Open, translations: {
                en: 'Open',
            }
        },
        SecurityFieldDisplay_High: {
            id: StringId.SecurityFieldDisplay_High, translations: {
                en: 'High',
            }
        },
        SecurityFieldHeading_High: {
            id: StringId.SecurityFieldHeading_High, translations: {
                en: 'High',
            }
        },
        SecurityFieldDisplay_Low: {
            id: StringId.SecurityFieldDisplay_Low, translations: {
                en: 'Low',
            }
        },
        SecurityFieldHeading_Low: {
            id: StringId.SecurityFieldHeading_Low, translations: {
                en: 'Low',
            }
        },
        SecurityFieldDisplay_Close: {
            id: StringId.SecurityFieldDisplay_Close, translations: {
                en: 'Close',
            }
        },
        SecurityFieldHeading_Close: {
            id: StringId.SecurityFieldHeading_Close, translations: {
                en: 'Close',
            }
        },
        SecurityFieldDisplay_Settlement: {
            id: StringId.SecurityFieldDisplay_Settlement, translations: {
                en: 'Settlement',
            }
        },
        SecurityFieldHeading_Settlement: {
            id: StringId.SecurityFieldHeading_Settlement, translations: {
                en: 'Settlement',
            }
        },
        SecurityFieldDisplay_Last: {
            id: StringId.SecurityFieldDisplay_Last, translations: {
                en: 'Last',
            }
        },
        SecurityFieldHeading_Last: {
            id: StringId.SecurityFieldHeading_Last, translations: {
                en: 'Last',
            }
        },
        SecurityFieldDisplay_Trend: {
            id: StringId.SecurityFieldDisplay_Trend, translations: {
                en: 'Trend',
            }
        },
        SecurityFieldHeading_Trend: {
            id: StringId.SecurityFieldHeading_Trend, translations: {
                en: 'Trend',
            }
        },
        SecurityFieldDisplay_BestAsk: {
            id: StringId.SecurityFieldDisplay_BestAsk, translations: {
                en: 'Best Ask',
            }
        },
        SecurityFieldHeading_BestAsk: {
            id: StringId.SecurityFieldHeading_BestAsk, translations: {
                en: 'Ask',
            }
        },
        SecurityFieldDisplay_AskCount: {
            id: StringId.SecurityFieldDisplay_AskCount, translations: {
                en: 'Ask Count',
            }
        },
        SecurityFieldHeading_AskCount: {
            id: StringId.SecurityFieldHeading_AskCount, translations: {
                en: 'Ask Count',
            }
        },
        SecurityFieldDisplay_AskQuantity: {
            id: StringId.SecurityFieldDisplay_AskQuantity, translations: {
                en: 'Ask Quantity',
            }
        },
        SecurityFieldHeading_AskQuantity: {
            id: StringId.SecurityFieldHeading_AskQuantity, translations: {
                en: 'Ask Quantity',
            }
        },
        SecurityFieldDisplay_AskUndisclosed: {
            id: StringId.SecurityFieldDisplay_AskUndisclosed, translations: {
                en: 'Ask Undisclosed',
            }
        },
        SecurityFieldHeading_AskUndisclosed: {
            id: StringId.SecurityFieldHeading_AskUndisclosed, translations: {
                en: 'Ask Undisclosed',
            }
        },
        SecurityFieldDisplay_BestBid: {
            id: StringId.SecurityFieldDisplay_BestBid, translations: {
                en: 'Best Bid',
            }
        },
        SecurityFieldHeading_BestBid: {
            id: StringId.SecurityFieldHeading_BestBid, translations: {
                en: 'Bid',
            }
        },
        SecurityFieldDisplay_BidCount: {
            id: StringId.SecurityFieldDisplay_BidCount, translations: {
                en: 'Bid Count',
            }
        },
        SecurityFieldHeading_BidCount: {
            id: StringId.SecurityFieldHeading_BidCount, translations: {
                en: 'Bid Count',
            }
        },
        SecurityFieldDisplay_BidQuantity: {
            id: StringId.SecurityFieldDisplay_BidQuantity, translations: {
                en: 'Bid Quantity',
            }
        },
        SecurityFieldHeading_BidQuantity: {
            id: StringId.SecurityFieldHeading_BidQuantity, translations: {
                en: 'Bid Quantity',
            }
        },
        SecurityFieldDisplay_BidUndisclosed: {
            id: StringId.SecurityFieldDisplay_BidUndisclosed, translations: {
                en: 'Bid Undisclosed',
            }
        },
        SecurityFieldHeading_BidUndisclosed: {
            id: StringId.SecurityFieldHeading_BidUndisclosed, translations: {
                en: 'Bid Undisclosed',
            }
        },
        SecurityFieldDisplay_NumberOfTrades: {
            id: StringId.SecurityFieldDisplay_NumberOfTrades, translations: {
                en: 'Number of Trades',
            }
        },
        SecurityFieldHeading_NumberOfTrades: {
            id: StringId.SecurityFieldHeading_NumberOfTrades, translations: {
                en: 'Trades',
            }
        },
        SecurityFieldDisplay_Volume: {
            id: StringId.SecurityFieldDisplay_Volume, translations: {
                en: 'Volume',
            }
        },
        SecurityFieldHeading_Volume: {
            id: StringId.SecurityFieldHeading_Volume, translations: {
                en: 'Volume',
            }
        },
        SecurityFieldDisplay_AuctionPrice: {
            id: StringId.SecurityFieldDisplay_AuctionPrice, translations: {
                en: 'Auction Price',
            }
        },
        SecurityFieldHeading_AuctionPrice: {
            id: StringId.SecurityFieldHeading_AuctionPrice, translations: {
                en: 'Auction',
            }
        },
        SecurityFieldDisplay_AuctionQuantity: {
            id: StringId.SecurityFieldDisplay_AuctionQuantity, translations: {
                en: 'Auction Quantity',
            }
        },
        SecurityFieldHeading_AuctionQuantity: {
            id: StringId.SecurityFieldHeading_AuctionQuantity, translations: {
                en: 'Auction Quantity',
            }
        },
        SecurityFieldDisplay_AuctionRemainder: {
            id: StringId.SecurityFieldDisplay_AuctionRemainder, translations: {
                en: 'Auction Remainder',
            }
        },
        SecurityFieldHeading_AuctionRemainder: {
            id: StringId.SecurityFieldHeading_AuctionRemainder, translations: {
                en: 'Auction Remainder',
            }
        },
        SecurityFieldDisplay_VWAP: {
            id: StringId.SecurityFieldDisplay_VWAP, translations: {
                en: 'VWAP',
            }
        },
        SecurityFieldHeading_VWAP: {
            id: StringId.SecurityFieldHeading_VWAP, translations: {
                en: 'VWAP',
            }
        },
        SecurityFieldDisplay_ValueTraded: {
            id: StringId.SecurityFieldDisplay_ValueTraded, translations: {
                en: 'Value Traded',
            }
        },
        SecurityFieldHeading_ValueTraded: {
            id: StringId.SecurityFieldHeading_ValueTraded, translations: {
                en: 'Value Traded',
            }
        },
        SecurityFieldDisplay_OpenInterest: {
            id: StringId.SecurityFieldDisplay_OpenInterest, translations: {
                en: 'Open Interest',
            }
        },
        SecurityFieldHeading_OpenInterest: {
            id: StringId.SecurityFieldHeading_OpenInterest, translations: {
                en: 'OI',
            }
        },
        SecurityFieldDisplay_ShareIssue: {
            id: StringId.SecurityFieldDisplay_ShareIssue, translations: {
                en: 'Share Issue',
            }
        },
        SecurityFieldHeading_ShareIssue: {
            id: StringId.SecurityFieldHeading_ShareIssue, translations: {
                en: 'Share Issue',
            }
        },
        SecurityFieldDisplay_StatusNote: {
            id: StringId.SecurityFieldDisplay_StatusNote, translations: {
                en: 'Status Note',
            }
        },
        SecurityFieldHeading_StatusNote: {
            id: StringId.SecurityFieldHeading_StatusNote, translations: {
                en: 'Status Note',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_Null: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_Null, translations: {
                en: 'Null',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_Null: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_Null, translations: {
                en: 'Nul',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_Symbol: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_Symbol, translations: {
                en: 'Symbol',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_Symbol: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_Symbol, translations: {
                en: 'Sym',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_Portfolio: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_Portfolio, translations: {
                en: 'Portfolio',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_Portfolio: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_Portfolio, translations: {
                en: 'Ptf',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_Group: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_Group, translations: {
                en: 'Group',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_Group: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_Group, translations: {
                en: 'Grp',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_MarketMovers: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_MarketMovers, translations: {
                en: 'Market Movers',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_MarketMovers: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_MarketMovers, translations: {
                en: 'MMv',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_IvemIdServer: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_IvemIdServer, translations: {
                en: 'Symbol Server',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_IvemIdServer: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_IvemIdServer, translations: {
                en: 'SSv',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_Gics: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_Gics, translations: {
                en: 'GICS',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_Gics: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_Gics, translations: {
                en: 'Gic',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_ProfitIvemHolding: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_ProfitIvemHolding, translations: {
                en: 'Symbol Holding',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_ProfitIvemHolding: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_ProfitIvemHolding, translations: {
                en: 'SHd',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_CashItemHolding: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_CashItemHolding, translations: {
                en: 'Cash Holding',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_CashItemHolding: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_CashItemHolding, translations: {
                en: 'CHd',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_IntradayProfitLossSymbolRec: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_IntradayProfitLossSymbolRec, translations: {
                en: 'Profit/Loss',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_IntradayProfitLossSymbolRec: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_IntradayProfitLossSymbolRec, translations: {
                en: 'Ipl',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_TmcDefinitionLegs: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_TmcDefinitionLegs, translations: {
                en: 'TMC Definition Legs',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_TmcDefinitionLegs: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_TmcDefinitionLegs, translations: {
                en: 'TDL',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_TmcLeg: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_TmcLeg, translations: {
                en: 'TMC Legs',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_TmcLeg: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_TmcLeg, translations: {
                en: 'TLg',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_TmcWithLegMatchingUnderlying: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_TmcWithLegMatchingUnderlying, translations: {
                en: 'TMC with Leg matching underlying',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_TmcWithLegMatchingUnderlying: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_TmcWithLegMatchingUnderlying, translations: {
                en: 'TLU',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_EtoMatchingUnderlyingCallPut: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_EtoMatchingUnderlyingCallPut, translations: {
                en: 'ETO matching underlying',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_EtoMatchingUnderlyingCallPut: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_EtoMatchingUnderlyingCallPut, translations: {
                en: 'EMU',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_HoldingAccountPortfolio: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_HoldingAccountPortfolio, translations: {
                en: 'Holding Account Portfolio',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_HoldingAccountPortfolio: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_HoldingAccountPortfolio, translations: {
                en: 'HAP',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_Feed: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_Feed, translations: {
                en: 'Feed',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_Feed: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_Feed, translations: {
                en: 'FD',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_BrokerageAccount: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_BrokerageAccount, translations: {
                en: 'Brokerage Account',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_BrokerageAccount: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_BrokerageAccount, translations: {
                en: 'BAC',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_Order: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_Order, translations: {
                en: 'Order',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_Order: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_Order, translations: {
                en: 'Odr',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_Holding: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_Holding, translations: {
                en: 'Holding',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_Holding: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_Holding, translations: {
                en: 'Hld',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_Balances: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_Balances, translations: {
                en: 'Account Currency Balances',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_Balances: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_Balances, translations: {
                en: 'ACB',
            }
        },
        TableRecordDefinitionList_ListTypeDisplay_TopShareholder: {
            id: StringId.TableRecordDefinitionList_ListTypeDisplay_TopShareholder, translations: {
                en: 'TopShareholder',
            }
        },
        TableRecordDefinitionList_ListTypeAbbr_TopShareholder: {
            id: StringId.TableRecordDefinitionList_ListTypeAbbr_TopShareholder, translations: {
                en: 'Tsh',
            }
        },
        ExchangeAbbreviatedDisplay_Asx: {
            id: StringId.ExchangeAbbreviatedDisplay_Asx, translations: {
                en: 'ASX',
            }
        },
        ExchangeFullDisplay_Asx: {
            id: StringId.ExchangeFullDisplay_Asx, translations: {
                en: 'Australian Stock Exchange',
            }
        },
        ExchangeAbbreviatedDisplay_Cxa: {
            id: StringId.ExchangeAbbreviatedDisplay_Cxa, translations: {
                en: 'CXA',
            }
        },
        ExchangeFullDisplay_Cxa: {
            id: StringId.ExchangeFullDisplay_Cxa, translations: {
                en: 'Chi-X Australia',
            }
        },
        ExchangeAbbreviatedDisplay_Nsx: {
            id: StringId.ExchangeAbbreviatedDisplay_Nsx, translations: {
                en: 'NSX',
            }
        },
        ExchangeFullDisplay_Nsx: {
            id: StringId.ExchangeFullDisplay_Nsx, translations: {
                en: 'Australian National Stock Exchange',
            }
        },
        ExchangeAbbreviatedDisplay_Nzx: {
            id: StringId.ExchangeAbbreviatedDisplay_Nzx, translations: {
                en: 'NZX',
            }
        },
        ExchangeFullDisplay_Nzx: {
            id: StringId.ExchangeFullDisplay_Nzx, translations: {
                en: 'New Zealand Stock Exchange',
            }
        },
        ExchangeAbbreviatedDisplay_Calastone: {
            id: StringId.ExchangeAbbreviatedDisplay_Calastone, translations: {
                en: 'Calastone',
            }
        },
        ExchangeFullDisplay_Calastone: {
            id: StringId.ExchangeFullDisplay_Calastone, translations: {
                en: 'Calastone',
            }
        },
        ExchangeAbbreviatedDisplay_Ptx: {
            id: StringId.ExchangeAbbreviatedDisplay_Ptx, translations: {
                en: 'PTX',
            }
        },
        ExchangeFullDisplay_Ptx: {
            id: StringId.ExchangeFullDisplay_Ptx, translations: {
                en: 'PTX',
            }
        },
        ExchangeAbbreviatedDisplay_Fnsx: {
            id: StringId.ExchangeAbbreviatedDisplay_Fnsx, translations: {
                en: 'FNSX',
            }
        },
        ExchangeFullDisplay_Fnsx: {
            id: StringId.ExchangeFullDisplay_Fnsx, translations: {
                en: 'First Nations Stock Exchange',
            }
        },
        ExchangeAbbreviatedDisplay_Myx: {
            id: StringId.ExchangeAbbreviatedDisplay_Myx, translations: {
                en: 'MYX',
            }
        },
        ExchangeFullDisplay_Myx: {
            id: StringId.ExchangeFullDisplay_Myx, translations: {
                en: 'Bursa Stock Exchange',
            }
        },
        ExchangeAbbreviatedDisplay_AsxCxa: {
            id: StringId.ExchangeAbbreviatedDisplay_AsxCxa, translations: {
                en: 'ASX+CXA',
            }
        },
        ExchangeFullDisplay_AsxCxa: {
            id: StringId.ExchangeFullDisplay_AsxCxa, translations: {
                en: 'ASX+CXA',
            }
        },
        ExchangeEnvironmentDisplay_Production: {
            id: StringId.ExchangeEnvironmentDisplay_Production, translations: {
                en: 'Production',
            }
        },
        ExchangeEnvironmentDisplay_DelayedProduction: {
            id: StringId.ExchangeEnvironmentDisplay_DelayedProduction, translations: {
                en: 'Delayed',
            }
        },
        ExchangeEnvironmentDisplay_Demo: {
            id: StringId.ExchangeEnvironmentDisplay_Demo, translations: {
                en: 'Demo',
            }
        },
        FeedDisplay_Null: {
            id: StringId.FeedDisplay_Null, translations: {
                en: 'Null',
            }
        },
        FeedDisplay_Authority_Trading: {
            id: StringId.FeedDisplay_Authority_Trading, translations: {
                en: 'Trading Authority',
            }
        },
        FeedDisplay_Authority_Watchlist: {
            id: StringId.FeedDisplay_Authority_Watchlist, translations: {
                en: 'Watchlist Authority',
            }
        },
        FeedDisplay_Trading_Motif: {
            id: StringId.FeedDisplay_Trading_Motif, translations: {
                en: 'Motif Trading',
            }
        },
        FeedDisplay_Trading_Malacca: {
            id: StringId.FeedDisplay_Trading_Malacca, translations: {
                en: 'Malacca Trading',
            }
        },
        FeedDisplay_Market_AsxBookBuild: {
            id: StringId.FeedDisplay_Market_AsxBookBuild, translations: {
                en: 'ASX Book Build',
            }
        },
        FeedDisplay_Market_AsxPureMatch: {
            id: StringId.FeedDisplay_Market_AsxPureMatch, translations: {
                en: 'ASX PureMatch',
            }
        },
        FeedDisplay_Market_AsxTradeMatch: {
            id: StringId.FeedDisplay_Market_AsxTradeMatch, translations: {
                en: 'ASX TradeMatch',
            }
        },
        FeedDisplay_Market_AsxCentrePoint: {
            id: StringId.FeedDisplay_Market_AsxCentrePoint, translations: {
                en: 'ASX CentrePoint',
            }
        },
        FeedDisplay_Market_AsxVolumeMatch: {
            id: StringId.FeedDisplay_Market_AsxVolumeMatch, translations: {
                en: 'ASX VolumeMatch',
            }
        },
        FeedDisplay_Market_ChixAustLimit: {
            id: StringId.FeedDisplay_Market_ChixAustLimit, translations: {
                en: 'Chix Aust Limit',
            }
        },
        FeedDisplay_Market_ChixAustFarPoint: {
            id: StringId.FeedDisplay_Market_ChixAustFarPoint, translations: {
                en: 'Chix Aust FarPoint',
            }
        },
        FeedDisplay_Market_ChixAustMarketOnClose: {
            id: StringId.FeedDisplay_Market_ChixAustMarketOnClose, translations: {
                en: 'Chix Aust MarketOnClose',
            }
        },
        FeedDisplay_Market_ChixAustNearPoint: {
            id: StringId.FeedDisplay_Market_ChixAustNearPoint, translations: {
                en: 'Chix Aust NearPoint',
            }
        },
        FeedDisplay_Market_ChixAustMidPoint: {
            id: StringId.FeedDisplay_Market_ChixAustMidPoint, translations: {
                en: 'Chix Aust MidPoint',
            }
        },
        FeedDisplay_Market_SimVenture: {
            id: StringId.FeedDisplay_Market_SimVenture, translations: {
                en: 'SimVenture',
            }
        },
        FeedDisplay_Market_Nsx: {
            id: StringId.FeedDisplay_Market_Nsx, translations: {
                en: 'NSX',
            }
        },
        FeedDisplay_Market_SouthPacific: {
            id: StringId.FeedDisplay_Market_SouthPacific, translations: {
                en: 'SouthPacific',
            }
        },
        FeedDisplay_Market_Nzfox: {
            id: StringId.FeedDisplay_Market_Nzfox, translations: {
                en: 'NZX fox',
            }
        },
        FeedDisplay_Market_Nzx: {
            id: StringId.FeedDisplay_Market_Nzx, translations: {
                en: 'NZX',
            }
        },
        FeedDisplay_Market_MyxNormal: {
            id: StringId.FeedDisplay_Market_MyxNormal, translations: {
                en: 'MYX Normal',
            }
        },
        FeedDisplay_Market_MyxDirectBusiness: {
            id: StringId.FeedDisplay_Market_MyxDirectBusiness, translations: {
                en: 'MYZ Direct Business',
            }
        },
        FeedDisplay_Market_MyxIndex: {
            id: StringId.FeedDisplay_Market_MyxIndex, translations: {
                en: 'MYX Index',
            }
        },
        FeedDisplay_Market_MyxOddLot: {
            id: StringId.FeedDisplay_Market_MyxOddLot, translations: {
                en: 'MYX Odd Lot',
            }
        },
        FeedDisplay_Market_MyxBuyIn: {
            id: StringId.FeedDisplay_Market_MyxBuyIn, translations: {
                en: 'MYX Buy In',
            }
        },
        FeedDisplay_Market_Calastone: {
            id: StringId.FeedDisplay_Market_Calastone, translations: {
                en: 'Calastone',
            }
        },
        FeedDisplay_Market_AsxCxa: {
            id: StringId.FeedDisplay_Market_AsxCxa, translations: {
                en: 'AsxCxa',
            }
        },
        FeedDisplay_Market_Ptx: {
            id: StringId.FeedDisplay_Market_Ptx, translations: {
                en: 'PTX',
            }
        },
        FeedDisplay_Market_Fnsx: {
            id: StringId.FeedDisplay_Market_Fnsx, translations: {
                en: 'FNSX',
            }
        },
        FeedDisplay_News_Asx: {
            id: StringId.FeedDisplay_News_Asx, translations: {
                en: 'ASX',
            }
        },
        FeedDisplay_News_Nsx: {
            id: StringId.FeedDisplay_News_Nsx, translations: {
                en: 'NSX',
            }
        },
        FeedDisplay_News_Nzx: {
            id: StringId.FeedDisplay_News_Nzx, translations: {
                en: 'NZX',
            }
        },
        FeedDisplay_News_Myx: {
            id: StringId.FeedDisplay_News_Myx, translations: {
                en: 'MYX',
            }
        },
        FeedDisplay_News_Ptx: {
            id: StringId.FeedDisplay_News_Ptx, translations: {
                en: 'PTX',
            }
        },
        FeedDisplay_News_Fnsx: {
            id: StringId.FeedDisplay_News_Fnsx, translations: {
                en: 'FNSX',
            }
        },
        MarketDisplay_MixedMarket: {
            id: StringId.MarketDisplay_MixedMarket, translations: {
                en: 'MixedMarket',
            }
        },
        MarketDisplay_MyxNormal: {
            id: StringId.MarketDisplay_MyxNormal, translations: {
                en: 'MYX Normal',
            }
        },
        MarketDisplay_MyxOddLot: {
            id: StringId.MarketDisplay_MyxOddLot, translations: {
                en: 'MYX Odd Lot',
            }
        },
        MarketDisplay_MyxBuyIn: {
            id: StringId.MarketDisplay_MyxBuyIn, translations: {
                en: 'MYX Buy In',
            }
        },
        MarketDisplay_MyxDirectBusiness: {
            id: StringId.MarketDisplay_MyxDirectBusiness, translations: {
                en: 'MYX Direct Business',
            }
        },
        MarketDisplay_MyxIndex: {
            id: StringId.MarketDisplay_MyxIndex, translations: {
                en: 'MYX Index',
            }
        },
        MarketDisplay_AsxBookBuild: {
            id: StringId.MarketDisplay_AsxBookBuild, translations: {
                en: 'ASX Book Build',
            }
        },
        MarketDisplay_AsxPureMatch: {
            id: StringId.MarketDisplay_AsxPureMatch, translations: {
                en: 'ASX PureMatch',
            }
        },
        MarketDisplay_AsxPureMatchDemo: {
            id: StringId.MarketDisplay_AsxPureMatchDemo, translations: {
                en: 'ASX PureMatch Demo',
            }
        },
        MarketDisplay_AsxTradeMatch: {
            id: StringId.MarketDisplay_AsxTradeMatch, translations: {
                en: 'ASX TradeMatch',
            }
        },
        MarketDisplay_AsxTradeMatchDelayed: {
            id: StringId.MarketDisplay_AsxTradeMatchDelayed, translations: {
                en: 'ASX TradeMatch Delayed',
            }
        },
        MarketDisplay_AsxTradeMatchDemo: {
            id: StringId.MarketDisplay_AsxTradeMatchDemo, translations: {
                en: 'ASX TradeMatch Demo',
            }
        },
        MarketDisplay_AsxCentrePoint: {
            id: StringId.MarketDisplay_AsxCentrePoint, translations: {
                en: 'ASX CentrePoint',
            }
        },
        MarketDisplay_AsxVolumeMatch: {
            id: StringId.MarketDisplay_AsxVolumeMatch, translations: {
                en: 'ASX VolumeMatch',
            }
        },
        MarketDisplay_ChixAustLimit: {
            id: StringId.MarketDisplay_ChixAustLimit, translations: {
                en: 'CHIX Aust Limit',
            }
        },
        MarketDisplay_ChixAustLimitDemo: {
            id: StringId.MarketDisplay_ChixAustLimitDemo, translations: {
                en: 'CHIX Aust Limit Demo',
            }
        },
        MarketDisplay_ChixAustFarPoint: {
            id: StringId.MarketDisplay_ChixAustFarPoint, translations: {
                en: 'CHIX Aust FarPoint',
            }
        },
        MarketDisplay_ChixAustMarketOnClose: {
            id: StringId.MarketDisplay_ChixAustMarketOnClose, translations: {
                en: 'CHIX Aust MarketOnClose',
            }
        },
        MarketDisplay_ChixAustNearPoint: {
            id: StringId.MarketDisplay_ChixAustNearPoint, translations: {
                en: 'CHIX Aust NearPoint',
            }
        },
        MarketDisplay_ChixAustMidPoint: {
            id: StringId.MarketDisplay_ChixAustMidPoint, translations: {
                en: 'CHIX Aust MidPoint',
            }
        },
        MarketDisplay_SimVenture: {
            id: StringId.MarketDisplay_SimVenture, translations: {
                en: 'SimVenture',
            }
        },
        MarketDisplay_Nsx: {
            id: StringId.MarketDisplay_Nsx, translations: {
                en: 'NSX',
            }
        },
        MarketDisplay_NsxDemo: {
            id: StringId.MarketDisplay_NsxDemo, translations: {
                en: 'NSX Demo',
            }
        },
        MarketDisplay_SouthPacific: {
            id: StringId.MarketDisplay_SouthPacific, translations: {
                en: 'SouthPacific',
            }
        },
        MarketDisplay_Nzfox: {
            id: StringId.MarketDisplay_Nzfox, translations: {
                en: 'Nzfox',
            }
        },
        MarketDisplay_Nzx: {
            id: StringId.MarketDisplay_Nzx, translations: {
                en: 'NZX',
            }
        },
        MarketDisplay_NzxDemo: {
            id: StringId.MarketDisplay_NzxDemo, translations: {
                en: 'NZX Demo',
            }
        },
        MarketDisplay_Calastone: {
            id: StringId.MarketDisplay_Calastone, translations: {
                en: 'Calastone',
            }
        },
        MarketDisplay_PtxDemo: {
            id: StringId.MarketDisplay_PtxDemo, translations: {
                en: 'PTX Demo',
            }
        },
        MarketDisplay_AsxCxa: {
            id: StringId.MarketDisplay_AsxCxa, translations: {
                en: 'AsxCxa',
            }
        },
        MarketDisplay_AsxCxaDemo: {
            id: StringId.MarketDisplay_AsxCxaDemo, translations: {
                en: 'AsxCxaDemo',
            }
        },
        MarketDisplay_Ptx: {
            id: StringId.MarketDisplay_Ptx, translations: {
                en: 'PTX',
            }
        },
        MarketDisplay_Fnsx: {
            id: StringId.MarketDisplay_Fnsx, translations: {
                en: 'FNSX',
            }
        },
        IvemClass_Unknown: {
            id: StringId.IvemClass_Unknown, translations: {
                en: 'Unknown',
            }
        },
        IvemClass_Market: {
            id: StringId.IvemClass_Market, translations: {
                en: 'Market',
            }
        },
        IvemClass_ManagedFund: {
            id: StringId.IvemClass_ManagedFund, translations: {
                en: 'Managed Fund',
            }
        },
        MarketBoardIdDisplay_MixedMarket: {
            id: StringId.MarketBoardIdDisplay_MixedMarket, translations: {
                en: 'Mixed',
            }
        },
        MarketBoardIdDisplay_AsxBookBuild: {
            id: StringId.MarketBoardIdDisplay_AsxBookBuild, translations: {
                en: 'ASX BookBuild',
            }
        },
        MarketBoardIdDisplay_AsxCentrePoint: {
            id: StringId.MarketBoardIdDisplay_AsxCentrePoint, translations: {
                en: 'ASX CentrePoint',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatch: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatch, translations: {
                en: 'ASX TradeMatch Market',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchAgric: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchAgric, translations: {
                en: 'ASX TradeMatch AGRIC',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchAus: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchAus, translations: {
                en: 'ASX TradeMatch AUS',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchDerivatives: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchDerivatives, translations: {
                en: 'ASX TradeMatch Derivatives Market',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchEquity1: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchEquity1, translations: {
                en: 'ASX TradeMatch Equity Market 1 (A-B)',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchEquity2: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchEquity2, translations: {
                en: 'ASX TradeMatch Equity Market 2 (C-F)',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchEquity3: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchEquity3, translations: {
                en: 'ASX TradeMatch Equity Market 3 (G-M)',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchEquity4: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchEquity4, translations: {
                en: 'ASX TradeMatch Equity Market 4 (N-R)',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchEquity5: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchEquity5, translations: {
                en: 'ASX TradeMatch Equity Market 5 (S-Z)',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchIndex: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchIndex, translations: {
                en: 'ASX TradeMatch Index Market',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchIndexDerivatives: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchIndexDerivatives, translations: {
                en: 'ASX TradeMatch Index Derivatives Market',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchInterestRate: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchInterestRate, translations: {
                en: 'ASX TradeMatch Interest Rate Market',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchPrivate: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchPrivate, translations: {
                en: 'ASX TradeMatch Private Market',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchQuoteDisplayBoard: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchQuoteDisplayBoard, translations: {
                en: 'ASX TradeMatch Quote Display Board',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchPractice: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchPractice, translations: {
                en: 'ASX TradeMatch Practice Market',
            }
        },
        MarketBoardIdDisplay_AsxTradeMatchWarrants: {
            id: StringId.MarketBoardIdDisplay_AsxTradeMatchWarrants, translations: {
                en: 'ASX TradeMatch Warrants Market',
            }
        },
        MarketBoardIdDisplay_AsxPureMatch: {
            id: StringId.MarketBoardIdDisplay_AsxPureMatch, translations: {
                en: 'ASX PureMatch Equity Market',
            }
        },
        MarketBoardIdDisplay_AsxPureMatchEquity1: {
            id: StringId.MarketBoardIdDisplay_AsxPureMatchEquity1, translations: {
                en: 'ASX PureMatch Equity Market 1 (A-B)',
            }
        },
        MarketBoardIdDisplay_AsxPureMatchEquity2: {
            id: StringId.MarketBoardIdDisplay_AsxPureMatchEquity2, translations: {
                en: 'ASX PureMatch Equity Market 2 (C-F)',
            }
        },
        MarketBoardIdDisplay_AsxPureMatchEquity3: {
            id: StringId.MarketBoardIdDisplay_AsxPureMatchEquity3, translations: {
                en: 'ASX PureMatch Equity Market 3 (G-M)',
            }
        },
        MarketBoardIdDisplay_AsxPureMatchEquity4: {
            id: StringId.MarketBoardIdDisplay_AsxPureMatchEquity4, translations: {
                en: 'ASX PureMatch Equity Market 4 (N-R)',
            }
        },
        MarketBoardIdDisplay_AsxPureMatchEquity5: {
            id: StringId.MarketBoardIdDisplay_AsxPureMatchEquity5, translations: {
                en: 'ASX PureMatch Equity Market 5 (S-Z)',
            }
        },
        MarketBoardIdDisplay_AsxVolumeMatch: {
            id: StringId.MarketBoardIdDisplay_AsxVolumeMatch, translations: {
                en: 'ASX VolumeMatch',
            }
        },
        MarketBoardIdDisplay_ChixAustFarPoint: {
            id: StringId.MarketBoardIdDisplay_ChixAustFarPoint, translations: {
                en: 'Chi-X Australia Far-Point Market',
            }
        },
        MarketBoardIdDisplay_ChixAustLimit: {
            id: StringId.MarketBoardIdDisplay_ChixAustLimit, translations: {
                en: 'Chi-X Australia Limit Market',
            }
        },
        MarketBoardIdDisplay_ChixAustMarketOnClose: {
            id: StringId.MarketBoardIdDisplay_ChixAustMarketOnClose, translations: {
                en: 'Chi-X Australia Market-on-Close Market',
            }
        },
        MarketBoardIdDisplay_ChixAustMidPoint: {
            id: StringId.MarketBoardIdDisplay_ChixAustMidPoint, translations: {
                en: 'Chi-X Australia Mid-Point Market',
            }
        },
        MarketBoardIdDisplay_ChixAustNearPoint: {
            id: StringId.MarketBoardIdDisplay_ChixAustNearPoint, translations: {
                en: 'Chi-X Australia Near-Point Market',
            }
        },
        MarketBoardIdDisplay_NsxMain: {
            id: StringId.MarketBoardIdDisplay_NsxMain, translations: {
                en: 'Australian National Stock Exchange Main',
            }
        },
        MarketBoardIdDisplay_NsxCommunityBanks: {
            id: StringId.MarketBoardIdDisplay_NsxCommunityBanks, translations: {
                en: 'Australian National Stock Exchange Community Banks',
            }
        },
        MarketBoardIdDisplay_NsxIndustrial: {
            id: StringId.MarketBoardIdDisplay_NsxIndustrial, translations: {
                en: 'Australian National Stock Exchange Industrial',
            }
        },
        MarketBoardIdDisplay_NsxDebt: {
            id: StringId.MarketBoardIdDisplay_NsxDebt, translations: {
                en: 'Australian National Stock Exchange Debt',
            }
        },
        MarketBoardIdDisplay_NsxMiningAndEnergy: {
            id: StringId.MarketBoardIdDisplay_NsxMiningAndEnergy, translations: {
                en: 'Australian National Stock Exchange Mining & Energy',
            }
        },
        MarketBoardIdDisplay_NsxCertifiedProperty: {
            id: StringId.MarketBoardIdDisplay_NsxCertifiedProperty, translations: {
                en: 'Australian National Stock Exchange Certified Property',
            }
        },
        MarketBoardIdDisplay_NsxProperty: {
            id: StringId.MarketBoardIdDisplay_NsxProperty, translations: {
                en: 'Australian National Stock Exchange Property',
            }
        },
        MarketBoardIdDisplay_NsxRestricted: {
            id: StringId.MarketBoardIdDisplay_NsxRestricted, translations: {
                en: 'Australian National Stock Exchange Restricted',
            }
        },
        MarketBoardIdDisplay_SimVenture: {
            id: StringId.MarketBoardIdDisplay_SimVenture, translations: {
                en: 'SIM-VSE',
            }
        },
        MarketBoardIdDisplay_SouthPacificStockExchangeEquities: {
            id: StringId.MarketBoardIdDisplay_SouthPacificStockExchangeEquities, translations: {
                en: 'South Pacific Stock Exchange Equities',
            }
        },
        MarketBoardIdDisplay_SouthPacificStockExchangeRestricted: {
            id: StringId.MarketBoardIdDisplay_SouthPacificStockExchangeRestricted, translations: {
                en: 'South Pacific Stock Exchange Restricted',
            }
        },
        MarketBoardIdDisplay_NzxMainBoard: {
            id: StringId.MarketBoardIdDisplay_NzxMainBoard, translations: {
                en: 'NZX Main Board',
            }
        },
        MarketBoardIdDisplay_NzxNXT: {
            id: StringId.MarketBoardIdDisplay_NzxNXT, translations: {
                en: 'NZX NXT Market',
            }
        },
        MarketBoardIdDisplay_NzxSpec: {
            id: StringId.MarketBoardIdDisplay_NzxSpec, translations: {
                en: 'NZX Spec',
            }
        },
        MarketBoardIdDisplay_NzxFonterraShareholders: {
            id: StringId.MarketBoardIdDisplay_NzxFonterraShareholders, translations: {
                en: 'NZX Fonterra Shareholders Market',
            }
        },
        MarketBoardIdDisplay_NzxIndex: {
            id: StringId.MarketBoardIdDisplay_NzxIndex, translations: {
                en: 'NZX Index Market',
            }
        },
        MarketBoardIdDisplay_NzxDebt: {
            id: StringId.MarketBoardIdDisplay_NzxDebt, translations: {
                en: 'NZX Debt Market',
            }
        },
        MarketBoardIdDisplay_NzxAlternate: {
            id: StringId.MarketBoardIdDisplay_NzxAlternate, translations: {
                en: 'NZX Alternate Market',
            }
        },
        MarketBoardIdDisplay_NzxDerivativeFutures: {
            id: StringId.MarketBoardIdDisplay_NzxDerivativeFutures, translations: {
                en: 'NZX Derivative Futures',
            }
        },
        MarketBoardIdDisplay_NzxDerivativeOptions: {
            id: StringId.MarketBoardIdDisplay_NzxDerivativeOptions, translations: {
                en: 'NZX Derivative Options',
            }
        },
        MarketBoardIdDisplay_NzxIndexFutures: {
            id: StringId.MarketBoardIdDisplay_NzxIndexFutures, translations: {
                en: 'NZX Index Futures',
            }
        },
        MarketBoardIdDisplay_NzxFxDerivativeOptions: {
            id: StringId.MarketBoardIdDisplay_NzxFxDerivativeOptions, translations: {
                en: 'NZ Futures & Options Derivative Options',
            }
        },
        MarketBoardIdDisplay_NzxFxDerivativeFutures: {
            id: StringId.MarketBoardIdDisplay_NzxFxDerivativeFutures, translations: {
                en: 'NZ Futures & Options Derivative Futures',
            }
        },
        MarketBoardIdDisplay_NzxFxEquityOptions: {
            id: StringId.MarketBoardIdDisplay_NzxFxEquityOptions, translations: {
                en: 'NZ Futures & Options Equity Options',
            }
        },
        MarketBoardIdDisplay_NzxFxIndexFutures: {
            id: StringId.MarketBoardIdDisplay_NzxFxIndexFutures, translations: {
                en: 'NZ Futures & Options Index Futures',
            }
        },
        MarketBoardIdDisplay_NzxFxMilkOptions: {
            id: StringId.MarketBoardIdDisplay_NzxFxMilkOptions, translations: {
                en: 'NZ Futures & Options Milk Options',
            }
        },
        MarketBoardIdDisplay_MyxNormal: {
            id: StringId.MarketBoardIdDisplay_MyxNormal, translations: {
                en: 'MYX Normal',
            }
        },
        MarketBoardIdDisplay_MyxDirectBusinessTransaction: {
            id: StringId.MarketBoardIdDisplay_MyxDirectBusinessTransaction, translations: {
                en: 'MYX Direct Business Transaction',
            }
        },
        MarketBoardIdDisplay_MyxIndex: {
            id: StringId.MarketBoardIdDisplay_MyxIndex, translations: {
                en: 'MYX Index',
            }
        },
        MarketBoardIdDisplay_MyxBuyIn: {
            id: StringId.MarketBoardIdDisplay_MyxBuyIn, translations: {
                en: 'MYX Buy In',
            }
        },
        MarketBoardIdDisplay_MyxOddLot: {
            id: StringId.MarketBoardIdDisplay_MyxOddLot, translations: {
                en: 'MYX Odd Lot',
            }
        },
        MarketBoardIdDisplay_Ptx: {
            id: StringId.MarketBoardIdDisplay_Ptx, translations: {
                en: 'PTX',
            }
        },
        MarketBoardIdDisplay_Fnsx: {
            id: StringId.MarketBoardIdDisplay_Fnsx, translations: {
                en: 'FNSX',
            }
        },
        CallOrPutDisplay_Call: {
            id: StringId.CallOrPutDisplay_Call, translations: {
                en: 'Call',
            }
        },
        CallOrPutDisplay_Put: {
            id: StringId.CallOrPutDisplay_Put, translations: {
                en: 'Put',
            }
        },
        ZenithSubscriptionDataDisplay_Asset: {
            id: StringId.ZenithSubscriptionDataDisplay_Asset, translations: {
                en: 'Asset',
            }
        },
        ZenithSubscriptionDataDisplay_Trades: {
            id: StringId.ZenithSubscriptionDataDisplay_Trades, translations: {
                en: 'Trades',
            }
        },
        ZenithSubscriptionDataDisplay_Depth: {
            id: StringId.ZenithSubscriptionDataDisplay_Depth, translations: {
                en: 'Depth',
            }
        },
        ZenithSubscriptionDataDisplay_DepthFull: {
            id: StringId.ZenithSubscriptionDataDisplay_DepthFull, translations: {
                en: 'DepthFull',
            }
        },
        ZenithSubscriptionDataDisplay_DepthShort: {
            id: StringId.ZenithSubscriptionDataDisplay_DepthShort, translations: {
                en: 'DepthShort',
            }
        },
        CurrencyCode_Aud: {
            id: StringId.CurrencyCode_Aud, translations: {
                en: 'AUD',
            }
        },
        CurrencySymbol_Aud: {
            id: StringId.CurrencySymbol_Aud, translations: {
                en: '$',
            }
        },
        CurrencyCode_Usd: {
            id: StringId.CurrencyCode_Usd, translations: {
                en: 'USD',
            }
        },
        CurrencySymbol_Usd: {
            id: StringId.CurrencySymbol_Usd, translations: {
                en: '$',
            }
        },
        CurrencyCode_Myr: {
            id: StringId.CurrencyCode_Myr, translations: {
                en: 'MYR',
            }
        },
        CurrencySymbol_Myr: {
            id: StringId.CurrencySymbol_Myr, translations: {
                en: 'RM',
            }
        },
        BrokerageAccountFieldDisplay_Code: {
            id: StringId.BrokerageAccountFieldDisplay_Code, translations: {
                en: 'Code',
            }
        },
        BrokerageAccountFieldHeading_Code: {
            id: StringId.BrokerageAccountFieldHeading_Code, translations: {
                en: 'Code',
            }
        },
        BrokerageAccountFieldDisplay_EnvironmentId: {
            id: StringId.BrokerageAccountFieldDisplay_EnvironmentId, translations: {
                en: 'Environment',
            }
        },
        BrokerageAccountFieldHeading_EnvironmentId: {
            id: StringId.BrokerageAccountFieldHeading_EnvironmentId, translations: {
                en: 'Environment',
            }
        },
        BrokerageAccountFieldDisplay_Name: {
            id: StringId.BrokerageAccountFieldDisplay_Name, translations: {
                en: 'Name',
            }
        },
        BrokerageAccountFieldHeading_Name: {
            id: StringId.BrokerageAccountFieldHeading_Name, translations: {
                en: 'Name',
            }
        },
        BrokerageAccountFieldDisplay_FeedStatusId: {
            id: StringId.BrokerageAccountFieldDisplay_FeedStatusId, translations: {
                en: 'Trading feed status',
            }
        },
        BrokerageAccountFieldHeading_FeedStatusId: {
            id: StringId.BrokerageAccountFieldHeading_FeedStatusId, translations: {
                en: 'Feed Status',
            }
        },
        BrokerageAccountFieldDisplay_TradingFeedName: {
            id: StringId.BrokerageAccountFieldDisplay_TradingFeedName, translations: {
                en: 'Trading Feed Name',
            }
        },
        BrokerageAccountFieldHeading_TradingFeedName: {
            id: StringId.BrokerageAccountFieldHeading_TradingFeedName, translations: {
                en: 'Feed Name',
            }
        },
        BrokerageAccountFieldDisplay_CurrencyId: {
            id: StringId.BrokerageAccountFieldDisplay_CurrencyId, translations: {
                en: 'Currency',
            }
        },
        BrokerageAccountFieldHeading_CurrencyId: {
            id: StringId.BrokerageAccountFieldHeading_CurrencyId, translations: {
                en: 'Currency',
            }
        },
        OrderFieldDisplay_Id: {
            id: StringId.OrderFieldDisplay_Id, translations: {
                en: 'Id',
            }
        },
        OrderFieldHeading_Id: {
            id: StringId.OrderFieldHeading_Id, translations: {
                en: 'Id',
            }
        },
        OrderFieldDisplay_AccountId: {
            id: StringId.OrderFieldDisplay_AccountId, translations: {
                en: 'Account ID',
            }
        },
        OrderFieldHeading_AccountId: {
            id: StringId.OrderFieldHeading_AccountId, translations: {
                en: 'Account ID',
            }
        },
        OrderFieldDisplay_ExternalID: {
            id: StringId.OrderFieldDisplay_ExternalID, translations: {
                en: 'External ID',
            }
        },
        OrderFieldHeading_ExternalID: {
            id: StringId.OrderFieldHeading_ExternalID, translations: {
                en: 'External ID',
            }
        },
        OrderFieldDisplay_DepthOrderID: {
            id: StringId.OrderFieldDisplay_DepthOrderID, translations: {
                en: 'Depth Order ID',
            }
        },
        OrderFieldHeading_DepthOrderID: {
            id: StringId.OrderFieldHeading_DepthOrderID, translations: {
                en: 'Depth Order ID',
            }
        },
        OrderFieldDisplay_Status: {
            id: StringId.OrderFieldDisplay_Status, translations: {
                en: 'Status',
            }
        },
        OrderFieldHeading_Status: {
            id: StringId.OrderFieldHeading_Status, translations: {
                en: 'Status',
            }
        },
        OrderFieldDisplay_StatusAllowIds: {
            id: StringId.OrderFieldDisplay_StatusAllowIds, translations: {
                en: 'Status Allows',
            }
        },
        OrderFieldHeading_StatusAllowIds: {
            id: StringId.OrderFieldHeading_StatusAllowIds, translations: {
                en: 'Allows',
            }
        },
        OrderFieldDisplay_StatusReasonIds: {
            id: StringId.OrderFieldDisplay_StatusReasonIds, translations: {
                en: 'Status Reasons',
            }
        },
        OrderFieldHeading_StatusReasonIds: {
            id: StringId.OrderFieldHeading_StatusReasonIds, translations: {
                en: 'Reasons',
            }
        },
        OrderFieldDisplay_Market: {
            id: StringId.OrderFieldDisplay_Market, translations: {
                en: 'Market',
            }
        },
        OrderFieldHeading_Market: {
            id: StringId.OrderFieldHeading_Market, translations: {
                en: 'Market',
            }
        },
        OrderFieldDisplay_TradingMarket: {
            id: StringId.OrderFieldDisplay_TradingMarket, translations: {
                en: 'Trading Market',
            }
        },
        OrderFieldHeading_TradingMarket: {
            id: StringId.OrderFieldHeading_TradingMarket, translations: {
                en: 'Trading Mkt',
            }
        },
        OrderFieldDisplay_Currency: {
            id: StringId.OrderFieldDisplay_Currency, translations: {
                en: 'Currency',
            }
        },
        OrderFieldHeading_Currency: {
            id: StringId.OrderFieldHeading_Currency, translations: {
                en: 'Currency',
            }
        },
        OrderFieldDisplay_EstimatedBrokerage: {
            id: StringId.OrderFieldDisplay_EstimatedBrokerage, translations: {
                en: 'Estimated Brokerage',
            }
        },
        OrderFieldHeading_EstimatedBrokerage: {
            id: StringId.OrderFieldHeading_EstimatedBrokerage, translations: {
                en: 'Est Brokerage',
            }
        },
        OrderFieldDisplay_CurrentBrokerage: {
            id: StringId.OrderFieldDisplay_CurrentBrokerage, translations: {
                en: 'Current Brokerage',
            }
        },
        OrderFieldHeading_CurrentBrokerage: {
            id: StringId.OrderFieldHeading_CurrentBrokerage, translations: {
                en: 'Cur Brokerage',
            }
        },
        OrderFieldDisplay_EstimatedTax: {
            id: StringId.OrderFieldDisplay_EstimatedTax, translations: {
                en: 'Estimated Tax',
            }
        },
        OrderFieldHeading_EstimatedTax: {
            id: StringId.OrderFieldHeading_EstimatedTax, translations: {
                en: 'Est Tax',
            }
        },
        OrderFieldDisplay_CurrentTax: {
            id: StringId.OrderFieldDisplay_CurrentTax, translations: {
                en: 'Current Tax',
            }
        },
        OrderFieldHeading_CurrentTax: {
            id: StringId.OrderFieldHeading_CurrentTax, translations: {
                en: 'Cur Tax',
            }
        },
        OrderFieldDisplay_CurrentValue: {
            id: StringId.OrderFieldDisplay_CurrentValue, translations: {
                en: 'Current Value',
            }
        },
        OrderFieldHeading_CurrentValue: {
            id: StringId.OrderFieldHeading_CurrentValue, translations: {
                en: 'Cur Value',
            }
        },
        OrderFieldDisplay_CreatedDate: {
            id: StringId.OrderFieldDisplay_CreatedDate, translations: {
                en: 'Created Date',
            }
        },
        OrderFieldHeading_CreatedDate: {
            id: StringId.OrderFieldHeading_CreatedDate, translations: {
                en: 'Created',
            }
        },
        OrderFieldDisplay_UpdatedDate: {
            id: StringId.OrderFieldDisplay_UpdatedDate, translations: {
                en: 'Updated Date',
            }
        },
        OrderFieldHeading_UpdatedDate: {
            id: StringId.OrderFieldHeading_UpdatedDate, translations: {
                en: 'Updated',
            }
        },
        OrderFieldDisplay_Style: {
            id: StringId.OrderFieldDisplay_Style, translations: {
                en: 'Style',
            }
        },
        OrderFieldHeading_Style: {
            id: StringId.OrderFieldHeading_Style, translations: {
                en: 'Style',
            }
        },
        OrderFieldDisplay_Children: {
            id: StringId.OrderFieldDisplay_Children, translations: {
                en: 'Children',
            }
        },
        OrderFieldHeading_Children: {
            id: StringId.OrderFieldHeading_Children, translations: {
                en: 'Children',
            }
        },
        OrderFieldDisplay_ExecutedQuantity: {
            id: StringId.OrderFieldDisplay_ExecutedQuantity, translations: {
                en: 'Executed Quantity',
            }
        },
        OrderFieldHeading_ExecutedQuantity: {
            id: StringId.OrderFieldHeading_ExecutedQuantity, translations: {
                en: 'Executed',
            }
        },
        OrderFieldDisplay_AveragePrice: {
            id: StringId.OrderFieldDisplay_AveragePrice, translations: {
                en: 'Average Price',
            }
        },
        OrderFieldHeading_AveragePrice: {
            id: StringId.OrderFieldHeading_AveragePrice, translations: {
                en: 'Avg Price',
            }
        },
        OrderFieldDisplay_TriggerType: {
            id: StringId.OrderFieldDisplay_TriggerType, translations: {
                en: 'Trigger Type',
            }
        },
        OrderFieldHeading_TriggerType: {
            id: StringId.OrderFieldHeading_TriggerType, translations: {
                en: 'Trigger',
            }
        },
        OrderFieldDisplay_TriggerValue: {
            id: StringId.OrderFieldDisplay_TriggerValue, translations: {
                en: 'Trigger Value',
            }
        },
        OrderFieldHeading_TriggerValue: {
            id: StringId.OrderFieldHeading_TriggerValue, translations: {
                en: 'Trig Val',
            }
        },
        OrderFieldDisplay_TriggerExtraParams: {
            id: StringId.OrderFieldDisplay_TriggerExtraParams, translations: {
                en: 'Trigger extra parameters',
            }
        },
        OrderFieldHeading_TriggerExtraParams: {
            id: StringId.OrderFieldHeading_TriggerExtraParams, translations: {
                en: 'Trig Prms',
            }
        },
        OrderFieldDisplay_TrailingStopLossConditionType: {
            id: StringId.OrderFieldDisplay_TrailingStopLossConditionType, translations: {
                en: 'Trailing Stop Loss Type',
            }
        },
        OrderFieldHeading_TrailingStopLossConditionType: {
            id: StringId.OrderFieldHeading_TrailingStopLossConditionType, translations: {
                en: 'Trailing Type',
            }
        },
        OrderFieldDisplay_Exchange: {
            id: StringId.OrderFieldDisplay_Exchange, translations: {
                en: 'Exchange',
            }
        },
        OrderFieldHeading_Exchange: {
            id: StringId.OrderFieldHeading_Exchange, translations: {
                en: 'Exchange',
            }
        },
        OrderFieldDisplay_Environment: {
            id: StringId.OrderFieldDisplay_Environment, translations: {
                en: 'Environment',
            }
        },
        OrderFieldHeading_Environment: {
            id: StringId.OrderFieldHeading_Environment, translations: {
                en: 'Environment',
            }
        },
        OrderFieldDisplay_Code: {
            id: StringId.OrderFieldDisplay_Code, translations: {
                en: 'Code',
            }
        },
        OrderFieldHeading_Code: {
            id: StringId.OrderFieldHeading_Code, translations: {
                en: 'Code',
            }
        },
        OrderFieldDisplay_Side: {
            id: StringId.OrderFieldDisplay_Side, translations: {
                en: 'Side',
            }
        },
        OrderFieldHeading_Side: {
            id: StringId.OrderFieldHeading_Side, translations: {
                en: 'Side',
            }
        },
        OrderFieldDisplay_DetailsStyle: {
            id: StringId.OrderFieldDisplay_DetailsStyle, translations: {
                en: 'Style',
            }
        },
        OrderFieldHeading_DetailsStyle: {
            id: StringId.OrderFieldHeading_DetailsStyle, translations: {
                en: 'Style',
            }
        },
        OrderFieldDisplay_BrokerageSchedule: {
            id: StringId.OrderFieldDisplay_BrokerageSchedule, translations: {
                en: 'Brokerage Schedule',
            }
        },
        OrderFieldHeading_BrokerageSchedule: {
            id: StringId.OrderFieldHeading_BrokerageSchedule, translations: {
                en: 'Bkg Schedule',
            }
        },
        OrderFieldDisplay_DetailsType: {
            id: StringId.OrderFieldDisplay_DetailsType, translations: {
                en: 'Type',
            }
        },
        OrderFieldHeading_DetailsType: {
            id: StringId.OrderFieldHeading_DetailsType, translations: {
                en: 'Type',
            }
        },
        OrderFieldDisplay_LimitPrice: {
            id: StringId.OrderFieldDisplay_LimitPrice, translations: {
                en: 'Limit Price',
            }
        },
        OrderFieldHeading_LimitPrice: {
            id: StringId.OrderFieldHeading_LimitPrice, translations: {
                en: 'Limit',
            }
        },
        OrderFieldDisplay_Quantity: {
            id: StringId.OrderFieldDisplay_Quantity, translations: {
                en: 'Quantity',
            }
        },
        OrderFieldHeading_Quantity: {
            id: StringId.OrderFieldHeading_Quantity, translations: {
                en: 'Quantity',
            }
        },
        OrderFieldDisplay_HiddenQuantity: {
            id: StringId.OrderFieldDisplay_HiddenQuantity, translations: {
                en: 'Hidden Quantity',
            }
        },
        OrderFieldHeading_HiddenQuantity: {
            id: StringId.OrderFieldHeading_HiddenQuantity, translations: {
                en: 'Hidden',
            }
        },
        OrderFieldDisplay_MinimumQuantity: {
            id: StringId.OrderFieldDisplay_MinimumQuantity, translations: {
                en: 'Minimum Quantity',
            }
        },
        OrderFieldHeading_MinimumQuantity: {
            id: StringId.OrderFieldHeading_MinimumQuantity, translations: {
                en: 'Minimum',
            }
        },
        OrderFieldDisplay_DetailsTimeInForce: {
            id: StringId.OrderFieldDisplay_DetailsTimeInForce, translations: {
                en: 'Validity',
            }
        },
        OrderFieldHeading_DetailsTimeInForce: {
            id: StringId.OrderFieldHeading_DetailsTimeInForce, translations: {
                en: 'Validity',
            }
        },
        OrderFieldDisplay_DetailsExpiryDate: {
            id: StringId.OrderFieldDisplay_DetailsExpiryDate, translations: {
                en: 'Expiry Date',
            }
        },
        OrderFieldHeading_DetailsExpiryDate: {
            id: StringId.OrderFieldHeading_DetailsExpiryDate, translations: {
                en: 'Expiry',
            }
        },
        OrderFieldDisplay_DetailsUnitType: {
            id: StringId.OrderFieldDisplay_DetailsUnitType, translations: {
                en: 'Unit Type',
            }
        },
        OrderFieldHeading_DetailsUnitType: {
            id: StringId.OrderFieldHeading_DetailsUnitType, translations: {
                en: 'Unit',
            }
        },
        OrderFieldDisplay_DetailsUnitAmount: {
            id: StringId.OrderFieldDisplay_DetailsUnitAmount, translations: {
                en: 'Unit Amount',
            }
        },
        OrderFieldHeading_DetailsUnitAmount: {
            id: StringId.OrderFieldHeading_DetailsUnitAmount, translations: {
                en: 'Unit Amt',
            }
        },
        OrderFieldDisplay_DetailsCurrency: {
            id: StringId.OrderFieldDisplay_DetailsCurrency, translations: {
                en: 'Currency',
            }
        },
        OrderFieldHeading_DetailsCurrency: {
            id: StringId.OrderFieldHeading_DetailsCurrency, translations: {
                en: 'Currency',
            }
        },
        OrderFieldDisplay_DetailsPhysicalDelivery: {
            id: StringId.OrderFieldDisplay_DetailsPhysicalDelivery, translations: {
                en: 'Physical Delivery',
            }
        },
        OrderFieldHeading_DetailsPhysicalDelivery: {
            id: StringId.OrderFieldHeading_DetailsPhysicalDelivery, translations: {
                en: 'Physical Delivery',
            }
        },
        OrderFieldDisplay_RouteAlgorithm: {
            id: StringId.OrderFieldDisplay_RouteAlgorithm, translations: {
                en: 'Route Algorithm',
            }
        },
        OrderFieldHeading_RouteAlgorithm: {
            id: StringId.OrderFieldHeading_RouteAlgorithm, translations: {
                en: 'Route',
            }
        },
        OrderFieldDisplay_RouteMarket: {
            id: StringId.OrderFieldDisplay_RouteMarket, translations: {
                en: 'Route Market',
            }
        },
        OrderFieldHeading_RouteMarket: {
            id: StringId.OrderFieldHeading_RouteMarket, translations: {
                en: 'Route Mkt',
            }
        },
        FeedStatusDisplay_Unknown: {
            id: StringId.FeedStatusDisplay_Unknown, translations: {
                en: 'Unknown',
            }
        },
        FeedStatusDisplay_Initialising: {
            id: StringId.FeedStatusDisplay_Initialising, translations: {
                en: 'Initialising',
            }
        },
        FeedStatusDisplay_Active: {
            id: StringId.FeedStatusDisplay_Active, translations: {
                en: 'Active',
            }
        },
        FeedStatusDisplay_Closed: {
            id: StringId.FeedStatusDisplay_Closed, translations: {
                en: 'Closed',
            }
        },
        FeedStatusDisplay_Inactive: {
            id: StringId.FeedStatusDisplay_Inactive, translations: {
                en: 'Inactive',
            }
        },
        FeedStatusDisplay_Impaired: {
            id: StringId.FeedStatusDisplay_Impaired, translations: {
                en: 'Impaired',
            }
        },
        FeedStatusDisplay_Expired: {
            id: StringId.FeedStatusDisplay_Expired, translations: {
                en: 'Expired',
            }
        },
        FeedClassDisplay_Authority: {
            id: StringId.FeedClassDisplay_Authority, translations: {
                en: 'Authority',
            }
        },
        FeedClassDisplay_Market: {
            id: StringId.FeedClassDisplay_Market, translations: {
                en: 'Market',
            }
        },
        FeedClassDisplay_News: {
            id: StringId.FeedClassDisplay_News, translations: {
                en: 'News',
            }
        },
        FeedClassDisplay_Trading: {
            id: StringId.FeedClassDisplay_Trading, translations: {
                en: 'Trading',
            }
        },
        SubscribabilityExtentDisplay_None: {
            id: StringId.SubscribabilityExtentDisplay_None, translations: {
                en: 'None',
            }
        },
        SubscribabilityExtentDisplay_Some: {
            id: StringId.SubscribabilityExtentDisplay_Some, translations: {
                en: 'Some',
            }
        },
        SubscribabilityExtentDisplay_All: {
            id: StringId.SubscribabilityExtentDisplay_All, translations: {
                en: 'All',
            }
        },
        DataCorrectnessDisplay_Good: {
            id: StringId.DataCorrectnessDisplay_Good, translations: {
                en: 'Good',
            }
        },
        DataCorrectnessDisplay_Suspect: {
            id: StringId.DataCorrectnessDisplay_Suspect, translations: {
                en: 'Suspect',
            }
        },
        DataCorrectnessDisplay_Error: {
            id: StringId.DataCorrectnessDisplay_Error, translations: {
                en: 'Error',
            }
        },
        Trend_None: {
            id: StringId.Trend_None, translations: {
                en: 'None',
            }
        },
        Trend_Up: {
            id: StringId.Trend_Up, translations: {
                en: 'Up',
            }
        },
        Trend_Down: {
            id: StringId.Trend_Down, translations: {
                en: 'Down',
            }
        },
        BidAskSideDisplay_Bid: {
            id: StringId.BidAskSideDisplay_Bid, translations: {
                en: 'Bid',
            }
        },
        BidAskSideDisplay_Ask: {
            id: StringId.BidAskSideDisplay_Ask, translations: {
                en: 'Ask',
            }
        },
        SideDisplay_Buy: {
            id: StringId.SideDisplay_Buy, translations: {
                en: 'Buy',
            }
        },
        SideDisplay_Sell: {
            id: StringId.SideDisplay_Sell, translations: {
                en: 'Sell',
            }
        },
        SideDisplay_BuyMinus: {
            id: StringId.SideDisplay_BuyMinus, translations: {
                en: 'BuyMinus',
            }
        },
        SideDisplay_SellPlus: {
            id: StringId.SideDisplay_SellPlus, translations: {
                en: 'SellPlus',
            }
        },
        SideDisplay_SellShort: {
            id: StringId.SideDisplay_SellShort, translations: {
                en: 'SellShort',
            }
        },
        SideDisplay_SellShortExempt: {
            id: StringId.SideDisplay_SellShortExempt, translations: {
                en: 'SellShortExempt',
            }
        },
        SideDisplay_Undisclosed: {
            id: StringId.SideDisplay_Undisclosed, translations: {
                en: 'Undisclosed',
            }
        },
        SideDisplay_Cross: {
            id: StringId.SideDisplay_Cross, translations: {
                en: 'Cross',
            }
        },
        SideDisplay_CrossShort: {
            id: StringId.SideDisplay_CrossShort, translations: {
                en: 'CrossShort',
            }
        },
        SideDisplay_CrossShortExempt: {
            id: StringId.SideDisplay_CrossShortExempt, translations: {
                en: 'CrossShortExempt',
            }
        },
        SideDisplay_AsDefined: {
            id: StringId.SideDisplay_AsDefined, translations: {
                en: 'AsDefined',
            }
        },
        SideDisplay_Opposite: {
            id: StringId.SideDisplay_Opposite, translations: {
                en: 'Opposite',
            }
        },
        SideDisplay_Subscribe: {
            id: StringId.SideDisplay_Subscribe, translations: {
                en: 'Subscribe',
            }
        },
        SideDisplay_Redeem: {
            id: StringId.SideDisplay_Redeem, translations: {
                en: 'Redeem',
            }
        },
        SideDisplay_Lend: {
            id: StringId.SideDisplay_Lend, translations: {
                en: 'Lend',
            }
        },
        SideDisplay_Borrow: {
            id: StringId.SideDisplay_Borrow, translations: {
                en: 'Borrow',
            }
        },
        EquityOrderTypeDisplay_Limit: {
            id: StringId.EquityOrderTypeDisplay_Limit, translations: {
                en: 'Limit',
            }
        },
        EquityOrderTypeDisplay_Best: {
            id: StringId.EquityOrderTypeDisplay_Best, translations: {
                en: 'Best',
            }
        },
        EquityOrderTypeDisplay_Market: {
            id: StringId.EquityOrderTypeDisplay_Market, translations: {
                en: 'Market',
            }
        },
        EquityOrderTypeDisplay_MarketToLimit: {
            id: StringId.EquityOrderTypeDisplay_MarketToLimit, translations: {
                en: 'MarketToLimit',
            }
        },
        EquityOrderTypeDisplay_Unknown: {
            id: StringId.EquityOrderTypeDisplay_Unknown, translations: {
                en: 'Unknown',
            }
        },
        TimeInForceDisplay_Day: {
            id: StringId.TimeInForceDisplay_Day, translations: {
                en: 'Day',
            }
        },
        TimeInForceDisplay_GoodTillCancel: {
            id: StringId.TimeInForceDisplay_GoodTillCancel, translations: {
                en: 'Good till Cancel',
            }
        },
        TimeInForceDisplay_AtTheOpening: {
            id: StringId.TimeInForceDisplay_AtTheOpening, translations: {
                en: 'At the Opening',
            }
        },
        TimeInForceDisplay_FillAndKill: {
            id: StringId.TimeInForceDisplay_FillAndKill, translations: {
                en: 'Fill and Kill',
            }
        },
        TimeInForceDisplay_FillOrKill: {
            id: StringId.TimeInForceDisplay_FillOrKill, translations: {
                en: 'Fill or Kill',
            }
        },
        TimeInForceDisplay_AllOrNone: {
            id: StringId.TimeInForceDisplay_AllOrNone, translations: {
                en: 'All or None',
            }
        },
        TimeInForceDisplay_GoodTillCrossing: {
            id: StringId.TimeInForceDisplay_GoodTillCrossing, translations: {
                en: 'Good till Crossing',
            }
        },
        TimeInForceDisplay_GoodTillDate: {
            id: StringId.TimeInForceDisplay_GoodTillDate, translations: {
                en: 'Good till Date',
            }
        },
        TimeInForceDisplay_AtTheClose: {
            id: StringId.TimeInForceDisplay_AtTheClose, translations: {
                en: 'At the Close',
            }
        },
        OrderPriceUnitTypeDisplay_Currency: {
            id: StringId.OrderPriceUnitTypeDisplay_Currency, translations: {
                en: 'Currency',
            }
        },
        OrderPriceUnitTypeDisplay_Units: {
            id: StringId.OrderPriceUnitTypeDisplay_Units, translations: {
                en: 'Units',
            }
        },
        OrderRouteAlgorithmDisplay_Market: {
            id: StringId.OrderRouteAlgorithmDisplay_Market, translations: {
                en: 'Market',
            }
        },
        OrderRouteAlgorithmDisplay_BestMarket: {
            id: StringId.OrderRouteAlgorithmDisplay_BestMarket, translations: {
                en: 'BestMarket',
            }
        },
        OrderRouteAlgorithmDisplay_Fix: {
            id: StringId.OrderRouteAlgorithmDisplay_Fix, translations: {
                en: 'Fix',
            }
        },
        OrderConditionTypeDisplay_Immediate: {
            id: StringId.OrderConditionTypeDisplay_Immediate, translations: {
                en: 'Immediate',
            }
        },
        OrderConditionTypeDisplay_StopLoss: {
            id: StringId.OrderConditionTypeDisplay_StopLoss, translations: {
                en: 'Stop',
            }
        },
        OrderConditionTypeDisplay_TrailingStopLoss: {
            id: StringId.OrderConditionTypeDisplay_TrailingStopLoss, translations: {
                en: 'Trailing',
            }
        },
        TrailingStopLossOrderConditionTypeDisplay_Price: {
            id: StringId.TrailingStopLossOrderConditionTypeDisplay_Price, translations: {
                en: 'Price',
            }
        },
        TrailingStopLossOrderConditionTypeDisplay_Percent: {
            id: StringId.TrailingStopLossOrderConditionTypeDisplay_Percent, translations: {
                en: 'Percent',
            }
        },
        HoldingFieldDisplay_ExchangeId: {
            id: StringId.HoldingFieldDisplay_ExchangeId, translations: {
                en: 'Exchange',
            }
        },
        HoldingFieldHeading_ExchangeId: {
            id: StringId.HoldingFieldHeading_ExchangeId, translations: {
                en: 'Exchange',
            }
        },
        HoldingFieldDisplay_Code: {
            id: StringId.HoldingFieldDisplay_Code, translations: {
                en: 'Code',
            }
        },
        HoldingFieldHeading_Code: {
            id: StringId.HoldingFieldHeading_Code, translations: {
                en: 'Code',
            }
        },
        HoldingFieldDisplay_AccountId: {
            id: StringId.HoldingFieldDisplay_AccountId, translations: {
                en: 'Account',
            }
        },
        HoldingFieldHeading_AccountId: {
            id: StringId.HoldingFieldHeading_AccountId, translations: {
                en: 'Account',
            }
        },
        HoldingFieldDisplay_Style: {
            id: StringId.HoldingFieldDisplay_Style, translations: {
                en: 'Style',
            }
        },
        HoldingFieldHeading_Style: {
            id: StringId.HoldingFieldHeading_Style, translations: {
                en: 'Style',
            }
        },
        HoldingFieldDisplay_Cost: {
            id: StringId.HoldingFieldDisplay_Cost, translations: {
                en: 'Cost',
            }
        },
        HoldingFieldHeading_Cost: {
            id: StringId.HoldingFieldHeading_Cost, translations: {
                en: 'Cost',
            }
        },
        HoldingFieldDisplay_Currency: {
            id: StringId.HoldingFieldDisplay_Currency, translations: {
                en: 'Currency',
            }
        },
        HoldingFieldHeading_Currency: {
            id: StringId.HoldingFieldHeading_Currency, translations: {
                en: 'Currency',
            }
        },
        HoldingFieldDisplay_TotalQuantity: {
            id: StringId.HoldingFieldDisplay_TotalQuantity, translations: {
                en: 'Total Quantity',
            }
        },
        HoldingFieldHeading_TotalQuantity: {
            id: StringId.HoldingFieldHeading_TotalQuantity, translations: {
                en: 'Total Quantity',
            }
        },
        HoldingFieldDisplay_TotalAvailableQuantity: {
            id: StringId.HoldingFieldDisplay_TotalAvailableQuantity, translations: {
                en: 'Available Quantity',
            }
        },
        HoldingFieldHeading_TotalAvailableQuantity: {
            id: StringId.HoldingFieldHeading_TotalAvailableQuantity, translations: {
                en: 'Available Quantity',
            }
        },
        HoldingFieldDisplay_AveragePrice: {
            id: StringId.HoldingFieldDisplay_AveragePrice, translations: {
                en: 'Average Price',
            }
        },
        HoldingFieldHeading_AveragePrice: {
            id: StringId.HoldingFieldHeading_AveragePrice, translations: {
                en: 'Average Price',
            }
        },
        TopShareholderFieldDisplay_Name: {
            id: StringId.TopShareholderFieldDisplay_Name, translations: {
                en: 'Name',
            }
        },
        TopShareholderFieldHeading_Name: {
            id: StringId.TopShareholderFieldHeading_Name, translations: {
                en: 'Name',
            }
        },
        TopShareholderFieldDisplay_Designation: {
            id: StringId.TopShareholderFieldDisplay_Designation, translations: {
                en: 'Designation',
            }
        },
        TopShareholderFieldHeading_Designation: {
            id: StringId.TopShareholderFieldHeading_Designation, translations: {
                en: 'Designation',
            }
        },
        TopShareholderFieldDisplay_HolderKey: {
            id: StringId.TopShareholderFieldDisplay_HolderKey, translations: {
                en: 'HolderKey',
            }
        },
        TopShareholderFieldHeading_HolderKey: {
            id: StringId.TopShareholderFieldHeading_HolderKey, translations: {
                en: 'HolderKey',
            }
        },
        TopShareholderFieldDisplay_SharesHeld: {
            id: StringId.TopShareholderFieldDisplay_SharesHeld, translations: {
                en: 'SharesHeld',
            }
        },
        TopShareholderFieldHeading_SharesHeld: {
            id: StringId.TopShareholderFieldHeading_SharesHeld, translations: {
                en: 'SharesHeld',
            }
        },
        TopShareholderFieldDisplay_TotalShareIssue: {
            id: StringId.TopShareholderFieldDisplay_TotalShareIssue, translations: {
                en: 'TotalShareIssue',
            }
        },
        TopShareholderFieldHeading_TotalShareIssue: {
            id: StringId.TopShareholderFieldHeading_TotalShareIssue, translations: {
                en: 'TotalShareIssue',
            }
        },
        TopShareholderFieldDisplay_SharesChanged: {
            id: StringId.TopShareholderFieldDisplay_SharesChanged, translations: {
                en: 'SharesChanged',
            }
        },
        TopShareholderFieldHeading_SharesChanged: {
            id: StringId.TopShareholderFieldHeading_SharesChanged, translations: {
                en: 'SharesChanged',
            }
        },
        FeedFieldDisplay_FeedId: {
            id: StringId.FeedFieldDisplay_FeedId, translations: {
                en: 'Feed ID',
            }
        },
        FeedFieldHeading_FeedId: {
            id: StringId.FeedFieldHeading_FeedId, translations: {
                en: 'ID',
            }
        },
        FeedFieldDisplay_EnvironmentId: {
            id: StringId.FeedFieldDisplay_EnvironmentId, translations: {
                en: 'Environment',
            }
        },
        FeedFieldHeading_EnvironmentId: {
            id: StringId.FeedFieldHeading_EnvironmentId, translations: {
                en: 'Environment',
            }
        },
        FeedFieldDisplay_StatusId: {
            id: StringId.FeedFieldDisplay_StatusId, translations: {
                en: 'Status ID',
            }
        },
        FeedFieldHeading_StatusId: {
            id: StringId.FeedFieldHeading_StatusId, translations: {
                en: 'Status',
            }
        },
        FeedFieldDisplay_Name: {
            id: StringId.FeedFieldDisplay_Name, translations: {
                en: 'Name',
            }
        },
        FeedFieldHeading_Name: {
            id: StringId.FeedFieldHeading_Name, translations: {
                en: 'Name',
            }
        },
        FeedFieldDisplay_ClassId: {
            id: StringId.FeedFieldDisplay_ClassId, translations: {
                en: 'Class ID',
            }
        },
        FeedFieldHeading_ClassId: {
            id: StringId.FeedFieldHeading_ClassId, translations: {
                en: 'Class',
            }
        },
        TradingFeedFieldDisplay_OrderStatusCount: {
            id: StringId.TradingFeedFieldDisplay_OrderStatusCount, translations: {
                en: 'Order status count',
            }
        },
        TradingFeedFieldHeading_OrderStatusCount: {
            id: StringId.TradingFeedFieldHeading_OrderStatusCount, translations: {
                en: 'Order status count',
            }
        },
        MarketFieldDisplay_MarketId: {
            id: StringId.MarketFieldDisplay_MarketId, translations: {
                en: 'Market ID',
            }
        },
        MarketFieldHeading_MarketId: {
            id: StringId.MarketFieldHeading_MarketId, translations: {
                en: 'ID',
            }
        },
        MarketFieldDisplay_FeedStatusId: {
            id: StringId.MarketFieldDisplay_FeedStatusId, translations: {
                en: 'Feed Status ID',
            }
        },
        MarketFieldHeading_FeedStatusId: {
            id: StringId.MarketFieldHeading_FeedStatusId, translations: {
                en: 'Feed Status ID',
            }
        },
        MarketFieldDisplay_TradingDate: {
            id: StringId.MarketFieldDisplay_TradingDate, translations: {
                en: 'Trading Date',
            }
        },
        MarketFieldHeading_TradingDate: {
            id: StringId.MarketFieldHeading_TradingDate, translations: {
                en: 'Trading Date',
            }
        },
        MarketFieldDisplay_MarketTime: {
            id: StringId.MarketFieldDisplay_MarketTime, translations: {
                en: 'Market Time',
            }
        },
        MarketFieldHeading_MarketTime: {
            id: StringId.MarketFieldHeading_MarketTime, translations: {
                en: 'Market Time',
            }
        },
        MarketFieldDisplay_Status: {
            id: StringId.MarketFieldDisplay_Status, translations: {
                en: 'Status',
            }
        },
        MarketFieldHeading_Status: {
            id: StringId.MarketFieldHeading_Status, translations: {
                en: 'Status',
            }
        },
        MarketFieldDisplay_AllowIds: {
            id: StringId.MarketFieldDisplay_AllowIds, translations: {
                en: 'Allows',
            }
        },
        MarketFieldHeading_AllowIds: {
            id: StringId.MarketFieldHeading_AllowIds, translations: {
                en: 'Allows',
            }
        },
        MarketFieldDisplay_ReasonId: {
            id: StringId.MarketFieldDisplay_ReasonId, translations: {
                en: 'Reason',
            }
        },
        MarketFieldHeading_ReasonId: {
            id: StringId.MarketFieldHeading_ReasonId, translations: {
                en: 'Reason',
            }
        },
        MarketFieldDisplay_TradingMarkets: {
            id: StringId.MarketFieldDisplay_TradingMarkets, translations: {
                en: 'Trading Markets',
            }
        },
        MarketFieldHeading_TradingMarkets: {
            id: StringId.MarketFieldHeading_TradingMarkets, translations: {
                en: 'Trading Markets',
            }
        },
        DepthStyleDisplay_Full: {
            id: StringId.DepthStyleDisplay_Full, translations: {
                en: 'Full',
            }
        },
        DepthStyleDisplay_Short: {
            id: StringId.DepthStyleDisplay_Short, translations: {
                en: 'Short',
            }
        },
        TradingStateAllowDisplay_OrderPlace: {
            id: StringId.TradingStateAllowDisplay_OrderPlace, translations: {
                en: 'Place Order',
            }
        },
        TradingStateAllowDisplay_OrderAmend: {
            id: StringId.TradingStateAllowDisplay_OrderAmend, translations: {
                en: 'Amend Order',
            }
        },
        TradingStateAllowDisplay_OrderCancel: {
            id: StringId.TradingStateAllowDisplay_OrderCancel, translations: {
                en: 'Cancel Order',
            }
        },
        TradingStateAllowDisplay_OrderMove: {
            id: StringId.TradingStateAllowDisplay_OrderMove, translations: {
                en: 'Move Order',
            }
        },
        TradingStateAllowDisplay_Match: {
            id: StringId.TradingStateAllowDisplay_Match, translations: {
                en: 'Match',
            }
        },
        TradingStateAllowDisplay_ReportCancel: {
            id: StringId.TradingStateAllowDisplay_ReportCancel, translations: {
                en: 'Report Cancel',
            }
        },
        TradingStateReasonDisplay_Unknown: {
            id: StringId.TradingStateReasonDisplay_Unknown, translations: {
                en: 'Unknown',
            }
        },
        TradingStateReasonDisplay_Normal: {
            id: StringId.TradingStateReasonDisplay_Normal, translations: {
                en: 'Normal',
            }
        },
        TradingStateReasonDisplay_Suspend: {
            id: StringId.TradingStateReasonDisplay_Suspend, translations: {
                en: 'Suspend',
            }
        },
        TradingStateReasonDisplay_TradingHalt: {
            id: StringId.TradingStateReasonDisplay_TradingHalt, translations: {
                en: 'Trading Halt',
            }
        },
        TradingStateReasonDisplay_NewsRelease: {
            id: StringId.TradingStateReasonDisplay_NewsRelease, translations: {
                en: 'News Release',
            }
        },
        OrderStatusAllowDisplay_Trade: {
            id: StringId.OrderStatusAllowDisplay_Trade, translations: {
                en: 'Trade',
            }
        },
        OrderStatusAllowDisplay_Amend: {
            id: StringId.OrderStatusAllowDisplay_Amend, translations: {
                en: 'Amend',
            }
        },
        OrderStatusAllowDisplay_Cancel: {
            id: StringId.OrderStatusAllowDisplay_Cancel, translations: {
                en: 'Cancel',
            }
        },
        OrderStatusAllowDisplay_Move: {
            id: StringId.OrderStatusAllowDisplay_Move, translations: {
                en: 'Move',
            }
        },
        OrderStatusReasonDisplay_Unknown: {
            id: StringId.OrderStatusReasonDisplay_Unknown, translations: {
                en: 'Unknown',
            }
        },
        OrderStatusReasonDisplay_Normal: {
            id: StringId.OrderStatusReasonDisplay_Normal, translations: {
                en: 'Normal',
            }
        },
        OrderStatusReasonDisplay_Manual: {
            id: StringId.OrderStatusReasonDisplay_Manual, translations: {
                en: 'Manual',
            }
        },
        OrderStatusReasonDisplay_Abnormal: {
            id: StringId.OrderStatusReasonDisplay_Abnormal, translations: {
                en: 'Abnormal',
            }
        },
        OrderStatusReasonDisplay_Waiting: {
            id: StringId.OrderStatusReasonDisplay_Waiting, translations: {
                en: 'Waiting',
            }
        },
        OrderStatusReason_Completed: {
            id: StringId.OrderStatusReason_Completed, translations: {
                en: 'Completed',
            }
        },
        TopShareholdersInputModeDisplay_Today: {
            id: StringId.TopShareholdersInputModeDisplay_Today, translations: {
                en: 'Today',
            }
        },
        TopShareholdersInputModeDescription_Today: {
            id: StringId.TopShareholdersInputModeDescription_Today, translations: {
                en: 'View current top shareholders',
            }
        },
        TopShareholdersInputModeDisplay_Historical: {
            id: StringId.TopShareholdersInputModeDisplay_Historical, translations: {
                en: 'Historical',
            }
        },
        TopShareholdersInputModeDescription_Historical: {
            id: StringId.TopShareholdersInputModeDescription_Historical, translations: {
                en: 'View top shareholders at a past date',
            }
        },
        TopShareholdersInputModeDisplay_Compare: {
            id: StringId.TopShareholdersInputModeDisplay_Compare, translations: {
                en: 'Compare',
            }
        },
        TopShareholdersInputModeDescription_Compare: {
            id: StringId.TopShareholdersInputModeDescription_Compare, translations: {
                en: 'Compare top shareholders at different dates',
            }
        },
        TopShareholdersInputModeDisplay_Details: {
            id: StringId.TopShareholdersInputModeDisplay_Details, translations: {
                en: 'Details',
            }
        },
        TopShareholdersInputModeDescription_Details: {
            id: StringId.TopShareholdersInputModeDescription_Details, translations: {
                en: 'Details of security',
            }
        },
        TopShareholdersSymbolTitle: {
            id: StringId.TopShareholdersSymbolTitle, translations: {
                en: 'Symbol (only supports NZX)',
            }
        },
        TopShareholdersTodayModeCaption: {
            id: StringId.TopShareholdersTodayModeCaption, translations: {
                en: 'Current',
            }
        },
        TopShareholdersTodayModeTitle: {
            id: StringId.TopShareholdersTodayModeTitle, translations: {
                en: 'Current Top Shareholders',
            }
        },
        TopShareholdersHistoricalModeCaption: {
            id: StringId.TopShareholdersHistoricalModeCaption, translations: {
                en: 'Historical',
            }
        },
        TopShareholdersHistoricalModeTitle: {
            id: StringId.TopShareholdersHistoricalModeTitle, translations: {
                en: 'Historical Top Shareholders',
            }
        },
        TopShareholdersCompareModeCaption: {
            id: StringId.TopShareholdersCompareModeCaption, translations: {
                en: 'Compare',
            }
        },
        TopShareholdersCompareModeTitle: {
            id: StringId.TopShareholdersCompareModeTitle, translations: {
                en: 'Compare Top Shareholders on different dates',
            }
        },
        TopShareholdersDetailsModeCaption: {
            id: StringId.TopShareholdersDetailsModeCaption, translations: {
                en: 'Details',
            }
        },
        TopShareholdersDetailsModeTitle: {
            id: StringId.TopShareholdersDetailsModeTitle, translations: {
                en: 'Details of security',
            }
        },
        TopShareholdersHistoricalDate: {
            id: StringId.TopShareholdersHistoricalDate, translations: {
                en: 'Historical Top Shareholders date',
            }
        },
        TopShareholdersHistory: {
            id: StringId.TopShareholdersHistory, translations: {
                en: 'Get Top Shareholders at date',
            }
        },
        TopShareholdersInvalidHistory: {
            id: StringId.TopShareholdersInvalidHistory, translations: {
                en: 'Cannot get without symbol and historical date',
            }
        },
        TopShareholdersCompareFromDate: {
            id: StringId.TopShareholdersCompareFromDate, translations: {
                en: 'Compare from date',
            }
        },
        TopShareholdersCompareToDate: {
            id: StringId.TopShareholdersCompareToDate, translations: {
                en: 'Compare to date',
            }
        },
        TopShareholdersCompare: {
            id: StringId.TopShareholdersCompare, translations: {
                en: 'Compare Top Shareholders at dates',
            }
        },
        TopShareholdersInvalidCompare: {
            id: StringId.TopShareholdersInvalidCompare, translations: {
                en: 'Cannot compare without symbol, from date and to date',
            }
        },
        Top100Shareholders: {
            id: StringId.Top100Shareholders, translations: {
                en: 'Top 100 Shareholders',
            }
        },
        WatchlistSymbolInputTitle: {
            id: StringId.WatchlistSymbolInputTitle, translations: {
                en: 'Enter symbol',
            }
        },
        WatchlistSymbolButtonTitle: {
            id: StringId.WatchlistSymbolButtonTitle, translations: {
                en: 'Add (or select) symbol',
            }
        },
        WatchlistDeleteSymbolCaption: {
            id: StringId.WatchlistDeleteSymbolCaption, translations: {
                en: 'Delete symbol',
            }
        },
        WatchlistDeleteSymbolTitle: {
            id: StringId.WatchlistDeleteSymbolTitle, translations: {
                en: 'Delete symbol',
            }
        },
        NewWatchlistCaption: {
            id: StringId.NewWatchlistCaption, translations: {
                en: 'New watchlist',
            }
        },
        NewWatchlistTitle: {
            id: StringId.NewWatchlistTitle, translations: {
                en: 'New watchlist (hold shift key down to keep current layout)',
            }
        },
        OpenWatchlistCaption: {
            id: StringId.OpenWatchlistCaption, translations: {
                en: 'Open watchlist',
            }
        },
        OpenWatchlistTitle: {
            id: StringId.OpenWatchlistTitle, translations: {
                en: 'Open watchlist',
            }
        },
        SaveWatchlistCaption: {
            id: StringId.SaveWatchlistCaption, translations: {
                en: 'Save watchlist',
            }
        },
        SaveWatchlistTitle: {
            id: StringId.SaveWatchlistTitle, translations: {
                en: 'Save watchlist',
            }
        },
        GridLayoutEditorCancelSearchCaption: {
            id: StringId.GridLayoutEditorCancelSearchCaption, translations: {
                en: 'Cancel search',
            }
        },
        GridLayoutEditorCancelSearchTitle: {
            id: StringId.GridLayoutEditorCancelSearchTitle, translations: {
                en: 'Cancel search',
            }
        },
        GridLayoutEditorSearchNextCaption: {
            id: StringId.GridLayoutEditorSearchNextCaption, translations: {
                en: 'Next match',
            }
        },
        GridLayoutEditorSearchNextTitle: {
            id: StringId.GridLayoutEditorSearchNextTitle, translations: {
                en: 'Next search match',
            }
        },
        GridLayoutEditorSearchInputTitle: {
            id: StringId.GridLayoutEditorSearchInputTitle, translations: {
                en: 'Search for column',
            }
        },
        GridLayoutEditorMoveUpCaption: {
            id: StringId.GridLayoutEditorMoveUpCaption, translations: {
                en: 'Up one',
            }
        },
        GridLayoutEditorMoveUpTitle: {
            id: StringId.GridLayoutEditorMoveUpTitle, translations: {
                en: 'Move column up one position',
            }
        },
        GridLayoutEditorMoveTopCaption: {
            id: StringId.GridLayoutEditorMoveTopCaption, translations: {
                en: 'To top',
            }
        },
        GridLayoutEditorMoveTopTitle: {
            id: StringId.GridLayoutEditorMoveTopTitle, translations: {
                en: 'Move column to top',
            }
        },
        GridLayoutEditorMoveDownCaption: {
            id: StringId.GridLayoutEditorMoveDownCaption, translations: {
                en: 'Down one',
            }
        },
        GridLayoutEditorMoveDownTitle: {
            id: StringId.GridLayoutEditorMoveDownTitle, translations: {
                en: 'Move column down one position',
            }
        },
        GridLayoutEditorMoveBottomCaption: {
            id: StringId.GridLayoutEditorMoveBottomCaption, translations: {
                en: 'To bottom',
            }
        },
        GridLayoutEditorMoveBottomTitle: {
            id: StringId.GridLayoutEditorMoveBottomTitle, translations: {
                en: 'Move column to bottom',
            }
        },
        GridLayoutEditorShowAllRadioCaption: {
            id: StringId.GridLayoutEditorShowAllRadioCaption, translations: {
                en: 'All',
            }
        },
        GridLayoutEditorShowAllRadioTitle: {
            id: StringId.GridLayoutEditorShowAllRadioTitle, translations: {
                en: 'Show all columns',
            }
        },
        GridLayoutEditorShowVisibleRadioCaption: {
            id: StringId.GridLayoutEditorShowVisibleRadioCaption, translations: {
                en: 'Visible',
            }
        },
        GridLayoutEditorShowVisibleRadioTitle: {
            id: StringId.GridLayoutEditorShowVisibleRadioTitle, translations: {
                en: 'Only show visible columns',
            }
        },
        GridLayoutEditorShowHiddenRadioCaption: {
            id: StringId.GridLayoutEditorShowHiddenRadioCaption, translations: {
                en: 'Hidden',
            }
        },
        GridLayoutEditorShowHiddenRadioTitle: {
            id: StringId.GridLayoutEditorShowHiddenRadioTitle, translations: {
                en: 'Only show hidden columns',
            }
        },
        CallPutFieldDisplay_ExercisePrice: {
            id: StringId.CallPutFieldDisplay_ExercisePrice, translations: {
               en: 'Exercise Price',
            }
        },
        CallPutFieldHeading_ExercisePrice: {
            id: StringId.CallPutFieldHeading_ExercisePrice, translations: {
               en: 'Exercise',
            }
        },
        CallPutFieldDisplay_ExpiryDate: {
            id: StringId.CallPutFieldDisplay_ExpiryDate, translations: {
               en: 'Expiry Date',
            }
        },
        CallPutFieldHeading_ExpiryDate: {
            id: StringId.CallPutFieldHeading_ExpiryDate, translations: {
               en: 'Expiry',
            }
        },
        CallPutFieldDisplay_LitId: {
            id: StringId.CallPutFieldDisplay_LitId, translations: {
               en: 'Market',
            }
        },
        CallPutFieldHeading_LitId: {
            id: StringId.CallPutFieldHeading_LitId, translations: {
               en: 'Market',
            }
        },
        CallPutFieldDisplay_CallLitIvemId: {
            id: StringId.CallPutFieldDisplay_CallLitIvemId, translations: {
               en: 'Call Symbol',
            }
        },
        CallPutFieldHeading_CallLitIvemId: {
            id: StringId.CallPutFieldHeading_CallLitIvemId, translations: {
               en: 'C.Symbol',
            }
        },
        CallPutFieldDisplay_PutLitIvemId: {
            id: StringId.CallPutFieldDisplay_PutLitIvemId, translations: {
               en: 'Put Symbol',
            }
        },
        CallPutFieldHeading_PutLitIvemId: {
            id: StringId.CallPutFieldHeading_PutLitIvemId, translations: {
               en: 'P.Symbol',
            }
        },
        CallPutFieldDisplay_ContractMultiplier: {
            id: StringId.CallPutFieldDisplay_ContractMultiplier, translations: {
               en: 'Contract Multiplier',
            }
        },
        CallPutFieldHeading_ContractMultiplier: {
            id: StringId.CallPutFieldHeading_ContractMultiplier, translations: {
               en: 'Multiplier',
            }
        },
        CallPutFieldDisplay_ExerciseTypeId: {
            id: StringId.CallPutFieldDisplay_ExerciseTypeId, translations: {
               en: 'Exercise Type',
            }
        },
        CallPutFieldHeading_ExerciseTypeId: {
            id: StringId.CallPutFieldHeading_ExerciseTypeId, translations: {
               en: 'Type',
            }
        },
        CallPutFieldDisplay_UnderlyingIvemId: {
            id: StringId.CallPutFieldDisplay_UnderlyingIvemId, translations: {
               en: 'Underlying Symbol',
            }
        },
        CallPutFieldHeading_UnderlyingIvemId: {
            id: StringId.CallPutFieldHeading_UnderlyingIvemId, translations: {
               en: 'Underlying',
            }
        },
        CallPutFieldDisplay_UnderlyingIsIndex: {
            id: StringId.CallPutFieldDisplay_UnderlyingIsIndex, translations: {
               en: 'Underlying is Index',
            }
        },
        CallPutFieldHeading_UnderlyingIsIndex: {
            id: StringId.CallPutFieldHeading_UnderlyingIsIndex, translations: {
               en: 'Index?',
            }
        },
        ExerciseTypeDisplay_American: {
            id: StringId.ExerciseTypeDisplay_American, translations: {
               en: 'American',
            }
        },
        ExerciseTypeDisplay_European: {
            id: StringId.ExerciseTypeDisplay_European, translations: {
               en: 'European',
            }
        },
        EtoPriceQuotationSymbolInputTitle: {
            id: StringId.EtoPriceQuotationSymbolInputTitle, translations: {
               en: 'Enter underlying symbol',
            }
        },
        EtoPriceQuotationApplySymbolCaption: {
            id: StringId.EtoPriceQuotationApplySymbolCaption, translations: {
               en: 'Get options',
            }
        },
        EtoPriceQuotationApplySymbolTitle: {
            id: StringId.EtoPriceQuotationApplySymbolTitle, translations: {
               en: 'Get options for symbol',
            }
        },
        TradeAffects_None: {
            id: StringId.TradeAffects_None, translations: {
               en: 'None',
            }
        },
        TradeAffects_Price: {
            id: StringId.TradeAffects_Price, translations: {
               en: 'Price',
            }
        },
        TradeAffects_Volume: {
            id: StringId.TradeAffects_Volume, translations: {
               en: 'Volume',
            }
        },
        TradeAffects_Vwap: {
            id: StringId.TradeAffects_Vwap, translations: {
               en: 'VWAP',
            }
        },
        TradeAttribute_OffMarketTrade: {
            id: StringId.TradeAttribute_OffMarketTrade, translations: {
                en: 'Off Market',
            }
        },
        TradeAttribute_PlaceholderTrade: {
            id: StringId.TradeAttribute_PlaceholderTrade, translations: {
                en: 'Placeholder',
            }
        },
        TradeAttribute_Cancel: {
            id: StringId.TradeAttribute_Cancel, translations: {
                en: 'Cancel',
            }
        },
        SettingCaption_FontFamily: {
            id: StringId.SettingCaption_FontFamily, translations: {
                en: 'Font Family',
            }
        },
        SettingTitle_FontFamily: {
            id: StringId.SettingTitle_FontFamily, translations: {
                en: 'Font Family',
            }
        },
        SettingCaption_FontSize: {
            id: StringId.SettingCaption_FontSize, translations: {
                en: 'Font Size',
            }
        },
        SettingTitle_FontSize: {
            id: StringId.SettingTitle_FontSize, translations: {
                en: 'Font Size',
            }
        },
        SettingCaption_Symbol_DefaultExchange: {
            id: StringId.SettingCaption_Symbol_DefaultExchange, translations: {
                en: 'Default exchange',
            }
        },
        SettingTitle_Symbol_DefaultExchange: {
            id: StringId.SettingTitle_Symbol_DefaultExchange, translations: {
                en: 'Default exchange',
            }
        },
        SettingCaption_Symbol_ExchangeHideMode: {
            id: StringId.SettingCaption_Symbol_ExchangeHideMode, translations: {
                en: 'Exchange hide mode',
            }
        },
        SettingTitle_Symbol_ExchangeHideMode: {
            id: StringId.SettingTitle_Symbol_ExchangeHideMode, translations: {
                en: 'Specifies when the exchange part of a symbol should be hidden',
            }
        },
        SettingCaption_Symbol_DefaultMarketHidden: {
            id: StringId.SettingCaption_Symbol_DefaultMarketHidden, translations: {
                en: 'Hide default market',
            }
        },
        SettingTitle_Symbol_DefaultMarketHidden: {
            id: StringId.SettingTitle_Symbol_DefaultMarketHidden, translations: {
                en: 'Hide the default market in a symbol',
            }
        },
        SettingCaption_Symbol_MarketCodeAsLocalWheneverPossible: {
            id: StringId.SettingCaption_Symbol_MarketCodeAsLocalWheneverPossible, translations: {
                en: 'Abbreviate market code',
            }
        },
        SettingTitle_Symbol_MarketCodeAsLocalWheneverPossible: {
            id: StringId.SettingTitle_Symbol_MarketCodeAsLocalWheneverPossible, translations: {
                en: 'Use abbreviated market code in symbol when market belongs to symbol\'s exchange',
            }
        },
        SettingCaption_Format_NumberGroupingActive: {
            id: StringId.SettingCaption_Format_NumberGroupingActive, translations: {
                en: 'Number grouping',
            }
        },
        SettingTitle_Format_NumberGroupingActive: {
            id: StringId.SettingTitle_Format_NumberGroupingActive, translations: {
                en: 'Group large numbers as per regional settings (eg. use , to separate every 3 digits)',
            }
        },
        SettingCaption_Format_MinimumPriceFractionDigitsCount: {
            id: StringId.SettingCaption_Format_MinimumPriceFractionDigitsCount, translations: {
                en: 'Price min fractional digits',
            }
        },
        SettingTitle_Format_MinimumPriceFractionDigitsCount: {
            id: StringId.SettingTitle_Format_MinimumPriceFractionDigitsCount, translations: {
                en: 'Show at least this number of fractional digits in a price',
            }
        },
        SettingCaption_Format_24Hour: {
            id: StringId.SettingCaption_Format_24Hour, translations: {
                en: '24 Hour times',
            }
        },
        SettingTitle_Format_24Hour: {
            id: StringId.SettingTitle_Format_24Hour, translations: {
                en: 'Show times with a 24 hour clock instead of a 12 hour clock',
            }
        },
        SettingCaption_Format_DateTimeTimezoneModeId: {
            id: StringId.SettingCaption_Format_DateTimeTimezoneModeId, translations: {
                en: 'Times in timezone',
            }
        },
        SettingTitle_Format_DateTimeTimezoneModeId: {
            id: StringId.SettingTitle_Format_DateTimeTimezoneModeId, translations: {
                en: 'Specify which timezone times should be converted to',
            }
        },
        SettingCaption_Master_SettingsProfile: {
            id: StringId.SettingCaption_Master_SettingsProfile, translations: {
                en: 'Settings profile',
            }
        },
        SettingTitle_Master_SettingsProfile: {
            id: StringId.SettingTitle_Master_SettingsProfile, translations: {
                en: 'Choose which set of settings to use',
            }
        },
        SettingCaption_Grid_HorizontalLinesVisible: {
            id: StringId.SettingCaption_Grid_HorizontalLinesVisible, translations: {
                en: 'Show horizontal grid lines',
            }
        },
        SettingTitle_Grid_HorizontalLinesVisible: {
            id: StringId.SettingTitle_Grid_HorizontalLinesVisible, translations: {
                en: 'Show horizontal grid lines',
            }
        },
        SettingCaption_Grid_VerticalLinesVisible: {
            id: StringId.SettingCaption_Grid_VerticalLinesVisible, translations: {
                en: 'Show vertical grid lines',
            }
        },
        SettingTitle_Grid_VerticalLinesVisible: {
            id: StringId.SettingTitle_Grid_VerticalLinesVisible, translations: {
                en: 'Show vertical grid lines',
            }
        },
        SettingCaption_Grid_HorizontalLineWeight: {
            id: StringId.SettingCaption_Grid_HorizontalLineWeight, translations: {
                en: 'Set weight of horizontal grid lines',
            }
        },
        SettingTitle_Grid_HorizontalLineWeight: {
            id: StringId.SettingTitle_Grid_HorizontalLineWeight, translations: {
                en: 'Set weight of horizontal grid lines',
            }
        },
        SettingCaption_Grid_VerticalLineWeight: {
            id: StringId.SettingCaption_Grid_VerticalLineWeight, translations: {
                en: 'Set weight of vertical grid lines',
            }
        },
        SettingTitle_Grid_VerticalLineWeight: {
            id: StringId.SettingTitle_Grid_VerticalLineWeight, translations: {
                en: 'Set weight of vertical grid lines',
            }
        },
        SettingCaption_Grid_CellPadding: {
            id: StringId.SettingCaption_Grid_CellPadding, translations: {
                en: 'Cell padding size (pixels)',
            }
        },
        SettingTitle_Grid_CellPadding: {
            id: StringId.SettingTitle_Grid_CellPadding, translations: {
                en: 'Cell padding size (pixels)',
            }
        },
        SettingCaption_Grid_AddHighlightDuration: {
            id: StringId.SettingCaption_Grid_AddHighlightDuration, translations: {
                en: 'Duration of add highlights (milliseconds)',
            }
        },
        SettingTitle_Grid_AddHighlightDuration: {
            id: StringId.SettingTitle_Grid_AddHighlightDuration, translations: {
                en: 'Duration of add highlights (milliseconds)',
            }
        },
        SettingCaption_Grid_UpdateHighlightDuration: {
            id: StringId.SettingCaption_Grid_UpdateHighlightDuration, translations: {
                en: 'Duration of update highlights (milliseconds)',
            }
        },
        SettingTitle_Grid_UpdateHighlightDuration: {
            id: StringId.SettingTitle_Grid_UpdateHighlightDuration, translations: {
                en: 'Duration of update highlights (milliseconds)',
            }
        },
        SettingCaption_Grid_FocusedRowColored: {
            id: StringId.SettingCaption_Grid_FocusedRowColored, translations: {
                en: 'Color focused row',
            }
        },
        SettingTitle_Grid_FocusedRowColored: {
            id: StringId.SettingTitle_Grid_FocusedRowColored, translations: {
                en: 'Color focused row',
            }
        },
        SettingCaption_Grid_FocusedRowBordered: {
            id: StringId.SettingCaption_Grid_FocusedRowBordered, translations: {
                en: 'Border focused row',
            }
        },
        SettingTitle_Grid_FocusedRowBordered: {
            id: StringId.SettingTitle_Grid_FocusedRowBordered, translations: {
                en: 'Border focused row',
            }
        },
        SettingCaption_Grid_FocusedRowBorderWidth: {
            id: StringId.SettingCaption_Grid_FocusedRowBorderWidth, translations: {
                en: 'Focused row border width',
            }
        },
        SettingTitle_Grid_FocusedRowBorderWidth: {
            id: StringId.SettingTitle_Grid_FocusedRowBorderWidth, translations: {
                en: 'Focused row border width',
            }
        },
        SettingCaption_Grid_HorizontalScrollbarWidth: {
            id: StringId.SettingCaption_Grid_HorizontalScrollbarWidth, translations: {
                en: 'Horizontal scrollbar width',
            }
        },
        SettingTitle_Grid_HorizontalScrollbarWidth: {
            id: StringId.SettingTitle_Grid_HorizontalScrollbarWidth, translations: {
                en: 'Horizontal scrollbar width (pixels)',
            }
        },
        SettingCaption_Grid_VerticalScrollbarWidth: {
            id: StringId.SettingCaption_Grid_VerticalScrollbarWidth, translations: {
                en: 'Vertical scrollbar width',
            }
        },
        SettingTitle_Grid_VerticalScrollbarWidth: {
            id: StringId.SettingTitle_Grid_VerticalScrollbarWidth, translations: {
                en: 'Vertical scrollbar width (pixels)',
            }
        },
        SettingCaption_Grid_ScrollbarMargin: {
            id: StringId.SettingCaption_Grid_ScrollbarMargin, translations: {
                en: 'Scrollbar margin',
            }
        },
        SettingTitle_Grid_ScrollbarMargin: {
            id: StringId.SettingTitle_Grid_ScrollbarMargin, translations: {
                en: 'Scrollbar margin (pixels)',
            }
        },
        SettingCaption_Grid_ScrollbarsOverlayAllowed: {
            id: StringId.SettingCaption_Grid_ScrollbarsOverlayAllowed, translations: {
                en: 'Scrollbars can overlap grid',
            }
        },
        SettingTitle_Grid_ScrollbarsOverlayAllowed: {
            id: StringId.SettingTitle_Grid_ScrollbarsOverlayAllowed, translations: {
                en: 'Allow scrollbars to overlap grid for more compact layout',
            }
        },
        SettingCaption_OrderPad_ReviewEnabled: {
            id: StringId.SettingCaption_OrderPad_ReviewEnabled, translations: {
                en: 'Enable order review',
            }
        },
        SettingTitle_OrderPad_ReviewEnabled: {
            id: StringId.SettingTitle_OrderPad_ReviewEnabled, translations: {
                en: 'Order pad will include review step before sending',
            }
        },
        SettingCaption_OrderPad_DefaultOrderTypeId: {
            id: StringId.SettingCaption_OrderPad_DefaultOrderTypeId, translations: {
                en: 'Default Order Type',
            }
        },
        SettingTitle_OrderPad_DefaultOrderTypeId: {
            id: StringId.SettingTitle_OrderPad_DefaultOrderTypeId, translations: {
                en: 'Initialise order type for new orders',
            }
        },
        DefaultOrderTypeIdNotSpecified: {
            id: StringId.DefaultOrderTypeIdNotSpecified, translations: {
                en: 'Order type is not initialised',
            }
        },
        SettingCaption_OrderPad_DefaultTimeInForceId: {
            id: StringId.SettingCaption_OrderPad_DefaultTimeInForceId, translations: {
                en: 'Default Time in Force',
            }
        },
        SettingTitle_OrderPad_DefaultTimeInForceId: {
            id: StringId.SettingTitle_OrderPad_DefaultTimeInForceId, translations: {
                en: 'Initialise time in force for new orders',
            }
        },
        DefaultTimeInForceIdNotSpecified: {
            id: StringId.DefaultTimeInForceIdNotSpecified, translations: {
                en: 'Time in force is not initialised',
            }
        },
        ColorGridHeading_ItemId: {
            id: StringId.ColorGridHeading_ItemId, translations: {
                en: 'Id',
            }
        },
        ColorGridHeading_Name: {
            id: StringId.ColorGridHeading_Name, translations: {
                en: 'Name',
            }
        },
        ColorGridHeading_Display: {
            id: StringId.ColorGridHeading_Display, translations: {
                en: 'Display',
            }
        },
        ColorGridHeading_ItemBkgdColorText: {
            id: StringId.ColorGridHeading_ItemBkgdColorText, translations: {
                en: 'Bkgd',
            }
        },
        ColorGridHeading_ResolvedBkgdColorText: {
            id: StringId.ColorGridHeading_ResolvedBkgdColorText, translations: {
                en: 'Bkgd',
            }
        },
        ColorGridHeading_ItemForeColorText: {
            id: StringId.ColorGridHeading_ItemForeColorText, translations: {
                en: 'Fore',
            }
        },
        ColorGridHeading_ResolvedForeColorText: {
            id: StringId.ColorGridHeading_ResolvedForeColorText, translations: {
                en: 'Fore',
            }
        },
        ColorGridHeading_ItemBkgdColor: {
            id: StringId.ColorGridHeading_ItemBkgdColor, translations: {
                en: 'Bkgd',
            }
        },
        ColorGridHeading_ResolvedBkgdColor: {
            id: StringId.ColorGridHeading_ResolvedBkgdColor, translations: {
                en: 'Bkgd',
            }
        },
        ColorGridHeading_ItemForeColor: {
            id: StringId.ColorGridHeading_ItemForeColor, translations: {
                en: 'Fore',
            }
        },
        ColorGridHeading_ResolvedForeColor: {
            id: StringId.ColorGridHeading_ResolvedForeColor, translations: {
                en: 'Fore',
            }
        },
        ColorGridHeading_NotHasBkgd: {
            id: StringId.ColorGridHeading_NotHasBkgd, translations: {
                en: 'Bkgd',
            }
        },
        ColorGridHeading_NotHasFore: {
            id: StringId.ColorGridHeading_NotHasFore, translations: {
                en: 'Fore',
            }
        },
        ColorGridHeading_Readability: {
            id: StringId.ColorGridHeading_Readability, translations: {
                en: 'Readability',
            }
        },
        ColorGridHeading_IsReadable: {
            id: StringId.ColorGridHeading_IsReadable, translations: {
                en: 'Readable',
            }
        },
        LogLevel_Info: {
            id: StringId.LogLevel_Info, translations: {
                en: 'Info',
            }
        },
        LogLevel_Warning: {
            id: StringId.LogLevel_Warning, translations: {
                en: 'Warning',
            }
        },
        LogLevel_Error: {
            id: StringId.LogLevel_Error, translations: {
                en: 'Error',
            }
        },
        LogLevel_Severe: {
            id: StringId.LogLevel_Severe, translations: {
                en: 'Severe',
            }
        },
        LogLevel_Debug: {
            id: StringId.LogLevel_Debug, translations: {
                en: 'Debug',
            }
        },
        ZenithPublisherStateDisplay_ConnectionSubscription: {
            id: StringId.ZenithPublisherStateDisplay_ConnectionSubscription, translations: {
                en: 'ConnectionSubscription',
            }
        },
        ZenithPublisherStateDisplay_ReconnectDelay: {
            id: StringId.ZenithPublisherStateDisplay_ReconnectDelay, translations: {
                en: 'Reconnect Delay',
            }
        },
        ZenithPublisherStateDisplay_ConnectPending: {
            id: StringId.ZenithPublisherStateDisplay_ConnectPending, translations: {
                en: 'Connect Pending',
            }
        },
        ZenithPublisherStateDisplay_Connect: {
            id: StringId.ZenithPublisherStateDisplay_Connect, translations: {
                en: 'Connect',
            }
        },
        ZenithPublisherStateDisplay_AuthFetch: {
            id: StringId.ZenithPublisherStateDisplay_AuthFetch, translations: {
                en: 'AuthFetch',
            }
        },
        ZenithPublisherStateDisplay_SocketOpen: {
            id: StringId.ZenithPublisherStateDisplay_SocketOpen, translations: {
                en: 'Socket Open',
            }
        },
        ZenithPublisherStateDisplay_ZenithTokenFetch: {
            id: StringId.ZenithPublisherStateDisplay_ZenithTokenFetch, translations: {
                en: 'Token Fetch',
            }
        },
        ZenithPublisherStateDisplay_ZenithTokenInterval: {
            id: StringId.ZenithPublisherStateDisplay_ZenithTokenInterval, translations: {
                en: 'Token Refresh Interval',
            }
        },
        ZenithPublisherStateDisplay_ZenithTokenRefresh: {
            id: StringId.ZenithPublisherStateDisplay_ZenithTokenRefresh, translations: {
                en: 'Zenith Refresh',
            }
        },
        ZenithPublisherStateDisplay_SocketClose: {
            id: StringId.ZenithPublisherStateDisplay_SocketClose, translations: {
                en: 'Socket Close',
            }
        },
        ZenithPublisherStateDisplay_Finalised: {
            id: StringId.ZenithPublisherStateDisplay_Finalised, translations: {
                en: 'Finalised',
            }
        },
        ZenithPublisherReconnectReasonDisplay_ConnectionSubscription: {
            id: StringId.ZenithPublisherReconnectReasonDisplay_ConnectionSubscription, translations: {
                en: 'Connection Subscription',
            }
        },
        ZenithPublisherReconnectReasonDisplay_PassportTokenFailure: {
            id: StringId.ZenithPublisherReconnectReasonDisplay_PassportTokenFailure, translations: {
                en: 'Passport Token Failure',
            }
        },
        ZenithPublisherReconnectReasonDisplay_SocketOpenFailure: {
            id: StringId.ZenithPublisherReconnectReasonDisplay_SocketOpenFailure, translations: {
                en: 'Socket Open Failure',
            }
        },
        ZenithPublisherReconnectReasonDisplay_ZenithTokenFetchFailure: {
            id: StringId.ZenithPublisherReconnectReasonDisplay_ZenithTokenFetchFailure, translations: {
                en: 'Zenith Token Fetch Failure',
            }
        },
        ZenithPublisherReconnectReasonDisplay_UnexpectedSocketClose: {
            id: StringId.ZenithPublisherReconnectReasonDisplay_UnexpectedSocketClose, translations: {
                en: 'Unexpected Socket Close',
            }
        },
        ZenithPublisherReconnectReasonDisplay_SocketClose: {
            id: StringId.ZenithPublisherReconnectReasonDisplay_SocketClose, translations: {
                en: 'Socket Close',
            }
        },
        ZenithPublisherReconnectReasonDisplay_Timeout: {
            id: StringId.ZenithPublisherReconnectReasonDisplay_Timeout, translations: {
                en: 'Timeout',
            }
        },
        SessionManagerStateDisplay_NotStarted: {
            id: StringId.SessionManagerStateDisplay_NotStarted, translations: {
                en: 'Not Started',
            }
        },
        SessionManagerStateDisplay_Starting: {
            id: StringId.SessionManagerStateDisplay_Starting, translations: {
                en: 'Starting',
            }
        },
        SessionManagerStateDisplay_Online: {
            id: StringId.SessionManagerStateDisplay_Online, translations: {
                en: 'Online',
            }
        },
        SessionManagerStateDisplay_Offline: {
            id: StringId.SessionManagerStateDisplay_Offline, translations: {
                en: 'Offline',
            }
        },
        SessionManagerStateDisplay_Finalising: {
            id: StringId.SessionManagerStateDisplay_Finalising, translations: {
                en: 'Finalising',
            }
        },
        SessionManagerStateDisplay_Finalised: {
            id: StringId.SessionManagerStateDisplay_Finalised, translations: {
                en: 'Finalised',
            }
        },
        ColorSettingsItemStateDisplay_Never: {
            id: StringId.ColorSettingsItemStateDisplay_Never, translations: {
                en: 'Never',
            }
        },
        ColorSettingsItemStateDisplay_Inherit: {
            id: StringId.ColorSettingsItemStateDisplay_Inherit, translations: {
                en: 'Inherit',
            }
        },
        ColorSettingsItemStateDisplay_Value: {
            id: StringId.ColorSettingsItemStateDisplay_Value, translations: {
                en: 'Value',
            }
        },
        OrderPadFieldDisplay_RequestType: {
            id: StringId.OrderPadFieldDisplay_RequestType, translations: {
                en: 'Request type',
            }
        },
        OrderPadFieldDisplay_ProductIdentificationType: {
            id: StringId.OrderPadFieldDisplay_ProductIdentificationType, translations: {
                en: 'ProductIdentificationType',
            }
        },
        OrderPadFieldDisplay_AccountId: {
            id: StringId.OrderPadFieldDisplay_AccountId, translations: {
                en: 'Account Id',
            }
        },
        OrderPadFieldDisplay_BrokerageAccountsDataItemReady: {
            id: StringId.OrderPadFieldDisplay_BrokerageAccountsDataItemReady, translations: {
                en: 'BrokerageAccountsDataItemReady',
            }
        },
        OrderPadFieldDisplay_BrokerageCode: {
            id: StringId.OrderPadFieldDisplay_BrokerageCode, translations: {
                en: 'Brokerage code',
            }
        },
        OrderPadFieldDisplay_BrokerageScheduleDataItemReady: {
            id: StringId.OrderPadFieldDisplay_BrokerageScheduleDataItemReady, translations: {
                en: 'BrokerageScheduleDataItemReady',
            }
        },
        OrderPadFieldDisplay_AccountDefaultBrokerageCode: {
            id: StringId.OrderPadFieldDisplay_AccountDefaultBrokerageCode, translations: {
                en: 'AccountDefaultBrokerageCode',
            }
        },
        OrderPadFieldDisplay_BrokerageCodeListReady: {
            id: StringId.OrderPadFieldDisplay_BrokerageCodeListReady, translations: {
                en: 'BrokerageCodeListReady',
            }
        },
        OrderPadFieldDisplay_LinkId: {
            id: StringId.OrderPadFieldDisplay_LinkId, translations: {
                en: 'LinkId',
            }
        },
        OrderPadFieldDisplay_Brokerage: {
            id: StringId.OrderPadFieldDisplay_Brokerage, translations: {
                en: 'Brokerage',
            }
        },
        OrderPadFieldDisplay_ExpiryDate: {
            id: StringId.OrderPadFieldDisplay_ExpiryDate, translations: {
                en: 'Expiry date',
            }
        },
        OrderPadFieldDisplay_InstructionTime: {
            id: StringId.OrderPadFieldDisplay_InstructionTime, translations: {
                en: 'Instruction time',
            }
        },
        OrderPadFieldDisplay_SymbolAndSource: {
            id: StringId.OrderPadFieldDisplay_SymbolAndSource, translations: {
                en: 'Symbol',
            }
        },
        OrderPadFieldDisplay_SymbolPriceStepSegmentsDataItemReady: {
            id: StringId.OrderPadFieldDisplay_SymbolPriceStepSegmentsDataItemReady, translations: {
                en: 'SymbolPriceStepSegmentsDataItemReady',
            }
        },
        OrderPadFieldDisplay_Srn: {
            id: StringId.OrderPadFieldDisplay_Srn, translations: {
                en: 'Srn',
            }
        },
        OrderPadFieldDisplay_LocateReqd: {
            id: StringId.OrderPadFieldDisplay_LocateReqd, translations: {
                en: 'LocateReqd',
            }
        },
        OrderPadFieldDisplay_Algo: {
            id: StringId.OrderPadFieldDisplay_Algo, translations: {
                en: 'Algo',
            }
        },
        OrderPadFieldDisplay_VisibleQuantity: {
            id: StringId.OrderPadFieldDisplay_VisibleQuantity, translations: {
                en: 'Visible quantity',
            }
        },
        OrderPadFieldDisplay_MinimumQuantity: {
            id: StringId.OrderPadFieldDisplay_MinimumQuantity, translations: {
                en: 'Minimum quantity',
            }
        },
        OrderPadFieldDisplay_ExecutionInstructions: {
            id: StringId.OrderPadFieldDisplay_ExecutionInstructions, translations: {
                en: 'Execution instructions',
            }
        },
        OrderPadFieldDisplay_OrderType: {
            id: StringId.OrderPadFieldDisplay_OrderType, translations: {
                en: 'Order type',
            }
        },
        OrderPadFieldDisplay_TriggerTypeId: {
            id: StringId.OrderPadFieldDisplay_TriggerTypeId, translations: {
                en: 'Trigger type',
            }
        },
        OrderPadFieldDisplay_Previewed: {
            id: StringId.OrderPadFieldDisplay_Previewed, translations: {
                en: 'Previewed',
            }
        },
        OrderPadFieldDisplay_TotalQuantity: {
            id: StringId.OrderPadFieldDisplay_TotalQuantity, translations: {
                en: 'Total quantity',
            }
        },
        OrderPadFieldDisplay_OrigRequestId: {
            id: StringId.OrderPadFieldDisplay_OrigRequestId, translations: {
                en: 'OrigRequestId',
            }
        },
        OrderPadFieldDisplay_OrderGivenBy: {
            id: StringId.OrderPadFieldDisplay_OrderGivenBy, translations: {
                en: 'OrderGivenBy',
            }
        },
        OrderPadFieldDisplay_OrderGiversDataItemReady: {
            id: StringId.OrderPadFieldDisplay_OrderGiversDataItemReady, translations: {
                en: 'OrderGiversDataItemReady',
            }
        },
        OrderPadFieldDisplay_OrderTakenBy: {
            id: StringId.OrderPadFieldDisplay_OrderTakenBy, translations: {
                en: 'OrderTakenBy',
            }
        },
        OrderPadFieldDisplay_LimitValue: {
            id: StringId.OrderPadFieldDisplay_LimitValue, translations: {
                en: 'Limit value',
            }
        },
        OrderPadFieldDisplay_LimitUnit: {
            id: StringId.OrderPadFieldDisplay_LimitUnit, translations: {
                en: 'Limit unit',
            }
        },
        OrderPadFieldDisplay_TriggerValue: {
            id: StringId.OrderPadFieldDisplay_TriggerValue, translations: {
                en: 'Trigger value',
            }
        },
        OrderPadFieldDisplay_TriggerUnit: {
            id: StringId.OrderPadFieldDisplay_TriggerUnit, translations: {
                en: 'Trigger unit',
            }
        },
        OrderPadFieldDisplay_TriggerField: {
            id: StringId.OrderPadFieldDisplay_TriggerField, translations: {
                en: 'Trigger field',
            }
        },
        OrderPadFieldDisplay_TriggerMovement: {
            id: StringId.OrderPadFieldDisplay_TriggerMovement, translations: {
                en: 'Trigger movement',
            }
        },
        OrderPadFieldDisplay_Side: {
            id: StringId.OrderPadFieldDisplay_Side, translations: {
                en: 'Side',
            }
        },
        OrderPadFieldDisplay_RoaNoAdvice: {
            id: StringId.OrderPadFieldDisplay_RoaNoAdvice, translations: {
                en: 'RoaNoAdvice',
            }
        },
        OrderPadFieldDisplay_RoaNotes: {
            id: StringId.OrderPadFieldDisplay_RoaNotes, translations: {
                en: 'RoaNotes',
            }
        },
        OrderPadFieldDisplay_SoaRequired: {
            id: StringId.OrderPadFieldDisplay_SoaRequired, translations: {
                en: 'SoaRequired',
            }
        },
        OrderPadFieldDisplay_RoaMethod: {
            id: StringId.OrderPadFieldDisplay_RoaMethod, translations: {
                en: 'RoaMethod',
            }
        },
        OrderPadFieldDisplay_RoaJustification: {
            id: StringId.OrderPadFieldDisplay_RoaJustification, translations: {
                en: 'RoaJustification',
            }
        },
        OrderPadFieldDisplay_RoaDeclarations: {
            id: StringId.OrderPadFieldDisplay_RoaDeclarations, translations: {
                en: 'RoaDeclarations',
            }
        },
        OrderPadFieldDisplay_RoaDeclarationDefinitionsDataItemReady: {
            id: StringId.OrderPadFieldDisplay_RoaDeclarationDefinitionsDataItemReady, translations: {
                en: 'RoaDeclarationDefinitionsDataItemReady',
            }
        },
        OrderPadFieldDisplay_Tax: {
            id: StringId.OrderPadFieldDisplay_Tax, translations: {
                en: 'Tax',
            }
        },
        OrderPadFieldDisplay_TimeInForce: {
            id: StringId.OrderPadFieldDisplay_TimeInForce, translations: {
                en: 'Time in force',
            }
        },
        OrderPadFieldDisplay_TmcLegCount: {
            id: StringId.OrderPadFieldDisplay_TmcLegCount, translations: {
                en: 'TmcLegCount',
            }
        },
        OrderPadFieldDisplay_TmcLeg0SymbolAndSource: {
            id: StringId.OrderPadFieldDisplay_TmcLeg0SymbolAndSource, translations: {
                en: 'TmcLeg0SymbolAndSource',
            }
        },
        OrderPadFieldDisplay_TmcLeg0Ratio: {
            id: StringId.OrderPadFieldDisplay_TmcLeg0Ratio, translations: {
                en: 'TmcLeg0Ratio',
            }
        },
        OrderPadFieldDisplay_TmcLeg0BuyOrSell: {
            id: StringId.OrderPadFieldDisplay_TmcLeg0BuyOrSell, translations: {
                en: 'TmcLeg0BuyOrSell',
            }
        },
        OrderPadFieldDisplay_TmcLeg1SymbolAndSource: {
            id: StringId.OrderPadFieldDisplay_TmcLeg1SymbolAndSource, translations: {
                en: 'TmcLeg1SymbolAndSource',
            }
        },
        OrderPadFieldDisplay_TmcLeg1Ratio: {
            id: StringId.OrderPadFieldDisplay_TmcLeg1Ratio, translations: {
                en: 'TmcLeg1Ratio',
            }
        },
        OrderPadFieldDisplay_TmcLeg1BuyOrSell: {
            id: StringId.OrderPadFieldDisplay_TmcLeg1BuyOrSell, translations: {
                en: 'TmcLeg1BuyOrSell',
            }
        },
        OrderPadFieldDisplay_TmcLeg2SymbolAndSource: {
            id: StringId.OrderPadFieldDisplay_TmcLeg2SymbolAndSource, translations: {
                en: 'TmcLeg2SymbolAndSource',
            }
        },
        OrderPadFieldDisplay_TmcLeg2Ratio: {
            id: StringId.OrderPadFieldDisplay_TmcLeg2Ratio, translations: {
                en: 'TmcLeg2Ratio',
            }
        },
        OrderPadFieldDisplay_TmcLeg2BuyOrSell: {
            id: StringId.OrderPadFieldDisplay_TmcLeg2BuyOrSell, translations: {
                en: 'TmcLeg2BuyOrSell',
            }
        },
        OrderPadFieldDisplay_TmcLeg3SymbolAndSource: {
            id: StringId.OrderPadFieldDisplay_TmcLeg3SymbolAndSource, translations: {
                en: 'TmcLeg3SymbolAndSource',
            }
        },
        OrderPadFieldDisplay_TmcLeg3Ratio: {
            id: StringId.OrderPadFieldDisplay_TmcLeg3Ratio, translations: {
                en: 'TmcLeg3Ratio',
            }
        },
        OrderPadFieldDisplay_TmcLeg3BuyOrSell: {
            id: StringId.OrderPadFieldDisplay_TmcLeg3BuyOrSell, translations: {
                en: 'TmcLeg3BuyOrSell',
            }
        },
        OrderPadFieldDisplay_TmcMaxLegRatioCommonFactor: {
            id: StringId.OrderPadFieldDisplay_TmcMaxLegRatioCommonFactor, translations: {
                en: 'TmcMaxLegRatioCommonFactor',
            }
        },
        OrderPadFieldDisplay_OmsServiceOnline: {
            id: StringId.OrderPadFieldDisplay_OmsServiceOnline, translations: {
                en: 'OmsServiceOnline',
            }
        },
        OrderPadFieldDisplay_Status: {
            id: StringId.OrderPadFieldDisplay_Status, translations: {
                en: 'Status',
            }
        },
        OrderPadFieldDisplay_CurrentOmsOrderId: {
            id: StringId.OrderPadFieldDisplay_CurrentOmsOrderId, translations: {
                en: 'CurrentOmsOrderId',
            }
        },
        OrderPadFieldDisplay_WorkOmsOrderId: {
            id: StringId.OrderPadFieldDisplay_WorkOmsOrderId, translations: {
                en: 'WorkOmsOrderId',
            }
        },
        OrderPadFieldDisplay_LoadedLeavesQuantity: {
            id: StringId.OrderPadFieldDisplay_LoadedLeavesQuantity, translations: {
                en: 'LoadedLeavesQuantity',
            }
        },
        OrderPadFieldDisplay_AccountTradePermissions: {
            id: StringId.OrderPadFieldDisplay_AccountTradePermissions, translations: {
                en: 'AccountTradePermissions',
            }
        },
        OrderPadFieldDisplay_ExistingOrderId: {
            id: StringId.OrderPadFieldDisplay_ExistingOrderId, translations: {
                en: 'Existing Order',
            }
        },
        OrderPadFieldDisplay_DestinationAccount: {
            id: StringId.OrderPadFieldDisplay_DestinationAccount, translations: {
                en: 'Destination Account',
            }
        },
        OrderPadFieldStatusReasonDescription_Unknown: {
            id: StringId.OrderPadFieldStatusReasonDescription_Unknown, translations: {
                en: 'Unknown',
            }
        },
        OrderPadFieldStatusReasonDescription_Initial: {
            id: StringId.OrderPadFieldStatusReasonDescription_Initial, translations: {
                en: 'Initial',
            }
        },
        OrderPadFieldStatusReasonDescription_ValueRequired: {
            id: StringId.OrderPadFieldStatusReasonDescription_ValueRequired, translations: {
                en: 'Value required',
            }
        },
        OrderPadFieldStatusReasonDescription_ValueNotRequired: {
            id: StringId.OrderPadFieldStatusReasonDescription_ValueNotRequired, translations: {
                en: 'Value not required',
            }
        },
        OrderPadFieldStatusReasonDescription_OmsServiceNotOnline: {
            id: StringId.OrderPadFieldStatusReasonDescription_OmsServiceNotOnline, translations: {
                en: 'OmsServiceNotOnline',
            }
        },
        OrderPadFieldStatusReasonDescription_NegativeValueNotAllowed: {
            id: StringId.OrderPadFieldStatusReasonDescription_NegativeValueNotAllowed, translations: {
                en: 'Negative value not allowed',
            }
        },
        OrderPadFieldStatusReasonDescription_ZeroOrNegativeValueNotAllowed: {
            id: StringId.OrderPadFieldStatusReasonDescription_ZeroOrNegativeValueNotAllowed, translations: {
                en: 'Zero or negative value not allowed',
            }
        },
        OrderPadFieldStatusReasonDescription_InvalidQuantityForDestination: {
            id: StringId.OrderPadFieldStatusReasonDescription_InvalidQuantityForDestination, translations: {
                en: 'Invalid quantity for route',
            }
        },
        OrderPadFieldStatusReasonDescription_InvalidAccountId: {
            id: StringId.OrderPadFieldStatusReasonDescription_InvalidAccountId, translations: {
                en: 'Invalid account Id',
            }
        },
        OrderPadFieldStatusReasonDescription_AccountNoLongerAvailable: {
            id: StringId.OrderPadFieldStatusReasonDescription_AccountNoLongerAvailable, translations: {
                en: 'Account no longer available',
            }
        },
        OrderPadFieldStatusReasonDescription_AccountFeedStatus_Initialising: {
            id: StringId.OrderPadFieldStatusReasonDescription_AccountFeedStatus_Initialising, translations: {
                en: 'Account Feed Status is Initialising',
            }
        },
        OrderPadFieldStatusReasonDescription_AccountFeedStatus_Closed: {
            id: StringId.OrderPadFieldStatusReasonDescription_AccountFeedStatus_Closed, translations: {
                en: 'Account Feed Status is Closed',
            }
        },
        OrderPadFieldStatusReasonDescription_AccountFeedStatus_Inactive: {
            id: StringId.OrderPadFieldStatusReasonDescription_AccountFeedStatus_Inactive, translations: {
                en: 'Account Feed Status is Inactive',
            }
        },
        OrderPadFieldStatusReasonDescription_AccountFeedStatus_Impaired: {
            id: StringId.OrderPadFieldStatusReasonDescription_AccountFeedStatus_Impaired, translations: {
                en: 'Account Feed Status is Impaired',
            }
        },
        OrderPadFieldStatusReasonDescription_AccountFeedStatus_Expired: {
            id: StringId.OrderPadFieldStatusReasonDescription_AccountFeedStatus_Expired, translations: {
                en: 'Account Feed Status is Expired',
            }
        },
        OrderPadFieldStatusReasonDescription_SymbolNotFound: {
            id: StringId.OrderPadFieldStatusReasonDescription_SymbolNotFound, translations: {
                en: 'Symbol not found',
            }
        },
        OrderPadFieldStatusReasonDescription_WorkOrdersNotAllowed: {
            id: StringId.OrderPadFieldStatusReasonDescription_WorkOrdersNotAllowed, translations: {
                en: 'WorkOrdersNotAllowed',
            }
        },
        OrderPadFieldStatusReasonDescription_ViewWorkOrdersNotAllowed: {
            id: StringId.OrderPadFieldStatusReasonDescription_ViewWorkOrdersNotAllowed, translations: {
                en: 'ViewWorkOrdersNotAllowed',
            }
        },
        OrderPadFieldStatusReasonDescription_NotBackOfficeScreens: {
            id: StringId.OrderPadFieldStatusReasonDescription_NotBackOfficeScreens, translations: {
                en: 'NotBackOfficeScreens',
            }
        },
        OrderPadFieldStatusReasonDescription_NotCanSelectBrokerage: {
            id: StringId.OrderPadFieldStatusReasonDescription_NotCanSelectBrokerage, translations: {
                en: 'NotCanSelectBrokerage',
            }
        },
        OrderPadFieldStatusReasonDescription_Place: {
            id: StringId.OrderPadFieldStatusReasonDescription_Place, translations: {
                en: 'Place',
            }
        },
        OrderPadFieldStatusReasonDescription_Amend: {
            id: StringId.OrderPadFieldStatusReasonDescription_Amend, translations: {
                en: 'Amend',
            }
        },
        OrderPadFieldStatusReasonDescription_Cancel: {
            id: StringId.OrderPadFieldStatusReasonDescription_Cancel, translations: {
                en: 'Cancel',
            }
        },
        OrderPadFieldStatusReasonDescription_Move: {
            id: StringId.OrderPadFieldStatusReasonDescription_Move, translations: {
                en: 'Move',
            }
        },
        OrderPadFieldStatusReasonDescription_NotMove: {
            id: StringId.OrderPadFieldStatusReasonDescription_NotMove, translations: {
                en: 'Not move',
            }
        },
        OrderPadFieldStatusReasonDescription_Work: {
            id: StringId.OrderPadFieldStatusReasonDescription_Work, translations: {
                en: 'Work',
            }
        },
        OrderPadFieldStatusReasonDescription_NotWork: {
            id: StringId.OrderPadFieldStatusReasonDescription_NotWork, translations: {
                en: 'NotWork',
            }
        },
        OrderPadFieldStatusReasonDescription_Linked: {
            id: StringId.OrderPadFieldStatusReasonDescription_Linked, translations: {
                en: 'Linked',
            }
        },
        OrderPadFieldStatusReasonDescription_NotIceberg: {
            id: StringId.OrderPadFieldStatusReasonDescription_NotIceberg, translations: {
                en: 'NotIceberg',
            }
        },
        OrderPadFieldStatusReasonDescription_AmendLinked: {
            id: StringId.OrderPadFieldStatusReasonDescription_AmendLinked, translations: {
                en: 'AmendLinked',
            }
        },
        OrderPadFieldStatusReasonDescription_AccountIdNotValid: {
            id: StringId.OrderPadFieldStatusReasonDescription_AccountIdNotValid, translations: {
                en: 'AccountIdNotValid',
            }
        },
        OrderPadFieldStatusReasonDescription_AccountDoesNotHaveDefaultBrokerageCode: {
            id: StringId.OrderPadFieldStatusReasonDescription_AccountDoesNotHaveDefaultBrokerageCode, translations: {
                en: 'AccountDoesNotHaveDefaultBrokerageCode',
            }
        },
        OrderPadFieldStatusReasonDescription_NotManualBrokerageCode: {
            id: StringId.OrderPadFieldStatusReasonDescription_NotManualBrokerageCode, translations: {
                en: 'NotManualBrokerageCode',
            }
        },
        OrderPadFieldStatusReasonDescription_RetrievingAccount: {
            id: StringId.OrderPadFieldStatusReasonDescription_RetrievingAccount, translations: {
                en: 'Retrieving Account',
            }
        },
        OrderPadFieldStatusReasonDescription_BrokerageScheduleDataItemNotReady: {
            id: StringId.OrderPadFieldStatusReasonDescription_BrokerageScheduleDataItemNotReady, translations: {
                en: 'BrokerageScheduleDataItemNotReady',
            }
        },
        OrderPadFieldStatusReasonDescription_BrokerageCodeListNotReady: {
            id: StringId.OrderPadFieldStatusReasonDescription_BrokerageCodeListNotReady, translations: {
                en: 'BrokerageCodeListNotReady',
            }
        },
        OrderPadFieldStatusReasonDescription_BrokerageCodeNotInSchedule: {
            id: StringId.OrderPadFieldStatusReasonDescription_BrokerageCodeNotInSchedule, translations: {
                en: 'BrokerageCodeNotInSchedule',
            }
        },
        OrderPadFieldStatusReasonDescription_ForceWorkOrder: {
            id: StringId.OrderPadFieldStatusReasonDescription_ForceWorkOrder, translations: {
                en: 'ForceWorkOrder',
            }
        },
        OrderPadFieldStatusReasonDescription_NotLimitOrderType: {
            id: StringId.OrderPadFieldStatusReasonDescription_NotLimitOrderType, translations: {
                en: 'NotLimitOrderType',
            }
        },
        OrderPadFieldStatusReasonDescription_MarketAndStopOrderTypeAreAlwaysFillOrKill: {
            id: StringId.OrderPadFieldStatusReasonDescription_MarketAndStopOrderTypeAreAlwaysFillOrKill, translations: {
                en: 'MarketAndStopOrderTypeAreAlwaysFillOrKill',
            }
        },
        OrderPadFieldStatusReasonDescription_RoaDeclarationDefinitionsDataItemNotReady: {
            id: StringId.OrderPadFieldStatusReasonDescription_RoaDeclarationDefinitionsDataItemNotReady, translations: {
                en: 'RoaDeclarationDefinitionsDataItemNotReady',
            }
        },
        OrderPadFieldStatusReasonDescription_PriceNotOnStep: {
            id: StringId.OrderPadFieldStatusReasonDescription_PriceNotOnStep, translations: {
                en: 'PriceNotOnStep',
            }
        },
        OrderPadFieldStatusReasonDescription_NotRoaEnabled: {
            id: StringId.OrderPadFieldStatusReasonDescription_NotRoaEnabled, translations: {
                en: 'NotRoaEnabled',
            }
        },
        OrderPadFieldStatusReasonDescription_RoaNoAdvice: {
            id: StringId.OrderPadFieldStatusReasonDescription_RoaNoAdvice, translations: {
                en: 'RoaNoAdvice',
            }
        },
        OrderPadFieldStatusReasonDescription_IvemId: {
            id: StringId.OrderPadFieldStatusReasonDescription_IvemId, translations: {
                en: 'IvemId',
            }
        },
        OrderPadFieldStatusReasonDescription_TriggerType: {
            id: StringId.OrderPadFieldStatusReasonDescription_TriggerType, translations: {
                en: 'TriggerType',
            }
        },
        OrderPadFieldStatusReasonDescription_TriggerTypeNotDefined: {
            id: StringId.OrderPadFieldStatusReasonDescription_TriggerTypeNotDefined, translations: {
                en: 'Trigger type not defined',
            }
        },
        OrderPadFieldStatusReasonDescription_ImmediateTriggerType: {
            id: StringId.OrderPadFieldStatusReasonDescription_ImmediateTriggerType, translations: {
                en: 'Immediate trigger type',
            }
        },
        OrderPadFieldStatusReasonDescription_SymbolPriceStepSegmentsDataItemNotReady: {
            id: StringId.OrderPadFieldStatusReasonDescription_SymbolPriceStepSegmentsDataItemNotReady, translations: {
                en: 'SymbolPriceStepSegmentsDataItemNotReady',
            }
        },
        OrderPadFieldStatusReasonDescription_LeafSymbolSourceNotSupported: {
            id: StringId.OrderPadFieldStatusReasonDescription_LeafSymbolSourceNotSupported, translations: {
                en: 'LeafSymbolSourceNotSupported',
            }
        },
        OrderPadFieldStatusReasonDescription_RootSymbolSourceNotSupported: {
            id: StringId.OrderPadFieldStatusReasonDescription_RootSymbolSourceNotSupported, translations: {
                en: 'RootSymbolSourceNotSupported',
            }
        },
        OrderPadFieldStatusReasonDescription_SymbolsNotAvailable: {
            id: StringId.OrderPadFieldStatusReasonDescription_SymbolsNotAvailable, translations: {
                en: 'SymbolsNotAvailable',
            }
        },
        OrderPadFieldStatusReasonDescription_RetrievingSymbolDetail: {
            id: StringId.OrderPadFieldStatusReasonDescription_RetrievingSymbolDetail, translations: {
                en: 'Retrieving Symbol Information',
            }
        },
        OrderPadFieldStatusReasonDescription_RetrieveSymbolDetailError: {
            id: StringId.OrderPadFieldStatusReasonDescription_RetrieveSymbolDetailError, translations: {
                en: 'Error Retrieving Symbol Information',
            }
        },
        OrderPadFieldStatusReasonDescription_SymbolNotOk: {
            id: StringId.OrderPadFieldStatusReasonDescription_SymbolNotOk, translations: {
                en: 'Symbol not Ok',
            }
        },
        OrderPadFieldStatusReasonDescription_RetrievePriceStepperError: {
            id: StringId.OrderPadFieldStatusReasonDescription_RetrievePriceStepperError, translations: {
                en: 'Error retrieving Price Stepper',
            }
        },
        OrderPadFieldStatusReasonDescription_RetrievingPriceStepper: {
            id: StringId.OrderPadFieldStatusReasonDescription_RetrievingPriceStepper, translations: {
                en: 'Retrieving Price Stepper',
            }
        },
        OrderPadFieldStatusReasonDescription_PriceOrSegmentsNotAvailable: {
            id: StringId.OrderPadFieldStatusReasonDescription_PriceOrSegmentsNotAvailable, translations: {
                en: 'PriceOrSegmentsNotAvailable',
            }
        },
        OrderPadFieldStatusReasonDescription_TradingNotPermissioned: {
            id: StringId.OrderPadFieldStatusReasonDescription_TradingNotPermissioned, translations: {
                en: 'Trading is not permissioned',
            }
        },
        OrderPadFieldStatusReasonDescription_AsxOrderAlgosNotPermissioned: {
            id: StringId.OrderPadFieldStatusReasonDescription_AsxOrderAlgosNotPermissioned, translations: {
                en: 'AsxOrderAlgosNotPermissioned',
            }
        },
        OrderPadFieldStatusReasonDescription_StopOrderRequestsNotPermissioned: {
            id: StringId.OrderPadFieldStatusReasonDescription_StopOrderRequestsNotPermissioned, translations: {
                en: 'Conditional order requests are not permissioned',
            }
        },
        OrderPadFieldStatusReasonDescription_ProductIdentificationType: {
            id: StringId.OrderPadFieldStatusReasonDescription_ProductIdentificationType, translations: {
                en: 'Product identification type',
            }
        },
        OrderPadFieldStatusReasonDescription_NotUsedInTmc: {
            id: StringId.OrderPadFieldStatusReasonDescription_NotUsedInTmc, translations: {
                en: 'NotUsedInTmc',
            }
        },
        OrderPadFieldStatusReasonDescription_TmcOnlySupportNewRequestType: {
            id: StringId.OrderPadFieldStatusReasonDescription_TmcOnlySupportNewRequestType, translations: {
                en: 'TmcOnlySupportNewRequestType',
            }
        },
        OrderPadFieldStatusReasonDescription_OnlyUsedInTmc: {
            id: StringId.OrderPadFieldStatusReasonDescription_OnlyUsedInTmc, translations: {
                en: 'OnlyUsedInTmc',
            }
        },
        OrderPadFieldStatusReasonDescription_TmcLegCountNotSpecified: {
            id: StringId.OrderPadFieldStatusReasonDescription_TmcLegCountNotSpecified, translations: {
                en: 'TmcLegCountNotSpecified',
            }
        },
        OrderPadFieldStatusReasonDescription_BeyondTmcLegCount: {
            id: StringId.OrderPadFieldStatusReasonDescription_BeyondTmcLegCount, translations: {
                en: 'BeyondTmcLegCount',
            }
        },
        OrderPadFieldStatusReasonDescription_OrderTypeNotSpecified: {
            id: StringId.OrderPadFieldStatusReasonDescription_OrderTypeNotSpecified, translations: {
                en: 'OrderTypeNotSpecified',
            }
        },
        OrderPadFieldStatusReasonDescription_AlgoNotSpecified: {
            id: StringId.OrderPadFieldStatusReasonDescription_AlgoNotSpecified, translations: {
                en: 'AlgoNotSpecified',
            }
        },
        OrderPadFieldStatusReasonDescription_ValueMustNotExceedMaxTmcLegRatio: {
            id: StringId.OrderPadFieldStatusReasonDescription_ValueMustNotExceedMaxTmcLegRatio, translations: {
                en: 'ValueMustNotExceedMaxTmcLegRatio',
            }
        },
        OrderPadFieldStatusReasonDescription_NotAllTmcLegRatiosValid: {
            id: StringId.OrderPadFieldStatusReasonDescription_NotAllTmcLegRatiosValid, translations: {
                en: 'NotAllTmcLegRatiosValid',
            }
        },
        OrderPadFieldStatusReasonDescription_TmcMaxLegRatioCommonFactorNotOne: {
            id: StringId.OrderPadFieldStatusReasonDescription_TmcMaxLegRatioCommonFactorNotOne, translations: {
                en: 'TmcMaxLegRatioCommonFactorNotOne',
            }
        },
        OrderPadFieldStatusReasonDescription_OnlySellStopAllowed: {
            id: StringId.OrderPadFieldStatusReasonDescription_OnlySellStopAllowed, translations: {
                en: 'OnlySellStopAllowed',
            }
        },
        OrderPadFieldStatusReasonDescription_NotSupportedByOrderType: {
            id: StringId.OrderPadFieldStatusReasonDescription_NotSupportedByOrderType, translations: {
                en: 'Not supported by Order Type',
            }
        },
        OrderPadFieldStatusReasonDescription_NotSupportedBySymbol: {
            id: StringId.OrderPadFieldStatusReasonDescription_NotSupportedBySymbol, translations: {
                en: 'Not supported by Symbol',
            }
        },
        OrderPadFieldStatusReasonDescription_TimeInForceNotSpecified: {
            id: StringId.OrderPadFieldStatusReasonDescription_TimeInForceNotSpecified, translations: {
                en: 'TimeInForceNotSpecified',
            }
        },
        OrderPadFieldStatusReasonDescription_TodayOrFutureDateRequired: {
            id: StringId.OrderPadFieldStatusReasonDescription_TodayOrFutureDateRequired, translations: {
                en: 'Today or future date required',
            }
        },
        OrderPadFieldStatusReasonDescription_TimeInForceDoesNotRequireDate: {
            id: StringId.OrderPadFieldStatusReasonDescription_TimeInForceDoesNotRequireDate, translations: {
                en: 'Time in Force value does not require a Date',
            }
        },
        OrderPadFieldStatusReasonDescription_AsxEtoTmcSymbolMissingUnderlyingIsIndex: {
            id: StringId.OrderPadFieldStatusReasonDescription_AsxEtoTmcSymbolMissingUnderlyingIsIndex, translations: {
                en: 'AsxEtoTmcSymbolMissingUnderlyingIsIndex',
            }
        },
        OrderPadFieldStatusReasonDescription_SymbolHasNoRoutes: {
            id: StringId.OrderPadFieldStatusReasonDescription_SymbolHasNoRoutes, translations: {
                en: 'Symbol has no routes',
            }
        },
        OrderPadFieldStatusReasonDescription_RouteNotAvailableForSymbol: {
            id: StringId.OrderPadFieldStatusReasonDescription_RouteNotAvailableForSymbol, translations: {
                en: 'Route not available for symbol',
            }
        },
        OrderPadFieldStatusReasonDescription_TmcNotInAsxTmcMarket: {
            id: StringId.OrderPadFieldStatusReasonDescription_TmcNotInAsxTmcMarket, translations: {
                en: 'TmcNotInAsxTmcMarket',
            }
        },
        OrderPadFieldStatusReasonDescription_Snapshot: {
            id: StringId.OrderPadFieldStatusReasonDescription_Snapshot, translations: {
                en: 'Snapshot',
            }
        },
        OrderPadFieldStatusReasonDescription_ValueOutOfRange: {
            id: StringId.OrderPadFieldStatusReasonDescription_ValueOutOfRange, translations: {
                en: 'Value out of range',
            }
        },
        OrderPadFieldStatusReasonDescription_MyxSymbolIsMissingBoardLotSize: {
            id: StringId.OrderPadFieldStatusReasonDescription_MyxSymbolIsMissingBoardLotSize, translations: {
                en: 'MYX Symbol is missing board lot size',
            }
        },
        OrderPadFieldStatusReasonDescription_SideNotValid: {
            id: StringId.OrderPadFieldStatusReasonDescription_SideNotValid, translations: {
                en: 'Side is not valid',
            }
        },
        OrderPadFieldStatusReasonDescription_BuyNotPermissioned: {
            id: StringId.OrderPadFieldStatusReasonDescription_BuyNotPermissioned, translations: {
                en: 'Buy is not permissioned',
            }
        },
        OrderPadFieldStatusReasonDescription_SellNotPermissioned: {
            id: StringId.OrderPadFieldStatusReasonDescription_SellNotPermissioned, translations: {
                en: 'Sell is not permissioned',
            }
        },
        OrderPadFieldStatusReasonDescription_QuantityNotAMultiple: {
            id: StringId.OrderPadFieldStatusReasonDescription_QuantityNotAMultiple, translations: {
                en: 'Quantity is not a valid multiple',
            }
        },
        OrderPadFieldStatusReasonDescription_OrderNotFound: {
            id: StringId.OrderPadFieldStatusReasonDescription_OrderNotFound, translations: {
                en: 'Order not found',
            }
        },
        OrderPadFieldStatusReasonDescription_OrderCannotBeAmended: {
            id: StringId.OrderPadFieldStatusReasonDescription_OrderCannotBeAmended, translations: {
                en: 'Order cannot be amended',
            }
        },
        OrderPadFieldStatusReasonDescription_OrderCannotBeCancelled: {
            id: StringId.OrderPadFieldStatusReasonDescription_OrderCannotBeCancelled, translations: {
                en: 'Order cannot be cancelled',
            }
        },
        OrderTriggerTypeDisplay_Immediate: {
            id: StringId.OrderTriggerTypeDisplay_Immediate, translations: {
                en: 'Immediate',
            }
        },
        OrderTriggerTypeDisplay_Price: {
            id: StringId.OrderTriggerTypeDisplay_Price, translations: {
                en: 'Price',
            }
        },
        OrderTriggerTypeDisplay_TrailingPrice: {
            id: StringId.OrderTriggerTypeDisplay_TrailingPrice, translations: {
                en: 'Trailing Price',
            }
        },
        OrderTriggerTypeDisplay_PercentageTrailingPrice: {
            id: StringId.OrderTriggerTypeDisplay_PercentageTrailingPrice, translations: {
                en: '% Trailing Price',
            }
        },
        OrderTriggerTypeDisplay_Overnight: {
            id: StringId.OrderTriggerTypeDisplay_Overnight, translations: {
                en: 'Overnight',
            }
        },
        OrderTriggerTypeAbbreviation_Immediate: {
            id: StringId.OrderTriggerTypeAbbreviation_Immediate, translations: {
                en: 'Immediate',
            }
        },
        OrderTriggerTypeAbbreviation_Price: {
            id: StringId.OrderTriggerTypeAbbreviation_Price, translations: {
                en: 'Price',
            }
        },
        OrderTriggerTypeAbbreviation_TrailingPrice: {
            id: StringId.OrderTriggerTypeAbbreviation_TrailingPrice, translations: {
                en: 'Trailing',
            }
        },
        OrderTriggerTypeAbbreviation_PercentageTrailingPrice: {
            id: StringId.OrderTriggerTypeAbbreviation_PercentageTrailingPrice, translations: {
                en: '% Trailing',
            }
        },
        OrderTriggerTypeAbbreviation_Overnight: {
            id: StringId.OrderTriggerTypeAbbreviation_Overnight, translations: {
                en: 'Overnight',
            }
        },
        OrderRequestTypeDisplay_Place: {
            id: StringId.OrderRequestTypeDisplay_Place, translations: {
                en: 'Place',
            }
        },
        OrderRequestTypeDisplay_Amend: {
            id: StringId.OrderRequestTypeDisplay_Amend, translations: {
                en: 'Amend',
            }
        },
        OrderRequestTypeDisplay_Cancel: {
            id: StringId.OrderRequestTypeDisplay_Cancel, translations: {
                en: 'Cancel',
            }
        },
        OrderRequestTypeDisplay_Move: {
            id: StringId.OrderRequestTypeDisplay_Move, translations: {
                en: 'Move',
            }
        },
        OrderRequestResultDisplay_Success: {
            id: StringId.OrderRequestResultDisplay_Success, translations: {
                en: 'Success',
            }
        },
        OrderRequestResultDisplay_Error: {
            id: StringId.OrderRequestResultDisplay_Error, translations: {
                en: 'Error',
            }
        },
        OrderRequestResultDisplay_Incomplete: {
            id: StringId.OrderRequestResultDisplay_Incomplete, translations: {
                en: 'Incomplete',
            }
        },
        OrderRequestResultDisplay_Invalid: {
            id: StringId.OrderRequestResultDisplay_Invalid, translations: {
                en: 'Invalid',
            }
        },
        OrderRequestResultDisplay_Rejected: {
            id: StringId.OrderRequestResultDisplay_Rejected, translations: {
                en: 'Rejected',
            }
        },
        OrderRequestErrorCodeDisplay_Unknown: {
            id: StringId.OrderRequestErrorCodeDisplay_Unknown, translations: {
                en: '<Error Description not available>',
            }
        },
        OrderRequestErrorCodeDisplay_Account: {
            id: StringId.OrderRequestErrorCodeDisplay_Account, translations: {
                en: 'The Account supplied does not exist',
            }
        },
        OrderRequestErrorCodeDisplay_Account_DailyNet: {
            id: StringId.OrderRequestErrorCodeDisplay_Account_DailyNet, translations: {
                en: 'The Account daily net value would be exceeded',
            }
        },
        OrderRequestErrorCodeDisplay_Account_DailyGross: {
            id: StringId.OrderRequestErrorCodeDisplay_Account_DailyGross, translations: {
                en: 'The Account daily gross value would be exceeded',
            }
        },
        OrderRequestErrorCodeDisplay_Authority: {
            id: StringId.OrderRequestErrorCodeDisplay_Authority, translations: {
                en: 'The current user does not have permission to trade',
            }
        },
        OrderRequestErrorCodeDisplay_Connection: {
            id: StringId.OrderRequestErrorCodeDisplay_Connection, translations: {
                en: 'Trading requires a secure connection',
            }
        },
        OrderRequestErrorCodeDisplay_Details: {
            id: StringId.OrderRequestErrorCodeDisplay_Details, translations: {
                en: 'No order details were provided',
            }
        },
        OrderRequestErrorCodeDisplay_Error: {
            id: StringId.OrderRequestErrorCodeDisplay_Error, translations: {
                en: 'An undefined server error occurred',
            }
        },
        OrderRequestErrorCodeDisplay_Exchange: {
            id: StringId.OrderRequestErrorCodeDisplay_Exchange, translations: {
                en: 'The exchange supplied is invalid or does not exist',
            }
        },
        OrderRequestErrorCodeDisplay_Internal: {
            id: StringId.OrderRequestErrorCodeDisplay_Internal, translations: {
                en: 'A server internal error has occurred',
            }
        },
        OrderRequestErrorCodeDisplay_Internal_NotFound: {
            id: StringId.OrderRequestErrorCodeDisplay_Internal_NotFound, translations: {
                en: 'A server internal error has occurred',
            }
        },
        OrderRequestErrorCodeDisplay_Order: {
            id: StringId.OrderRequestErrorCodeDisplay_Order, translations: {
                en: 'The given Order ID for a cancel or amend is invalid',
            }
        },
        OrderRequestErrorCodeDisplay_Operation: {
            id: StringId.OrderRequestErrorCodeDisplay_Operation, translations: {
                en: 'The operation is not supported for this Order',
            }
        },
        OrderRequestErrorCodeDisplay_Retry: {
            id: StringId.OrderRequestErrorCodeDisplay_Retry, translations: {
                en: 'A temporary error occurred, please retry the request',
            }
        },
        OrderRequestErrorCodeDisplay_Route: {
            id: StringId.OrderRequestErrorCodeDisplay_Route, translations: {
                en: 'A routing algorithm was not supplied',
            }
        },
        OrderRequestErrorCodeDisplay_Route_Algorithm: {
            id: StringId.OrderRequestErrorCodeDisplay_Route_Algorithm, translations: {
                en: 'The supplied routing algorithm does not exist',
            }
        },
        OrderRequestErrorCodeDisplay_Route_Market: {
            id: StringId.OrderRequestErrorCodeDisplay_Route_Market, translations: {
                en: 'The supplied Trading Market was invalid or does not exist',
            }
        },
        OrderRequestErrorCodeDisplay_Route_Symbol: {
            id: StringId.OrderRequestErrorCodeDisplay_Route_Symbol, translations: {
                en: 'The target Symbol cannot be routed to the target Trading Market',
            }
        },
        OrderRequestErrorCodeDisplay_Status: {
            id: StringId.OrderRequestErrorCodeDisplay_Status, translations: {
                en: 'The order is not in a state where it can be changed',
            }
        },
        OrderRequestErrorCodeDisplay_Style: {
            id: StringId.OrderRequestErrorCodeDisplay_Style, translations: {
                en: 'The style of Order must be provided.If amending, it must also match the Order being amended',
            }
        },
        OrderRequestErrorCodeDisplay_Submitted: {
            id: StringId.OrderRequestErrorCodeDisplay_Submitted, translations: {
                en: 'A fault occurred after the Order was submitted to the Exchange.The Order may have been successfully processed.Please check the Orders subscription',
            }
        },
        OrderRequestErrorCodeDisplay_Symbol: {
            id: StringId.OrderRequestErrorCodeDisplay_Symbol, translations: {
                en: 'The selected symbol is invalid',
            }
        },
        OrderRequestErrorCodeDisplay_Symbol_Authority: {
            id: StringId.OrderRequestErrorCodeDisplay_Symbol_Authority, translations: {
                en: 'The current use does not have permission to trade the selected symbol',
            }
        },
        OrderRequestErrorCodeDisplay_Symbol_Status: {
            id: StringId.OrderRequestErrorCodeDisplay_Symbol_Status, translations: {
                en: 'The target symbol is not in a state where the Order operation is supported',
            }
        },
        OrderRequestErrorCodeDisplay_TotalValue_Balance: {
            id: StringId.OrderRequestErrorCodeDisplay_TotalValue_Balance, translations: {
                en: 'Not enough funds to cover this Order',
            }
        },
        OrderRequestErrorCodeDisplay_TotalValue_Maximum: {
            id: StringId.OrderRequestErrorCodeDisplay_TotalValue_Maximum, translations: {
                en: 'Greater than the maximum allowed value',
            }
        },
        OrderRequestErrorCodeDisplay_ExpiryDate: {
            id: StringId.OrderRequestErrorCodeDisplay_ExpiryDate, translations: {
                en: 'The expiry date is invalid',
            }
        },
        OrderRequestErrorCodeDisplay_HiddenQuantity: {
            id: StringId.OrderRequestErrorCodeDisplay_HiddenQuantity, translations: {
                en: 'The hidden quantity is out of range or invalid',
            }
        },
        OrderRequestErrorCodeDisplay_HiddenQuantity_Symbol: {
            id: StringId.OrderRequestErrorCodeDisplay_HiddenQuantity_Symbol, translations: {
                en: 'A hidden quantity is not supported by this Symbol',
            }
        },
        OrderRequestErrorCodeDisplay_LimitPrice: {
            id: StringId.OrderRequestErrorCodeDisplay_LimitPrice, translations: {
                en: 'The limit price is out of range or invalid',
            }
        },
        OrderRequestErrorCodeDisplay_LimitPrice_Distance: {
            id: StringId.OrderRequestErrorCodeDisplay_LimitPrice_Distance, translations: {
                en: 'The limit price is too far from the market',
            }
        },
        OrderRequestErrorCodeDisplay_LimitPrice_Given: {
            id: StringId.OrderRequestErrorCodeDisplay_LimitPrice_Given, translations: {
                en: 'The limit price must be empty for this Order Type',
            }
        },
        OrderRequestErrorCodeDisplay_LimitPrice_Maximum: {
            id: StringId.OrderRequestErrorCodeDisplay_LimitPrice_Maximum, translations: {
                en: 'The limit price is above the maximum for this Symbol',
            }
        },
        OrderRequestErrorCodeDisplay_LimitPrice_Missing: {
            id: StringId.OrderRequestErrorCodeDisplay_LimitPrice_Missing, translations: {
                en: 'The limit price is required for this Order Type',
            }
        },
        OrderRequestErrorCodeDisplay_MinimumQuantity: {
            id: StringId.OrderRequestErrorCodeDisplay_MinimumQuantity, translations: {
                en: 'The minimum quantity is out of range or invalid',
            }
        },
        OrderRequestErrorCodeDisplay_MinimumQuantity_Symbol: {
            id: StringId.OrderRequestErrorCodeDisplay_MinimumQuantity_Symbol, translations: {
                en: 'A minimum quantity is not supported by this Symbol',
            }
        },
        OrderRequestErrorCodeDisplay_OrderType: {
            id: StringId.OrderRequestErrorCodeDisplay_OrderType, translations: {
                en: 'The order type is invalid',
            }
        },
        OrderRequestErrorCodeDisplay_OrderType_Market: {
            id: StringId.OrderRequestErrorCodeDisplay_OrderType_Market, translations: {
                en: 'The order type is not supported by the Trading Market',
            }
        },
        OrderRequestErrorCodeDisplay_OrderType_Status: {
            id: StringId.OrderRequestErrorCodeDisplay_OrderType_Status, translations: {
                en: 'The order type is not supported in this Trading State',
            }
        },
        OrderRequestErrorCodeDisplay_OrderType_Symbol: {
            id: StringId.OrderRequestErrorCodeDisplay_OrderType_Symbol, translations: {
                en: 'The order type is not supported by this Symbol',
            }
        },
        OrderRequestErrorCodeDisplay_Side: {
            id: StringId.OrderRequestErrorCodeDisplay_Side, translations: {
                en: 'The side of the Market is invalid',
            }
        },
        OrderRequestErrorCodeDisplay_Side_Maximum: {
            id: StringId.OrderRequestErrorCodeDisplay_Side_Maximum, translations: {
                en: 'There are too many open orders on the market on this side',
            }
        },
        OrderRequestErrorCodeDisplay_TotalQuantity: {
            id: StringId.OrderRequestErrorCodeDisplay_TotalQuantity, translations: {
                en: 'The visible and hidden quantities are both zero',
            }
        },
        OrderRequestErrorCodeDisplay_TotalQuantity_Minimum: {
            id: StringId.OrderRequestErrorCodeDisplay_TotalQuantity_Minimum, translations: {
                en: 'The order is below the minimum value',
            }
        },
        OrderRequestErrorCodeDisplay_TotalQuantity_Holdings: {
            id: StringId.OrderRequestErrorCodeDisplay_TotalQuantity_Holdings, translations: {
                en: 'The sell order is greater than your available holdings',
            }
        },
        OrderRequestErrorCodeDisplay_Validity: {
            id: StringId.OrderRequestErrorCodeDisplay_Validity, translations: {
                en: 'The validity period is invalid',
            }
        },
        OrderRequestErrorCodeDisplay_Validity_Symbol: {
            id: StringId.OrderRequestErrorCodeDisplay_Validity_Symbol, translations: {
                en: 'The validity period is not supported by this Symbol',
            }
        },
        OrderRequestErrorCodeDisplay_VisibleQuantity: {
            id: StringId.OrderRequestErrorCodeDisplay_VisibleQuantity, translations: {
                en: 'The visible quantity is out of range or invalid',
            }
        },
        OrderRequestErrorCodeDisplay_TotalQuantity_Maximum: {
            id: StringId.OrderRequestErrorCodeDisplay_TotalQuantity_Maximum, translations: {
                en: 'The total quantity is above the maximum allowed',
            }
        },
        OrderRequestErrorCodeDisplay_UnitType: {
            id: StringId.OrderRequestErrorCodeDisplay_UnitType, translations: {
                en: 'The unit type is invalid',
            }
        },
        OrderRequestErrorCodeDisplay_UnitAmount: {
            id: StringId.OrderRequestErrorCodeDisplay_UnitAmount, translations: {
                en: 'The unit amount is out of range',
            }
        },
        OrderRequestErrorCodeDisplay_Currency: {
            id: StringId.OrderRequestErrorCodeDisplay_Currency, translations: {
                en: 'A valid currency must be provided for this Unit Type',
            }
        },
        OrderRequestErrorCodeDisplay_Flags_PDS: {
            id: StringId.OrderRequestErrorCodeDisplay_Flags_PDS, translations: {
                en: 'The Flag "PDS" must be set',
            }
        },
        OrderPadAccountCaption: {
            id: StringId.OrderPadAccountCaption, translations: {
                en: 'Account',
            }
        },
        OrderPadSideTitle_Buy: {
            id: StringId.OrderPadSideTitle_Buy, translations: {
                en: 'Buy',
            }
        },
        OrderPadSideTitle_Sell: {
            id: StringId.OrderPadSideTitle_Sell, translations: {
                en: 'Sell',
            }
        },
        OrderPadSideTitle_SellShort: {
            id: StringId.OrderPadSideTitle_SellShort, translations: {
                en: 'Short Sell',
            }
        },
        OrderPadSideTitle: {
            id: StringId.OrderPadSideTitle, translations: {
                en: 'Select side',
            }
        },
        OrderPadSideCaption: {
            id: StringId.OrderPadSideCaption, translations: {
                en: 'Side',
            }
        },
        OrderPadSymbolTitle: {
            id: StringId.OrderPadSymbolTitle, translations: {
                en: 'Select symbol',
            }
        },
        OrderPadSymbolCaption: {
            id: StringId.OrderPadSymbolCaption, translations: {
                en: 'Symbol',
            }
        },
        OrderPadRouteTitle: {
            id: StringId.OrderPadRouteTitle, translations: {
                en: 'OrderPadRouteTitle',
            }
        },
        OrderPadTotalQuantityTitle: {
            id: StringId.OrderPadTotalQuantityTitle, translations: {
                en: 'Total quantity',
            }
        },
        OrderPadTotalQuantityCaption: {
            id: StringId.OrderPadTotalQuantityCaption, translations: {
                en: 'Quantity',
            }
        },
        OrderPadOrderTypeTitle_Market: {
            id: StringId.OrderPadOrderTypeTitle_Market, translations: {
                en: 'Market',
            }
        },
        OrderPadOrderTypeTitle_MarketToLimit: {
            id: StringId.OrderPadOrderTypeTitle_MarketToLimit, translations: {
                en: 'Market to Limit',
            }
        },
        OrderPadOrderTypeTitle_Limit: {
            id: StringId.OrderPadOrderTypeTitle_Limit, translations: {
                en: 'Limit',
            }
        },
        OrderPadOrderTypeTitle_MarketAtBest: {
            id: StringId.OrderPadOrderTypeTitle_MarketAtBest, translations: {
                en: 'Market at Best',
            }
        },
        OrderPadOrderTypeTitle: {
            id: StringId.OrderPadOrderTypeTitle, translations: {
                en: 'Order type',
            }
        },
        OrderPadOrderTypeCaption: {
            id: StringId.OrderPadOrderTypeCaption, translations: {
                en: 'Type',
            }
        },
        OrderPadLimitValueTitle: {
            id: StringId.OrderPadLimitValueTitle, translations: {
                en: 'Order can only trade at specified price',
            }
        },
        OrderPadLimitValueCaption: {
            id: StringId.OrderPadLimitValueCaption, translations: {
                en: 'Price',
            }
        },
        OrderPadLimitUnitTitle: {
            id: StringId.OrderPadLimitUnitTitle, translations: {
                en: 'Price units',
            }
        },
        OrderPadTriggerTypeTitle_Immediate: {
            id: StringId.OrderPadTriggerTypeTitle_Immediate, translations: {
                en: 'Order is made active in the market immediately',
            }
        },
        OrderPadTriggerTypeTitle_Price: {
            id: StringId.OrderPadTriggerTypeTitle_Price, translations: {
                en: 'Order is made active in the market when the price of its symbol reaches a specified level',
            }
        },
        OrderPadTriggerTypeTitle_TrailingPrice: {
            id: StringId.OrderPadTriggerTypeTitle_TrailingPrice, translations: {
                en: 'Order is made active in the market when the price of its symbol recedes a specified amount',
            }
        },
        OrderPadTriggerTypeTitle_PercentageTrailingPrice: {
            id: StringId.OrderPadTriggerTypeTitle_PercentageTrailingPrice, translations: {
                en: 'Order is made active in the market when the price of its symbol recedes a specified percentage amount',
            }
        },
        OrderPadTriggerTypeTitle_Overnight: {
            id: StringId.OrderPadTriggerTypeTitle_Overnight, translations: {
                en: 'Order is made active in the market on the next trading day',
            }
        },
        OrderPadTriggerTitle: {
            id: StringId.OrderPadTriggerTitle, translations: {
                en: 'Condition for when order is made active in the market',
            }
        },
        OrderPadTriggerCaption: {
            id: StringId.OrderPadTriggerCaption, translations: {
                en: 'Trigger',
            }
        },

        OrderPadTriggerValueTitle: {
            id: StringId.OrderPadTriggerValueTitle, translations: {
                en: 'Value at which order should trigger',
            }
        },
        OrderPadTriggerValueCaption: {
            id: StringId.OrderPadTriggerValueCaption, translations: {
                en: 'Value',
            }
        },
        OrderPadTriggerFieldTitle_Last: {
            id: StringId.OrderPadTriggerFieldTitle_Last, translations: {
                en: 'Use last price to trigger order',
            }
        },
        OrderPadTriggerFieldTitle_BestBid: {
            id: StringId.OrderPadTriggerFieldTitle_BestBid, translations: {
                en: 'Use best bid price to trigger order',
            }
        },
        OrderPadTriggerFieldTitle_BestAsk: {
            id: StringId.OrderPadTriggerFieldTitle_BestAsk, translations: {
                en: 'Use best ask price to trigger order',
            }
        },
        OrderPadTriggerFieldTitle: {
            id: StringId.OrderPadTriggerFieldTitle, translations: {
                en: 'Security price field used to trigger order',
            }
        },
        OrderPadTriggerFieldCaption: {
            id: StringId.OrderPadTriggerFieldCaption, translations: {
                en: 'Price Field',
            }
        },
        OrderApiTriggerMovementTitle_None: {
            id: StringId.OrderApiTriggerMovementTitle_None, translations: {
                en: 'Trigger on any/none price movement',
            }
        },
        OrderApiTriggerMovementTitle_Up: {
            id: StringId.OrderApiTriggerMovementTitle_Up, translations: {
                en: 'Trigger on upwards price movement',
            }
        },
        OrderApiTriggerMovementTitle_Down: {
            id: StringId.OrderApiTriggerMovementTitle_Down, translations: {
                en: 'Trigger on downwards price movement',
            }
        },
        OrderPadTriggerMovementTitle: {
            id: StringId.OrderPadTriggerMovementTitle, translations: {
                en: 'Price movement direction to trigger an order',
            }
        },
        OrderPadTriggerMovementCaption: {
            id: StringId.OrderPadTriggerMovementCaption, translations: {
                en: 'Movement',
            }
        },
        OrderPadTimeInForceTitle_Day: {
            id: StringId.OrderPadTimeInForceTitle_Day, translations: {
                en: 'Order is valid for current trading day',
            }
        },
        OrderPadTimeInForceTitle_GoodTillCancel: {
            id: StringId.OrderPadTimeInForceTitle_GoodTillCancel, translations: {
                en: 'Order is valid until cancelled',
            }
        },
        OrderPadTimeInForceTitle_AtTheOpening: {
            id: StringId.OrderPadTimeInForceTitle_AtTheOpening, translations: {
                en: 'Order is only valid when the market opens',
            }
        },
        OrderPadTimeInForceTitle_FillAndKill: {
            id: StringId.OrderPadTimeInForceTitle_FillAndKill, translations: {
                en: 'Fill an order as much as possible immediately then cancel order',
            }
        },
        OrderPadTimeInForceTitle_FillOrKill: {
            id: StringId.OrderPadTimeInForceTitle_FillOrKill, translations: {
                en: 'Fully fill an order immediately or cancel it',
            }
        },
        OrderPadTimeInForceTitle_AllOrNone: {
            id: StringId.OrderPadTimeInForceTitle_AllOrNone, translations: {
                en: 'Order cannot be partially filled',
            }
        },
        OrderPadTimeInForceTitle_GoodTillCrossing: {
            id: StringId.OrderPadTimeInForceTitle_GoodTillCrossing, translations: {
                en: 'Order is valid until auction or crossing phase',
            }
        },
        OrderPadTimeInForceTitle_GoodTillDate: {
            id: StringId.OrderPadTimeInForceTitle_GoodTillDate, translations: {
                en: 'Order is valid until expiry date',
            }
        },
        OrderPadTimeInForceTitle_AtTheClose: {
            id: StringId.OrderPadTimeInForceTitle_AtTheClose, translations: {
                en: 'Order is only valid when the market closes',
            }
        },
        OrderPadTimeInForceTitle: {
            id: StringId.OrderPadTimeInForceTitle, translations: {
                en: 'When an order is valid',
            }
        },
        OrderPadTimeInForceCaption: {
            id: StringId.OrderPadTimeInForceCaption, translations: {
                en: 'In force',
            }
        },
        OrderPadExpiryDateTitle: {
            id: StringId.OrderPadExpiryDateTitle, translations: {
                en: 'Date until which an order is valid',
            }
        },
        OrderPadExpiryDateCaption: {
            id: StringId.OrderPadExpiryDateCaption, translations: {
                en: 'Expiry Date',
            }
        },
        OrderPadExistingOrderIdTitle: {
            id: StringId.OrderPadExistingOrderIdTitle, translations: {
                en: 'Id of order to be amended or cancelled',
            }
        },
        OrderPadExistingOrderIdCaption: {
            id: StringId.OrderPadExistingOrderIdCaption, translations: {
                en: 'Order Id',
            }
        },
        OrderPadDestinationAccountTitle: {
            id: StringId.OrderPadDestinationAccountTitle, translations: {
                en: 'Account to which an order is to be moved',
            }
        },
        OrderPadDestinationAccountCaption: {
            id: StringId.OrderPadDestinationAccountCaption, translations: {
                en: 'Destination',
            }
        },
        OrderPadErrorsCaption: {
            id: StringId.OrderPadErrorsCaption, translations: {
                en: 'Errors',
            }
        },
        OrderRequest_PrimaryCaption: {
            id: StringId.OrderRequest_PrimaryCaption, translations: {
                en: 'Default pad',
            }
        },
        OrderRequest_PrimaryTitle: {
            id: StringId.OrderRequest_PrimaryTitle, translations: {
                en: 'Default pad for order requests',
            }
        },
        OrderRequest_ReviewZenithMessageActiveCaption: {
            id: StringId.OrderRequest_ReviewZenithMessageActiveCaption, translations: {
                en: 'Zenith',
            }
        },
        OrderRequest_ReviewZenithMessageActiveTitle: {
            id: StringId.OrderRequest_ReviewZenithMessageActiveTitle, translations: {
                en: 'Review Zenith Message to be sent to server (only for diagnostic purposes)',
            }
        },
        OrderRequest_NewCaption: {
            id: StringId.OrderRequest_NewCaption, translations: {
                en: 'New',
            }
        },
        OrderRequest_NewTitle: {
            id: StringId.OrderRequest_NewTitle, translations: {
                en: 'New order request\nHold [Shift] to initialise to previous "Place"\nHold [Ctrl] to initialise as "Amend" for previous Order',
            }
        },
        OrderRequest_NewAmendPossibleFlagChar: {
            id: StringId.OrderRequest_NewAmendPossibleFlagChar, translations: {
                en: 'A',
            }
        },
        OrderRequest_BackCaption: {
            id: StringId.OrderRequest_BackCaption, translations: {
                en: 'Back',
            }
        },
        OrderRequest_BackTitle: {
            id: StringId.OrderRequest_BackTitle, translations: {
                en: 'Back to order pad',
            }
        },
        OrderRequest_ReviewCaption: {
            id: StringId.OrderRequest_ReviewCaption, translations: {
                en: 'Review',
            }
        },
        OrderRequest_ReviewTitle: {
            id: StringId.OrderRequest_ReviewTitle, translations: {
                en: 'Review order request before sending',
            }
        },
        OrderRequest_SendCaption: {
            id: StringId.OrderRequest_SendCaption, translations: {
                en: 'Send',
            }
        },
        OrderRequest_SendTitle: {
            id: StringId.OrderRequest_SendTitle, translations: {
                en: 'Send order request',
            }
        },
        SymbolCache_UnresolvedRequestTimedOut: {
            id: StringId.SymbolCache_UnresolvedRequestTimedOut, translations: {
                en: 'Symbol information server request timed out',
            }
        },
        OrderRequestResultStatusDisplay_Waiting: {
            id: StringId.OrderRequestResultStatusDisplay_Waiting, translations: {
                en: 'Waiting',
            }
        },
        OrderRequestResultStatusDisplay_CommunicateError: {
            id: StringId.OrderRequestResultStatusDisplay_CommunicateError, translations: {
                en: 'Communications Error',
            }
        },
        OrderRequestResultStatusDisplay_Success: {
            id: StringId.OrderRequestResultStatusDisplay_Success, translations: {
                en: 'Success',
            }
        },
        OrderRequestResultStatusDisplay_Error: {
            id: StringId.OrderRequestResultStatusDisplay_Error, translations: {
                en: 'Error',
            }
        },
        OrderRequestResultStatusDisplay_Incomplete: {
            id: StringId.OrderRequestResultStatusDisplay_Incomplete, translations: {
                en: 'Incomplete',
            }
        },
        OrderRequestResultStatusDisplay_Invalid: {
            id: StringId.OrderRequestResultStatusDisplay_Invalid, translations: {
                en: 'Invalid',
            }
        },
        OrderRequestResultStatusDisplay_Rejected: {
            id: StringId.OrderRequestResultStatusDisplay_Rejected, translations: {
                en: 'Rejected',
            }
        },
        OrderRequestResultTitle_Status: {
            id: StringId.OrderRequestResultTitle_Status, translations: {
                en: 'Order request result status',
            }
        },
        OrderRequestResultCaption_Status: {
            id: StringId.OrderRequestResultCaption_Status, translations: {
                en: 'Status',
            }
        },
        OrderRequestResultTitle_OrderId: {
            id: StringId.OrderRequestResultTitle_OrderId, translations: {
                en: 'Order Id',
            }
        },
        OrderRequestResultCaption_OrderId: {
            id: StringId.OrderRequestResultCaption_OrderId, translations: {
                en: 'Order Id',
            }
        },
        OrderRequestResultTitle_Errors: {
            id: StringId.OrderRequestResultTitle_Errors, translations: {
                en: 'Order request errors',
            }
        },
        OrderRequestResultCaption_Errors: {
            id: StringId.OrderRequestResultCaption_Errors, translations: {
                en: 'Errors',
            }
        },
        ColorSelector_ItemColorTypeCaption: {
            id: StringId.ColorSelector_ItemColorTypeCaption, translations: {
                en: 'Item color type',
            }
        },
        ColorSelector_ItemColorTypeTitle: {
            id: StringId.ColorSelector_ItemColorTypeTitle, translations: {
                en: 'Item color type',
            }
        },
        ColorSelector_OpaqueCaption: {
            id: StringId.ColorSelector_OpaqueCaption, translations: {
                en: 'Picker color',
            }
        },
        ColorSelector_OpaqueTitle: {
            id: StringId.ColorSelector_OpaqueTitle, translations: {
                en: 'Color specified in picker',
            }
        },
        ColorSelector_TransparentCaption: {
            id: StringId.ColorSelector_TransparentCaption, translations: {
                en: 'Transparent',
            }
        },
        ColorSelector_TransparentTitle: {
            id: StringId.ColorSelector_TransparentTitle, translations: {
                en: 'Show underlying element',
            }
        },
        ColorSelector_UseInheritedCaption: {
            id: StringId.ColorSelector_UseInheritedCaption, translations: {
                en: 'Use inherited color',
            }
        },
        ColorSelector_UseInheritedTitle: {
            id: StringId.ColorSelector_UseInheritedTitle, translations: {
                en: 'To avoid having to specify each color, they can be set to have the same color as their ancestor',
            }
        },
        ColorSelector_LightenCaption: {
            id: StringId.ColorSelector_LightenCaption, translations: {
                en: 'Lighten',
            }
        },
        ColorSelector_LightenTitle: {
            id: StringId.ColorSelector_LightenTitle, translations: {
                en: 'Lighten',
            }
        },
        ColorSelector_DarkenCaption: {
            id: StringId.ColorSelector_DarkenCaption, translations: {
                en: 'Darken',
            }
        },
        ColorSelector_DarkenTitle: {
            id: StringId.ColorSelector_DarkenTitle, translations: {
                en: 'Darken',
            }
        },
        ColorSelector_BrightenCaption: {
            id: StringId.ColorSelector_BrightenCaption, translations: {
                en: 'Brighten',
            }
        },
        ColorSelector_BrightenTitle: {
            id: StringId.ColorSelector_BrightenTitle, translations: {
                en: 'Brighten',
            }
        },
        ColorSelector_ComplementCaption: {
            id: StringId.ColorSelector_ComplementCaption, translations: {
                en: 'Complement',
            }
        },
        ColorSelector_ComplementTitle: {
            id: StringId.ColorSelector_ComplementTitle, translations: {
                en: 'Complement',
            }
        },
        ColorSelector_SaturateCaption: {
            id: StringId.ColorSelector_SaturateCaption, translations: {
                en: 'Saturate',
            }
        },
        ColorSelector_SaturateTitle: {
            id: StringId.ColorSelector_SaturateTitle, translations: {
                en: 'Saturate',
            }
        },
        ColorSelector_DesaturateCaption: {
            id: StringId.ColorSelector_DesaturateCaption, translations: {
                en: 'Desaturate',
            }
        },
        ColorSelector_DesaturateTitle: {
            id: StringId.ColorSelector_DesaturateTitle, translations: {
                en: 'Desaturate',
            }
        },
        ColorSelector_SpinCaption: {
            id: StringId.ColorSelector_SpinCaption, translations: {
                en: 'Spin',
            }
        },
        ColorSelector_SpinTitle: {
            id: StringId.ColorSelector_SpinTitle, translations: {
                en: 'Spin',
            }
        },
        ColorSelector_CopyCaption: {
            id: StringId.ColorSelector_CopyCaption, translations: {
                en: 'Copy',
            }
        },
        ColorSelector_CopyTitle: {
            id: StringId.ColorSelector_CopyTitle, translations: {
                en: 'Copy',
            }
        },
        ColorItemProperties_ReadabilityTitle: {
            id: StringId.ColorItemProperties_ReadabilityTitle, translations: {
                en: 'Level of readability (0 = poor, 21 = excellent)',
            }
        },
        ColorItemProperties_ReadabilityCaption: {
            id: StringId.ColorItemProperties_ReadabilityCaption, translations: {
                en: 'Readability',
            }
        },
        ApplicationEnvironmentSelectorDisplay_Default: {
            id: StringId.ApplicationEnvironmentSelectorDisplay_Default, translations: {
                en: 'Default',
            }
        },
        ApplicationEnvironmentSelectorTitle_Default: {
            id: StringId.ApplicationEnvironmentSelectorTitle_Default, translations: {
                en: 'Default (used with all exchange environments)',
            }
        },
        ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment: {
            id: StringId.ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment, translations: {
                en: 'Exchange Environment',
            }
        },
        ApplicationEnvironmentSelectorTitle_ExchangeEnvironment: {
            id: StringId.ApplicationEnvironmentSelectorTitle_ExchangeEnvironment, translations: {
                en: 'Different settings for each exchange environment (Production, Delayed and Demo)',
            }
        },
        ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment_Demo: {
            id: StringId.ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment_Demo, translations: {
                en: 'Demo Exchange Environment',
            }
        },
        ApplicationEnvironmentSelectorTitle_ExchangeEnvironment_Demo: {
            id: StringId.ApplicationEnvironmentSelectorTitle_ExchangeEnvironment_Demo, translations: {
                en: 'Always use settings for Demo Exchange Environment',
            }
        },
        ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment_Delayed: {
            id: StringId.ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment_Delayed, translations: {
                en: 'Delayed Exchange Environment',
            }
        },
        ApplicationEnvironmentSelectorTitle_ExchangeEnvironment_Delayed: {
            id: StringId.ApplicationEnvironmentSelectorTitle_ExchangeEnvironment_Delayed, translations: {
                en: 'Always use settings for Delayed Production Exchange Environment',
            }
        },
        ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment_Production: {
            id: StringId.ApplicationEnvironmentSelectorDisplay_ExchangeEnvironment_Production, translations: {
                en: 'Production Exchange Environment',
            }
        },
        ApplicationEnvironmentSelectorTitle_ExchangeEnvironment_Production: {
            id: StringId.ApplicationEnvironmentSelectorTitle_ExchangeEnvironment_Production, translations: {
                en: 'Always use settings for Production Exchange Environment',
            }
        },
        ApplicationEnvironmentSelectorDisplay_Test: {
            id: StringId.ApplicationEnvironmentSelectorDisplay_Test, translations: {
                en: 'Test Settings',
            }
        },
        ApplicationEnvironmentSelectorTitle_Test: {
            id: StringId.ApplicationEnvironmentSelectorTitle_Test, translations: {
                en: 'Settings environment for testing',
            }
        },
        ApplicationEnvironmentDisplay_Default: {
            id: StringId.ApplicationEnvironmentDisplay_Default, translations: {
                en: 'Default',
            }
        },
        ApplicationEnvironmentTitle_Default: {
            id: StringId.ApplicationEnvironmentTitle_Default, translations: {
                en: 'Default',
            }
        },
        ApplicationEnvironmentDisplay_ExchangeEnvironment_Demo: {
            id: StringId.ApplicationEnvironmentDisplay_ExchangeEnvironment_Demo, translations: {
                en: 'Demo Exchange Environment',
            }
        },
        ApplicationEnvironmentTitle_ExchangeEnvironment_Demo: {
            id: StringId.ApplicationEnvironmentTitle_ExchangeEnvironment_Demo, translations: {
                en: 'Demo Exchange Environment',
            }
        },
        ApplicationEnvironmentDisplay_ExchangeEnvironment_Delayed: {
            id: StringId.ApplicationEnvironmentDisplay_ExchangeEnvironment_Delayed, translations: {
                en: 'Delayed Exchange Environment',
            }
        },
        ApplicationEnvironmentTitle_ExchangeEnvironment_Delayed: {
            id: StringId.ApplicationEnvironmentTitle_ExchangeEnvironment_Delayed, translations: {
                en: 'Delayed Production Exchange Environment',
            }
        },
        ApplicationEnvironmentDisplay_ExchangeEnvironment_Production: {
            id: StringId.ApplicationEnvironmentDisplay_ExchangeEnvironment_Production, translations: {
                en: 'Production Exchange Environment',
            }
        },
        ApplicationEnvironmentTitle_ExchangeEnvironment_Production: {
            id: StringId.ApplicationEnvironmentTitle_ExchangeEnvironment_Production, translations: {
                en: 'Production Exchange Environment',
            }
        },
        ApplicationEnvironmentDisplay_Test: {
            id: StringId.ApplicationEnvironmentDisplay_Test, translations: {
                en: 'Test',
            }
        },
        ApplicationEnvironmentTitle_Test: {
            id: StringId.ApplicationEnvironmentTitle_Test, translations: {
                en: 'Test',
            }
        },
        SymbolExchangeHideModeDisplay_Never: {
            id: StringId.SymbolExchangeHideModeDisplay_Never, translations: {
                en: 'Never',
            }
        },
        SymbolExchangeHideModeDescription_Never: {
            id: StringId.SymbolExchangeHideModeDescription_Never, translations: {
                en: 'Never hide the Exchange part of symbol (ie. it is always visible)',
            }
        },
        SymbolExchangeHideModeDisplay_Default: {
            id: StringId.SymbolExchangeHideModeDisplay_Default, translations: {
                en: 'Default',
            }
        },
        SymbolExchangeHideModeDescription_Default: {
            id: StringId.SymbolExchangeHideModeDescription_Default, translations: {
                en: 'Hide the exchange part of symbol if it is the default exchange',
            }
        },
        SymbolExchangeHideModeDisplay_WheneverPossible: {
            id: StringId.SymbolExchangeHideModeDisplay_WheneverPossible, translations: {
                en: 'Whenever Possible',
            }
        },
        SymbolExchangeHideModeDescription_WheneverPossible: {
            id: StringId.SymbolExchangeHideModeDescription_WheneverPossible, translations: {
                en: 'Hide the exchange part whenever possible.  (It will be hidden if market is shown)',
            }
        },
        BalancesFieldDisplay_AccountId: {
            id: StringId.BalancesFieldDisplay_AccountId, translations: {
                en: 'Account Id',
            }
        },
        BalancesFieldHeading_AccountId: {
            id: StringId.BalancesFieldHeading_AccountId, translations: {
                en: 'Account',
            }
        },
        BalancesFieldDisplay_CurrencyId: {
            id: StringId.BalancesFieldDisplay_CurrencyId, translations: {
                en: 'Currency Id',
            }
        },
        BalancesFieldHeading_CurrencyId: {
            id: StringId.BalancesFieldHeading_CurrencyId, translations: {
                en: 'Currency',
            }
        },
        BalancesFieldDisplay_NetBalance: {
            id: StringId.BalancesFieldDisplay_NetBalance, translations: {
                en: 'Net Balance',
            }
        },
        BalancesFieldHeading_NetBalance: {
            id: StringId.BalancesFieldHeading_NetBalance, translations: {
                en: 'Net Balance',
            }
        },
        BalancesFieldDisplay_Trading: {
            id: StringId.BalancesFieldDisplay_Trading, translations: {
                en: 'Trading',
            }
        },
        BalancesFieldHeading_Trading: {
            id: StringId.BalancesFieldHeading_Trading, translations: {
                en: 'Trading',
            }
        },
        BalancesFieldDisplay_NonTrading: {
            id: StringId.BalancesFieldDisplay_NonTrading, translations: {
                en: 'Non Trading',
            }
        },
        BalancesFieldHeading_NonTrading: {
            id: StringId.BalancesFieldHeading_NonTrading, translations: {
                en: 'Non Trading',
            }
        },
        BalancesFieldDisplay_UnfilledBuys: {
            id: StringId.BalancesFieldDisplay_UnfilledBuys, translations: {
                en: 'Unfilled Buys',
            }
        },
        BalancesFieldHeading_UnfilledBuys: {
            id: StringId.BalancesFieldHeading_UnfilledBuys, translations: {
                en: 'Unfilled Buys',
            }
        },
        BalancesFieldDisplay_Margin: {
            id: StringId.BalancesFieldDisplay_Margin, translations: {
                en: 'Margin',
            }
        },
        BalancesFieldHeading_Margin: {
            id: StringId.BalancesFieldHeading_Margin, translations: {
                en: 'Margin',
            }
        },
        BaseLitIvemDetailDisplay_Id: {
            id: StringId.BaseLitIvemDetailDisplay_Id, translations: {
                en: 'Symbol',
            }
        },
        BaseLitIvemDetailHeading_Id: {
            id: StringId.BaseLitIvemDetailHeading_Id, translations: {
                en: 'Symbol',
            }
        },
        BaseLitIvemDetailDisplay_Code: {
            id: StringId.BaseLitIvemDetailDisplay_Code, translations: {
                en: 'Code',
            }
        },
        BaseLitIvemDetailHeading_Code: {
            id: StringId.BaseLitIvemDetailHeading_Code, translations: {
                en: 'Code',
            }
        },
        BaseLitIvemDetailDisplay_MarketId: {
            id: StringId.BaseLitIvemDetailDisplay_MarketId, translations: {
                en: 'Market',
            }
        },
        BaseLitIvemDetailHeading_MarketId: {
            id: StringId.BaseLitIvemDetailHeading_MarketId, translations: {
                en: 'Market',
            }
        },
        BaseLitIvemDetailDisplay_IvemClassId: {
            id: StringId.BaseLitIvemDetailDisplay_IvemClassId, translations: {
                en: 'Class',
            }
        },
        BaseLitIvemDetailHeading_IvemClassId: {
            id: StringId.BaseLitIvemDetailHeading_IvemClassId, translations: {
                en: 'Class',
            }
        },
        BaseLitIvemDetailDisplay_SubscriptionDataIds: {
            id: StringId.BaseLitIvemDetailDisplay_SubscriptionDataIds, translations: {
                en: 'Subscription Datas',
            }
        },
        BaseLitIvemDetailHeading_SubscriptionDataIds: {
            id: StringId.BaseLitIvemDetailHeading_SubscriptionDataIds, translations: {
                en: 'Subscription Datas',
            }
        },
        BaseLitIvemDetailDisplay_TradingMarketIds: {
            id: StringId.BaseLitIvemDetailDisplay_TradingMarketIds, translations: {
                en: 'Trading Markets',
            }
        },
        BaseLitIvemDetailHeading_TradingMarketIds: {
            id: StringId.BaseLitIvemDetailHeading_TradingMarketIds, translations: {
                en: 'Trading Markets',
            }
        },
        BaseLitIvemDetailDisplay_Name: {
            id: StringId.BaseLitIvemDetailDisplay_Name, translations: {
                en: 'Name',
            }
        },
        BaseLitIvemDetailHeading_Name: {
            id: StringId.BaseLitIvemDetailHeading_Name, translations: {
                en: 'Name',
            }
        },
        BaseLitIvemDetailDisplay_ExchangeId: {
            id: StringId.BaseLitIvemDetailDisplay_ExchangeId, translations: {
                en: 'Exchange',
            }
        },
        BaseLitIvemDetailHeading_ExchangeId: {
            id: StringId.BaseLitIvemDetailHeading_ExchangeId, translations: {
                en: 'Exchange',
            }
        },
        ExtendedLitIvemDetailDisplay_DepthDirectionId: {
            id: StringId.ExtendedLitIvemDetailDisplay_DepthDirectionId, translations: {
                en: 'Depth Direction',
            }
        },
        ExtendedLitIvemDetailHeading_DepthDirectionId: {
            id: StringId.ExtendedLitIvemDetailHeading_DepthDirectionId, translations: {
                en: 'Depth Direction',
            }
        },
        ExtendedLitIvemDetailDisplay_IsIndex: {
            id: StringId.ExtendedLitIvemDetailDisplay_IsIndex, translations: {
                en: 'Is Index',
            }
        },
        ExtendedLitIvemDetailHeading_IsIndex: {
            id: StringId.ExtendedLitIvemDetailHeading_IsIndex, translations: {
                en: 'Index',
            }
        },
        ExtendedLitIvemDetailDisplay_ExpiryDate: {
            id: StringId.ExtendedLitIvemDetailDisplay_ExpiryDate, translations: {
                en: 'Expiry Date',
            }
        },
        ExtendedLitIvemDetailHeading_ExpiryDate: {
            id: StringId.ExtendedLitIvemDetailHeading_ExpiryDate, translations: {
                en: 'Expiry Date',
            }
        },
        ExtendedLitIvemDetailDisplay_StrikePrice: {
            id: StringId.ExtendedLitIvemDetailDisplay_StrikePrice, translations: {
                en: 'Strike Price',
            }
        },
        ExtendedLitIvemDetailHeading_StrikePrice: {
            id: StringId.ExtendedLitIvemDetailHeading_StrikePrice, translations: {
                en: 'Strike Price',
            }
        },
        ExtendedLitIvemDetailDisplay_ExerciseTypeId: {
            id: StringId.ExtendedLitIvemDetailDisplay_ExerciseTypeId, translations: {
                en: 'Exercise Type',
            }
        },
        ExtendedLitIvemDetailHeading_ExerciseTypeId: {
            id: StringId.ExtendedLitIvemDetailHeading_ExerciseTypeId, translations: {
                en: 'Exercise Type',
            }
        },
        ExtendedLitIvemDetailDisplay_CallOrPutId: {
            id: StringId.ExtendedLitIvemDetailDisplay_CallOrPutId, translations: {
                en: 'Call Or Put',
            }
        },
        ExtendedLitIvemDetailHeading_CallOrPutId: {
            id: StringId.ExtendedLitIvemDetailHeading_CallOrPutId, translations: {
                en: 'Call/Put',
            }
        },
        ExtendedLitIvemDetailDisplay_ContractSize: {
            id: StringId.ExtendedLitIvemDetailDisplay_ContractSize, translations: {
                en: 'Contract Size',
            }
        },
        ExtendedLitIvemDetailHeading_ContractSize: {
            id: StringId.ExtendedLitIvemDetailHeading_ContractSize, translations: {
                en: 'Contract Size',
            }
        },
        ExtendedLitIvemDetailDisplay_AlternateCodes: {
            id: StringId.ExtendedLitIvemDetailDisplay_AlternateCodes, translations: {
                en: 'Alternate Codes',
            }
        },
        ExtendedLitIvemDetailHeading_AlternateCodes: {
            id: StringId.ExtendedLitIvemDetailHeading_AlternateCodes, translations: {
                en: 'Alternate Codes',
            }
        },
        ExtendedLitIvemDetailDisplay_Attributes: {
            id: StringId.ExtendedLitIvemDetailDisplay_Attributes, translations: {
                en: 'Attributes',
            }
        },
        ExtendedLitIvemDetailHeading_Attributes: {
            id: StringId.ExtendedLitIvemDetailHeading_Attributes, translations: {
                en: 'Attributes',
            }
        },
        ExtendedLitIvemDetailDisplay_TmcLegs: {
            id: StringId.ExtendedLitIvemDetailDisplay_TmcLegs, translations: {
                en: 'Tmc Legs',
            }
        },
        ExtendedLitIvemDetailHeading_TmcLegs: {
            id: StringId.ExtendedLitIvemDetailHeading_TmcLegs, translations: {
                en: 'Tmc Legs',
            }
        },
        ExtendedLitIvemDetailDisplay_Categories: {
            id: StringId.ExtendedLitIvemDetailDisplay_Categories, translations: {
                en: 'Categories',
            }
        },
        ExtendedLitIvemDetailHeading_Categories: {
            id: StringId.ExtendedLitIvemDetailHeading_Categories, translations: {
                en: 'Categories',
            }
        },
        MyxLitIvemAttributesDisplay_Category: {
            id: StringId.MyxLitIvemAttributesDisplay_Category, translations: {
                en: 'Category',
            }
        },
        MyxLitIvemAttributesHeading_Category: {
            id: StringId.MyxLitIvemAttributesHeading_Category, translations: {
                en: 'Category',
            }
        },
        MyxLitIvemAttributesDisplay_MarketClassification: {
            id: StringId.MyxLitIvemAttributesDisplay_MarketClassification, translations: {
                en: 'Market Classification',
            }
        },
        MyxLitIvemAttributesHeading_MarketClassification: {
            id: StringId.MyxLitIvemAttributesHeading_MarketClassification, translations: {
                en: 'Classification',
            }
        },
        MyxLitIvemAttributesDisplay_DeliveryBasis: {
            id: StringId.MyxLitIvemAttributesDisplay_DeliveryBasis, translations: {
                en: 'Delivery Basis',
            }
        },
        MyxLitIvemAttributesHeading_DeliveryBasis: {
            id: StringId.MyxLitIvemAttributesHeading_DeliveryBasis, translations: {
                en: 'Delivery',
            }
        },
        MyxLitIvemAttributesDisplay_MaxRSS: {
            id: StringId.MyxLitIvemAttributesDisplay_MaxRSS, translations: {
                en: 'MaxRSS',
            }
        },
        MyxLitIvemAttributesHeading_MaxRSS: {
            id: StringId.MyxLitIvemAttributesHeading_MaxRSS, translations: {
                en: 'MaxRSS',
            }
        },
        MyxLitIvemAttributesDisplay_Sector: {
            id: StringId.MyxLitIvemAttributesDisplay_Sector, translations: {
                en: 'Sector',
            }
        },
        MyxLitIvemAttributesHeading_Sector: {
            id: StringId.MyxLitIvemAttributesHeading_Sector, translations: {
                en: 'Sector',
            }
        },
        MyxLitIvemAttributesDisplay_Short: {
            id: StringId.MyxLitIvemAttributesDisplay_Short, translations: {
                en: 'Short',
            }
        },
        MyxLitIvemAttributesHeading_Short: {
            id: StringId.MyxLitIvemAttributesHeading_Short, translations: {
                en: 'Short',
            }
        },
        MyxLitIvemAttributesDisplay_ShortSuspended: {
            id: StringId.MyxLitIvemAttributesDisplay_ShortSuspended, translations: {
                en: 'Short Suspended',
            }
        },
        MyxLitIvemAttributesHeading_ShortSuspended: {
            id: StringId.MyxLitIvemAttributesHeading_ShortSuspended, translations: {
                en: 'Short Suspended',
            }
        },
        MyxLitIvemAttributesDisplay_SubSector: {
            id: StringId.MyxLitIvemAttributesDisplay_SubSector, translations: {
                en: 'Sub Sector',
            }
        },
        MyxLitIvemAttributesHeading_SubSector: {
            id: StringId.MyxLitIvemAttributesHeading_SubSector, translations: {
                en: 'Sub Sector',
            }
        },
        LitIvemAlternateCodeDisplay_Ticker: {
            id: StringId.LitIvemAlternateCodeDisplay_Ticker, translations: {
                en: 'Ticker',
            }
        },
        LitIvemAlternateCodeHeading_Ticker: {
            id: StringId.LitIvemAlternateCodeHeading_Ticker, translations: {
                en: 'Ticker',
            }
        },
        LitIvemAlternateCodeDisplay_Gics: {
            id: StringId.LitIvemAlternateCodeDisplay_Gics, translations: {
                en: 'GICS',
            }
        },
        LitIvemAlternateCodeHeading_Gics: {
            id: StringId.LitIvemAlternateCodeHeading_Gics, translations: {
                en: 'GICS',
            }
        },
        LitIvemAlternateCodeDisplay_Isin: {
            id: StringId.LitIvemAlternateCodeDisplay_Isin, translations: {
                en: 'ISIN',
            }
        },
        LitIvemAlternateCodeHeading_Isin: {
            id: StringId.LitIvemAlternateCodeHeading_Isin, translations: {
                en: 'ISIN',
            }
        },
        LitIvemAlternateCodeDisplay_Ric: {
            id: StringId.LitIvemAlternateCodeDisplay_Ric, translations: {
                en: 'RIC',
            }
        },
        LitIvemAlternateCodeHeading_Ric: {
            id: StringId.LitIvemAlternateCodeHeading_Ric, translations: {
                en: 'RIC',
            }
        },
        LitIvemAlternateCodeDisplay_Base: {
            id: StringId.LitIvemAlternateCodeDisplay_Base, translations: {
                en: 'Base/Underlying',
            }
        },
        LitIvemAlternateCodeHeading_Base: {
            id: StringId.LitIvemAlternateCodeHeading_Base, translations: {
                en: 'Base',
            }
        },
        DepthDirectionDisplay_BidBelowAsk: {
            id: StringId.DepthDirectionDisplay_BidBelowAsk, translations: {
                en: 'Bid below Ask',
            }
        },
        DepthDirectionDisplay_AskBelowBid: {
            id: StringId.DepthDirectionDisplay_AskBelowBid, translations: {
                en: 'Ask below Bid',
            }
        },
        MyxMarketClassificationDisplay_Main: {
            id: StringId.MyxMarketClassificationDisplay_Main, translations: {
                en: 'MAIN',
            }
        },
        MyxMarketClassificationDisplay_Ace: {
            id: StringId.MyxMarketClassificationDisplay_Ace, translations: {
                en: 'ACE',
            }
        },
        MyxMarketClassificationDisplay_Etf: {
            id: StringId.MyxMarketClassificationDisplay_Etf, translations: {
                en: 'ETF',
            }
        },
        MyxMarketClassificationDisplay_Strw: {
            id: StringId.MyxMarketClassificationDisplay_Strw, translations: {
                en: 'STRW',
            }
        },
        MyxMarketClassificationDisplay_Bond: {
            id: StringId.MyxMarketClassificationDisplay_Bond, translations: {
                en: 'BOND',
            }
        },
        MyxMarketClassificationDisplay_Leap: {
            id: StringId.MyxMarketClassificationDisplay_Leap, translations: {
                en: 'LEAP',
            }
        },
        MyxShortSellTypeDisplay_RegulatedShortSelling: {
            id: StringId.MyxShortSellTypeDisplay_RegulatedShortSelling, translations: {
                en: 'Regulated short selling',
            }
        },
        MyxShortSellTypeDisplay_ProprietaryDayTrading: {
            id: StringId.MyxShortSellTypeDisplay_ProprietaryDayTrading, translations: {
                en: 'Proprietary day trading',
            }
        },
        MyxShortSellTypeDisplay_IntraDayShortSelling: {
            id: StringId.MyxShortSellTypeDisplay_IntraDayShortSelling, translations: {
                en: 'Intraday short selling',
            }
        },
        MyxShortSellTypeDisplay_ProprietaryShortSelling: {
            id: StringId.MyxShortSellTypeDisplay_ProprietaryShortSelling, translations: {
                en: 'Proprietary short selling',
            }
        },
        MyxCategoryDisplay_Foreign: {
            id: StringId.MyxCategoryDisplay_Foreign, translations: {
                en: 'Foreign',
            }
        },
        MyxCategoryDisplay_Sharia: {
            id: StringId.MyxCategoryDisplay_Sharia, translations: {
                en: 'Sharia',
            }
        },
        MyxDeliveryBasisDisplay_BuyingInT0: {
            id: StringId.MyxDeliveryBasisDisplay_BuyingInT0, translations: {
                en: 'Buying in T0',
            }
        },
        MyxDeliveryBasisDisplay_DesignatedBasisT1: {
            id: StringId.MyxDeliveryBasisDisplay_DesignatedBasisT1, translations: {
                en: 'Designated basis T1',
            }
        },
        MyxDeliveryBasisDisplay_ReadyBasisT2: {
            id: StringId.MyxDeliveryBasisDisplay_ReadyBasisT2, translations: {
                en: 'Ready basis T2',
            }
        },
        MyxDeliveryBasisDisplay_ImmediateBasisT1: {
            id: StringId.MyxDeliveryBasisDisplay_ImmediateBasisT1, translations: {
                en: 'Immediate basis T1',
            }
        },
        QuerySymbolsDataDefinitionFieldDisplay_Code: {
            id: StringId.QuerySymbolsDataDefinitionFieldDisplay_Code, translations: {
                en: 'Code',
            }
        },
        QuerySymbolsDataDefinitionFieldDescription_Code: {
            id: StringId.QuerySymbolsDataDefinitionFieldDescription_Code, translations: {
                en: 'Match symbol Code',
            }
        },
        QuerySymbolsDataDefinitionFieldDisplay_Name: {
            id: StringId.QuerySymbolsDataDefinitionFieldDisplay_Name, translations: {
                en: 'Name',
            }
        },
        QuerySymbolsDataDefinitionFieldDescription_Name: {
            id: StringId.QuerySymbolsDataDefinitionFieldDescription_Name, translations: {
                en: 'Match symbol Name',
            }
        },
        QuerySymbolsDataDefinitionFieldDisplay_Ticker: {
            id: StringId.QuerySymbolsDataDefinitionFieldDisplay_Ticker, translations: {
                en: 'Ticker',
            }
        },
        QuerySymbolsDataDefinitionFieldDescription_Ticker: {
            id: StringId.QuerySymbolsDataDefinitionFieldDescription_Ticker, translations: {
                en: 'Match symbol Ticker',
            }
        },
        QuerySymbolsDataDefinitionFieldDisplay_Gics: {
            id: StringId.QuerySymbolsDataDefinitionFieldDisplay_Gics, translations: {
                en: 'GICS',
            }
        },
        QuerySymbolsDataDefinitionFieldDescription_Gics: {
            id: StringId.QuerySymbolsDataDefinitionFieldDescription_Gics, translations: {
                en: 'Match symbol GICS value',
            }
        },
        QuerySymbolsDataDefinitionFieldDisplay_Isin: {
            id: StringId.QuerySymbolsDataDefinitionFieldDisplay_Isin, translations: {
                en: 'ISIN',
            }
        },
        QuerySymbolsDataDefinitionFieldDescription_Isin: {
            id: StringId.QuerySymbolsDataDefinitionFieldDescription_Isin, translations: {
                en: 'Match symbol ISIN',
            }
        },
        QuerySymbolsDataDefinitionFieldDisplay_Base: {
            id: StringId.QuerySymbolsDataDefinitionFieldDisplay_Base, translations: {
                en: 'Underlying',
            }
        },
        QuerySymbolsDataDefinitionFieldDescription_Base: {
            id: StringId.QuerySymbolsDataDefinitionFieldDescription_Base, translations: {
                en: 'Match symbol Underlying security code',
            }
        },
        QuerySymbolsDataDefinitionFieldDisplay_Ric: {
            id: StringId.QuerySymbolsDataDefinitionFieldDisplay_Ric, translations: {
                en: 'RIC',
            }
        },
        QuerySymbolsDataDefinitionFieldDescription_Ric: {
            id: StringId.QuerySymbolsDataDefinitionFieldDescription_Ric, translations: {
                en: 'Match symbol RIC code',
            }
        },

        SymbolsDitemControlTitle_QueryOrSubscribe: {
            id: StringId.SymbolsDitemControlTitle_QueryOrSubscribe, translations: {
                en: 'Search Type',
            }
        },
        SymbolsDitemControlCaption_QueryOrSubscribe: {
            id: StringId.SymbolsDitemControlCaption_QueryOrSubscribe, translations: {
                en: 'Search Type',
            }
        },
        SymbolsDitemControlTitle_Exchange: {
            id: StringId.SymbolsDitemControlTitle_Exchange, translations: {
                en: 'Limit search to exchange',
            }
        },
        SymbolsDitemControlCaption_Exchange: {
            id: StringId.SymbolsDitemControlCaption_Exchange, translations: {
                en: 'Exchange',
            }
        },
        SymbolsDitemControlTitle_Markets: {
            id: StringId.SymbolsDitemControlTitle_Markets, translations: {
                en: 'Select markets for search',
            }
        },
        SymbolsDitemControlCaption_Markets: {
            id: StringId.SymbolsDitemControlCaption_Markets, translations: {
                en: 'Markets',
            }
        },
        SymbolsDitemControlTitle_Cfi: {
            id: StringId.SymbolsDitemControlTitle_Cfi, translations: {
                en: 'Classification of Financial Instruments'
            }
        },
        SymbolsDitemControlCaption_Cfi: {
            id: StringId.SymbolsDitemControlCaption_Cfi, translations: {
                en: 'CFI'
            }
        },
        SymbolsDitemControlTitle_Fields: {
            id: StringId.SymbolsDitemControlTitle_Fields, translations: {
                en: 'Select symbol fields to search',
            }
        },
        SymbolsDitemControlCaption_Fields: {
            id: StringId.SymbolsDitemControlCaption_Fields, translations: {
                en: 'Fields',
            }
        },
        SymbolsDitemControlTitle_Partial: {
            id: StringId.SymbolsDitemControlTitle_Partial, translations: {
                en: 'Allow search to partially match field',
            }
        },
        SymbolsDitemControlCaption_Partial: {
            id: StringId.SymbolsDitemControlCaption_Partial, translations: {
                en: 'Partial',
            }
        },
        SymbolsDitemControlTitle_PreferExact: {
            id: StringId.SymbolsDitemControlTitle_PreferExact, translations: {
                en: 'Only show exact match if an exact match is found',
            }
        },
        SymbolsDitemControlCaption_PreferExact: {
            id: StringId.SymbolsDitemControlCaption_PreferExact, translations: {
                en: 'Prefer exact',
            }
        },
        SymbolsDitemControlTitle_ShowFull: {
            id: StringId.SymbolsDitemControlTitle_ShowFull, translations: {
                en: 'Show all available data for symbols',
            }
        },
        SymbolsDitemControlCaption_ShowFull: {
            id: StringId.SymbolsDitemControlCaption_ShowFull, translations: {
                en: 'Show Full',
            }
        },
        SymbolsDitemControlTitle_PageSize: {
            id: StringId.SymbolsDitemControlTitle_PageSize, translations: {
                en: 'Number of symbols per page',
            }
        },
        SymbolsDitemControlCaption_PageSize: {
            id: StringId.SymbolsDitemControlCaption_PageSize, translations: {
                en: 'Page size',
            }
        },
        SymbolsDitemControlTitle_Search: {
            id: StringId.SymbolsDitemControlTitle_Search, translations: {
                en: 'Text which symbol fields (code, name etc) will be matched against',
            }
        },
        SymbolsDitemControlCaption_Search: {
            id: StringId.SymbolsDitemControlCaption_Search, translations: {
                en: 'Search',
            }
        },
        SymbolsDitemControlTitle_Query: {
            id: StringId.SymbolsDitemControlTitle_Query, translations: {
                en: 'Search for symbols',
            }
        },
        SymbolsDitemControlCaption_Query: {
            id: StringId.SymbolsDitemControlCaption_Query, translations: {
                en: 'Search',
            }
        },
        SymbolsDitemControlTitle_SubscribeMarket: {
            id: StringId.SymbolsDitemControlTitle_SubscribeMarket, translations: {
                en: 'Specify market for symbol subscription',
            }
        },
        SymbolsDitemControlCaption_SubscribeMarket: {
            id: StringId.SymbolsDitemControlCaption_SubscribeMarket, translations: {
                en: 'Market',
            }
        },
        SymbolsDitemControlTitle_Class: {
            id: StringId.SymbolsDitemControlTitle_Class, translations: {
                en: 'Specify class for symbol subscription',
            }
        },
        SymbolsDitemControlCaption_Class: {
            id: StringId.SymbolsDitemControlCaption_Class, translations: {
                en: 'Class',
            }
        },
        SymbolsDitemControlTitle_Subscribe: {
            id: StringId.SymbolsDitemControlTitle_Subscribe, translations: {
                en: 'Subscribe to symbols for Market/Class. List will be updated as symbols are added, removed or modified',
            }
        },
        SymbolsDitemControlCaption_Subscribe: {
            id: StringId.SymbolsDitemControlCaption_Subscribe, translations: {
                en: 'Subscribe',
            }
        },
        SymbolsDitemControlTitle_QuerySearchDescription: {
            id: StringId.SymbolsDitemControlTitle_QuerySearchDescription, translations: {
                en: 'Symbol search parameters for query list',
            }
        },
        SymbolsDitemControlCaption_QuerySearchDescription: {
            id: StringId.SymbolsDitemControlCaption_QuerySearchDescription, translations: {
                en: 'Symbol search parameters',
            }
        },
        SymbolsDitemControlTitle_SubscriptionSearchDescription: {
            id: StringId.SymbolsDitemControlTitle_SubscriptionSearchDescription, translations: {
                en: 'Symbol search parameters for subscribe list',
            }
        },
        SymbolsDitemControlCaption_SubscriptionSearchDescription: {
            id: StringId.SymbolsDitemControlCaption_SubscriptionSearchDescription, translations: {
                en: 'Symbol search parameters',
            }
        },
        SymbolsDitemControlTitle_NextPage: {
            id: StringId.SymbolsDitemControlTitle_NextPage, translations: {
                en: 'Get next page of symbols',
            }
        },
        SymbolsDitemControlCaption_NextPage: {
            id: StringId.SymbolsDitemControlCaption_NextPage, translations: {
                en: 'Next',
            }
        },
        SymbolsDitemQueryOrSubscribeDescription_Query: {
            id: StringId.SymbolsDitemQueryOrSubscribeDescription_Query, translations: {
                en: 'Execute a \'one of\' query for symbols',
            }
        },
        SymbolsDitemQueryOrSubscribeDescription_Subscription: {
            id: StringId.SymbolsDitemQueryOrSubscribeDescription_Subscription, translations: {
                en: 'Subscribe to symbols for Market/Class. List will be updated as symbols are added, removed or modified',
            }
        },
        DayTradesGridHeading_Id: {
            id: StringId.DayTradesGridHeading_Id, translations: {
                en: 'Id',
            }
        },
        DayTradesGridHeading_Price: {
            id: StringId.DayTradesGridHeading_Price, translations: {
                en: 'Price',
            }
        },
        DayTradesGridHeading_Quantity: {
            id: StringId.DayTradesGridHeading_Quantity, translations: {
                en: 'Quantity',
            }
        },
        DayTradesGridHeading_Time: {
            id: StringId.DayTradesGridHeading_Time, translations: {
                en: 'Time',
            }
        },
        DayTradesGridHeading_FlagIds: {
            id: StringId.DayTradesGridHeading_FlagIds, translations: {
                en: 'Flags',
            }
        },
        DayTradesGridHeading_TrendId: {
            id: StringId.DayTradesGridHeading_TrendId, translations: {
                en: 'Trend',
            }
        },
        DayTradesGridHeading_BidAskSideId: {
            id: StringId.DayTradesGridHeading_BidAskSideId, translations: {
                en: 'Side',
            }
        },
        DayTradesGridHeading_AffectsIds: {
            id: StringId.DayTradesGridHeading_AffectsIds, translations: {
                en: 'Affects',
            }
        },
        DayTradesGridHeading_ConditionCodes: {
            id: StringId.DayTradesGridHeading_ConditionCodes, translations: {
                en: 'Codes',
            }
        },
        DayTradesGridHeading_BuyDepthOrderId: {
            id: StringId.DayTradesGridHeading_BuyDepthOrderId, translations: {
                en: 'Buy Id',
            }
        },
        DayTradesGridHeading_BuyBroker: {
            id: StringId.DayTradesGridHeading_BuyBroker, translations: {
                en: 'Buy Broker',
            }
        },
        DayTradesGridHeading_BuyCrossRef: {
            id: StringId.DayTradesGridHeading_BuyCrossRef, translations: {
                en: 'Buy XRef',
            }
        },
        DayTradesGridHeading_SellDepthOrderId: {
            id: StringId.DayTradesGridHeading_SellDepthOrderId, translations: {
                en: 'Sell Id',
            }
        },
        DayTradesGridHeading_SellBroker: {
            id: StringId.DayTradesGridHeading_SellBroker, translations: {
                en: 'Sell Broker',
            }
        },
        DayTradesGridHeading_SellCrossRef: {
            id: StringId.DayTradesGridHeading_SellCrossRef, translations: {
                en: 'Sell XRef',
            }
        },
        DayTradesGridHeading_MarketId: {
            id: StringId.DayTradesGridHeading_MarketId, translations: {
                en: 'Market',
            }
        },
        DayTradesGridHeading_RelatedId: {
            id: StringId.DayTradesGridHeading_RelatedId, translations: {
                en: 'Related',
            }
        },
        DayTradesGridHeading_Attributes: {
            id: StringId.DayTradesGridHeading_Attributes, translations: {
                en: 'Attributes',
            }
        },
        DayTradesGridHeading_RecordType: {
            id: StringId.DayTradesGridHeading_RecordType, translations: {
                en: 'Record Type',
            }
        },
        SubscribabilityIncreaseRetry_FromExtentNone: {
            id: StringId.SubscribabilityIncreaseRetry_FromExtentNone, translations: {
                en: 'Retrying from no subscribability',
            }
        },
        SubscribabilityIncreaseRetry_FromExtentSome: {
            id: StringId.SubscribabilityIncreaseRetry_FromExtentSome, translations: {
                en: 'Retrying from partial subscribability',
            }
        },
        SubscribabilityIncreaseRetry_ReIncrease: {
            id: StringId.SubscribabilityIncreaseRetry_ReIncrease, translations: {
                en: 'Waiting for Feed to reconnect or come online again',
            }
        },
        BadnessReasonId_NotBad: {
            id: StringId.BadnessReasonId_NotBad, translations: {
                en: 'Not bad',
            }
        },
        BadnessReasonId_Inactive: {
            id: StringId.BadnessReasonId_Inactive, translations: {
                en: 'Inactive',
            }
        },
        BadnessReasonId_PublisherSubscriptionError_Internal_Error: {
            id: StringId.BadnessReasonId_PublisherSubscriptionError_Internal_Error, translations: {
                en: 'Feed internal error',
            },
        },
        BadnessReasonId_PublisherSubscriptionError_Offlined_Suspect: {
            id: StringId.BadnessReasonId_PublisherSubscriptionError_Offlined_Suspect, translations: {
                en: 'Feed offline (waiting)',
            },
        },
        BadnessReasonId_PublisherSubscriptionError_Offlined_Error: {
            id: StringId.BadnessReasonId_PublisherSubscriptionError_Offlined_Error, translations: {
                en: 'Feed offline error',
            },
        },
        BadnessReasonId_PublisherSubscriptionError_Timeout_Suspect: {
            id: StringId.BadnessReasonId_PublisherSubscriptionError_Timeout_Suspect, translations: {
                en: 'Feed request timeout (retrying)',
            },
        },
        BadnessReasonId_PublisherSubscriptionError_Timeout_Error: {
            id: StringId.BadnessReasonId_PublisherSubscriptionError_Timeout_Error, translations: {
                en: 'Feed request timeout error',
            },
        },
        BadnessReasonId_PublisherSubscriptionError_UserNotAuthorised_Error: {
            id: StringId.BadnessReasonId_PublisherSubscriptionError_UserNotAuthorised_Error, translations: {
                en: 'User authorisation error',
            },
        },
        BadnessReasonId_PublisherSubscriptionError_PublishRequestError_Suspect: {
            id: StringId.BadnessReasonId_PublisherSubscriptionError_PublishRequestError_Suspect, translations: {
                en: 'Feed request error (retrying)',
            },
        },
        BadnessReasonId_PublisherSubscriptionError_PublishRequestError_Error: {
            id: StringId.BadnessReasonId_PublisherSubscriptionError_PublishRequestError_Error, translations: {
                en: 'Feed request error',
            },
        },
        BadnessReasonId_PublisherSubscriptionError_SubRequestError_Suspect: {
            id: StringId.BadnessReasonId_PublisherSubscriptionError_SubRequestError_Suspect, translations: {
                en: 'Feed request error (retrying)',
            },
        },
        BadnessReasonId_PublisherSubscriptionError_SubRequestError_Error: {
            id: StringId.BadnessReasonId_PublisherSubscriptionError_SubRequestError_Error, translations: {
                en: 'Feed request error',
            },
        },
        BadnessReasonId_PublisherSubscriptionError_DataError_Suspect: {
            id: StringId.BadnessReasonId_PublisherSubscriptionError_DataError_Suspect, translations: {
                en: 'Data error',
            },
        },
        BadnessReasonId_PublisherSubscriptionError_DataError_Error: {
            id: StringId.BadnessReasonId_PublisherSubscriptionError_DataError_Error, translations: {
                en: 'Data error',
            },
        },
        BadnessReasonId_PublisherServerWarning: {
            id: StringId.BadnessReasonId_PublisherServerWarning, translations: {
                en: 'Feed server warning',
            }
        },
        BadnessReasonId_PublisherServerError: {
            id: StringId.BadnessReasonId_PublisherServerError, translations: {
                en: 'Feed server error',
            }
        },
        BadnessReasonId_PublisherSubscription_NeverSubscribed: {
            id: StringId.BadnessReasonId_PublisherSubscription_NeverSubscribed, translations: {
                en: 'Not yet subscribed to Feed data',
            }
        },
        BadnessReasonId_PublisherSubscription_PublisherOnlineWaiting: {
            id: StringId.BadnessReasonId_PublisherSubscription_PublisherOnlineWaiting, translations: {
                en: 'Waiting for feed connection to come online',
            }
        },
        BadnessReasonId_PublisherSubscription_PublisherOfflining: {
            id: StringId.BadnessReasonId_PublisherSubscription_PublisherOfflining, translations: {
                en: 'Feed going offline',
            }
        },
        BadnessReasonId_PublisherSubscription_ResponseWaiting: {
            id: StringId.BadnessReasonId_PublisherSubscription_ResponseWaiting, translations: {
                en: 'Waiting for server data',
            }
        },
        BadnessReasonId_PublisherSubscription_SynchronisationWaiting: {
            id: StringId.BadnessReasonId_PublisherSubscription_SynchronisationWaiting, translations: {
                en: 'Data synchronising',
            }
        },
        BadnessReasonId_PublisherSubscription_Synchronised: {
            id: StringId.BadnessReasonId_PublisherSubscription_Synchronised, translations: {
                en: 'Data synchronised',
            }
        },
        BadnessReasonId_PublisherSubscription_UnsubscribedSynchronised: {
            id: StringId.BadnessReasonId_PublisherSubscription_UnsubscribedSynchronised, translations: {
                en: 'Data snapshot synchronised',
            }
        },
        BadnessReasonId_PreGood_Clear: {
            id: StringId.BadnessReasonId_PreGood_Clear, translations: {
                en: 'Pre good clearing',
            }
        },
        BadnessReasonId_PreGood_Add: {
            id: StringId.BadnessReasonId_PreGood_Add, translations: {
                en: 'Pre good adding',
            }
        },
        BadnessReasonId_ConnectionOffline: {
            id: StringId.BadnessReasonId_ConnectionOffline, translations: {
                en: 'Connection offline',
            }
        },
        BadnessReasonId_FeedsWaiting: {
            id: StringId.BadnessReasonId_FeedsWaiting, translations: {
                en: 'Waiting for feeds',
            }
        },
        BadnessReasonId_FeedsError: {
            id: StringId.BadnessReasonId_FeedsError, translations: {
                en: 'Feeds error',
            }
        },
        BadnessReasonId_FeedWaiting: {
            id: StringId.BadnessReasonId_FeedWaiting, translations: {
                en: 'Waiting for feed',
            }
        },
        BadnessReasonId_FeedError: {
            id: StringId.BadnessReasonId_FeedError, translations: {
                en: 'Feed error',
            }
        },
        BadnessReasonId_FeedNotAvailable: {
            id: StringId.BadnessReasonId_FeedNotAvailable, translations: {
                en: 'Feed not available',
            }
        },
        BadnessReasonId_NoAuthorityFeed: {
            id: StringId.BadnessReasonId_NoAuthorityFeed, translations: {
                en: 'No Authority Feed',
            }
        },
        BadnessReasonId_MarketsWaiting: {
            id: StringId.BadnessReasonId_MarketsWaiting, translations: {
                en: 'Waiting for markets',
            }
        },
        BadnessReasonId_MarketsError: {
            id: StringId.BadnessReasonId_MarketsError, translations: {
                en: 'Markets Error',
            }
        },
        BadnessReasonId_MarketWaiting: {
            id: StringId.BadnessReasonId_MarketWaiting, translations: {
                en: 'Waiting for market',
            }
        },
        BadnessReasonId_MarketError: {
            id: StringId.BadnessReasonId_MarketError, translations: {
                en: 'Market error',
            }
        },
        BadnessReasonId_MarketNotAvailable: {
            id: StringId.BadnessReasonId_MarketNotAvailable, translations: {
                en: 'Market not available',
            }
        },
        BadnessReasonId_BrokerageAccountsWaiting: {
            id: StringId.BadnessReasonId_BrokerageAccountsWaiting, translations: {
                en: 'Waiting for accounts',
            }
        },
        BadnessReasonId_BrokerageAccountsError: {
            id: StringId.BadnessReasonId_BrokerageAccountsError, translations: {
                en: 'Accounts error',
            }
        },
        BadnessReasonId_BrokerageAccountWaiting: {
            id: StringId.BadnessReasonId_BrokerageAccountWaiting, translations: {
                en: 'Waiting for account',
            }
        },
        BadnessReasonId_BrokerageAccountError: {
            id: StringId.BadnessReasonId_BrokerageAccountError, translations: {
                en: 'Account error',
            }
        },
        BadnessReasonId_BrokerageAccountNotAvailable: {
            id: StringId.BadnessReasonId_BrokerageAccountNotAvailable, translations: {
                en: 'Brokerage account not available',
            }
        },
        BadnessReasonId_OrderStatusesError: {
            id: StringId.BadnessReasonId_OrderStatusesError, translations: {
                en: 'Order statuses error',
            }
        },
        BadnessReasonId_FeedStatus_Unknown: {
            id: StringId.BadnessReasonId_FeedStatus_Unknown, translations: {
                en: 'Feed state unknown',
            }
        },
        BadnessReasonId_FeedStatus_Initialising: {
            id: StringId.BadnessReasonId_FeedStatus_Initialising, translations: {
                en: 'Feed initialising',
            }
        },
        BadnessReasonId_FeedStatus_Impaired: {
            id: StringId.BadnessReasonId_FeedStatus_Impaired, translations: {
                en: 'Feed impaired',
            }
        },
        BadnessReasonId_FeedStatus_Expired: {
            id: StringId.BadnessReasonId_FeedStatus_Expired, translations: {
                en: 'Feed expired',
            }
        },
        BadnessReasonId_Reading: {
            id: StringId.BadnessReasonId_Reading, translations: {
                en: 'Reading',
            }
        },
        BadnessReasonId_SymbolMatching_None: {
            id: StringId.BadnessReasonId_SymbolMatching_None, translations: {
                en: 'No Matching Symbol',
            }
        },
        BadnessReasonId_SymbolMatching_Ambiguous: {
            id: StringId.BadnessReasonId_SymbolMatching_Ambiguous, translations: {
                en: 'Ambiguous Symbol Match',
            }
        },
        BadnessReasonId_SymbolOkWaitingForData: {
            id: StringId.BadnessReasonId_SymbolOkWaitingForData, translations: {
                en: 'Symbol ok, waiting for data',
            }
        },
        BadnessReasonId_DataRetrieving: {
            id: StringId.BadnessReasonId_DataRetrieving, translations: {
                en: 'Retrieving data',
            }
        },
        BadnessReasonId_MarketTradingStatesRetrieving: {
            id: StringId.BadnessReasonId_MarketTradingStatesRetrieving, translations: {
                en: 'Retrieving market trading states',
            }
        },
        BadnessReasonId_OrderStatusesFetching: {
            id: StringId.BadnessReasonId_OrderStatusesFetching, translations: {
                en: 'Fetching order statuses',
            }
        },
        BadnessReasonId_BrokerageAccountDataListsIncubating: {
            id: StringId.BadnessReasonId_BrokerageAccountDataListsIncubating, translations: {
                en: 'Waiting on data from individual accounts',
            }
        },
        BadnessReasonId_OneOrMoreAccountsInError: {
            id: StringId.BadnessReasonId_OneOrMoreAccountsInError, translations: {
                en: 'One or more accounts in error',
            }
        },
        BadnessReasonId_ResourceWarnings: {
            id: StringId.BadnessReasonId_ResourceWarnings, translations: {
                en: 'Resource warning(s)',
            }
        },
        BadnessReasonId_ResourceErrors: {
            id: StringId.BadnessReasonId_ResourceErrors, translations: {
                en: 'Resource error(s)',
            }
        },
        BadnessReasonId_StatusWarnings: {
            id: StringId.BadnessReasonId_StatusWarnings, translations: {
                en: 'Status warning(s)',
            }
        },
        BadnessReasonId_StatusRetrieving: {
            id: StringId.BadnessReasonId_StatusRetrieving, translations: {
                en: 'Retrieving status data',
            }
        },
        BadnessReasonId_StatusErrors: {
            id: StringId.BadnessReasonId_StatusErrors, translations: {
                en: 'Status error(s)',
            }
        },
        SourceTzOffsetDateTimeTimezoneModeDisplay_Utc: {
            id: StringId.SourceTzOffsetDateTimeTimezoneModeDisplay_Utc, translations: {
                en: 'UTC',
            }
        },
        SourceTzOffsetDateTimeTimezoneModeDescription_Utc: {
            id: StringId.SourceTzOffsetDateTimeTimezoneModeDescription_Utc, translations: {
                en: 'Display times according to UTC timezone',
            }
        },
        SourceTzOffsetDateTimeTimezoneModeDisplay_Local: {
            id: StringId.SourceTzOffsetDateTimeTimezoneModeDisplay_Local, translations: {
                en: 'Local',
            }
        },
        SourceTzOffsetDateTimeTimezoneModeDescription_Local: {
            id: StringId.SourceTzOffsetDateTimeTimezoneModeDescription_Local, translations: {
                en: 'Display times according to your local timezone',
            }
        },
        SourceTzOffsetDateTimeTimezoneModeDisplay_Source: {
            id: StringId.SourceTzOffsetDateTimeTimezoneModeDisplay_Source, translations: {
                en: 'Source',
            }
        },
        SourceTzOffsetDateTimeTimezoneModeDescription_Source: {
            id: StringId.SourceTzOffsetDateTimeTimezoneModeDescription_Source, translations: {
                en: 'Display times according to the timezone of the source (normally the exchange\'s timezone)',
            }
        },
        ChartHistoryIntervalUnitDisplay_Trade: {
            id: StringId.ChartHistoryIntervalUnitDisplay_Trade, translations: {
                en: 'Trade',
            }
        },
        ChartHistoryIntervalUnitDisplay_Millisecond: {
            id: StringId.ChartHistoryIntervalUnitDisplay_Millisecond, translations: {
                en: 'Millisecond',
            }
        },
        ChartHistoryIntervalUnitDisplay_Day: {
            id: StringId.ChartHistoryIntervalUnitDisplay_Day, translations: {
                en: 'Day',
            }
        },
        ChartHistoryIntervalUnitDisplay_Week: {
            id: StringId.ChartHistoryIntervalUnitDisplay_Week, translations: {
                en: 'Week',
            }
        },
        ChartHistoryIntervalUnitDisplay_Month: {
            id: StringId.ChartHistoryIntervalUnitDisplay_Month, translations: {
                en: 'Month',
            }
        },
        ChartHistoryIntervalUnitDisplay_Year: {
            id: StringId.ChartHistoryIntervalUnitDisplay_Year, translations: {
                en: 'Year',
            }
        },
        ChartHistoryIntervalPresetDisplay_Trade: {
            id: StringId.ChartHistoryIntervalPresetDisplay_Trade, translations: {
                en: 'Trade',
            }
        },
        ChartHistoryIntervalPresetDisplay_OneSecond: {
            id: StringId.ChartHistoryIntervalPresetDisplay_OneSecond, translations: {
                en: 'OneSecond',
            }
        },
        ChartHistoryIntervalPresetDisplay_OneMinute: {
            id: StringId.ChartHistoryIntervalPresetDisplay_OneMinute, translations: {
                en: 'OneMinute',
            }
        },
        ChartHistoryIntervalPresetDisplay_FiveMinutes: {
            id: StringId.ChartHistoryIntervalPresetDisplay_FiveMinutes, translations: {
                en: 'FiveMinutes',
            }
        },
        ChartHistoryIntervalPresetDisplay_FifteenMinutes: {
            id: StringId.ChartHistoryIntervalPresetDisplay_FifteenMinutes, translations: {
                en: 'FifteenMinutes',
            }
        },
        ChartHistoryIntervalPresetDisplay_ThirtyMinutes: {
            id: StringId.ChartHistoryIntervalPresetDisplay_ThirtyMinutes, translations: {
                en: 'ThirtyMinutes',
            }
        },
        ChartHistoryIntervalPresetDisplay_Hourly: {
            id: StringId.ChartHistoryIntervalPresetDisplay_Hourly, translations: {
                en: 'Hourly',
            }
        },
        ChartHistoryIntervalPresetDisplay_Daily: {
            id: StringId.ChartHistoryIntervalPresetDisplay_Daily, translations: {
                en: 'Daily',
            }
        },
        ChartHistoryIntervalPresetDisplay_Weekly: {
            id: StringId.ChartHistoryIntervalPresetDisplay_Weekly, translations: {
                en: 'Weekly',
            }
        },
        ChartHistoryIntervalPresetDisplay_Monthly: {
            id: StringId.ChartHistoryIntervalPresetDisplay_Monthly, translations: {
                en: 'Monthly',
            }
        },
        ChartHistoryIntervalPresetDisplay_Quarterly: {
            id: StringId.ChartHistoryIntervalPresetDisplay_Quarterly, translations: {
                en: 'Quarterly',
            }
        },
        ChartHistoryIntervalPresetDisplay_Yearly: {
            id: StringId.ChartHistoryIntervalPresetDisplay_Yearly, translations: {
                en: 'Yearly',
            }
        },
        ChartHistoryIntervalPresetDisplay_Custom: {
            id: StringId.ChartHistoryIntervalPresetDisplay_Custom, translations: {
                en: 'Custom',
            }
        },
        ChartIntervalDisplay_OneMinute: {
            id: StringId.ChartIntervalDisplay_OneMinute, translations: {
                en: '1 Minute',
            }
        },
        ChartIntervalDisplay_FiveMinutes: {
            id: StringId.ChartIntervalDisplay_FiveMinutes, translations: {
                en: '5 Minutes',
            }
        },
        ChartIntervalDisplay_FifteenMinutes: {
            id: StringId.ChartIntervalDisplay_FifteenMinutes, translations: {
                en: '15 Minutes',
            }
        },
        ChartIntervalDisplay_ThirtyMinutes: {
            id: StringId.ChartIntervalDisplay_ThirtyMinutes, translations: {
                en: '30 Minutes',
            }
        },
        ChartIntervalDisplay_OneDay: {
            id: StringId.ChartIntervalDisplay_OneDay, translations: {
                en: '1 Day',
            }
        },
        LitIvemIdPriceVolumeSequenceHistoryResourceDisplay_ChartHistory: {
            id: StringId.LitIvemIdPriceVolumeSequenceHistoryResourceDisplay_ChartHistory, translations: {
                en: 'Chart history',
            }
        },
        LitIvemIdPriceVolumeSequenceHistoryResourceDisplay_Trades: {
            id: StringId.LitIvemIdPriceVolumeSequenceHistoryResourceDisplay_Trades, translations: {
                en: 'Trades',
            }
        },
        LitIvemIdPriceVolumeSequenceHistoryResourceDisplay_Security: {
            id: StringId.LitIvemIdPriceVolumeSequenceHistoryResourceDisplay_Security, translations: {
                en: 'Security',
            }
        },
        DayTradesDataItemRecordTypeIdDisplay_Trade: {
            id: StringId.DayTradesDataItemRecordTypeIdDisplay_Trade, translations: {
                en: 'Trade',
            }
        },
        DayTradesDataItemRecordTypeIdDisplay_Canceller: {
            id: StringId.DayTradesDataItemRecordTypeIdDisplay_Canceller, translations: {
                en: 'Canceller',
            }
        },
        DayTradesDataItemRecordTypeIdDisplay_Cancelled: {
            id: StringId.DayTradesDataItemRecordTypeIdDisplay_Cancelled, translations: {
                en: 'Cancelled',
            }
        },
        InternalCommandDisplay_Null: {
            id: StringId.InternalCommandDisplay_Null, translations: {
                en: '',
            }
        },
        InternalCommandDisplay_ChildMenu: {
            id: StringId.InternalCommandDisplay_ChildMenu, translations: {
                en: 'Child Menu',
            }
        },
        InternalCommandDisplay_MenuDivider: {
            id: StringId.InternalCommandDisplay_MenuDivider, translations: {
                en: 'Divider',
            }
        },
        DitemCommandDisplay_ToggleSecurityLinking: {
            id: StringId.DitemCommandDisplay_ToggleSecurityLinking, translations: {
                en: 'Toggle security linking',
            }
        },
        DitemCommandDisplay_SetSecurityLinking: {
            id: StringId.DitemCommandDisplay_SetSecurityLinking, translations: {
                en: 'Set security linking',
            }
        },
        DitemCommandDisplay_ToggleAccountLinking: {
            id: StringId.DitemCommandDisplay_ToggleAccountLinking, translations: {
                en: 'Toggle account linking',
            }
        },
        DitemCommandDisplay_SetAccountLinking: {
            id: StringId.DitemCommandDisplay_SetAccountLinking, translations: {
                en: 'Set account linking',
            }
        },
        MenuDisplay_Price: {
            id: StringId.MenuDisplay_Price, translations: {
                en: 'Price',
            }
        },
        MenuAccessKey_Price: {
            id: StringId.MenuAccessKey_Price, translations: {
                en: 'P',
            }
        },
        MenuDisplay_Trading: {
            id: StringId.MenuDisplay_Trading, translations: {
                en: 'Trading',
            }
        },
        MenuAccessKey_Trading: {
            id: StringId.MenuAccessKey_Trading, translations: {
                en: 'T',
            }
        },
        MenuDisplay_Commands: {
            id: StringId.MenuDisplay_Commands, translations: {
                en: 'Commands',
            }
        },
        MenuAccessKey_Commands: {
            id: StringId.MenuAccessKey_Commands, translations: {
                en: 'C',
            }
        },
        MenuDisplay_Tools: {
            id: StringId.MenuDisplay_Tools, translations: {
                en: 'Tools',
            }
        },
        MenuAccessKey_Tools: {
            id: StringId.MenuAccessKey_Tools, translations: {
                en: 'T',
            }
        },
        MenuDisplay_Help: {
            id: StringId.MenuDisplay_Help, translations: {
                en: 'Help',
            }
        },
        MenuAccessKey_Help: {
            id: StringId.MenuAccessKey_Help, translations: {
                en: 'H',
            }
        },
        DitemMenuDisplay_Placeholder: {
            id: StringId.DitemMenuDisplay_Placeholder, translations: {
                en: 'Placeholder',
            }
        },
        DitemMenuDisplay_Extensions: {
            id: StringId.DitemMenuDisplay_Extensions, translations: {
                en: 'Extensions',
            }
        },
        DitemMenuDisplay_Symbols: {
            id: StringId.DitemMenuDisplay_Symbols, translations: {
                en: 'Symbols',
            }
        },
        DitemMenuDisplay_DepthAndTrades: {
            id: StringId.DitemMenuDisplay_DepthAndTrades, translations: {
                en: 'Depth & Trades',
            }
        },
        DitemMenuDisplay_Watchlist: {
            id: StringId.DitemMenuDisplay_Watchlist, translations: {
                en: 'Watchlist',
            }
        },
        DitemMenuDisplay_Depth: {
            id: StringId.DitemMenuDisplay_Depth, translations: {
                en: 'Depth',
            }
        },
        DitemMenuDisplay_NewsHeadlines: {
            id: StringId.DitemMenuDisplay_NewsHeadlines, translations: {
                en: 'News Headlines',
            }
        },
        DitemMenuDisplay_NewsBody: {
            id: StringId.DitemMenuDisplay_NewsBody, translations: {
                en: 'News Body',
            }
        },
        DitemMenuDisplay_TopShareholders: {
            id: StringId.DitemMenuDisplay_TopShareholders, translations: {
                en: 'Top Shareholders',
            }
        },
        DitemMenuDisplay_Status: {
            id: StringId.DitemMenuDisplay_Status, translations: {
                en: 'Status',
            }
        },
        DitemMenuDisplay_Trades: {
            id: StringId.DitemMenuDisplay_Trades, translations: {
                en: 'Trades',
            }
        },
        DitemMenuDisplay_OrderRequest: {
            id: StringId.DitemMenuDisplay_OrderRequest, translations: {
                en: 'Order Request',
            }
        },
        DitemMenuDisplay_BrokerageAccounts: {
            id: StringId.DitemMenuDisplay_BrokerageAccounts, translations: {
                en: 'Brokerage Accounts',
            }
        },
        DitemMenuDisplay_Orders: {
            id: StringId.DitemMenuDisplay_Orders, translations: {
                en: 'Orders',
            }
        },
        DitemMenuDisplay_Holdings: {
            id: StringId.DitemMenuDisplay_Holdings, translations: {
                en: 'Holdings',
            }
        },
        DitemMenuDisplay_Balances: {
            id: StringId.DitemMenuDisplay_Balances, translations: {
                en: 'Balances',
            }
        },
        DitemMenuDisplay_Settings: {
            id: StringId.DitemMenuDisplay_Settings, translations: {
                en: 'Settings',
            }
        },
        DitemMenuDisplay_EtoPriceQuotation: {
            id: StringId.DitemMenuDisplay_EtoPriceQuotation, translations: {
                en: 'ETO Price',
            }
        },
        DitemMenuDisplay_OrderRequest_Buy: {
            id: StringId.DitemMenuDisplay_OrderRequest_Buy, translations: {
                en: 'New Buy Order',
            }
        },
        DitemMenuDisplay_OrderRequest_Sell: {
            id: StringId.DitemMenuDisplay_OrderRequest_Sell, translations: {
                en: 'New Sell Order',
            }
        },
        Desktop_SaveLayoutCaption: {
            id: StringId.Desktop_SaveLayoutCaption, translations: {
                en: 'Save Layout',
            }
        },
        Desktop_ResetLayoutCaption: {
            id: StringId.Desktop_ResetLayoutCaption, translations: {
                en: 'Reset Layout',
            }
        },
        Desktop_SignOutCaption: {
            id: StringId.Desktop_SignOutCaption, translations: {
                en: 'Sign Out',
            }
        },
        ZenithWebsocketCloseCodeId_NormalClosure: {
            id: StringId.ZenithWebsocketCloseCodeId_NormalClosure, translations: {
                en: 'Normal closure',
            }
        },
        ZenithWebsocketCloseCodeId_GoingAway: {
            id: StringId.ZenithWebsocketCloseCodeId_GoingAway, translations: {
                en: 'Going away',
            }
        },
        ZenithWebsocketCloseCodeId_ProtocolError: {
            id: StringId.ZenithWebsocketCloseCodeId_ProtocolError, translations: {
                en: 'Protocol error',
            }
        },
        ZenithWebsocketCloseCodeId_UnsupportedData: {
            id: StringId.ZenithWebsocketCloseCodeId_UnsupportedData, translations: {
                en: 'Unsupported data',
            }
        },
        ZenithWebsocketCloseCodeId_NoStatusReceived: {
            id: StringId.ZenithWebsocketCloseCodeId_NoStatusReceived, translations: {
                en: 'No status received',
            }
        },
        ZenithWebsocketCloseCodeId_AbnormalClosure: {
            id: StringId.ZenithWebsocketCloseCodeId_AbnormalClosure, translations: {
                en: 'Abnormal closure',
            }
        },
        ZenithWebsocketCloseCodeId_InvalidFramePayloadData: {
            id: StringId.ZenithWebsocketCloseCodeId_InvalidFramePayloadData, translations: {
                en: 'Invalid frame payload data',
            }
        },
        ZenithWebsocketCloseCodeId_PolicyViolation: {
            id: StringId.ZenithWebsocketCloseCodeId_PolicyViolation, translations: {
                en: 'Policy violation (ping failure)',
            }
        },
        ZenithWebsocketCloseCodeId_MessageTooBig: {
            id: StringId.ZenithWebsocketCloseCodeId_MessageTooBig, translations: {
                en: 'Message too big',
            }
        },
        ZenithWebsocketCloseCodeId_MissingExtension: {
            id: StringId.ZenithWebsocketCloseCodeId_MissingExtension, translations: {
                en: 'Missing extension',
            }
        },
        ZenithWebsocketCloseCodeId_ServerError: {
            id: StringId.ZenithWebsocketCloseCodeId_ServerError, translations: {
                en: 'Server error',
            }
        },
        ZenithWebsocketCloseCodeId_ServerRestart: {
            id: StringId.ZenithWebsocketCloseCodeId_ServerRestart, translations: {
                en: 'Server restart',
            }
        },
        ZenithWebsocketCloseCodeId_TryAgainLater: {
            id: StringId.ZenithWebsocketCloseCodeId_TryAgainLater, translations: {
                en: 'Try again later',
            }
        },
        ZenithWebsocketCloseCodeId_BadGateway: {
            id: StringId.ZenithWebsocketCloseCodeId_BadGateway, translations: {
                en: 'Bad gateway',
            }
        },
        ZenithWebsocketCloseCodeId_TlsHandshake: {
            id: StringId.ZenithWebsocketCloseCodeId_TlsHandshake, translations: {
                en: 'TLS Handshake',
            }
        },
        ZenithWebsocketCloseCodeId_Session: {
            id: StringId.ZenithWebsocketCloseCodeId_Session, translations: {
                en: 'Session (Logged in elsewhere)',
            }
        },
        NotCurrentVersion_NotRunningCurrentVersion: {
            id: StringId.NotCurrentVersion_NotRunningCurrentVersion, translations: {
                en: 'You are not running the current version of Motif',
            }
        },
        NotCurrentVersion_CurrentCaption: {
            id: StringId.NotCurrentVersion_CurrentCaption, translations: {
                en: 'Current',
            }
        },
        NotCurrentVersion_RunningCaption: {
            id: StringId.NotCurrentVersion_RunningCaption, translations: {
                en: 'Running',
            }
        },
        NotCurrentVersion_ClickButtonToAttemptLoadCurrentText: {
            id: StringId.NotCurrentVersion_ClickButtonToAttemptLoadCurrentText, translations: {
                en: 'Click this button to try to load the latest version',
            }
        },
        NotCurrentVersion_ReloadAppCaption: {
            id: StringId.NotCurrentVersion_ReloadAppCaption, translations: {
                en: 'Reload App',
            }
        },
        NotCurrentVersion_MoreInfo: {
            id: StringId.NotCurrentVersion_MoreInfo, translations: {
                en: 'For more information see ???',
            }
        },
        Extensions_ExtensionNotInstalledOrEnabled: {
            id: StringId.Extensions_ExtensionNotInstalledOrEnabled, translations: {
                en: 'Extension not installed or enabled',
            }
        },
        Extensions_LocalDesktopNotLoaded: {
            id: StringId.Extensions_LocalDesktopNotLoaded, translations: {
                en: 'Extension local desktop not loaded',
            }
        },
        Extensions_ExtensionDidNotCreateComponent: {
            id: StringId.Extensions_ExtensionDidNotCreateComponent, translations: {
                en: 'Extension did not create component',
            }
        },
        Extensions_DownloadTimeout: {
            id: StringId.Extensions_DownloadTimeout, translations: {
                en: 'Download timeout',
            }
        },
        Extensions_ExtensionInstallCaption: {
            id: StringId.Extensions_ExtensionInstallCaption, translations: {
                en: 'Install',
            }
        },
        Extensions_ExtensionUninstallCaption: {
            id: StringId.Extensions_ExtensionUninstallCaption, translations: {
                en: 'Uninstall',
            }
        },
        Extensions_ExtensionEnableCaption: {
            id: StringId.Extensions_ExtensionEnableCaption, translations: {
                en: 'Enable',
            }
        },
        Extensions_ExtensionDisableCaption: {
            id: StringId.Extensions_ExtensionDisableCaption, translations: {
                en: 'Disable',
            }
        },
        Extensions_AvailableExtensionsHeadingCaption: {
            id: StringId.Extensions_AvailableExtensionsHeadingCaption, translations: {
                en: 'AVAILABLE'
            }
        },
        Extensions_InstalledExtensionsHeadingCaption: {
            id: StringId.Extensions_InstalledExtensionsHeadingCaption, translations: {
                en: 'INSTALLED'
            }
        },
        PlaceholderDitem_ComponentStateNotSpecified: {
            id: StringId.PlaceholderDitem_ComponentStateNotSpecified, translations: {
                en: 'Component state not specified',
            }
        },
        PlaceholderDitem_ComponentStateIsInvalid: {
            id: StringId.PlaceholderDitem_ComponentStateIsInvalid, translations: {
                en: 'Component state is invalid',
            }
        },
        PlaceholderDitem_ComponentIsNotAvailable: {
            id: StringId.PlaceholderDitem_ComponentIsNotAvailable, translations: {
                en: 'Component is not available',
            }
        },
        PlaceholderDitem_PlaceheldExtensionPublisherCaption: {
            id: StringId.PlaceholderDitem_PlaceheldExtensionPublisherCaption, translations: {
                en: 'Publisher',
            }
        },
        PlaceholderDitem_PlaceheldExtensionNameCaption: {
            id: StringId.PlaceholderDitem_PlaceheldExtensionNameCaption, translations: {
                en: 'Extension',
            }
        },
        PlaceholderDitem_PlaceheldConstructionMethodCaption: {
            id: StringId.PlaceholderDitem_PlaceheldConstructionMethodCaption, translations: {
                en: 'Construction',
            }
        },
        PlaceholderDitem_PlaceheldComponentTypeNameCaption: {
            id: StringId.PlaceholderDitem_PlaceheldComponentTypeNameCaption, translations: {
                en: 'Component Type',
            }
        },
        PlaceholderDitem_PlaceheldComponentStateCaption: {
            id: StringId.PlaceholderDitem_PlaceheldComponentStateCaption, translations: {
                en: 'Component State',
            }
        },
        PlaceholderDitem_PlaceheldReasonCaption: {
            id: StringId.PlaceholderDitem_PlaceheldReasonCaption, translations: {
                en: 'Reason',
            }
        },
        PlaceholderDitem_InvalidCaption: {
            id: StringId.PlaceholderDitem_InvalidCaption, translations: {
                en: 'Invalid',
            }
        },
        ExtensionPublisherTypeId_Display_Invalid: {
            id: StringId.ExtensionPublisherTypeId_Display_Invalid, translations: {
                en: 'Invalid',
            }
        },
        ExtensionPublisherTypeId_Abbreviation_Invalid: {
            id: StringId.ExtensionPublisherTypeId_Abbreviation_Invalid, translations: {
                en: 'I',
            }
        },
        ExtensionPublisherTypeId_Display_Builtin: {
            id: StringId.ExtensionPublisherTypeId_Display_Builtin, translations: {
                en: 'Builtin',
            }
        },
        ExtensionPublisherTypeId_Abbreviation_Builtin: {
            id: StringId.ExtensionPublisherTypeId_Abbreviation_Builtin, translations: {
                en: 'B',
            }
        },
        ExtensionPublisherTypeId_Display_User: {
            id: StringId.ExtensionPublisherTypeId_Display_User, translations: {
                en: 'User',
            }
        },
        ExtensionPublisherTypeId_Abbreviation_User: {
            id: StringId.ExtensionPublisherTypeId_Abbreviation_User, translations: {
                en: 'U',
            }
        },
        ExtensionPublisherTypeId_Display_Organisation: {
            id: StringId.ExtensionPublisherTypeId_Display_Organisation, translations: {
                en: 'Organisation',
            }
        },
        ExtensionPublisherTypeId_Abbreviation_Organisation: {
            id: StringId.ExtensionPublisherTypeId_Abbreviation_Organisation, translations: {
                en: 'O',
            }
        },
        ExtensionId_PersistableIsNotSpecified: {
            id: StringId.ExtensionId_PersistableIsNotSpecified, translations: {
                en: 'Persistence is not specified',
            }
        },
        ExtensionId_PublisherTypeIsNotSpecified: {
            id: StringId.ExtensionId_PublisherTypeIsNotSpecified, translations: {
                en: 'Publisher type is not specified',
            }
        },
        ExtensionId_PublisherTypeIsInvalid: {
            id: StringId.ExtensionId_PublisherTypeIsInvalid, translations: {
                en: 'Publisher type is invalid',
            }
        },
        ExtensionId_PublisherIsNotSpecified: {
            id: StringId.ExtensionId_PublisherIsNotSpecified, translations: {
                en: 'Publisher is not specified',
            }
        },
        ExtensionId_PublisherIsInvalid: {
            id: StringId.ExtensionId_PublisherIsInvalid, translations: {
                en: 'Publisher is invalid',
            }
        },
        ExtensionId_ExtensionNameIsNotSpecified: {
            id: StringId.ExtensionId_ExtensionNameIsNotSpecified, translations: {
                en: 'Extension name is not specified',
            }
        },
        ExtensionId_ExtensionNameIsInvalid: {
            id: StringId.ExtensionId_ExtensionNameIsInvalid, translations: {
                en: 'Extension name is invalid',
            }
        },
        DitemComponent_PersistableIsNotSpecified: {
            id: StringId.DitemComponent_PersistableIsNotSpecified, translations: {
                en: 'Persistence is not specified',
            }
        },
        DitemComponent_ConstructionMethodIsNotSpecified: {
            id: StringId.DitemComponent_ConstructionMethodIsNotSpecified, translations: {
                en: 'Construction method is not specified',
            }
        },
        DitemComponent_ConstructionMethodIsInvalid: {
            id: StringId.DitemComponent_ConstructionMethodIsInvalid, translations: {
                en: 'Construction method is invalid',
            }
        },
        DitemComponent_ComponentTypeIsNotSpecified: {
            id: StringId.DitemComponent_ComponentTypeIsNotSpecified, translations: {
                en: 'Component type is not specified',
            }
        },
        DitemComponent_ComponentTypeIsInvalid: {
            id: StringId.DitemComponent_ComponentTypeIsInvalid, translations: {
                en: 'Component type is invalid',
            }
        },
        ExtensionInfo_VersionIsNotSpecified: {
            id: StringId.ExtensionInfo_VersionIsNotSpecified, translations: {
                en: 'Version is not specified',
            }
        },
        ExtensionInfo_VersionIsInvalid: {
            id: StringId.ExtensionInfo_VersionIsInvalid, translations: {
                en: 'Version is invalid',
            }
        },
        ExtensionInfo_ApiVersionIsNotSpecified: {
            id: StringId.ExtensionInfo_ApiVersionIsNotSpecified, translations: {
                en: 'ApiVersion is not specified',
            }
        },
        ExtensionInfo_ApiVersionIsInvalid: {
            id: StringId.ExtensionInfo_ApiVersionIsInvalid, translations: {
                en: 'ApiVersion is invalid',
            }
        },
        ExtensionInfo_ShortDescriptionIsNotSpecified: {
            id: StringId.ExtensionInfo_ShortDescriptionIsNotSpecified, translations: {
                en: 'ShortDescription is not specified',
            }
        },
        ExtensionInfo_ShortDescriptionIsInvalid: {
            id: StringId.ExtensionInfo_ShortDescriptionIsInvalid, translations: {
                en: 'Short description is invalid',
            }
        },
        ExtensionInfo_LongDescriptionIsNotSpecified: {
            id: StringId.ExtensionInfo_LongDescriptionIsNotSpecified, translations: {
                en: 'Long description is not specified',
            }
        },
        ExtensionInfo_LongDescriptionIsInvalid: {
            id: StringId.ExtensionInfo_LongDescriptionIsInvalid, translations: {
                en: 'Long description is invalid',
            }
        },
        ExtensionInfo_UrlPathIsNotSpecified: {
            id: StringId.ExtensionInfo_UrlPathIsNotSpecified, translations: {
                en: 'UrlPath is not specified',
            }
        },
        ExtensionInfo_UrlPathIsInvalid: {
            id: StringId.ExtensionInfo_UrlPathIsInvalid, translations: {
                en: 'UrlPath is invalid',
            }
        },

    } as const;

    /* eslint-enable max-len */


    const recs: readonly Rec[] = Object.values(recsObject);
    export const recCount = recs.length;

    const isCookieAvailable = (typeof document) !== 'undefined';
    const cookieName = 'i18n-language';
    let currentlanguageId: LanguageId;
    let currentLanguage: string;

    export function initialiseStatic(preferredLanguage?: string) {
        const outOfOrderIdx = recs.findIndex((rec: Rec, index: number) => rec.id !== index);
        if (outOfOrderIdx >= 0) {
            // do not use EnumInfoOutOfOrderError as causes circular error
            const errorName = recs[StringId.EnumInfoOutOfOrderInternalError].translations.en;
            throw new Error(`${errorName}: StringId: ${outOfOrderIdx}, ${recs[outOfOrderIdx].translations.en}`);
        }
        // get the current language from cookie, browser locale
        const langCode = preferredLanguage || getCookie(cookieName) || getBrowserLanguage();
        const langId = findBestLanguageId(langCode);
        setLanguage(langId);
    }
    function getlanguage() {
        return currentLanguage;
    }

    function setLanguage(langId: LanguageId) {
        currentlanguageId = langId;
        currentLanguage = Languages[langId].code;
        setCookie(cookieName, currentLanguage);
        prepareStrings(langId);
    }

    function setCookie(name: string, value: string, expires?: Date, path?: string) {
        if (!isCookieAvailable) {
            return;
        }
        const expiration = expires ? '; expires=' + expires.toUTCString() : '';
        let cookieStr = `${name}=${value}${expiration}`;
        if (path) {
            cookieStr += ';path=' + path;
        }
        document.cookie = cookieStr;
    }

    function getCookie(name: string): string | null {
        if (!isCookieAvailable) {
            return null;
        }
        const cookie = document.cookie
            .split(';')
            .map(cookieStr => cookieStr.trim())
            .find(cookieStr => cookieStr.startsWith(name + '='));

        return cookie ? cookie.replace(name + '=', '') : null;
    }

    function getBrowserLanguage(): string {
        return navigator.language; // || (navigator as any).userLanguage; // fallback for IE
    }

    function findBestLanguageId(language: string): LanguageId {
        let idx = Languages.findIndex((lang: Language) => lang.code === language);
        if (idx >= 0) {
            return Languages[idx].id;
        } else {
            const langPrefix = language.split('-')[0];
            idx = Languages.findIndex((lang: Language) => lang.code === langPrefix);
            if (idx >= 0) {
                return Languages[idx].id;
            } else {
                return DefaultLanguageId;
            }
        }
    }

    function prepareStrings(langId: LanguageId) {
        for (let i = 0; i < recs.length; i++) {
            Strings[i] = calculateString(i, langId);
        }
    }

    function calculateString(idx: number, langId: LanguageId): string {
        switch (langId) {
            case LanguageId.English: return recs[idx].translations.en;
            default: return '?';
        }
    }

    export function getStringPlusEnglish(id: StringId) {
        if (currentlanguageId === LanguageId.English) {
            return Strings[id];
        } else {
            return Strings[id] + '[ ' + calculateString(id, LanguageId.English) + ']';
        }
    }
}

export const Strings: string[] = new Array<string>(I18nStrings.recCount);
