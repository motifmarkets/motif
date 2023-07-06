/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    AdiService,
    AssertInternalError,
    AurcChangeTypeId,
    BooleanUiAction,
    CommandRegisterService,
    ComparisonResult,
    ExchangeId,
    ExchangeInfo,
    IconButtonUiAction,
    Integer,
    InternalCommand,
    LitIvemDetail,
    LitIvemId,
    LitIvemIdUiAction,
    MarketId,
    MarketInfo,
    MultiEvent,
    SearchSymbolsDataDefinition,
    StringId,
    Strings,
    SymbolDetailCacheService,
    SymbolsDataItem,
    SymbolsDataMessage,
    SymbolsService,
    UiAction,
    compareString,
    getErrorMessage
} from '@motifmarkets/motif-core';
import { NgSelectComponent } from '@ng-select/ng-select';
import {
    AdiNgService,
    CommandRegisterNgService,
    SettingsNgService,
    SymbolDetailCacheNgService,
    SymbolsNgService
} from 'component-services-ng-api';
import { Observable, Observer, Subject, Unsubscribable, distinctUntilChanged, map, merge, of, switchAll, tap } from 'rxjs';
import { SvgButtonNgComponent } from '../../../boolean/ng-api';
import { NgSelectUtils } from '../../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { NgSelectOverlayNgService } from '../../../ng/ng-select-overlay-ng.service';

