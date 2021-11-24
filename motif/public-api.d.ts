/** @public */
export declare interface AccumulationIntervalHistorySequenceSeries extends IntervalHistorySequenceSeries, NumberHistorySequenceSeriesInterface {
}

/** @public */
export declare namespace AccumulationIntervalHistorySequenceSeries {
    export interface Point extends IntervalHistorySequenceSeries.Point {
        value: number;
    }
}

/** @public */
export declare interface AllBrokerageAccountGroup extends BrokerageAccountGroup {
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare interface ApiError extends Error {
    readonly code: ApiError.Code;
}

/** @public */
export declare namespace ApiError {
    export const enum CodeEnum {
        ZeroLengthMenuName = "ZeroLengthMenuName",
        CommandNotRegistered = "CommandNotRegistered",
        DestroyCommandMenuItemNotExist = "DestroyCommandMenuItemNotExist",
        DestroyChildMenuItemNotExist = "DestroyChildMenuItemNotExist",
        InvalidCorrectness = "InvalidCorrectness",
        InvalidBadness = "InvalidBadness",
        InvalidFeedClass = "InvalidFeedClass",
        InvalidFeedId = "InvalidFeedId",
        InvalidMarketId = "InvalidMarketId",
        InvalidExchangeId = "InvalidExchangeId",
        InvalidExchangeEnvironmentId = "InvalidExchangeEnvironmentId",
        InvalidOrderSide = "InvalidOrderSide",
        InvalidOrderTimeInForce = "InvalidOrderTimeInForce",
        InvalidOrderType = "InvalidOrderType",
        InvalidOrderRouteAlgorithm = "InvalidOrderRouteAlgorithm",
        InvalidUiActionState = "InvalidUiActionState",
        InvalidUiActionCommitType = "InvalidUiActionCommitType",
        InvalidUiActionAutoAcceptanceType = "InvalidUiActionAutoAcceptanceType",
        InvalidBuiltinIconButtonUiActionIconId = "InvalidBuiltinIconButtonUiActionIconId",
        InvalidBrokerageAccountGroupType = "InvalidBrokerageAccountGroupType",
        InvalidDesktopPreferredLocation = "InvalidDesktopPreferredLocation",
        InvalidPublisherType = "InvalidPublisherType",
        InvalidSourceTzOffsetDateTimeApiTimezoneMode = "InvalidSourceTzOffsetDateTimeApiTimezoneMode",
        InvalidLitIvemIdPriceVolumeSequenceHistorySeriesTypeId = "InvalidLitIvemIdPriceVolumeSequenceHistorySeriesTypeId",
        InvalidHistorySequencerUnit = "InvalidHistorySequencerUnit",
        InvalidSequencerHistory = "InvalidSequencerHistory",
        EventSubscriptionNotFound = "EventSubscriptionNotFound",
        RoutedIvemIdCreateError_InvalidParameterTypes = "RoutedIvemIdCreateError_InvalidParameterTypes",
        GetFrameEventerIsUndefined = "GetFrameEventerIsUndefined",
        UnknownControl = "UnknownControl",
        UnknownContentComponent = "UnknownContentComponent"
    }
    export type Code = keyof typeof CodeEnum;
}

/** @public */
export declare interface ApiErrorSvc {
    createError(code: ApiError.Code, message?: string): ApiError;
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare interface Badness {
    readonly reason: Badness.Reason;
    readonly reasonExtra: string;
}

/** @public */
export declare namespace Badness {
    export const enum ReasonEnum {
        NotBad = "NotBad",
        Inactive = "Inactive",
        Custom_Usable = "Custom_Usable",
        Custom_Suspect = "Custom_Suspect",
        Custom_Error = "Custom_Error",
        PublisherSubscriptionError_Internal_Error = "PublisherSubscriptionError_Internal_Error",
        PublisherSubscriptionError_Offlined_Suspect = "PublisherSubscriptionError_Offlined_Suspect",
        PublisherSubscriptionError_Offlined_Error = "PublisherSubscriptionError_Offlined_Error",
        PublisherSubscriptionError_RequestTimeout_Suspect = "PublisherSubscriptionError_RequestTimeout_Suspect",
        PublisherSubscriptionError_RequestTimeout_Error = "PublisherSubscriptionError_RequestTimeout_Error",
        PublisherSubscriptionError_UserNotAuthorised_Error = "PublisherSubscriptionError_UserNotAuthorised_Error",
        PublisherSubscriptionError_PublishRequestError_Suspect = "PublisherSubscriptionError_PublishRequestError_Suspect",
        PublisherSubscriptionError_PublishRequestError_Error = "PublisherSubscriptionError_PublishRequestError_Error",
        PublisherSubscriptionError_SubRequestError_Suspect = "PublisherSubscriptionError_SubRequestError_Suspect",
        PublisherSubscriptionError_SubRequestError_Error = "PublisherSubscriptionError_SubRequestError_Error",
        PublisherSubscriptionError_DataError_Suspect = "PublisherSubscriptionError_DataError_Suspect",
        PublisherSubscriptionError_DataError_Error = "PublisherSubscriptionError_DataError_Error",
        PublisherServerWarning = "PublisherServerWarning",
        PublisherServerError = "PublisherServerError",
        PublisherSubscriptionState_NeverSubscribed = "PublisherSubscriptionState_NeverSubscribed",
        PublisherSubscriptionState_PublisherOnlineWaiting = "PublisherSubscriptionState_PublisherOnlineWaiting",
        PublisherSubscriptionState_PublisherOfflining = "PublisherSubscriptionState_PublisherOfflining",
        PublisherSubscriptionState_ResponseWaiting = "PublisherSubscriptionState_ResponseWaiting",
        PublisherSubscriptionState_SynchronisationWaiting = "PublisherSubscriptionState_SynchronisationWaiting",
        PublisherSubscriptionState_Synchronised = "PublisherSubscriptionState_Synchronised",
        PublisherSubscriptionState_UnsubscribedSynchronised = "PublisherSubscriptionState_UnsubscribedSynchronised",
        PublisherSubscriptionState_Unexpected = "PublisherSubscriptionState_Unexpected",
        PreUsable_Clear = "PreUsable_Clear",
        PreUsable_Add = "PreUsable_Add",
        ConnectionOffline = "ConnectionOffline",
        FeedsWaiting = "FeedsWaiting",
        FeedsError = "FeedsError",
        FeedWaiting = "FeedWaiting",
        FeedError = "FeedError",
        FeedNotAvailable = "FeedNotAvailable",
        NoAuthorityFeed = "NoAuthorityFeed",
        MarketsWaiting = "MarketsWaiting",
        MarketsError = "MarketsError",
        MarketWaiting = "MarketWaiting",
        MarketError = "MarketError",
        MarketNotAvailable = "MarketNotAvailable",
        BrokerageAccountsWaiting = "BrokerageAccountsWaiting",
        BrokerageAccountsError = "BrokerageAccountsError",
        BrokerageAccountWaiting = "BrokerageAccountWaiting",
        BrokerageAccountError = "BrokerageAccountError",
        BrokerageAccountNotAvailable = "BrokerageAccountNotAvailable",
        OrderStatusesError = "OrderStatusesError",
        FeedStatus_Unknown = "FeedStatus_Unknown",
        FeedStatus_Initialising = "FeedStatus_Initialising",
        FeedStatus_Impaired = "FeedStatus_Impaired",
        FeedStatus_Expired = "FeedStatus_Expired",
        Reading = "Reading",
        SymbolMatching_None = "SymbolMatching_None",
        SymbolMatching_Ambiguous = "SymbolMatching_Ambiguous",
        SymbolOkWaitingForData = "SymbolOkWaitingForData",
        DataRetrieving = "DataRetrieving",
        MarketTradingStatesRetrieving = "MarketTradingStatesRetrieving",
        OrderStatusesFetching = "OrderStatusesFetching",
        BrokerageAccountDataListsIncubating = "BrokerageAccountDataListsIncubating",
        OneOrMoreAccountsInError = "OneOrMoreAccountsInError",
        ResourceWarnings = "ResourceWarnings",
        ResourceErrors = "ResourceErrors",
        StatusWarnings = "StatusWarnings",
        StatusRetrieving = "StatusRetrieving",
        StatusErrors = "StatusErrors"
    }
    export type Reason = keyof typeof ReasonEnum;
}

/** @public */
export declare interface BadnessSvc {
    create(reason: Badness.Reason, reasonExtra: string): Badness;
    createCopy(badness: Badness): Badness;
    createNotBad(): Badness;
    createInactive(): Badness;
    createCustomUsable(text: string): Badness;
    createCustomSuspect(text: string): Badness;
    createCustomError(text: string): Badness;
    getCorrectness(badness: Badness): Correctness;
    isGood(badness: Badness): boolean;
    isUsable(badness: Badness): boolean;
    isUnusable(badness: Badness): boolean;
    isSuspect(badness: Badness): boolean;
    isError(badness: Badness): boolean;
    isEqual(left: Badness, right: Badness): boolean;
    generateText(badness: Badness): string;
    reasonToDisplay(reason: Badness.Reason): string;
}

/** @public */
export declare interface BooleanUiAction extends UiAction {
    readonly value: boolean | undefined;
    readonly definedValue: boolean;
    pushValue(value: boolean | undefined): void;
}

/** @public */
export declare interface BrokerageAccount {
    readonly id: BrokerageAccount.Id;
    readonly upperId: string;
    readonly name: string;
    readonly upperName: string;
    readonly tradingFeed: Feed;
    readonly currencyId: CurrencyId;
}

/** @public */
export declare namespace BrokerageAccount {
    export type Id = BrokerageAccountId;
}

/** @public */
export declare interface BrokerageAccountGroup {
    readonly type: BrokerageAccountGroup.Type;
    readonly id: BrokerageAccountGroup.Id;
    isSingle(): boolean;
    isAll(): boolean;
    isEqualTo(other: BrokerageAccountGroup): boolean;
    compareTo(other: BrokerageAccountGroup): ComparisonResult;
}

/** @public */
export declare namespace BrokerageAccountGroup {
    export type Id = string;
    export const enum TypeEnum {
        Single = "Single",
        All = "All"
    }
    export type Type = keyof typeof TypeEnum;
}

/** @public */
export declare interface BrokerageAccountGroupSelect extends BrokerageAccountGroupUiAction, ControlComponent {
}

/** @public */
export declare interface BrokerageAccountGroupSvc {
    createAll(): AllBrokerageAccountGroup;
    createSingle(accountId: BrokerageAccountId): SingleBrokerageAccountGroup;
    isSingle(group: BrokerageAccountGroup): group is SingleBrokerageAccountGroup;
    isEqual(left: BrokerageAccountGroup, right: BrokerageAccountGroup): boolean;
    isUndefinableEqual(left: BrokerageAccountGroup | undefined, right: BrokerageAccountGroup | undefined): boolean;
    compare(left: BrokerageAccountGroup, right: BrokerageAccountGroup): ComparisonResult;
    compareUndefinable(left: BrokerageAccountGroup | undefined, right: BrokerageAccountGroup | undefined): ComparisonResult;
}

/** @public */
export declare interface BrokerageAccountGroupUiAction extends UiAction {
    readonly value: BrokerageAccountGroup | undefined;
    readonly definedValue: BrokerageAccountGroup;
    readonly options: BrokerageAccountGroupUiAction.Options;
    pushValue(value: BrokerageAccountGroup | undefined): void;
    pushOptions(options: BrokerageAccountGroupUiAction.Options): void;
}

/** @public */
export declare namespace BrokerageAccountGroupUiAction {
    export interface Options {
        allAllowed: boolean;
    }
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare type BrokerageAccountId = string;

/** @public */
export declare interface BuiltinIconButton extends BuiltinIconButtonUiAction, ControlComponent {
}

/** @public */
export declare interface BuiltinIconButtonUiAction extends ButtonUiAction {
    readonly iconId: BuiltinIconButtonUiAction.IconId;
    pushIcon(iconId: BuiltinIconButtonUiAction.IconId): void;
}

/** @public */
export declare namespace BuiltinIconButtonUiAction {
    export const enum IconIdEnum {
        Blankest = "Blankest",
        PrimaryDitemFrame = "PrimaryDitemFrame",
        SymbolLink = "SymbolLink",
        AccountGroupLink = "AccountGroupLink",
        SubWindowReturn = "SubWindowReturn",
        CopyToClipboard = "CopyToClipboard",
        Execute = "Execute",
        BuyOrderPad = "BuyOrderPad",
        SellOrderPad = "SellOrderPad",
        AmendOrderPad = "AmendOrderPad",
        CancelOrderPad = "CancelOrderPad",
        MoveOrderPad = "MoveOrderPad",
        SelectColumns = "SelectColumns",
        AutoSizeColumnWidths = "AutoSizeColumnWidths",
        RollUp = "RollUp",
        RollDown = "RollDown",
        Filter = "Filter",
        Save = "Save",
        DeleteSymbol = "DeleteSymbol",
        NewWatchlist = "NewWatchlist",
        OpenWatchlist = "OpenWatchlist",
        SaveWatchlist = "SaveWatchlist",
        Lighten = "Lighten",
        Darken = "Darken",
        Brighten = "Brighten",
        Complement = "Complement",
        Saturate = "Saturate",
        Desaturate = "Desaturate",
        SpinColor = "SpinColor",
        CopyColor = "CopyColor",
        ReturnOk = "ReturnOk",
        ReturnCancel = "ReturnCancel",
        SearchNext = "SearchNext",
        CancelSearch = "CancelSearch",
        MoveUp = "MoveUp",
        MoveToTop = "MoveToTop",
        MoveDown = "MoveDown",
        MoveToBottom = "MoveToBottom",
        NotHistorical = "NotHistorical",
        Historical = "Historical",
        HistoricalCompare = "HistoricalCompare",
        Details = "Details",
        ToggleSearchTermNotExchangedMarketProcessed = "ToggleSearchTermNotExchangedMarketProcessed"
    }
    export type IconId = keyof typeof IconIdEnum;
}

/** @public */
export declare interface Button extends ButtonUiAction, ControlComponent {
}

/** @public */
export declare interface ButtonUiAction extends CommandUiAction {
    pushUnselected(): void;
    pushSelected(): void;
}

/** @public */
export declare interface CaptionedCheckbox extends BooleanUiAction, ControlComponent {
}

/** @public */
export declare interface Checkbox extends BooleanUiAction, ControlComponent {
}

/** @public */
export declare interface ChildMenuItem {
    readonly childMenuName: MenuBar.MenuName;
    readonly defaultPosition: MenuBar.MenuItemPosition;
}

/** @public */
export declare interface CloseIntervalHistorySequenceSeries extends IntervalHistorySequenceSeries, NumberHistorySequenceSeriesInterface {
}

/** @public */
export declare namespace CloseIntervalHistorySequenceSeries {
    export interface Point extends IntervalHistorySequenceSeries.Point {
        closeDateTime: Date;
        closeDateTimeRepeatCount: Integer;
        value: number;
    }
}

/** @public */
export declare interface Command {
    readonly name: string;
    readonly defaultDisplayId: StringId;
    readonly defaultMenuBarItemPosition?: Command.MenuBarItemPosition;
}

/** @public */
export declare namespace Command {
    export type MenuBarMenuName = string;
    export type MenuBarMenuPath = readonly MenuBarMenuName[];
    export interface MenuBarItemPosition {
        readonly menuPath: MenuBarMenuPath;
        readonly rank: number;
    }
}

/** @public */
export declare interface CommandMenuItem extends CommandUiAction {
    readonly defaultPosition: MenuBar.MenuItemPosition;
}

/** @public */
export declare interface CommandSvc {
    getCommand(name: string): Command | undefined;
    getOrRegisterCommand(name: string, defaultDisplayId: StringId, menuBarItemPosition?: Command.MenuBarItemPosition): Command;
}

/** @public */
export declare interface CommandUiAction extends BooleanUiAction {
    readonly command: Command;
    readonly accessKey: string;
    readonly accessibleCaption: CommandUiAction.AccessibleCaption;
    pushAccessKey(accessKey: string): void;
}

/** @public */
export declare namespace CommandUiAction {
    export interface AccessibleCaption {
        readonly preAccessKey: string;
        readonly accessKey: string;
        readonly postAccessKey: string;
    }
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare interface CommaTextSvc {
    readonly delimiterChar: string;
    readonly quoteChar: string;
    readonly pairQuoteChar: string;
    from2Values(value1: string, value2: string): string;
    from3Values(value1: string, value2: string, value3: string): string;
    from4Values(value1: string, value2: string, value3: string, value4: string): string;
    fromStringArray(value: readonly string[]): string;
    fromIntegerArray(value: number[]): string;
    toStringArray(value: string): string[];
    toStringArrayWithResult(value: string, strict?: boolean): CommaTextSvc.ToStringArrayResult;
    toIntegerArrayWithResult(value: string): CommaTextSvc.ToIntegerArrayResult;
    strictValidate(value: string): CommaTextSvc.StrictValidateResult;
}

/** @public */
export declare namespace CommaTextSvc {
    export interface ToStringArrayResult {
        success: boolean;
        array: string[];
        errorText: string;
    }
    export interface ToIntegerArrayResult {
        success: boolean;
        array: number[];
        errorText: string;
    }
    export interface StrictValidateResult {
        success: boolean;
        errorText: string;
    }
}

/** @public */
export declare interface ComparableList<T> {
    capacityIncSize: Integer | undefined;
    readonly items: readonly T[];
    capacity: Integer;
    count: Integer;
    readonly lastIndex: Integer;
    getItem(index: Integer): T;
    setItem(index: Integer, value: T): void;
    toArray(): T[];
    add(value: T): Integer;
    addRange(values: T[]): void;
    addItemsRange(values: T[], subRangeStartIndex: Integer, subRangeCount: Integer): void;
    insert(index: Integer, value: T): void;
    insertRange(index: Integer, values: T[]): void;
    remove(value: T): void;
    removeAtIndex(index: Integer): void;
    removeRange(index: Integer, deleteCount: Integer): void;
    clear(): void;
    replace(index: Integer, value: T): void;
    extract(value: T): T;
    pack(unusedValue: T, beforeDeleteRangeCallBackFtn?: ComparableList.BeforeDeleteRangeCallBack): void;
    exchange(index1: Integer, index2: Integer): void;
    move(curIndex: Integer, newIndex: Integer): void;
    first(): T;
    last(): T;
    setMinimumCapacity(value: Integer): void;
    expand(): void;
    trimExcess(): void;
    contains(value: T): boolean;
    indexOf(value: T): Integer;
    compareItems(left: T, right: T): ComparisonResult;
    sort(compareCallback?: ComparableList.CompareCallback<T>): void;
    binarySearch(item: T, compareCallback?: ComparableList.CompareCallback<T>): ComparableList.BinarySearchResult;
}

/** @public */
export declare namespace ComparableList {
    export interface BinarySearchResult {
        found: boolean;
        index: Integer;
    }
    export type CompareCallback<T> = (this: void, left: T, right: T) => ComparisonResult;
    export type BeforeDeleteRangeCallBack = (this: void, index: Integer, count: Integer) => void;
}

/** @public */
export declare const enum ComparisonResult {
    LeftLessThanRight = -1,
    LeftEqualsRight = 0,
    LeftGreaterThanRight = 1
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare interface Component {
    readonly rootHtmlElement: HTMLElement;
}

/** @public */
export declare interface ContentComponent extends Component {
}

/** @public */
export declare interface ContentSvc {
    readonly components: readonly ContentComponent[];
    destroyAllComponents(): void;
    destroyComponent(component: Component): void;
    createDelayedBadnessComponent(): DelayedBadnessComponent;
}

/** @public */
export declare interface ControlComponent extends Component {
}

/** @public */
export declare interface ControlsSvc {
    readonly controls: readonly ControlComponent[];
    readonly uiActions: readonly UiAction[];
    destroyAllControls(): void;
    destroyControl(control: UiAction | ControlComponent): void;
    createButton(command: Command): Promise<Button>;
    createBuiltinIconButton(command: Command): Promise<BuiltinIconButton>;
    createCaptionedCheckbox(valueRequired?: boolean): Promise<CaptionedCheckbox>;
    createCheckbox(valueRequired?: boolean): Promise<Checkbox>;
    createIntegerInput(valueRequired?: boolean): Promise<IntegerInput>;
    createNumberInput(valueRequired?: boolean): Promise<NumberInput>;
    createDecimalInput(valueRequired?: boolean): Promise<DecimalInput>;
    createDateInput(valueRequired?: boolean): Promise<DateInput>;
    createBrokerageAccountGroupSelect(valueRequired?: boolean): Promise<BrokerageAccountGroupSelect>;
    createLitIvemIdSelect(valueRequired?: boolean): Promise<LitIvemIdSelect>;
    createRoutedIvemIdSelect(valueRequired?: boolean): Promise<RoutedIvemIdSelect>;
    createOrderRouteSelect(valueRequired?: boolean): Promise<OrderRouteSelect>;
}

/** @public */
export declare type Correctness = keyof typeof CorrectnessEnum;

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare const enum CorrectnessEnum {
    Good = "Good",
    Usable = "Usable",
    Suspect = "Suspect",
    Error = "Error"
}

/** @public */
export declare interface CorrectnessSvc {
    isUsable(correctness: Correctness): boolean;
    isUnusable(correctness: Correctness): boolean;
    isIncubated(correctness: Correctness): boolean;
}

/** @public */
export declare type CurrencyId = keyof typeof CurrencyIdEnum;

/** @public */
export declare const enum CurrencyIdEnum {
    Aud = "Aud",
    Usd = "Usd",
    Myr = "Myr"
}

/** @public */
export declare type CurrencyIdHandle = Handle;

/** @public */
export declare interface CurrentRepeatableExactHistorySequenceSeries extends RepeatableExactHistorySequenceSeries, NumberHistorySequenceSeriesInterface {
}

/** @public */
export declare namespace CurrentRepeatableExactHistorySequenceSeries {
    export interface Point extends RepeatableExactHistorySequenceSeries.Point {
        value: number;
    }
}

/** @public */
export declare interface DateInput extends DateUiAction, ControlComponent {
}

/** @public */
export declare interface DateUiAction extends UiAction {
    readonly value: Date | undefined;
    readonly definedValue: Date;
    pushValue(value: Date | undefined): void;
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare interface Decimal {
    /**
     * Return a new Decimal whose value is the absolute value of this Decimal.
     */
    absoluteValue(): Decimal;
    /**
     * Return a new Decimal whose value is the absolute value of this Decimal.
     */
    abs(): Decimal;
    /**
     * Return
     *   1    if the value of this Decimal is greater than the value of `y`,
     *  -1    if the value of this Decimal is less than the value of `y`,
     *   0    if they have the same value
     */
    comparedTo(y: Decimal.Numeric): 1 | 0 | -1;
    /**
     * Return
     *   1    if the value of this Decimal is greater than the value of `y`,
     *  -1    if the value of this Decimal is less than the value of `y`,
     *   0    if they have the same value
     */
    cmp(y: Decimal.Numeric): 1 | 0 | -1;
    /**
     * Return the number of decimal places of the value of this Decimal.
     */
    decimalPlaces(): number;
    /**
     * Return the number of decimal places of the value of this Decimal.
     */
    dp(): number;
    /**
     * Return a new Decimal whose value is the value of this Decimal divided by `y`, truncated to
     * `precision` significant digits.
     *
     */
    dividedBy(y: Decimal.Numeric): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal divided by `y`, truncated to
     * `precision` significant digits.
     *
     */
    div(y: Decimal.Numeric): Decimal;
    /**
     * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
     * by the value of `y`, truncated to `precision` significant digits.
     *
     */
    dividedToIntegerBy(y: Decimal.Numeric): Decimal;
    /**
     * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
     * by the value of `y`, truncated to `precision` significant digits.
     *
     */
    idiv(y: Decimal.Numeric): Decimal;
    /**
     * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
     */
    equals(y: Decimal.Numeric): boolean;
    /**
     * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
     */
    eq(y: Decimal.Numeric): boolean;
    /**
     * Return the (base 10) exponent value of this Decimal (this.e is the base 10000000 exponent).
     */
    exponent(): number;
    /**
     * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
     * false.
     */
    greaterThan(y: Decimal.Numeric): boolean;
    /**
     * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
     * false.
     */
    gt(y: Decimal.Numeric): boolean;
    /**
     * Return true if the value of this Decimal is greater than or equal to the value of `y`,
     * otherwise return false.
     *
     */
    greaterThanOrEqualTo(y: Decimal.Numeric): boolean;
    /**
     * Return true if the value of this Decimal is greater than or equal to the value of `y`,
     * otherwise return false.
     *
     */
    gte(y: Decimal.Numeric): boolean;
    /**
     * Return true if the value of this Decimal is an integer, otherwise return false.
     *
     */
    isInteger(): boolean;
    /**
     * Return true if the value of this Decimal is an integer, otherwise return false.
     *
     */
    isint(): boolean;
    /**
     * Return true if the value of this Decimal is negative, otherwise return false.
     *
     */
    isNegative(): boolean;
    /**
     * Return true if the value of this Decimal is negative, otherwise return false.
     *
     */
    isneg(): boolean;
    /**
     * Return true if the value of this Decimal is positive, otherwise return false.
     *
     */
    isPositive(): boolean;
    /**
     * Return true if the value of this Decimal is positive, otherwise return false.
     *
     */
    ispos(): boolean;
    /**
     * Return true if the value of this Decimal is 0, otherwise return false.
     *
     */
    isZero(): boolean;
    /**
     * Return true if the value of this Decimal is less than `y`, otherwise return false.
     *
     */
    lessThan(y: Decimal.Numeric): boolean;
    /**
     * Return true if the value of this Decimal is less than `y`, otherwise return false.
     *
     */
    lt(y: Decimal.Numeric): boolean;
    /**
     * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
     *
     */
    lessThanOrEqualTo(y: Decimal.Numeric): boolean;
    /**
     * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
     *
     */
    lte(y: Decimal.Numeric): boolean;
    /**
     * Return the logarithm of the value of this Decimal to the specified base, truncated to
     * `precision` significant digits.
     *
     * If no base is specified, return log[10](x).
     *
     * log[base](x) = ln(x) / ln(base)
     *
     * The maximum error of the result is 1 ulp (unit in the last place).
     *
     */
    logarithm(base?: Decimal.Numeric): Decimal;
    /**
     * Return the logarithm of the value of this Decimal to the specified base, truncated to
     * `precision` significant digits.
     *
     * If no base is specified, return log[10](x).
     *
     * log[base](x) = ln(x) / ln(base)
     *
     * The maximum error of the result is 1 ulp (unit in the last place).
     *
     */
    log(base?: Decimal.Numeric): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal minus `y`, truncated to
     * `precision` significant digits.
     *
     */
    minus(y: Decimal.Numeric): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal minus `y`, truncated to
     * `precision` significant digits.
     *
     */
    sub(y: Decimal.Numeric): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal modulo `y`, truncated to
     * `precision` significant digits.
     *
     */
    modulo(y: Decimal.Numeric): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal modulo `y`, truncated to
     * `precision` significant digits.
     *
     */
    mod(y: Decimal.Numeric): Decimal;
    /**
     * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
     * i.e. the base e raised to the power the value of this Decimal, truncated to `precision`
     * significant digits.
     *
     */
    naturalExponetial(): Decimal;
    /**
     * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
     * i.e. the base e raised to the power the value of this Decimal, truncated to `precision`
     * significant digits.
     *
     */
    exp(): Decimal;
    /**
     * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
     * truncated to `precision` significant digits.
     *
     */
    naturalLogarithm(): Decimal;
    /**
     * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
     * truncated to `precision` significant digits.
     *
     */
    ln(): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
     * -1.
     *
     */
    negated(): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
     * -1.
     *
     */
    neg(): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal plus `y`, truncated to
     * `precision` significant digits.
     *
     */
    plus(y: Decimal.Numeric): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal plus `y`, truncated to
     * `precision` significant digits.
     *
     */
    add(y: Decimal.Numeric): Decimal;
    /**
     * Return the number of significant digits of the value of this Decimal.
     *
     * @param zeros - Whether to count integer-part trailing zeros: true, false, 1 or 0.
     */
    precision(zeros: boolean | number): number;
    /**
     * Return the number of significant digits of the value of this Decimal.
     *
     * @param zeros - Whether to count integer-part trailing zeros: true, false, 1 or 0.
     */
    sd(zeros: boolean | number): number;
    /**
     * Return a new Decimal whose value is the square root of this Decimal, truncated to `precision`
     * significant digits.
     *
     */
    squareRoot(): Decimal;
    /**
     * Return a new Decimal whose value is the square root of this Decimal, truncated to `precision`
     * significant digits.
     *
     */
    sqrt(): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal times `y`, truncated to
     * `precision` significant digits.
     *
     */
    times(y: Decimal.Numeric): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal times `y`, truncated to
     * `precision` significant digits.
     *
     */
    mul(y: Decimal.Numeric): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
     * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
     *
     * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
     *
     * @param dp - Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    toDecimalPlaces(dp?: number, rm?: number): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
     * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
     *
     * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
     *
     * @param dp - Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    todp(dp?: number, rm?: number): Decimal;
    /**
     * Return a string representing the value of this Decimal in exponential notation rounded to
     * `dp` fixed decimal places using rounding mode `rounding`.
     *
     * @param dp - Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    toExponential(dp?: number, rm?: number): string;
    /**
     * Return a string representing the value of this Decimal in normal (fixed-point) notation to
     * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
     * omitted.
     *
     * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
     *
     * @param dp - Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
     * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
     * (-0).toFixed(3) is '0.000'.
     * (-0.5).toFixed(0) is '-0'.
     *
     */
    toFixed(dp?: number, rm?: number): string;
    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
     * rounding mode `rounding`.
     *
     */
    toInteger(): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
     * rounding mode `rounding`.
     *
     */
    toint(): Decimal;
    /**
     * Return the value of this Decimal converted to a number primitive.
     *
     */
    toNumber(): number;
    /**
     * Return a new Decimal whose value is the value of this Decimal raised to the power `y`,
     * truncated to `precision` significant digits.
     *
     * For non-integer or very large exponents pow(x, y) is calculated using
     *
     *   x^y = exp(y*ln(x))
     *
     * The maximum error is 1 ulp (unit in last place).
     *
     * @param y - The power to which to raise this Decimal.
     *
     */
    toPower(y: Decimal.Numeric): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal raised to the power `y`,
     * truncated to `precision` significant digits.
     *
     * For non-integer or very large exponents pow(x, y) is calculated using
     *
     *   x^y = exp(y*ln(x))
     *
     * The maximum error is 1 ulp (unit in last place).
     *
     * @param y - The power to which to raise this Decimal.
     *
     */
    pow(y: Decimal.Numeric): Decimal;
    /**
     * Return a string representing the value of this Decimal rounded to `sd` significant digits
     * using rounding mode `rounding`.
     *
     * Return exponential notation if `sd` is less than the number of digits necessary to represent
     * the integer part of the value in normal notation.
     *
     * @param sd - Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    toPrecision(sd?: number, rm?: number): string;
    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
     * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
     * omitted.
     *
     * @param sd - Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    toSignificantDigits(sd?: number, rm?: number): Decimal;
    /**
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
     * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
     * omitted.
     *
     * @param sd - Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * @param rm - Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    tosd(sd?: number, rm?: number): Decimal;
    /**
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    toString(): string;
    /**
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    valueOf(): string;
    /**
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    val(): string;
    /**
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    toJSON(): string;
}

/** @public */
export declare namespace Decimal {
    export type Numeric = string | number | Decimal;
}

/** @public */
export declare interface DecimalInput extends DecimalUiAction, ControlComponent {
}

/** @public */
export declare interface DecimalSvc {
    precision: number;
    rounding: number;
    readonly ROUND_UP: number;
    readonly ROUND_DOWN: number;
    readonly ROUND_CEIL: number;
    readonly ROUND_FLOOR: number;
    readonly ROUND_HALF_UP: number;
    readonly ROUND_HALF_DOWN: number;
    readonly ROUND_HALF_EVEN: number;
    readonly ROUND_HALF_CEIL: number;
    readonly ROUND_HALF_FLOOR: number;
    toExpNeg: number;
    toExpPos: number;
    LN10: Decimal;
    /**
     * The Decimal constructor and exported function.
     * Return a new Decimal instance.
     *
     * @param value - A numeric value.
     *
     */
    create(value: Decimal.Numeric, config?: DecimalSvc.Config): Decimal;
    /**
     * Configure global settings for a Decimal constructor.
     */
    config(config: DecimalSvc.Config): void;
    /**
     * Configure global settings for a Decimal constructor.
     */
    set(config: DecimalSvc.Config): void;
}

/** @public */
export declare namespace DecimalSvc {
    export interface Config {
        precision?: number;
        rounding?: number;
        toExpNeg?: number;
        toExpPos?: number;
        LN10?: Decimal.Numeric;
    }
}

/** @public */
export declare interface DecimalUiAction extends UiAction {
    readonly value: Decimal | undefined;
    readonly definedValue: Decimal;
    readonly options: DecimalUiAction.Options;
    pushValue(value: Decimal | undefined): void;
    pushOptions(options: DecimalUiAction.Options): void;
}

/** @public */
export declare namespace DecimalUiAction {
    export interface Options {
        max?: number;
        min?: number;
        step?: number;
        useGrouping?: boolean;
    }
}

/** @public */
export declare interface DelayedBadnessComponent extends ContentComponent {
    delayTimeSpan: TimeSpan;
    setBadness(value: Badness): void;
    hideWithVisibleDelay(badness: Badness): void;
}

/** @public */
export declare type ExchangeEnvironmentId = keyof typeof ExchangeEnvironmentIdEnum;

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare const enum ExchangeEnvironmentIdEnum {
    Production = "Production",
    DelayedProduction = "DelayedProduction",
    Demo = "Demo"
}

/** @public */
export declare type ExchangeEnvironmentIdHandle = Integer;

/** @public */
export declare interface ExchangeEnvironmentIdSvc {
    toName(id: ExchangeEnvironmentId): string;
    fromName(name: string): ExchangeEnvironmentId | undefined;
    toJsonValue(id: ExchangeEnvironmentId): string;
    fromJsonValue(jsonValue: string): ExchangeEnvironmentId | undefined;
    toDisplay(id: ExchangeEnvironmentId): string;
    toHandle(id: ExchangeEnvironmentId): ExchangeEnvironmentIdHandle;
    fromHandle(handle: ExchangeEnvironmentIdHandle): ExchangeEnvironmentId | undefined;
    handleToName(handle: ExchangeEnvironmentIdHandle): string;
    handleFromName(name: string): ExchangeEnvironmentIdHandle | undefined;
    handleToDisplay(handle: ExchangeEnvironmentIdHandle): string;
}

/** @public */
export declare type ExchangeId = keyof typeof ExchangeIdEnum;

/** @public */
export declare const enum ExchangeIdEnum {
    Asx = "Asx",
    Cxa = "Cxa",
    Myx = "Myx",
    Ptx = "Ptx",
    Fnsx = "Fnsx"
}

/** @public */
export declare type ExchangeIdHandle = Handle;

/** @public */
export declare interface ExchangeIdSvc {
    toName(id: ExchangeId): string;
    fromName(name: string): ExchangeId | undefined;
    toJsonValue(id: ExchangeId): string;
    fromJsonValue(id: string): ExchangeId | undefined;
    toAbbreviatedDisplay(id: ExchangeId): string;
    toDisplay(id: ExchangeId): string;
    toLocalMarketIds(id: ExchangeId): MarketId[];
    toDefaultMarketId(id: ExchangeId): MarketId;
    toHandle(id: ExchangeId): ExchangeIdHandle;
    fromHandle(handle: ExchangeIdHandle): ExchangeId | undefined;
    handleToName(handle: ExchangeIdHandle): string;
    handleFromName(name: string): ExchangeIdHandle | undefined;
    handleToAbbreviatedDisplay(handle: ExchangeIdHandle): string;
    handleToDisplay(handle: ExchangeIdHandle): string;
    handleToLocalMarketIds(handle: ExchangeIdHandle): readonly MarketIdHandle[];
    handleToDefaultMarketId(handle: ExchangeIdHandle): MarketIdHandle;
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare interface Extension {
    unloadEventer: Extension.UnloadEventHandler;
}

/** @public */
export declare namespace Extension {
    export type UnloadEventHandler = (this: void) => void;
}

/** @public */
export declare interface ExtensionRegistrar {
    register(request: ExtensionRegistrar.Request): void;
}

/** @public */
export declare namespace ExtensionRegistrar {
    export type ApiVersion = '1';
    export interface Request {
        publisherType: PublisherType;
        publisherName: string;
        name: string;
        version: string;
        apiVersion: ApiVersion;
        loadCallback: Request.LoadCallback;
    }
    export namespace Request {
        export type LoadCallback = (this: void, extension: ExtensionSvc) => Extension;
    }
    const windowPropertyName = "motifExtensionRegistrar";
}

/** @public */
export declare interface ExtensionSvc {
    readonly selfInfoSvc: SelfInfoSvc;
    readonly resourcesSvc: ResourcesSvc;
    readonly apiErrorSvc: ApiErrorSvc;
    readonly badnessSvc: BadnessSvc;
    readonly commaTextSvc: CommaTextSvc;
    readonly correctnessSvc: CorrectnessSvc;
    readonly decimalSvc: DecimalSvc;
    readonly jsonSvc: JsonSvc;
    readonly sourceTzOffsetDateTimeSvc: SourceTzOffsetDateTimeSvc;
    readonly brokerageAccountGroupSvc: BrokerageAccountGroupSvc;
    readonly exchangeEnvironmentIdSvc: ExchangeEnvironmentIdSvc;
    readonly exchangeIdSvc: ExchangeIdSvc;
    readonly feedClassSvc: FeedClassSvc;
    readonly feedIdSvc: FeedIdSvc;
    readonly ivemIdSvc: IvemIdSvc;
    readonly litIvemIdSvc: LitIvemIdSvc;
    readonly marketIdSvc: MarketIdSvc;
    readonly orderTypeSvc: OrderTypeSvc;
    readonly orderSideSvc: OrderSideSvc;
    readonly orderRouteSvc: OrderRouteSvc;
    readonly orderTimeInForceSvc: OrderTimeInForceSvc;
    readonly routedIvemIdSvc: RoutedIvemIdSvc;
    readonly commandSvc: CommandSvc;
    readonly historySequencerSvc: HistorySequencerSvc;
    readonly intervalHistorySequencerSvc: IntervalHistorySequencerSvc;
    readonly storageSvc: StorageSvc;
    readonly symbolSvc: SymbolSvc;
    readonly workspaceSvc: WorkspaceSvc;
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare interface Feed {
}

/** @public */
export declare type FeedClass = keyof typeof FeedClassEnum;

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare const enum FeedClassEnum {
    Authority = "Authority",
    Market = "Market",
    News = "News",
    Trading = "Trading"
}

/** @public */
export declare type FeedClassHandle = Integer;

/** @public */
export declare interface FeedClassSvc {
    toName(id: FeedClass): string;
    toDisplay(id: FeedClass): string;
    toHandle(id: FeedClass): FeedClassHandle;
    fromHandle(handle: FeedClassHandle): FeedClass | undefined;
    handleToName(handle: FeedClassHandle): string;
    handleToDisplay(handle: FeedClassHandle): string;
}

/** @public */
export declare type FeedId = keyof typeof FeedIdEnum;

/** @public */
export declare const enum FeedIdEnum {
    Null = "Null",
    Authority_Trading = "Authority_Trading",
    Authority_Watchlist = "Authority_Watchlist",
    Trading_Motif = "Trading_Motif",
    Trading_Malacca = "Trading_Malacca",
    Market_AsxTradeMatch = "Market_AsxTradeMatch",
    Market_AsxCentrePoint = "Market_AsxCentrePoint",
    Market_MyxNormal = "Market_MyxNormal",
    Market_MyxDirectBusiness = "Market_MyxDirectBusiness",
    Market_MyxIndex = "Market_MyxIndex",
    Market_MyxOddLot = "Market_MyxOddLot",
    Market_MyxBuyIn = "Market_MyxBuyIn",
    Market_Ptx = "Market_Ptx",
    Market_Fnsx = "Market_Fnsx",
    News_Asx = "News_Asx",
    News_Nsx = "News_Nsx",
    News_Nzx = "News_Nzx",
    News_Myx = "News_Myx",
    News_Ptx = "News_Ptx",
    News_Fnsx = "News_Fnsx"
}

/** @public */
export declare type FeedIdHandle = Handle;

/** @public */
export declare interface FeedIdSvc {
    toName(id: FeedId): string;
    fromName(name: string): FeedId | undefined;
    toDisplay(id: FeedId): string;
    toHandle(id: FeedId): FeedIdHandle;
    fromHandle(handle: FeedIdHandle): FeedId | undefined;
    handleToName(handle: FeedIdHandle): string;
    handleFromName(name: string): FeedIdHandle | undefined;
    handleToDisplay(handle: FeedIdHandle): string;
}

/** @public */
export declare interface Frame {
    readonly rootHtmlElement: HTMLElement;
    readonly svc: FrameSvc;
}

/** @public */
export declare interface FrameSvc {
    readonly frameTypeName: string;
    readonly initialPersistState: JsonElement | undefined;
    readonly width: number;
    readonly height: number;
    readonly focused: boolean;
    readonly shown: boolean;
    tabText: string;
    readonly litIvemId: LitIvemId | undefined;
    readonly oldlitIvemId: LitIvemId | undefined;
    readonly litIvemIdValid: boolean;
    readonly oldlitIvemIdValid: boolean;
    litIvemIdLinkable: boolean;
    litIvemIdLinked: boolean;
    allBrokerageAccountGroupSupported: boolean;
    readonly brokerageAccountGroup: BrokerageAccountGroup | undefined;
    readonly oldbrokerageAccountGroup: BrokerageAccountGroup | undefined;
    brokerageAccountGroupLinkable: boolean;
    brokerageAccountGroupLinked: boolean;
    primary: boolean;
    readonly controlsSvc: ControlsSvc;
    readonly contentSvc: ContentSvc;
    savePersistStateEventer: FrameSvc.SavePersistStateEventHandler | undefined;
    shownEventer: FrameSvc.ShownEventHandler | undefined;
    hiddenEventer: FrameSvc.HiddenEventHandler | undefined;
    focusedEventer: FrameSvc.FocusedEventHandler | undefined;
    blurredEventer: FrameSvc.BlurredEventHandler | undefined;
    resizedEventer: FrameSvc.ResizedEventHandler | undefined;
    applySymbolEventer: FrameSvc.ApplySymbolEventHandler | undefined;
    symbolLinkedChangedEventer: FrameSvc.SymbolLinkedChangedEventHandler | undefined;
    applyBrokerageAccountGroupEventer: FrameSvc.ApplyBrokerageAccountGroupEventHandler | undefined;
    brokerageAccountGroupLinkedChangedEventer: FrameSvc.BrokerageAccountGroupLinkedChangedEventHandler | undefined;
    primaryChangedEventer: FrameSvc.PrimaryChangedEventHandler | undefined;
    focus(): void;
    blur(): void;
    destroyAllComponents(): void;
    setLitIvemId(value: LitIvemId, force?: boolean): void;
    setBrokerageAccountGroup(value: BrokerageAccountGroup, force?: boolean): void;
}

/** @public */
export declare namespace FrameSvc {
    export type SavePersistStateEventHandler = (this: void, element: JsonElement) => void;
    export type ShownEventHandler = (this: void) => void;
    export type HiddenEventHandler = (this: void) => void;
    export type FocusedEventHandler = (this: void) => void;
    export type BlurredEventHandler = (this: void) => void;
    export type ResizedEventHandler = (this: void) => void;
    export type ApplySymbolEventHandler = (this: void, litIvemId: LitIvemId | undefined, selfInitiated: boolean) => boolean;
    export type SymbolLinkedChangedEventHandler = (this: void) => void;
    export type ApplyBrokerageAccountGroupEventHandler = (this: void, group: BrokerageAccountGroup | undefined, selfInitiated: boolean) => boolean;
    export type BrokerageAccountGroupLinkedChangedEventHandler = (this: void) => void;
    export type PrimaryChangedEventHandler = (this: void) => void;
}

/** @public */
export declare type Guid = string;

/** @public */
export declare type Handle = Integer;

/** @public */
export declare interface HistorySequencer {
    readonly type: HistorySequencer.Type;
    readonly changeBegun: boolean;
    changeBegunEventer: HistorySequencer.ChangeBegunEventHandler | undefined;
    changeEndedEventer: HistorySequencer.ChangeEndedEventHandler | undefined;
    sequencerLoadedEventer: HistorySequencer.SequencerLoadedEvent | undefined;
    allEngineSeriesLoadedEventer: HistorySequencer.AllEngineSeriesLoadedEventHandler | undefined;
    finalise(): void;
    beginHistoriesChange(): void;
    endHistoriesChange(): void;
}

/** @public */
export declare namespace HistorySequencer {
    export const enum TypeEnum {
        Interval = "Interval",
        RepeatableExact = "RepeatableExact"
    }
    export type Type = keyof typeof TypeEnum;
    export type Point = SourceTzOffsetDateTime;
    export type ChangeBegunEventHandler = (this: void) => void;
    export type ChangeEndedEventHandler = (this: void) => void;
    export type SequencerLoadedEvent = (this: void) => void;
    export type AllEngineSeriesLoadedEventHandler = (this: void) => void;
}

/** @public */
export declare interface HistorySequencerSvc {
    createIntervalHistorySequencer(): IntervalHistorySequencer;
    createRepeatableExactHistorySequencer(): RepeatableExactHistorySequencer;
    createOhlcIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer): OhlcIntervalHistorySequenceSeries;
    createCloseIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer): CloseIntervalHistorySequenceSeries;
    createLastIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer): LastIntervalHistorySequenceSeries;
    createAccumulationIntervalHistorySequenceSeries(sequencer: IntervalHistorySequencer): AccumulationIntervalHistorySequenceSeries;
    createCurrentRepeatableExactHistorySequenceSeries(sequencer: RepeatableExactHistorySequencer): CurrentRepeatableExactHistorySequenceSeries;
    createLitIvemIdPriceVolumeSequenceHistory(litIvemId: LitIvemId): LitIvemIdPriceVolumeSequenceHistory;
    typeToJsonValue(value: HistorySequencer.TypeEnum): string;
    typeFromJsonValue(value: string): HistorySequencer.TypeEnum | undefined;
}

/** @public */
export declare interface HistorySequenceSeries extends HistorySequenceSeriesInterface {
    initialiseWithNullPoints(): void;
    finalise(): void;
    subscribePointInsertedEvent(handler: HistorySequenceSeriesInterface.PointInsertedEventHandler): MultiEvent.SubscriptionId;
    unsubscribePointInsertedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    subscribePointsInsertedEvent(handler: HistorySequenceSeriesInterface.PointsInsertedEventHandler): MultiEvent.SubscriptionId;
    unsubscribePointsInsertedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    subscribePointUpdatedEvent(handler: HistorySequenceSeriesInterface.PointUpdatedEventHandler): MultiEvent.SubscriptionId;
    unsubscribePointUpdatedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

/** @public */
export declare namespace HistorySequenceSeries {
    export interface Point extends HistorySequenceSeriesInterface.Point {
    }
}

/** @public */
export declare interface HistorySequenceSeriesInterface {
    readonly pointCount: number;
    initialiseWithNullPoints(): void;
    finalise(): void;
    subscribePointInsertedEvent(handler: HistorySequenceSeriesInterface.PointInsertedEventHandler): MultiEvent.SubscriptionId;
    unsubscribePointInsertedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    subscribePointsInsertedEvent(handler: HistorySequenceSeriesInterface.PointsInsertedEventHandler): MultiEvent.SubscriptionId;
    unsubscribePointsInsertedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    subscribePointUpdatedEvent(handler: HistorySequenceSeriesInterface.PointUpdatedEventHandler): MultiEvent.SubscriptionId;
    unsubscribePointUpdatedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

/** @public */
export declare namespace HistorySequenceSeriesInterface {
    export interface Point {
        null: boolean;
    }
    export type PointInsertedEventHandler = (this: void, index: Integer) => void;
    export type PointsInsertedEventHandler = (this: void, index: Integer, count: Integer) => void;
    export type PointUpdatedEventHandler = (this: void, index: Integer) => void;
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare type Integer = number;

/** @public */
export declare interface IntegerInput extends IntegerUiAction, ControlComponent {
}

/** @public */
export declare interface IntegerUiAction extends NumberUiAction {
}

/** @public */
export declare interface IntervalHistorySequencer extends HistorySequencer {
    readonly unit: IntervalHistorySequencer.Unit;
    readonly unitCount: Integer;
    readonly emptyPeriodsSkipped: boolean;
    readonly weekendsSkipped: boolean;
    readonly pointList: IntervalHistorySequencer.PointList;
    setParameters(unit: IntervalHistorySequencer.Unit, unitCount: Integer, emptyPeriodsSkipped: boolean, weekendsSkipped: boolean): void;
}

/** @public */
export declare namespace IntervalHistorySequencer {
    export const enum UnitEnum {
        Millisecond = "Millisecond",
        Day = "Day",
        Week = "Week",
        Month = "Month",
        Year = "Year"
    }
    export type Unit = keyof typeof UnitEnum;
    export interface Point extends HistorySequencer.Point {
    }
    export interface PointList extends ComparableList<Point> {
        findPoint(dateTime: Date, suggestedIndex: Integer): ComparableList.BinarySearchResult;
    }
}

/** @public */
export declare interface IntervalHistorySequencerSvc {
    unitToJsonValue(value: IntervalHistorySequencer.UnitEnum): string;
    unitFromJsonValue(value: string): IntervalHistorySequencer.UnitEnum | undefined;
}

/** @public */
export declare interface IntervalHistorySequenceSeries extends HistorySequenceSeries {
    readonly intervalSequencer: IntervalHistorySequencer;
    readonly sequencerPoints: IntervalHistorySequencer.PointList;
}

/** @public */
export declare namespace IntervalHistorySequenceSeries {
    export interface Point extends HistorySequenceSeries.Point {
    }
}

/** @public */
export declare interface IvemId {
    readonly code: string;
    readonly exchangeId: ExchangeId;
    readonly name: string;
    toJson(): Json;
}

/** @public */
export declare interface IvemIdSvc {
    create(code: string, exchangeId: ExchangeId): IvemId;
    isEqual(left: IvemId, right: IvemId): boolean;
    isUndefinableEqual(left: IvemId | undefined, right: IvemId | undefined): boolean;
    compare(left: IvemId, right: IvemId): ComparisonResult;
    tryCreateFromJson(json: Json): IvemId | undefined;
    tryCreateArrayFromJson(jsonArray: Json[]): IvemId[] | undefined;
}

/** @public */
export declare interface Json {
    [name: string]: JsonValue;
}

/** @public */
export declare interface JsonElement {
    readonly json: Json;
    clear(): void;
    shallowAssign(element: JsonElement | undefined): void;
    deepExtend(other: Json): void;
    stringify(): string;
    parse(jsonText: string, context?: string): boolean;
    tryGetElement(name: string, context?: string): JsonElement | undefined;
    tryGetJsonValue(name: string): JsonValue | undefined;
    tryGetNativeObject(name: string, context?: string): object | undefined;
    tryGetJsonObject(name: string, context?: string): Json | undefined;
    tryGetString(name: string, context?: string): string | undefined;
    getString(name: string, defaultValue: string, context?: string): string;
    tryGetNumber(name: string, context?: string): number | undefined;
    getNumber(name: string, defaultValue: number, context?: string): number;
    tryGetBoolean(name: string, context?: string): boolean | undefined;
    getBoolean(name: string, defaultValue: boolean, context?: string): boolean;
    tryGetElementArray(name: string, context?: string): JsonElement[] | undefined;
    tryGetJsonObjectArray(name: string, context?: string): Json[] | undefined;
    tryGetStringArray(name: string, context?: string): string[] | undefined;
    tryGetNumberArray(name: string, context?: string): number[] | undefined;
    tryGetBooleanArray(name: string, context?: string): boolean[] | undefined;
    tryGetAnyJsonValueTypeArray(name: string, context?: string): JsonValueArray | undefined;
    tryGetInteger(name: string, context?: string): Integer | undefined;
    getInteger(name: string, defaultValue: Integer, context?: string): Integer;
    tryGetDate(name: string, context?: string): Date | undefined;
    getDate(name: string, defaultValue: Date, context?: string): Date;
    tryGetDateTime(name: string, context?: string): Date | undefined;
    getDateTime(name: string, defaultValue: Date, context?: string): Date;
    tryGetGuid(name: string, context?: string): Guid | undefined;
    getGuid(name: string, defaultValue: Guid, context?: string): Guid;
    tryGetDecimal(name: string, context?: string): Decimal | undefined;
    getDecimal(name: string, defaultValue: Decimal, context?: string): Decimal;
    newElement(name: string): JsonElement;
    setElement(name: string, value: JsonElement | undefined): void;
    setJson(name: string, value: Json | undefined): void;
    setJsonValue(name: string, value: JsonValue | undefined): void;
    setString(name: string, value: string | undefined): void;
    setNumber(name: string, value: number | undefined): void;
    setBoolean(name: string, value: boolean | undefined): void;
    setElementArray(name: string, value: JsonElement[] | undefined): void;
    setObjectArray(name: string, value: Json[] | undefined): void;
    setStringArray(name: string, value: string[] | undefined): void;
    setNumberArray(name: string, value: number[] | undefined): void;
    setBooleanArray(name: string, value: boolean[] | undefined): void;
    setInteger(name: string, value: Integer | undefined): void;
    setDate(name: string, value: Date | undefined): void;
    setDateTime(name: string, value: Date | undefined): void;
    setGuid(name: string, value: Guid | undefined): void;
    setDecimal(name: string, value: Decimal | undefined): void;
    forEach(callback: JsonElement.ForEachCallback): void;
    forEachElement(callback: JsonElement.ForEachElementCallback): void;
    forEachValue(callback: JsonElement.ForEachValueCallback): void;
    forEachString(callback: JsonElement.ForEachStringCallback): void;
    forEachNumber(callback: JsonElement.ForEachNumberCallback): void;
    forEachBoolean(callback: JsonElement.ForEachBooleanCallback): void;
}

/** @public */
export declare namespace JsonElement {
    export type ForEachCallback = (this: void, name: string, value: JsonValue, idx: Integer) => void;
    export type ForEachElementCallback = (this: void, name: string, value: JsonElement, idx: Integer) => void;
    export type ForEachValueCallback = (this: void, name: string, value: JsonValue, idx: Integer) => void;
    export type ForEachStringCallback = (this: void, name: string, value: string, idx: Integer) => void;
    export type ForEachNumberCallback = (this: void, name: string, value: number, idx: Integer) => void;
    export type ForEachBooleanCallback = (this: void, name: string, value: boolean, idx: Integer) => void;
}

/** @public */
export declare interface JsonSvc {
    isJson(value: JsonValue): value is Json;
    isJsonObject(value: JsonValue): value is Json | object;
    createJsonElement(json?: Json): JsonElement;
    tryCreateJsonElementFromJsonValue(jsonValue: JsonValue | undefined): JsonElement | undefined;
}

/** @public */
export declare type JsonValue = string | number | boolean | null | Json | object | JsonValueArray;

/** @public */
export declare type JsonValueArray = Array<JsonValue>;

/** @public */
export declare interface LastIntervalHistorySequenceSeries extends IntervalHistorySequenceSeries, NumberHistorySequenceSeriesInterface {
}

/** @public */
export declare namespace LastIntervalHistorySequenceSeries {
    export interface Point extends IntervalHistorySequenceSeries.Point {
        previousIntervalCloseDateTime: Date;
        previousIntervalCloseDateTimeRepeatCount: Integer;
        value: number;
    }
}

/** @public */
export declare interface LitIvemId {
    readonly code: string;
    readonly litId: MarketId;
    readonly environmentId: ExchangeEnvironmentId;
    readonly explicitEnvironmentId: ExchangeEnvironmentId | undefined;
    readonly name: string;
    readonly persistKey: string;
    toJson(): Json;
}

/** @public */
export declare interface LitIvemIdParseDetails {
    readonly success: boolean;
    readonly litIvemId: LitIvemId | undefined;
    readonly sourceIdExplicit: boolean;
    readonly marketIdExplicit: boolean;
    readonly errorText: string;
    readonly parseText: string;
}

/** @public */
export declare interface LitIvemIdPriceVolumeSequenceHistory extends SequenceHistory {
    readonly active: boolean;
    readonly litIvemId: LitIvemId;
    registerSeries(series: HistorySequenceSeries, seriesType: LitIvemIdPriceVolumeSequenceHistory.SeriesType): void;
    deregisterSeries(series: HistorySequenceSeries, seriesType: LitIvemIdPriceVolumeSequenceHistory.SeriesType): void;
    activate(litIvemId: LitIvemId): void;
    setSequencer(sequencer: HistorySequencer | undefined): void;
}

/** @public */
export declare namespace LitIvemIdPriceVolumeSequenceHistory {
    export const enum SeriesTypeEnum {
        Price = "Price",
        Volume = "Volume"
    }
    export type SeriesType = keyof typeof SeriesTypeEnum;
}

/** @public */
export declare interface LitIvemIdSelect extends LitIvemIdUiAction, ControlComponent {
}

/** @public */
export declare interface LitIvemIdSvc {
    create(code: string, litId: MarketId, exchangeEnvironmentId?: ExchangeEnvironmentId): LitIvemId;
    isEqual(left: LitIvemId, right: LitIvemId): boolean;
    isUndefinableEqual(left: LitIvemId | undefined, right: LitIvemId | undefined): boolean;
    compare(left: LitIvemId, right: LitIvemId): ComparisonResult;
    tryCreateFromJson(json: Json): LitIvemId | undefined;
    tryCreateArrayFromJson(jsonArray: Json[]): LitIvemId[] | undefined;
}

/** @public */
export declare interface LitIvemIdUiAction extends UiAction {
    readonly value: LitIvemId | undefined;
    readonly definedValue: LitIvemId;
    readonly parseDetails: LitIvemIdParseDetails | undefined;
    pushValue(value: LitIvemId | undefined): void;
}

/** @public */
export declare interface LocalDesktop {
    readonly lastFocusedLitIvemId: LitIvemId | undefined;
    readonly lastFocusedBrokerageAccountGroup: BrokerageAccountGroup | undefined;
    readonly lastSingleBrokerageAccountGroup: SingleBrokerageAccountGroup | undefined;
    readonly menuBar: MenuBar;
    litIvemId: LitIvemId | undefined;
    brokerageAccountGroup: BrokerageAccountGroup | undefined;
    getFrameEventer: LocalDesktop.GetFrameEventHandler;
    releaseFrameEventer: LocalDesktop.ReleaseFrameEventHandler | undefined;
    readonly frames: Frame[];
    createFrame(frameTypeName: string, tabText?: string, initialState?: JsonValue, preferredLocation?: LocalDesktop.PreferredLocation): Frame;
    destroyFrame(frame: Frame): void;
    destroyAllFrames(): void;
}

/** @public */
export declare namespace LocalDesktop {
    export type GetFrameEventHandler = (this: void, frameSvc: FrameSvc) => Frame;
    export type ReleaseFrameEventHandler = (this: void, frame: Frame) => void;
    export const enum PreferredLocationEnum {
        FirstTabset = "FirstTabset",
        NextToFocused = "NextToFocused"
    }
    export type PreferredLocation = keyof typeof PreferredLocationEnum;
}

/** @public */
export declare type MarketId = keyof typeof MarketIdEnum;

/** @public */
export declare const enum MarketIdEnum {
    AsxTradeMatch = "AsxTradeMatch",
    AsxCentrePoint = "AsxCentrePoint",
    MyxNormal = "MyxNormal",
    MyxDirectBusiness = "MyxDirectBusiness",
    MyxIndex = "MyxIndex",
    MyxOddLot = "MyxOddLot",
    MyxBuyIn = "MyxBuyIn",
    Ptx = "Ptx",
    Fnsx = "Fnsx"
}

/** @public */
export declare type MarketIdHandle = Handle;

/** @public */
export declare interface MarketIdSvc {
    isLit(id: MarketId): boolean;
    isRoutable(id: MarketId): boolean;
    toName(id: MarketId): string;
    toJsonValue(id: MarketId): string;
    fromJsonValue(id: string): MarketId | undefined;
    toDisplay(id: MarketId): string;
    fromDisplay(display: string): MarketId | undefined;
    toFeedId(id: MarketId): FeedId;
    toExchangeId(id: MarketId): ExchangeId;
    toSupportedExchangeIds(id: MarketId): ExchangeId[];
    toBestLitId(id: MarketId): MarketId;
    toAllowedOrderTypes(id: MarketId): OrderType[];
    toAllowedOrderTimeInForces(id: MarketId): OrderTimeInForce[];
    toAllowedOrderSides(id: MarketId): OrderSide[];
    toHandle(id: MarketId): MarketIdHandle;
    fromHandle(handle: MarketIdHandle): MarketId | undefined;
    handleIsLit(handle: MarketIdHandle): boolean;
    handleIsRoutable(handle: MarketIdHandle): boolean;
    handleToName(handle: MarketIdHandle): string;
    handleToDisplay(handle: MarketIdHandle): string;
    handleFromDisplay(display: string): MarketIdHandle | undefined;
    handleToFeedId(handle: MarketIdHandle): FeedIdHandle;
    handleToExchangeId(handle: MarketIdHandle): ExchangeIdHandle;
    handleToSupportedExchangeIds(handle: MarketIdHandle): readonly ExchangeIdHandle[];
    handleToBestLitId(handle: MarketIdHandle): MarketIdHandle;
    handleToAllowedOrderTypes(handle: MarketIdHandle): readonly OrderTypeHandle[];
    handleToAllowedOrderTimeInForces(handle: MarketIdHandle): readonly OrderTimeInForceHandle[];
    handleToAllowedOrderTimeInForcesForOrderType(marketIdHandle: MarketIdHandle, orderTypeHandle: OrderTypeHandle): readonly OrderTimeInForceHandle[];
    handleToAllowedOrderSides(handle: MarketIdHandle): readonly OrderSideHandle[];
    handleAreArraysUniquelyEqual(left: readonly MarketIdHandle[], right: readonly MarketIdHandle[]): boolean;
}

/** @public */
export declare interface MarketOrderRoute extends OrderRoute {
    readonly marketId: MarketId;
    readonly marketIdHandle: MarketIdHandle;
    isEqualTo(other: MarketOrderRoute): boolean;
}

/** @public */
export declare interface MenuBar {
    beginChanges(): void;
    endChanges(): void;
    createCommandMenuItem(command: Command, overrideDefaultPosition?: MenuBar.MenuItemPosition): CommandMenuItem;
    destroyCommandMenuItem(menuItem: CommandMenuItem): void;
    createChildMenuItem(childMenuName: MenuBar.MenuName, defaultItemPosition: MenuBar.MenuItemPosition, displayId?: StringId, accessKeyId?: StringId, embedded?: boolean): ChildMenuItem;
    createRootChildMenuItem(childMenuName: MenuBar.MenuName, rank: number, displayId?: StringId, accessKeyId?: StringId): ChildMenuItem;
    createEmbeddedChildMenu(menuName: MenuBar.MenuName, defaultPosition: MenuBar.MenuItemPosition): ChildMenuItem;
    destroyChildMenuItem(menuItem: ChildMenuItem): void;
    destroyAllMenuItems(): void;
}

/** @public */
export declare namespace MenuBar {
    export type MenuName = string;
    export type MenuItemPosition = Command.MenuBarItemPosition;
}

/** @public */
export declare interface MultiEvent<T> {
    readonly count: Integer;
    subscribe(handler: T): MultiEvent.DefinedSubscriptionId;
    unsubscribe(id: MultiEvent.SubscriptionId): void;
    copyHandlers(): T[];
}

/** @public */
export declare namespace MultiEvent {
    export type DefinedSubscriptionId = Integer;
    export type SubscriptionId = DefinedSubscriptionId | undefined;
}

/** @public */
export declare interface NumberHistorySequenceSeriesInterface extends HistorySequenceSeriesInterface {
    getSequencerPoint(idx: Integer): HistorySequencer.Point;
    getNumberPoint(idx: Integer): NumberHistorySequenceSeriesInterface.Point;
}

/** @public */
export declare namespace NumberHistorySequenceSeriesInterface {
    export interface Point extends HistorySequenceSeries.Point {
        value: number;
    }
}

/** @public */
export declare interface NumberInput extends NumberUiAction, ControlComponent {
}

/** @public */
export declare interface NumberUiAction extends UiAction {
    readonly value: number | undefined;
    readonly definedValue: number;
    readonly options: NumberUiAction.Options;
    pushValue(value: number | undefined): void;
    pushOptions(options: NumberUiAction.Options): void;
}

/** @public */
export declare namespace NumberUiAction {
    export interface Options {
        max?: number;
        min?: number;
        step?: number;
        useGrouping?: boolean;
    }
}

/** @public */
export declare interface OhlcHistorySequenceSeriesInterface extends HistorySequenceSeriesInterface {
    getSequencerPoint(idx: Integer): HistorySequencer.Point;
    getOhlcPoint(idx: Integer): OhlcHistorySequenceSeriesInterface.Point;
}

/** @public */
export declare namespace OhlcHistorySequenceSeriesInterface {
    export interface Point extends HistorySequenceSeries.Point {
        open: number;
        high: number;
        low: number;
        close: number;
    }
}

/** @public */
export declare interface OhlcIntervalHistorySequenceSeries extends IntervalHistorySequenceSeries, OhlcHistorySequenceSeriesInterface {
}

/** @public */
export declare type OrderRequestType = keyof typeof OrderRequestTypeEnum;

/** @public */
export declare const enum OrderRequestTypeEnum {
    Place = "Place",
    Amend = "Amend",
    Cancel = "Cancel",
    Move = "Move"
}

/** @public */
export declare type OrderRequestTypeHandle = Handle;

/** @public */
export declare interface OrderRoute {
    readonly algorithm: OrderRouteAlgorithm;
    readonly algorithmHandle: OrderRouteAlgorithmHandle;
    readonly code: string;
    readonly name: string;
    readonly display: string;
    createCopy(): OrderRoute;
    toJson(): Json;
    getBestLitMarketId(): MarketId;
    getAllowedOrderTypes(): OrderType[];
    isOrderTypeAllowed(orderType: OrderType): boolean;
    getAllowedOrderSides(): OrderSide[];
    isOrderSideAllowed(orderSide: OrderSide): boolean;
    isQuantityAllowed(value: number): boolean;
    getAllowedTimeInForcesForOrderType(orderType: OrderType): OrderTimeInForce[];
    isTimeInForceForOrderTypeAllowed(orderType: OrderType, orderTimeInForce: OrderTimeInForce): boolean;
    getBestLitMarketIdHandle(): MarketIdHandle;
    getAllowedOrderTypeHandles(): readonly OrderTypeHandle[];
    isOrderTypeHandleAllowed(orderTypeHandle: OrderTypeHandle): boolean;
    getAllowedOrderSideHandles(): readonly OrderSideHandle[];
    isOrderSideHandleAllowed(orderSideHandle: OrderSideHandle): boolean;
    getAllowedTimeInForcesForOrderTypeHandle(orderTypeHandle: OrderTypeHandle): readonly OrderTimeInForceHandle[];
    isTimeInForceForOrderTypeHandleAllowed(orderTypeHandle: OrderTypeHandle, orderTimeInForceHandle: OrderTimeInForceHandle): boolean;
}

/** @public */
export declare type OrderRouteAlgorithm = keyof typeof OrderRouteAlgorithmEnum;

/** @public */
export declare const enum OrderRouteAlgorithmEnum {
    Market = "Market"
}

/** @public */
export declare type OrderRouteAlgorithmHandle = Handle;

/** @public */
export declare interface OrderRouteSelect extends OrderRouteUiAction, ControlComponent {
}

/** @public */
export declare interface OrderRouteSvc {
    isEqual(left: OrderRoute, right: OrderRoute): boolean;
    isUndefinableEqual(left: OrderRoute | undefined, right: OrderRoute | undefined): boolean;
    isMarketRoute(route: OrderRoute): route is MarketOrderRoute;
    tryCreateFromJson(json: Json): OrderRoute | undefined;
}

/** @public */
export declare interface OrderRouteUiAction extends UiAction {
    readonly value: OrderRoute | undefined;
    readonly definedValue: OrderRoute;
    readonly allowedValues: readonly OrderRoute[];
    pushValue(value: OrderRoute | undefined): void;
    pushAllowedValues(value: readonly OrderRoute[]): void;
}

/** @public */
export declare type OrderSide = keyof typeof OrderSideEnum;

/** @public */
export declare const enum OrderSideEnum {
    Buy = "Buy",
    Sell = "Sell"
}

/** @public */
export declare type OrderSideHandle = Handle;

/** @public */
export declare interface OrderSideSvc {
    toName(id: OrderSide): string;
    fromName(name: string): OrderSide | undefined;
    toDisplay(id: OrderSide): string;
    toHandle(id: OrderSide): OrderSideHandle;
    fromHandle(handle: OrderSideHandle): OrderSide | undefined;
    handleToName(handle: OrderSideHandle): string;
    handleFromName(name: string): OrderSideHandle | undefined;
    handleToDisplay(handle: OrderSideHandle): string;
}

/** @public */
export declare type OrderTimeInForce = keyof typeof OrderTimeInForceEnum;

/** @public */
export declare const enum OrderTimeInForceEnum {
    UntilCancel = "UntilCancel",
    UntilExpiryDate = "UntilExpiryDate",
    Today = "Today",
    FillAndKill = "FillAndKill",
    FillOrKill = "FillOrKill",
    AllOrNone = "AllOrNone"
}

/** @public */
export declare type OrderTimeInForceHandle = Handle;

/** @public */
export declare interface OrderTimeInForceSvc {
    toName(id: OrderTimeInForce): string;
    fromName(name: string): OrderTimeInForce | undefined;
    toDisplay(id: OrderTimeInForce): string;
    toHandle(id: OrderTimeInForce): OrderTimeInForceHandle;
    fromHandle(handle: OrderTimeInForceHandle): OrderTimeInForce | undefined;
    handleToName(handle: OrderTimeInForceHandle): string;
    handleFromName(name: string): OrderTimeInForceHandle | undefined;
    handleToDisplay(handle: OrderTimeInForceHandle): string;
}

/** @public */
export declare type OrderType = keyof typeof OrderTypeEnum;

/** @public */
export declare const enum OrderTypeEnum {
    Limit = "Limit",
    Best = "Best",
    Market = "Market",
    MarketToLimit = "MarketToLimit"
}

/** @public */
export declare type OrderTypeHandle = Handle;

/** @public */
export declare interface OrderTypeSvc {
    toName(id: OrderType): string;
    fromName(name: string): OrderType | undefined;
    toDisplay(id: OrderType): string;
    isLimit(id: OrderType): boolean;
    toHandle(id: OrderType): OrderTypeHandle;
    fromHandle(handle: OrderTypeHandle): OrderType | undefined;
    handleToName(handle: OrderTypeHandle): string;
    handleFromName(name: string): OrderTypeHandle | undefined;
    handleToDisplay(handle: OrderTypeHandle): string;
    handleIsLimit(handle: OrderTypeHandle): boolean;
}

/** @public */
export declare type PublisherType = keyof typeof PublisherTypeEnum;

/** @public */
export declare namespace PublisherType {
    const builtin = "Builtin";
    const user = "User";
    const organisation = "Organisation";
}

/** @public */
export declare const enum PublisherTypeEnum {
    Builtin = "Builtin",
    User = "User",
    Organisation = "Organisation"
}

/** @public */
export declare interface RepeatableExactHistorySequencer extends HistorySequencer {
    readonly pointList: RepeatableExactHistorySequencer.PointList;
}

/** @public */
export declare namespace RepeatableExactHistorySequencer {
    export interface Point extends HistorySequencer.Point {
        dateTimeRepeatIndex: Integer;
    }
    export interface PointList extends ComparableList<Point> {
        findPoint(dateTime: Date, dateTimeRepeatIndex: Integer, suggestedIndex: Integer): ComparableList.BinarySearchResult;
    }
    export namespace PointList {
        export interface SearchPoint {
            utcDate: Date;
            readonly offset: Integer;
            readonly dateTimeRepeatIndex: Integer;
        }
    }
}

/** @public */
export declare interface RepeatableExactHistorySequenceSeries extends HistorySequenceSeries {
    readonly repeatableExactSequencer: RepeatableExactHistorySequencer;
    readonly sequencerPoints: RepeatableExactHistorySequencer.PointList;
}

/** @public */
export declare namespace RepeatableExactHistorySequenceSeries {
    export interface Point extends HistorySequenceSeries.Point {
    }
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare interface ResourcesSvc {
    setI18nStrings(value: string[]): void;
    clearI18nStrings(value: string[]): void;
}

/** @public */
export declare interface RoutedIvemId {
    readonly code: string;
    readonly exchangeId: ExchangeId;
    readonly ivemId: IvemId;
    readonly route: OrderRoute;
    readonly name: string;
    toJson(): Json;
}

/** @public */
export declare interface RoutedIvemIdParseDetails {
    readonly success: boolean;
    readonly routedIvemId: RoutedIvemId | undefined;
    readonly sourceIdExplicit: boolean;
    readonly orderRouteExplicit: boolean;
    readonly errorText: string;
    readonly parseText: string;
}

/** @public */
export declare interface RoutedIvemIdSelect extends RoutedIvemIdUiAction, ControlComponent {
}

/** @public */
export declare interface RoutedIvemIdSvc {
    create(code: string, exchangeId: ExchangeId, route: OrderRoute): RoutedIvemId;
    create(ivemId: IvemId, route: OrderRoute): RoutedIvemId;
    isEqual(left: RoutedIvemId, right: RoutedIvemId): boolean;
    isUndefinableEqual(left: RoutedIvemId | undefined, right: RoutedIvemId | undefined): boolean;
    tryCreateFromJson(json: Json): RoutedIvemId | undefined;
    tryCreateArrayFromJson(jsonArray: Json[]): RoutedIvemId[] | undefined;
}

/** @public */
export declare interface RoutedIvemIdUiAction extends UiAction {
    readonly value: RoutedIvemId | undefined;
    readonly definedValue: RoutedIvemId;
    readonly parseDetails: RoutedIvemIdParseDetails | undefined;
    pushValue(value: RoutedIvemId | undefined): void;
}

/** @public */
export declare interface SelfInfoSvc {
    readonly publisherType: PublisherType;
    readonly publisherName: string;
    readonly name: string;
    readonly version: string;
    readonly shortDescription: string;
    readonly longDescription: string;
}

/** @public */
export declare interface SequenceHistory {
    badnessChangeEventer: SequenceHistory.BadnessChangeEventHandler | undefined;
    readonly badness: Badness;
    readonly good: boolean;
    readonly usable: boolean;
    finalise(): void;
}

/** @public */
export declare namespace SequenceHistory {
    export type BadnessChangeEventHandler = (this: void) => void;
}

/** @public */
export declare interface SingleBrokerageAccountGroup extends BrokerageAccountGroup {
    readonly accountId: BrokerageAccountId;
}

/** @public */
export declare interface SourceTzOffsetDateTime {
    readonly utcDate: Date;
    readonly offset: Integer;
}

/** @public */
export declare namespace SourceTzOffsetDateTime {
    export const enum TimezoneModeEnum {
        Utc = "Utc",
        Local = "Local",
        Source = "Source"
    }
    export type TimezoneMode = keyof typeof TimezoneModeEnum;
}

/** @public */
export declare interface SourceTzOffsetDateTimeSvc {
    getTimezonedDate(value: SourceTzOffsetDateTime, adjustment: SourceTzOffsetDateTime.TimezoneMode): Date;
    createCopy(value: SourceTzOffsetDateTime): SourceTzOffsetDateTime;
    isEqual(left: SourceTzOffsetDateTime, right: SourceTzOffsetDateTime): boolean;
    isUndefinableEqual(left: SourceTzOffsetDateTime | undefined, right: SourceTzOffsetDateTime | undefined): boolean;
    compare(left: SourceTzOffsetDateTime, right: SourceTzOffsetDateTime): ComparisonResult;
    compareUndefinable(left: SourceTzOffsetDateTime | undefined, right: SourceTzOffsetDateTime | undefined, undefinedIsLowest: boolean): ComparisonResult;
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare interface StorageSvc {
    getItem(key: string): Promise<string | undefined>;
    getSubNamedItem(key: string, subName: string): Promise<string | undefined>;
    setItem(key: string, value: string): Promise<void>;
    setSubNamedItem(key: string, subName: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    removeSubNamedItem(key: string, subName: string): Promise<void>;
}

/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */
/** @public */
export declare type StringId = number;

/** @public */
export declare interface SymbolsSvc {
}

/** @public */
export declare interface SymbolSvc {
    readonly defaultDefaultExchangeId: ExchangeId;
    readonly allowedExchangeIds: readonly ExchangeId[];
    readonly allowedMarketIds: readonly MarketId[];
    readonly defaultExchangeId: ExchangeId;
    readonly exchangeAnnouncerChar: string;
    readonly marketSeparatorChar: string;
    readonly exchangeHideMode: SymbolSvc.ExchangeHideMode;
    readonly defaultMarketHidden: boolean;
    readonly marketCodeAsLocalWheneverPossible: boolean;
    parseLitIvemId(value: string): SymbolSvc.LitIvemIdParseDetails;
    parseRoutedIvemId(value: string): SymbolSvc.RoutedIvemIdParseDetails;
    parseIvemId(value: string): SymbolSvc.IvemIdParseDetails;
    litIvemIdToDisplay(litIvemId: LitIvemId | undefined): string;
    routedIvemIdToDisplay(routedIvemId: RoutedIvemId | undefined): string;
    routedIvemIdToNothingHiddenDisplay(routedIvemId: RoutedIvemId): string;
    ivemIdToDisplay(ivemId: IvemId | undefined): string;
    getBestLitIvemIdFromIvemId(ivemId: IvemId): LitIvemId;
    getBestLitIvemIdFromRoutedIvemId(routedIvemId: RoutedIvemId): LitIvemId;
    tryGetBestRoutedIvemIdFromLitIvemId(litIvemId: LitIvemId): RoutedIvemId | undefined;
    tryGetBestRoutedIvemIdFromIvemId(ivemId: IvemId): RoutedIvemId | undefined;
    subscribeAllowedMarketIdsChangedEvent(handler: SymbolSvc.AllowedMarketIdsChangedEventHandler): MultiEvent.SubscriptionId;
    unsubscribeAllowedMarketIdsChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    subscribeAllowedExchangeIdsChangedEvent(handler: SymbolSvc.AllowedExchangeIdsChangedEventHandler): MultiEvent.SubscriptionId;
    unsubscribeAllowedExchangeIdsChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
    unsubscribeAllEvents(): void;
}

/** @public */
export declare namespace SymbolSvc {
    export const enum ExchangeHideModeEnum {
        Never = "Never",
        Default = "Default",
        WheneverPossible = "WheneverPossible"
    }
    export type ExchangeHideMode = keyof typeof ExchangeHideModeEnum;
    export type AllowedMarketIdsChangedEventHandler = (this: void) => void;
    export type AllowedExchangeIdsChangedEventHandler = (this: void) => void;
    export interface LitIvemIdParseDetails {
        success: boolean;
        litIvemId: LitIvemId | undefined;
        exchangeExplicit: boolean;
        marketExplicit: boolean;
        errorText: string;
        value: string;
    }
    export interface IvemIdParseDetails {
        success: boolean;
        ivemId: IvemId | undefined;
        exchangeExplicit: boolean;
        errorText: string;
        value: string;
    }
    export interface RoutedIvemIdParseDetails {
        success: boolean;
        routedIvemId: RoutedIvemId | undefined;
        exchangeExplicit: boolean;
        orderRouteExplicit: boolean;
        errorText: string;
        value: string;
    }
}

/** @public */
export declare type TimeSpan = number;

/** @public */
export declare interface UiAction {
    readonly state: UiAction.State;
    readonly enabled: boolean;
    readonly edited: boolean;
    readonly editedValid: boolean;
    readonly editedInvalidErrorText: string | undefined;
    readonly inputtedText: string;
    readonly caption: string;
    readonly title: string;
    readonly placeholder: string;
    required: boolean;
    commitOnAnyValidInput: boolean;
    autoAcceptanceType: UiAction.AutoAcceptanceType;
    autoEchoCommit: boolean;
    autoInvalid: boolean;
    commitEventer: UiAction.CommitEventHandler | undefined;
    inputEventer: UiAction.InputEventHandler | undefined;
    signalEventer: UiAction.SignalEventHandler | undefined;
    editedChangeEventer: UiAction.EditedChangeEventHandler | undefined;
    pushState(newState: UiAction.State, stateTitleText?: string): void;
    pushDisabled(disabledTitleText?: string): void;
    pushReadonly(): void;
    pushInvalid(invalidTitleText?: string): void;
    pushValid(titleText?: string): void;
    pushAccepted(value?: boolean): void;
    pushWaiting(waitingTitleText?: string): void;
    pushWarning(warningTitleText?: string): void;
    pushError(errorTitleText?: string): void;
    pushCaption(value: string): void;
    pushTitle(value: string): void;
    pushPlaceholder(value: string): void;
    cancelEdit(): void;
    isValueOk(): boolean;
}

/** @public */
export declare namespace UiAction {
    export type CommitEventHandler = (this: void, type: UiAction.CommitType) => void;
    export type InputEventHandler = (this: void) => void;
    export type SignalEventHandler = (this: void, signalType: SignalType, downKeys: DownKeys) => void;
    export type EditedChangeEventHandler = (this: void) => void;
    export const enum StateEnum {
        Disabled = "Disabled",
        Readonly = "Readonly",
        Missing = "Missing",
        Invalid = "Invalid",
        Valid = "Valid",
        Accepted = "Accepted",
        Waiting = "Waiting",
        Warning = "Warning",
        Error = "Error"
    }
    export type State = keyof typeof StateEnum;
    export const enum CommitTypeEnum {
        Implicit = "Implicit",
        Explicit = "Explicit",
        Input = "Input"
    }
    export type CommitType = keyof typeof CommitTypeEnum;
    export const enum SignalTypeEnum {
        MouseClick = "MouseClick",
        EnterKeyPress = "EnterKeyPress",
        SpacebarKeyPress = "SpacebarKeyPress"
    }
    export type SignalType = keyof typeof SignalTypeEnum;
    export const enum DownKeyEnum {
        Alt = "Alt",
        Ctrl = "Ctrl",
        Meta = "Meta",
        Shift = "Shift"
    }
    export type DownKey = keyof typeof DownKeyEnum;
    export type DownKeys = DownKey[];
    export const enum AutoAcceptanceTypeEnum {
        None = "None",
        Valid = "Valid",
        Accepted = "Accepted"
    }
    export type AutoAcceptanceType = keyof typeof AutoAcceptanceTypeEnum;
}

/** @public */
export declare interface WorkspaceSvc {
    readonly localDesktop: LocalDesktop;
    localDesktopLoadedEventer: WorkspaceSvc.LocalDesktopLoadedEventHandler;
    getLoadedLocalDesktop(): Promise<LocalDesktop | undefined>;
}

/** @public */
export declare namespace WorkspaceSvc {
    export type LocalDesktopLoadedEventHandler = (this: void) => void;
}

export { }