@Component({
    selector: 'app-lit-ivem-id-select',
    templateUrl: './lit-ivem-id-select-ng.component.html',
    styleUrls: ['./lit-ivem-id-select-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class LitIvemIdSelectNgComponent extends ControlComponentBaseNgDirective implements OnInit {
    @Input() inputId: string;

    @ViewChild('ngSelect', { static: true }) private _ngSelectComponent: NgSelectComponent;
    @ViewChild('searchTermNotExchangedMarketProcessedToggleButton', { static: true })
        private _searchTermNotExchangedMarketProcessedToggleButtonComponent: SvgButtonNgComponent;

    public symbol = LitIvemIdSelectNgComponent.emptySymbol;

    // Compilation fails with public items: Observable<LitIvemIdSelectComponent.Item[]>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public items: Observable<any>;
    public loading = false;
    public typeahead = new Subject<string>();
    public selected: LitIvemIdSelectNgComponent.Item | null;
    public minCodeLength = 2;

    private readonly _adiService: AdiService;
    private readonly _symbolsService: SymbolsService;
    private readonly _symbolDetailCacheService: SymbolDetailCacheService;
    private readonly _searchTermNotExchangedMarketProcessedToggleUiAction: BooleanUiAction;

    private _pushLitivemidEventsSubscriptionId: MultiEvent.SubscriptionId;

    private _applyValueTransactionId = 0;
    private _nextSearchNumber = 1;
    private _debounceDelayingCount = 0;
    private _queryRunningCount = 0;
    private _selectedObservable = new LitIvemIdSelectNgComponent.SelectedObservable();

    private _measureCanvasContextsEventSubscriptionId: MultiEvent.SubscriptionId;
    private _measureCanvasContext: CanvasRenderingContext2D;
    private _measureBoldCanvasContext: CanvasRenderingContext2D;

    constructor(
        cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        private _ngSelectOverlayNgService: NgSelectOverlayNgService,
        settingsNgService: SettingsNgService,
        adiNgService: AdiNgService,
        symbolsNgService: SymbolsNgService,
        symbolDetailCacheNgService: SymbolDetailCacheNgService,
    ) {
        super(
            cdr,
            settingsNgService.service,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray
        );
        this._adiService = adiNgService.service;
        this._symbolsService = symbolsNgService.service;
        this._symbolDetailCacheService = symbolDetailCacheNgService.service;
        this.inputId = 'LitIvemIdInput' + this.componentInstanceId;
        this._searchTermNotExchangedMarketProcessedToggleUiAction =
            this.createSearchTermNotExchangedMarketProcessedToggleUiAction(commandRegisterNgService.service);
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureBoldCanvasContext = this._ngSelectOverlayNgService.measureBoldCanvasContext;
        this._measureCanvasContextsEventSubscriptionId = this._ngSelectOverlayNgService.subscribeMeasureCanvasContextsEvent(
            () => this.handleMeasureCanvasContextsEvent()
        );
    }

    override get uiAction() { return super.uiAction as LitIvemIdUiAction; }

    ngOnInit() {
        this.startSearchProcessor();
        this._searchTermNotExchangedMarketProcessedToggleButtonComponent.initialise(
            this._searchTermNotExchangedMarketProcessedToggleUiAction
        );
        this.setInitialiseReady();
    }

    focus() {
        // this does not work.  needs further investigation
        // const element = this._renderer.selectRootElement('symbolInput');
        // element.focus();
    }

    public generateTitle(item: LitIvemIdSelectNgComponent.Item, nameIncluded: boolean) {
        const detail = item.detail;
        if (detail === undefined) {
            return `<${Strings[StringId.FetchingSymbolDetails]}>`;
        } else {
            if (item.exists !== true) {
                return `<${Strings[StringId.SymbolNotFound]}>`;
            } else {
                let tradingMarketsText: string;
                const tradingMarketIds = detail.tradingMarketIds;
                const count = tradingMarketIds.length;
                switch (count) {
                    case 0: {
                        tradingMarketsText = LitIvemIdSelectNgComponent.noneTradingMarketsText;
                        break;
                    }
                    case 1: {
                        tradingMarketsText = MarketInfo.idToDisplay(tradingMarketIds[0]);
                        break;
                    }
                    default: {
                        const tradingMarketDisplays = new Array<string>(count);
                        for (let i = 0; i < count; i++) {
                            tradingMarketDisplays[i] = MarketInfo.idToDisplay(tradingMarketIds[i]);
                        }
                        tradingMarketsText = tradingMarketDisplays.join(',');
                    }
                }

                let result = `${Strings[StringId.Market]}: ${MarketInfo.idToDisplay(detail.marketId)}\n` +
                    `${Strings[StringId.Exchange]}: ${ExchangeInfo.idToAbbreviatedDisplay(detail.exchangeId)}\n` +
                    `${Strings[StringId.Trading]}: ${tradingMarketsText}`;

                if (nameIncluded) {
                    const name = this._symbolsService.calculateSymbolNameFromLitIvemDetail(detail);
                    result = `${name}\n${result}`;
                }

                return result;
            }
        }
    }

    getItemDetailName(item: LitIvemIdSelectNgComponent.Item) {
        const detail = item.detail;
        return detail === undefined ? '' : this._symbolsService.calculateSymbolNameFromLitIvemDetail(detail).trim();
    }

    public handleSelectChangeEvent(event: unknown) {
        const changeEvent = event as LitIvemIdSelectNgComponent.ChangeEvent;
        if (changeEvent !== undefined && changeEvent !== null) {
            const parseDetails: SymbolsService.LitIvemIdParseDetails = {
                success: true,
                litIvemId: changeEvent.litIvemId,
                isRic: false,
                sourceIdExplicit: false,
                marketIdExplicit: false,
                errorText: '',
                value: '',
            };

            const detail = changeEvent.detail;
            if (detail !== undefined) {
                this._symbolDetailCacheService.setLitIvemId(detail);
            }
            this.commitValue(parseDetails, UiAction.CommitTypeId.Explicit);
        } else {
            // if (!this.uiAction.required) {
            //     this.commitValue(undefined, UiAction.CommitTypeId.Explicit);
            // }
        }
    }

    public handleSelectOpenEvent() {
        this._ngSelectOverlayNgService.notifyDropDownOpen();

        const list = this._ngSelectComponent.itemsList;
        const ngOptions = list.items;
        const count = ngOptions.length;
        const items = new Array<LitIvemIdSelectNgComponent.Item>(count);
        for (let i = 0; i < count; i++) {
            const ngOption = ngOptions[i];
            items[i] = ngOption.value as LitIvemIdSelectNgComponent.Item;
        }
        this.updateNgSelectWidthsFromItems(items, false);
    }

    public trackByFn(item: LitIvemIdSelectNgComponent.Item) {
        return item.litIvemId.mapKey;
    }

    protected override pushSettings() {
        super.pushSettings();
        this.applyValueWithoutWait(this.uiAction.value, this.uiAction.edited, false);
    }

    protected override setUiAction(action: LitIvemIdUiAction) {
        super.setUiAction(action);

        const pushEventHandlersInterface: LitIvemIdUiAction.PushEventHandlersInterface = {
            value: (value, edited, selectAll) =>
                this.handleValuePushEvent(value, edited, selectAll),
        };
        this._pushLitivemidEventsSubscriptionId = this.uiAction.subscribePushEvents(
            pushEventHandlersInterface
        );

        this.applyValueWithoutWait(action.value, action.edited);
    }

    protected override finalise() {
        this._searchTermNotExchangedMarketProcessedToggleUiAction.finalise();

        this._ngSelectOverlayNgService.unsubscribeMeasureCanvasContextsEvent(
            this._measureCanvasContextsEventSubscriptionId
        );
        this.uiAction.unsubscribePushEvents(
            this._pushLitivemidEventsSubscriptionId
        );
        super.finalise();
    }

    protected override setStateColors(stateId: UiAction.StateId) {
        super.setStateColors(stateId);

        NgSelectUtils.ApplyColors(this._ngSelectComponent.element, this.foreColor, this.bkgdColor);
    }

    private handleMeasureCanvasContextsEvent() {
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureBoldCanvasContext = this._ngSelectOverlayNgService.measureBoldCanvasContext;
    }

    private calculateNgSelectWidths(items: LitIvemIdSelectNgComponent.Item[]) {
        let maxBoldIdWidth = 0;
        let maxNameWidth = 0;
        const count = items.length;
        for (let i = 0; i < count; i++) {
            const item = items[i];
            const id = item.idDisplay;
            const boldIdMetrics = this._measureBoldCanvasContext.measureText(id);
            if (boldIdMetrics.width > maxBoldIdWidth) {
                maxBoldIdWidth = boldIdMetrics.width;
            }
            if (item.detail !== undefined) {
                const name = this._symbolsService.calculateSymbolNameFromLitIvemDetail(item.detail);
                const nameMetrics = this._measureCanvasContext.measureText(name);
                if (nameMetrics.width > maxNameWidth) {
                    maxNameWidth = nameMetrics.width;
                }
            }
        }
        const spaceMetrics = this._measureCanvasContext.measureText(' ');
        const firstColumnRightPaddingWidth = Math.ceil(2 * spaceMetrics.width);
        const firstColumnWidth = firstColumnRightPaddingWidth + Math.ceil(maxBoldIdWidth);

        let dropDownPanelWidth = firstColumnWidth + Math.ceil(maxNameWidth) + 2 * NgSelectUtils.ngOptionLeftRightPadding;
        const componentWidth = this._ngSelectComponent.element.clientWidth;
        if (dropDownPanelWidth < componentWidth) {
            dropDownPanelWidth = componentWidth;
        }
        const ngSelectWidths: LitIvemIdSelectNgComponent.NgSelectWidths = {
            firstColumn: firstColumnWidth,
            dropDownPanel: dropDownPanelWidth,
        };

        return ngSelectWidths;
    }

    private handleValuePushEvent(value: LitIvemId | undefined, edited: boolean, selectAll: boolean) {
        this.applyValueWithoutWait(value, edited, selectAll);
    }

    private handleSearchTermNotExchangedMarketProcessedToggleUiActionSignal() {
        const toggledValue = !this._searchTermNotExchangedMarketProcessedToggleUiAction.definedValue;
        this._searchTermNotExchangedMarketProcessedToggleUiAction.pushValue(toggledValue);
    }

    private startSearchProcessor() {
        const searchItemsObservable = this.typeahead.pipe<
            LitIvemIdSelectNgComponent.ParsedSearchTerm,
            LitIvemIdSelectNgComponent.ParsedSearchTerm,
            Observable<LitIvemIdSelectNgComponent.Item[]>,
            Observable<LitIvemIdSelectNgComponent.Item[]>
        >(
            map<string | null, LitIvemIdSelectNgComponent.ParsedSearchTerm>((term) => this.createParsedSearchTerm(term)),
            distinctUntilChanged<LitIvemIdSelectNgComponent.ParsedSearchTerm>(
                (prev, curr) => LitIvemIdSelectNgComponent.ParsedSearchTerm.isEqual(prev, curr)
            ),
            // debounceTime(800),
            map<LitIvemIdSelectNgComponent.ParsedSearchTerm, Observable<LitIvemIdSelectNgComponent.Item[]>>(
                (parsedTerm) => new LitIvemIdSelectNgComponent.ItemArrayObservable(
                    this._adiService,
                    this._symbolsService,
                    this._symbolDetailCacheService,
                    parsedTerm,
                    800,
                    (start) => this.handleQueryStartFinishEvent(start),
                    (start) => this.handleDebounceDelayStartFinishEvent(start)
                )
            ),
            tap<Observable<LitIvemIdSelectNgComponent.Item[]>>(() => { this._nextSearchNumber++; }) // this needs to be reviewed
        );

        this.items = merge<Observable<LitIvemIdSelectNgComponent.Item[]>[]>(searchItemsObservable, this._selectedObservable).pipe(
            switchAll(),
            tap<LitIvemIdSelectNgComponent.Item[]>((itemArray) => this.updateNgSelectWidthsFromItems(itemArray, true))
        );
    }

    private createSearchTermNotExchangedMarketProcessedToggleUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.LitIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed;
        const displayId = StringId.ToggleSearchTermNotExchangedMarketProcessedCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSearchTermNotExchangedMarketProcessedTitle]);
        action.pushIcon(IconButtonUiAction.IconId.ToggleSearchTermNotExchangedMarketProcessed);
        action.pushUnselected();
        action.signalEvent = () => this.handleSearchTermNotExchangedMarketProcessedToggleUiActionSignal();
        return action;
    }

    private setNotFoundText(value: string) {
        if (value !== this._ngSelectComponent.notFoundText) {
            this._ngSelectComponent.notFoundText = value;
        }
    }

    private checkSetNotFoundTextToSymbolSearchRequiresCodeWithAtLeast(searchable: boolean) {
        if (!searchable) {
            this.setNotFoundText(`${Strings[StringId.SearchRequiresAtLeast]} ` +
                `${this.minCodeLength} ${Strings[StringId.Characters]}`);
        }
    }

    private createParsedSearchTerm(term: string | null): LitIvemIdSelectNgComponent.ParsedSearchTerm {
        let result: LitIvemIdSelectNgComponent.ParsedSearchTerm;
        if (term === null) {
            result = {
                searchNumber: this._nextSearchNumber,
                searchable: false,
                codeOrName: '',
                exchangeId: undefined,
                marketId: undefined,
            };
            this.checkSetNotFoundTextToSymbolSearchRequiresCodeWithAtLeast(result.searchable);
        } else {
            if (this._searchTermNotExchangedMarketProcessedToggleUiAction.value) {
                result = {
                    searchNumber: this._nextSearchNumber,
                    searchable: term.length >= this.minCodeLength,
                    codeOrName: term,
                    exchangeId: undefined,
                    marketId: undefined,
                };
                this.checkSetNotFoundTextToSymbolSearchRequiresCodeWithAtLeast(result.searchable);
            } else {
                const parseDetails = this._symbolsService.parseLitIvemId(term);
                if (!parseDetails.success || parseDetails.litIvemId === undefined) {
                    result = {
                        searchNumber: this._nextSearchNumber,
                        searchable: false,
                        codeOrName: term,
                        exchangeId: undefined,
                        marketId: undefined,
                    };
                    this.setNotFoundText(Strings[StringId.InvalidSymbol]);
                } else {
                    const code = parseDetails.litIvemId.code;
                    result = {
                        searchNumber: this._nextSearchNumber,
                        searchable: code.length >= this.minCodeLength,
                        codeOrName: code,
                        exchangeId: parseDetails.sourceIdExplicit ? parseDetails.litIvemId.exchangeId : undefined,
                        marketId: parseDetails.marketIdExplicit ? parseDetails.litIvemId.litId : undefined,
                    };
                    this.checkSetNotFoundTextToSymbolSearchRequiresCodeWithAtLeast(result.searchable);
                }
            }
        }

        return result;
    }

    private updateNgSelectWidthsFromItems(items: LitIvemIdSelectNgComponent.Item[], widenOnly: boolean) {
        const widths = this.calculateNgSelectWidths(items);

        this._ngSelectOverlayNgService.setDropDownPanelClientWidth(widths.dropDownPanel, widenOnly);
        this._ngSelectOverlayNgService.setFirstColumnWidth(widths.firstColumn, widenOnly);
    }

    private applyValueWithoutWait(value: LitIvemId | undefined, edited: boolean, selectAll = true) {
        const applyPromise = this.applyValue(value, edited, selectAll);
        applyPromise.then(
            () => {/**/},
            (error) => { throw AssertInternalError.createIfNotError(error, 'RIISNCIAOSF34344'); }
        )
    }

    private async applyValue(value: LitIvemId | undefined, edited: boolean, selectAll: boolean) {
        if (!edited) {
            const applyValueTransactionId = ++this._applyValueTransactionId;
            let selected: LitIvemIdSelectNgComponent.Item | null;
            if (value === undefined) {
                selected = null;
            } else {
                const cachedDetail = await this._symbolDetailCacheService.getLitIvemId(value);
                if (cachedDetail === undefined) {
                    selected = null;
                } else {
                    selected = LitIvemIdSelectNgComponent.createItemFromCacheDetail(value, cachedDetail, this._symbolsService);
                }
            }

            if (applyValueTransactionId === this._applyValueTransactionId) {
                if (selected !== this.selected) {
                    this._ngSelectComponent.searchTerm = '';
                    this._selectedObservable.setSelected(selected);
                    this.selected = selected;
                    this.markForCheck();
                }

                if (selectAll) {
                    //                delay1Tick(() => this.selectAllText() );
                }
            }
        }
    }

    private commitValue(parseDetails: SymbolsService.LitIvemIdParseDetails, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(parseDetails, typeId);
    }

    // private selectAllText() {
    //     (this.symbolInput.nativeElement as HTMLInputElement).select();
    // }

    private handleDebounceDelayStartFinishEvent(start: boolean) {
        // give priority to queryRunning
        if (start) {
            if (this._debounceDelayingCount++ === 0) {
                if (this._queryRunningCount === 0) {
                    this._ngSelectComponent.notFoundText = Strings[StringId.TypingPauseWaiting];
                }
            }
        } else {
            if (--this._debounceDelayingCount === 0) {
                if (this._queryRunningCount === 0) {
                    this._ngSelectComponent.notFoundText = Strings[StringId.NoMatchingSymbolsOrNamesFound];
                }
            }
        }
    }

    private handleQueryStartFinishEvent(start: boolean) {
        if (start) {
            if (this._queryRunningCount++ === 0) {
                this.loading = true;
                this._ngSelectComponent.notFoundText = Strings[StringId.NoMatchingSymbolsOrNamesFound];
            }
        } else {
            if (--this._queryRunningCount === 0) {
                this.loading = false;
                if (this._debounceDelayingCount > 0) {
                    this._ngSelectComponent.notFoundText = Strings[StringId.TypingPauseWaiting];
                }
            }
        }
    }
}

export namespace LitIvemIdSelectNgComponent {
    export const emptySymbol = '';
    export const noneTradingMarketsText = `<${Strings[StringId.None]}>`;

    export interface Item {
        exists: boolean | undefined;
        detail: LitIvemDetail | undefined;
        litIvemId: LitIvemId;
        idDisplay: string;
    }

    export interface ParsedSearchTerm {
        searchNumber: Integer;
        searchable: boolean;
        codeOrName: string;
        exchangeId: ExchangeId | undefined;
        marketId: MarketId | undefined;
    }

    export namespace ParsedSearchTerm {
        export function isEqual(left: ParsedSearchTerm, right: ParsedSearchTerm) {
            return left.searchNumber === right.searchNumber &&
                left.codeOrName === right.codeOrName &&
                left.exchangeId === right.exchangeId &&
                left.marketId === right.marketId;
        }
    }

    export type ChangeEvent = Item | undefined | null;

    export interface NgSelectWidths {
        dropDownPanel: number;
        firstColumn: number;
    }

    export function createLitIvemDetailFromCacheDetail(
        litIvemId: LitIvemId,
        cacheDetail: SymbolDetailCacheService.LitIvemIdDetail,
        symbolsService: SymbolsService,
    ) {
        const exists = cacheDetail.exists;
        let name: string;
        if (exists) {
            name = symbolsService.calculateSymbolName(
                cacheDetail.exchangeId,
                cacheDetail.name,
                cacheDetail.litIvemId.code,
                cacheDetail.alternateCodes
            );
        } else {
            name = `<${Strings[StringId.SymbolNotFound]}>`;
        }
        // should be AddUpdateChange - review when AddUpdateChange includes AlternateCodes
        const addUpdateChange: SymbolsDataMessage.AddChange = {
            typeId: AurcChangeTypeId.Add,
            litIvemId,
            ivemClassId: cacheDetail.ivemClassId,
            subscriptionDataIds: cacheDetail.subscriptionDataIds,
            tradingMarketIds: cacheDetail.tradingMarketIds,
            name,
            exchangeId: cacheDetail.exchangeId,
            alternateCodes: cacheDetail.alternateCodes,
            cfi: undefined,
            depthDirectionId: undefined,
            isIndex: undefined,
            expiryDate: undefined,
            strikePrice: undefined,
            exerciseTypeId: undefined,
            callOrPutId: undefined,
            contractSize: undefined,
            lotSize: undefined,
            attributes: undefined,
            tmcLegs: undefined,
            categories: undefined,
        };

        return new LitIvemDetail(addUpdateChange);
    }

    export function createItemFromCacheDetail(litIvemId: LitIvemId,
        cacheDetail: SymbolDetailCacheService.LitIvemIdDetail,
        symbolsService: SymbolsService
    ) {
        const litIvemDetail = createLitIvemDetailFromCacheDetail(litIvemId, cacheDetail, symbolsService);
        const item: Item = {
            exists: cacheDetail.exists,
            detail: litIvemDetail,
            litIvemId,
            idDisplay: symbolsService.litIvemIdToDisplay(litIvemId),
        };

        return item;
    }

    export class ItemArrayObservable extends Observable<Item[]> {
        private _dataItem: SymbolsDataItem | undefined;
        private _dataItemCorrectnessChangeSubcriptionId: MultiEvent.SubscriptionId;
        private _observer: Observer<Item[]>;
        private _termLitIvemIdFetching = false;
        private _searchDelaySetTimeoutHandle: ReturnType<typeof setTimeout> | undefined;
        private _termItem: Item | undefined;
        private _searchItems: Item[] | undefined;

        constructor(
            private readonly _adiService: AdiService,
            private readonly _symbolsService: SymbolsService,
            private readonly _symbolDetailCacheService: SymbolDetailCacheService,
            private readonly _term: ParsedSearchTerm,
            private readonly _searchDelay: Integer,
            private readonly _queryStartFinishEventHandler: (this: void, start: boolean) => void,
            private readonly _debounceDelayStartFinishEventHandler: (this: void, start: boolean) => void
        ) {
            super((observer) => this.subscribeFtn(observer));
        }

        private dispose() {
            this.checkUnsubscribeDataItem();
            if (this._termLitIvemIdFetching) {
                this._termLitIvemIdFetching = false;
            }
            if (this._searchDelaySetTimeoutHandle !== undefined) {
                clearTimeout(this._searchDelaySetTimeoutHandle);
                this._searchDelaySetTimeoutHandle = undefined;
                this._debounceDelayStartFinishEventHandler(false);
            }
        }

        private subscribeFtn(observer: Observer<Item[]>) {
            this._observer = observer;

            const codeOrName = this._term.codeOrName;
            const exchangeId = this._term.exchangeId;
            const marketId = this._term.marketId;

            const termLitIvemId = this._symbolsService.tryCreateValidLitIvemId(codeOrName, exchangeId, marketId);
            if (termLitIvemId === undefined) {
                this.emitItems();
            } else {
                const cachedDetail = this._symbolDetailCacheService.getLitIvemIdFromCache(termLitIvemId);
                let exists: boolean | undefined;
                let detail: LitIvemDetail | undefined;
                if (cachedDetail === undefined) {
                    exists = undefined;
                    detail = undefined;
                } else {
                    exists = cachedDetail.exists;
                    detail = createLitIvemDetailFromCacheDetail(termLitIvemId, cachedDetail, this._symbolsService);
                }

                this._termItem = {
                    exists,
                    detail,
                    litIvemId: termLitIvemId,
                    idDisplay: this._symbolsService.litIvemIdToDisplay(termLitIvemId),
                };

                this.emitItems();

                if (detail === undefined) {
                    const fetchTermDetailAndEmitPromise = this.fetchTermDetailAndEmit(termLitIvemId);
                    fetchTermDetailAndEmitPromise.then(
                        () => {/**/},
                        (error) => { throw new AssertInternalError('LIISNCIAOSF34344', getErrorMessage(error)); }
                    )
                }
            }

            if (this._term.searchable) {
                this._debounceDelayStartFinishEventHandler(true);
                this._searchDelaySetTimeoutHandle = setTimeout(() => this.initiateSearch(), this._searchDelay);
            } else {
                if (!this._termLitIvemIdFetching) {
                    this.complete();
                }
            }

            const result: Unsubscribable = {
                unsubscribe: () => this.dispose()
            };
            return result;
        }

        private complete() {
            this.dispose(); // probably not necessary as observer will teardown as well
            this._observer.complete();
        }

        private async fetchTermDetailAndEmit(litIvemId: LitIvemId) {
            this._termLitIvemIdFetching = true;
            const cachedDetail = await this._symbolDetailCacheService.getLitIvemId(litIvemId);
            this._termLitIvemIdFetching = false;
            if (cachedDetail !== undefined) {
                this._termItem = LitIvemIdSelectNgComponent.createItemFromCacheDetail(litIvemId, cachedDetail, this._symbolsService);
                this.emitItems();
            }

            if (this._searchDelaySetTimeoutHandle === undefined) {
                this.complete();
            }
        }

        private initiateSearch() {
            this._searchDelaySetTimeoutHandle = undefined;
            this._debounceDelayStartFinishEventHandler(false);
            this._queryStartFinishEventHandler(true);

            const exchangeId = this._term.exchangeId;
            const fieldIds = this._symbolsService.calculateSymbolSearchFieldIds(exchangeId);

            const condition: SearchSymbolsDataDefinition.Condition = {
                text: this._term.codeOrName,
                fieldIds,
                isCaseSensitive: false,
            };

            const definition = new SearchSymbolsDataDefinition();
            definition.conditions = [condition];
            definition.exchangeId = exchangeId;
            definition.marketIds = this._term.marketId === undefined ? undefined : [this._term.marketId];
            definition.fullSymbol = true; // AlternateCodesFix: should be false
            definition.count = 100;
            this._dataItem = this._adiService.subscribe(definition) as SymbolsDataItem;
            if (this._dataItem.incubated) {
                this.processDataItemIncubated(this._dataItem);
            } else {
                this._dataItemCorrectnessChangeSubcriptionId = this._dataItem.subscribeCorrectnessChangedEvent(
                    () => this.handleDataItemCorrectnessChange()
                );
            }
        }

        private handleDataItemCorrectnessChange() {
            if (this._dataItem === undefined) {
                throw new AssertInternalError('LIISCIAOHDICC19966434');
            } else {
                if (this._dataItem.incubated) {
                    this.processDataItemIncubated(this._dataItem);
                }
            }
        }

        private checkUnsubscribeDataItem() {
            if (this._dataItem !== undefined) {
                this._dataItem.unsubscribeCorrectnessChangedEvent(this._dataItemCorrectnessChangeSubcriptionId);
                this._dataItemCorrectnessChangeSubcriptionId = undefined;
                this._adiService.unsubscribe(this._dataItem);
                this._dataItem = undefined;
                this._queryStartFinishEventHandler(false);
            }
        }

        private processDataItemIncubated(dataItem: SymbolsDataItem) {
            if (dataItem.usable) {
                const records = dataItem.records;
                const count = records.length;
                const items = new Array<Item>(count);
                for (let i = 0; i < count; i++) {
                    const record = records[i];
                    const litIvemId = record.litIvemId;
                    const item: Item = {
                        exists: true,
                        detail: record,
                        litIvemId,
                        idDisplay: this._symbolsService.litIvemIdToDisplay(litIvemId)
                    };
                    items[i] = item;
                }

                const priorityExchangeId = this._term.exchangeId ?? this._symbolsService.defaultExchangeId;

                items.sort((left, right) => {
                    const leftRoutedIvemId = left.litIvemId;
                    const leftIvemId = leftRoutedIvemId.ivemId;
                    const rightRoutedIvemId = right.litIvemId;
                    const rightIvemId = rightRoutedIvemId.ivemId;
                    let result = ExchangeInfo.priorityCompareId(leftIvemId.exchangeId, rightIvemId.exchangeId, priorityExchangeId);
                    if (result === ComparisonResult.LeftEqualsRight) {
                        result = compareString(leftIvemId.code, rightIvemId.code);
                        if (result === ComparisonResult.LeftEqualsRight) {
                            result = MarketInfo.compareDisplayPriority(leftRoutedIvemId.litId, rightRoutedIvemId.litId);
                        }
                    }
                    return result;
                });

                this._searchItems = items;
                this.emitItems();
            }

            this.checkUnsubscribeDataItem();

            if (!this._termLitIvemIdFetching) {
                this.complete();
            }
        }

        private emitItems() {
            const termItem = this._termItem;
            const searchItems = this._searchItems;
            if (termItem === undefined) {
                if (searchItems !== undefined) {
                    this._observer.next(searchItems);
                } else {
                    this._observer.next([]);
                }
            } else {
                if (searchItems === undefined) {
                    this._observer.next([termItem]);
                } else {
                    const searchItemCount = searchItems.length;
                    if (searchItemCount === 0) {
                        this._observer.next([termItem]);
                    } else {
                        const termLitIvemId = termItem.litIvemId;
                        if (LitIvemId.isUndefinableEqual(termLitIvemId, searchItems[0].litIvemId)) {
                            this._observer.next(searchItems);
                        } else {
                            const combinedItems = new Array<Item>(searchItemCount + 1);
                            combinedItems[0] = termItem;
                            combinedItems[1] = searchItems[0];
                            let count = 2;
                            for (let i = 1; i < searchItemCount; i++) {
                                const searchItem = searchItems[i];
                                if (!LitIvemId.isUndefinableEqual(termLitIvemId, searchItem.litIvemId)) {
                                    combinedItems[count++] = searchItem;
                                }
                            }
                            combinedItems.length = count;
                            this._observer.next(combinedItems);
                        }
                    }
                }
            }
        }
    }

    export class SelectedObservable extends Observable<Observable<Item[]>> {
        private _observer: Observer<Observable<Item[]>> | undefined;
        private _selected: Item | null;

        constructor() {
            super((observer) => this.subscribeFtn(observer));
        }

        setSelected(value: Item | null) {
            this._selected = value;
            if (this._observer !== undefined) {
                if (this._selected !== null) {
                    this._observer.next(of([this._selected]));
                } else {
                    this._observer.next(of([]));
                }
            }
        }

        private dispose() {
            // nothing to dispose
        }

        private subscribeFtn(observer: Observer<Observable<Item[]>>) {
            this._observer = observer;
            const result: Unsubscribable = {
                unsubscribe: () => this.dispose()
            };
            return result;
        }
    }
}
