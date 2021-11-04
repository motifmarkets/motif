/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { merge, Observable, Observer, of, Subject, Unsubscribable } from 'rxjs';
import { distinctUntilChanged, map, switchAll, tap } from 'rxjs/operators';
import {
    AdiService,
    ExchangeId,
    ExchangeInfo,
    IvemId,
    MarketId,
    MarketOrderRoute,
    OrderRoute,
    RoutedIvemId,
    SearchSymbolsDataDefinition,
    SymbolsDataItem
} from 'src/adi/internal-api';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'src/component-services/ng-api';
import {
    BooleanUiAction,
    CommandRegisterService,
    IconButtonUiAction,
    InternalCommand,
    SymbolDetailCache,
    symbolDetailCache,
    SymbolsService,
    UiAction
} from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import {
    addToGrow15ArrayUniquely,
    AssertInternalError,
    compareString,
    ComparisonResult,
    Integer,
    MultiEvent,
    numberToPixels,
    UnreachableCaseError
} from 'src/sys/internal-api';
import { SvgButtonNgComponent } from '../../../boolean/ng-api';
import { NgSelectUtils } from '../../../ng-select-utils';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { NgSelectOverlayNgService } from '../../../ng/ng-select-overlay-ng.service';
import { RoutedIvemIdComponentBaseNgDirective } from '../../ng/routed-ivem-id-component-base-ng.directive';

@Component({
    selector: 'app-routed-ivem-id-select',
    templateUrl: './routed-ivem-id-select-ng.component.html',
    styleUrls: ['./routed-ivem-id-select-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class RoutedIvemIdSelectNgComponent extends RoutedIvemIdComponentBaseNgDirective implements OnInit {
    @Input() inputId: string;

    @ViewChild('ngSelect', { static: true }) private _ngSelectComponent: NgSelectComponent;
    @ViewChild('searchTermNotExchangedMarketProcessedToggleButton', { static: true })
        private _searchTermNotExchangedMarketProcessedToggleButtonComponent: SvgButtonNgComponent;

    // Compilation fails with public items: Observable<LitIvemIdSelectComponent.Item[]>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public items: Observable<any>;
    public loading = false;
    public typeahead = new Subject<string>();
    public selected: RoutedIvemIdSelectNgComponent.Item | null;
    public minCodeLength = 2;

    private _adiService: AdiService;
    private _searchTermNotExchangedMarketProcessedToggleUiAction: BooleanUiAction;

    private _applyValueTransactionId = 0;
    private _nextSearchNumber = 1;
    private _debounceDelayingCount = 0;
    private _queryRunningCount = 0;
    private _selectedObservable = new RoutedIvemIdSelectNgComponent.SelectedObservable();

    private _measureCanvasContextsEventSubscriptionId: MultiEvent.SubscriptionId;
    private _measureCanvasContext: CanvasRenderingContext2D;
    private _measureBoldCanvasContext: CanvasRenderingContext2D;
    private _ngSelectWidths: RoutedIvemIdSelectNgComponent.NgSelectWidths | undefined;

    constructor(
        cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        private _ngSelectOverlayNgService: NgSelectOverlayNgService,
        settingsNgService: SettingsNgService,
        adiNgService: AdiNgService,
        symbolsNgService: SymbolsNgService
    ) {
        super(
            cdr,
            settingsNgService.settingsService,
            ControlComponentBaseNgDirective.textControlStateColorItemIdArray,
            symbolsNgService,
        );
        this._adiService = adiNgService.adiService;
        this.inputId = 'RoutedIvemIdInput' + this.instanceNumber.toString(10);
        this._searchTermNotExchangedMarketProcessedToggleUiAction =
            this.createSearchTermNotExchangedMarketProcessedToggleUiAction(commandRegisterNgService.service);
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureBoldCanvasContext = this._ngSelectOverlayNgService.measureBoldCanvasContext;
        this._measureCanvasContextsEventSubscriptionId = this._ngSelectOverlayNgService.subscribeMeasureCanvasContextsEvent(
            () => this.handleMeasureCanvasContextsEvent()
        );
    }

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

    public generateTitle(item: RoutedIvemIdSelectNgComponent.Item, nameIncluded: boolean) {
        switch (item.exists) {
            case undefined: {
                return `<${Strings[StringId.FetchingSymbolDetails]}>`;
            }
            case false: {
                return `<${Strings[StringId.SymbolNotFound]}>`;
            }
            case true: {
                let result = `${Strings[StringId.Exchange]}: ${ExchangeInfo.idToAbbreviatedDisplay(item.routedIvemId.ivemId.exchangeId)}`;

                if (nameIncluded) {
                    result = `${this.getItemDisplayName}\n` + result;
                }

                return result;
            }
            default:
                throw new UnreachableCaseError('RIISCGT5882271', item.exists);
        }
    }

    getItemDisplayName(item: RoutedIvemIdSelectNgComponent.Item) {
        const name = item.name;
        return name === undefined ? '' : name;
    }

    public handleSelectChangeEvent(event: unknown) {
        const changeEvent = event as RoutedIvemIdSelectNgComponent.ChangeEvent;
        if (changeEvent !== undefined && changeEvent !== null) {
            const parseDetails: SymbolsService.RoutedIvemIdParseDetails = {
                success: true,
                routedIvemId: changeEvent.routedIvemId,
                sourceIdExplicit: false,
                orderRouteExplicit: false,
                errorText: '',
                value: '',
            };
            this.commitValue(parseDetails, UiAction.CommitTypeId.Explicit);
        } else {
            // if (!this.uiAction.required) {
            //     this.commitValue(undefined, UiAction.CommitTypeId.Explicit);
            // }
        }
    }

    public handleSelectOpenEvent() {
        const list = this._ngSelectComponent.itemsList;
        const ngOptions = list.items;
        const count = ngOptions.length;
        const items = new Array<RoutedIvemIdSelectNgComponent.Item>(count);
        for (let i = 0; i < count; i++) {
            const ngOption = ngOptions[i];
            items[i] = ngOption.value as RoutedIvemIdSelectNgComponent.Item;
        }
        this.updateNgSelectWidthsFromItems(items, false);
    }

    public trackByFn(item: RoutedIvemIdSelectNgComponent.Item) {
        return item.routedIvemId.mapKey;
    }

    protected override finalise() {
        this._searchTermNotExchangedMarketProcessedToggleUiAction.finalise();

        this._ngSelectOverlayNgService.unsubscribeMeasureCanvasContextsEvent(
            this._measureCanvasContextsEventSubscriptionId
        );
        super.finalise();
    }

    protected override async applyValue(value: RoutedIvemId | undefined, selectAll: boolean = true) {
        if (!this.uiAction.edited) {
            const applyValueTransactionId = ++this._applyValueTransactionId;
            let selected: RoutedIvemIdSelectNgComponent.Item | null;
            if (value === undefined) {
                selected = null;
            } else {
                const cachedIvemIdDetail = await symbolDetailCache.getIvemId(value.ivemId);
                if (cachedIvemIdDetail === undefined) {
                    selected = null;
                } else {
                    selected = RoutedIvemIdSelectNgComponent.createItem(value, cachedIvemIdDetail, this.symbolsManager);
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

    protected override setStateColors(stateId: UiAction.StateId) {
        super.setStateColors(stateId);

        NgSelectUtils.ApplyColors(this._ngSelectComponent.element, this.foreColor, this.bkgdColor);
    }

    private handleMeasureCanvasContextsEvent() {
        this._measureCanvasContext = this._ngSelectOverlayNgService.measureCanvasContext;
        this._measureBoldCanvasContext = this._ngSelectOverlayNgService.measureBoldCanvasContext;
        this._ngSelectWidths = undefined; // force recalculation
    }

    private calculateNgSelectWidths(items: RoutedIvemIdSelectNgComponent.Item[]) {
        let maxIdWidth = 0;
        let maxBoldIdWidth = 0;
        let maxNameWidth = 0;
        const count = items.length;
        for (let i = 0; i < count; i++) {
            const item = items[i];
            const id = item.idDisplay;
            const idMetrics = this._measureCanvasContext.measureText(id);
            if (idMetrics.width > maxIdWidth) {
                maxIdWidth = idMetrics.width;
            }
            const boldIdMetrics = this._measureBoldCanvasContext.measureText(
                id
            );
            if (boldIdMetrics.width > maxBoldIdWidth) {
                maxBoldIdWidth = boldIdMetrics.width;
            }
            const name = item.name;
            if (name !== undefined) {
                const nameMetrics = this._measureCanvasContext.measureText(name);
                if (nameMetrics.width > maxNameWidth) {
                    maxNameWidth = nameMetrics.width;
                }
            }
        }
        const spaceMetrics = this._measureCanvasContext.measureText(' ');
        const firstColumnRightPaddingWidth = 2 * spaceMetrics.width;
        const firstColumnWidth = firstColumnRightPaddingWidth + maxBoldIdWidth;

        // width = 1st column + 2nd column + 2 * option padding + 2 * dropdown border + some extra (8)
        let dropDownPanelWidth = firstColumnWidth + maxNameWidth + 2 * NgSelectUtils.ngOptionLeftRightPadding + 10;
        const componentWidth = this._ngSelectComponent.element.offsetWidth;
        if (dropDownPanelWidth < componentWidth) {
            dropDownPanelWidth = componentWidth;
        }
        const ngSelectWidths: RoutedIvemIdSelectNgComponent.NgSelectWidths = {
            firstColumn: firstColumnWidth,
            dropDownPanel: dropDownPanelWidth,
        };

        return ngSelectWidths;
    }

    private handleSearchTermNotExchangedMarketProcessedToggleUiActionSignal() {
        const toggledValue = !this._searchTermNotExchangedMarketProcessedToggleUiAction.definedValue;
        this._searchTermNotExchangedMarketProcessedToggleUiAction.pushValue(toggledValue);
    }

    private startSearchProcessor() {
        const searchItemsObservable = this.typeahead.pipe(
            map((term) => this.createParsedSearchTerm(term)),
            distinctUntilChanged(
                (prev, curr) => RoutedIvemIdSelectNgComponent.ParsedSearchTerm.isEqual(prev, curr)
            ),
            map((parsedTerm) => new RoutedIvemIdSelectNgComponent.ItemArrayObservable(
                    this._adiService,
                    this.symbolsService,
                    parsedTerm, 800,
                    (start) => this.handleQueryStartFinishEvent(start),
                    (start) => this.handleDebounceDelayStartFinishEvent(start)
                )
            ),
            tap(() => { this._nextSearchNumber++; }) // this needs to be reviewed
        );

        this.items = merge<Observable<RoutedIvemIdSelectNgComponent.Item[]>>(searchItemsObservable, this._selectedObservable).pipe(
            switchAll(),
            tap((itemArray) => this.updateNgSelectWidthsFromItems(itemArray, true))
        );
    }

    private createSearchTermNotExchangedMarketProcessedToggleUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Name.RoutedIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed;
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

    private createParsedSearchTerm(term: string | null) {
        let result: RoutedIvemIdSelectNgComponent.ParsedSearchTerm;
        if (term === null) {
            result = {
                searchNumber: this._nextSearchNumber,
                searchable: false,
                codeOrName: '',
                exchangeId: undefined,
                orderRoute: undefined,
            };
            this.checkSetNotFoundTextToSymbolSearchRequiresCodeWithAtLeast(result.searchable);
        } else {
            if (this._searchTermNotExchangedMarketProcessedToggleUiAction.value) {
                result = {
                    searchNumber: this._nextSearchNumber,
                    searchable: term.length >= this.minCodeLength,
                    codeOrName: term,
                    exchangeId: undefined,
                    orderRoute: undefined,
                };
                this.checkSetNotFoundTextToSymbolSearchRequiresCodeWithAtLeast(result.searchable);
            } else {
                const parseDetails = this.symbolsService.parseRoutedIvemId(term);
                if (!parseDetails.success || parseDetails.routedIvemId === undefined) {
                    result = {
                        searchNumber: this._nextSearchNumber,
                        searchable: false,
                        codeOrName: term,
                        exchangeId: undefined,
                        orderRoute: undefined,
                    };
                    this.setNotFoundText(Strings[StringId.InvalidSymbol]);
                } else {
                    const code = parseDetails.routedIvemId.ivemId.code;
                    result = {
                        searchNumber: this._nextSearchNumber,
                        searchable: code.length >= this.minCodeLength,
                        codeOrName: code,
                        exchangeId: parseDetails.sourceIdExplicit ? parseDetails.routedIvemId.ivemId.exchangeId : undefined,
                        orderRoute: parseDetails.orderRouteExplicit ? parseDetails.routedIvemId.route : undefined,
                    };
                    this.checkSetNotFoundTextToSymbolSearchRequiresCodeWithAtLeast(result.searchable);
                }
            }
        }

        return result;
    }

    private updateNgSelectWidthsFromItems(items: RoutedIvemIdSelectNgComponent.Item[], widenOnly: boolean) {
        const widths = this.calculateNgSelectWidths(items);

        let dropDownPanelWidth: number | undefined;
        let firstColumnWidth: number | undefined;
        if (this._ngSelectWidths === undefined || !widenOnly) {
            this._ngSelectWidths = widths;
            dropDownPanelWidth = widths.dropDownPanel;
            firstColumnWidth = widths.firstColumn;
        } else {
            if (widths.dropDownPanel > this._ngSelectWidths.dropDownPanel) {
                dropDownPanelWidth = widths.dropDownPanel;
                this._ngSelectWidths.dropDownPanel = dropDownPanelWidth;
            }
            if (widths.firstColumn > this._ngSelectWidths.firstColumn) {
                firstColumnWidth = widths.firstColumn;
                this._ngSelectWidths.firstColumn = firstColumnWidth;
            }
        }

        if (dropDownPanelWidth !== undefined) {
            const dropDownPanelWidthPixels = numberToPixels(dropDownPanelWidth + 4); // make allowance for borders
            this._ngSelectOverlayNgService.setDropDownPanelWidth(dropDownPanelWidthPixels);
        }
        if (firstColumnWidth !== undefined) {
            const firstColumnWidthPixels = numberToPixels(firstColumnWidth);
            this._ngSelectOverlayNgService.setFirstColumnWidth(firstColumnWidthPixels);
        }
    }

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


export namespace RoutedIvemIdSelectNgComponent {
    export const emptySymbol = '';
    export const noneTradingMarketsText = `<${Strings[StringId.None]}>`;

    export interface Item {
        exists: boolean | undefined;
        name: string | undefined;
        routedIvemId: RoutedIvemId;
        idDisplay: string;
    }

    export interface ParsedSearchTerm {
        searchNumber: Integer;
        searchable: boolean;
        codeOrName: string;
        exchangeId: ExchangeId | undefined;
        orderRoute: OrderRoute | undefined;
    }

    export namespace ParsedSearchTerm {
        export function isEqual(left: ParsedSearchTerm, right: ParsedSearchTerm) {
            return left.searchNumber === right.searchNumber &&
                left.codeOrName === right.codeOrName &&
                left.exchangeId === right.exchangeId &&
                left.orderRoute === right.orderRoute;
        }
    }

    export type ChangeEvent = Item | undefined | null;

    export interface NgSelectWidths {
        dropDownPanel: number;
        firstColumn: number;
    }

    export function createItemNameFromIvemNameAndOrderRoute(ivemName: string, route: OrderRoute) {
        return `${ivemName} (${route.display})`;
    }

    export function createItemNameFromCacheDetail(routedIvemId: RoutedIvemId, cacheDetail: SymbolDetailCache.IvemIdDetail) {
        if (cacheDetail.exists) {
            const detailName = cacheDetail.name;
            return detailName === undefined ? undefined : createItemNameFromIvemNameAndOrderRoute(detailName, routedIvemId.route);
        } else {
            return `<${Strings[StringId.SymbolNotFound]}>`;
        }
    }

    export function createItem(routedIvemId: RoutedIvemId,
        cacheDetail: SymbolDetailCache.IvemIdDetail,
        symbolsService: SymbolsService
    ) {
        const item: Item = {
            exists: cacheDetail.exists,
            routedIvemId,
            name: createItemNameFromCacheDetail(routedIvemId, cacheDetail),
            idDisplay: symbolsService.routedIvemIdToDisplay(routedIvemId),
        };

        return item;
    }

    export class ItemArrayObservable extends Observable<Item[]> {
        private _dataItem: SymbolsDataItem | undefined;
        private _dataItemCorrectnessChangeSubcriptionId: MultiEvent.SubscriptionId;
        private _observer: Observer<Item[]>;
        private _termIvemIdFetching = false;
        private _searchDelaySetTimeoutHandle: ReturnType<typeof setTimeout> | undefined;
        private _termItem: Item;
        private _searchItems: Item[];

        constructor(private _adiService: AdiService,
            private _symbolsService: SymbolsService,
            private _term: ParsedSearchTerm,
            private _searchDelay: Integer,
            private _queryStartFinishEventHandler: (this: void, start: boolean) => void,
            private _debounceDelayStartFinishEventHandler: (this: void, start: boolean) => void
        ) {
            super((observer) => this.subscribeFtn(observer));
        }

        private dispose() {
            this.checkUnsubscribeDataItem();
            if (this._termIvemIdFetching) {
                this._termIvemIdFetching = false;
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
            const orderRoute = this._term.orderRoute;

            const termRoutedIvemId = this._symbolsService.tryCreateValidRoutedIvemId(codeOrName, exchangeId, orderRoute);
            if (termRoutedIvemId === undefined) {
                this.emitItems();
            } else {
                const cacheDetail = symbolDetailCache.getIvemIdFromCache(termRoutedIvemId.ivemId);
                let exists: boolean | undefined;
                let name: string | undefined;
                if (cacheDetail === undefined) {
                    exists = undefined;
                    name = undefined;
                } else {
                    exists = cacheDetail.exists;
                    name = createItemNameFromCacheDetail(termRoutedIvemId, cacheDetail);
                }

                this._termItem = {
                    exists,
                    name,
                    routedIvemId: termRoutedIvemId,
                    idDisplay: this._symbolsService.routedIvemIdToDisplay(termRoutedIvemId),
                };

                this.emitItems();

                if (exists === undefined) {
                    this.fetchTermDetailAndEmit(termRoutedIvemId);
                }
            }

            if (this._term.searchable) {
                this._debounceDelayStartFinishEventHandler(true);
                this._searchDelaySetTimeoutHandle = setTimeout(() => this.initiateSearch(), this._searchDelay);
            } else {
                if (!this._termIvemIdFetching) {
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

        private async fetchTermDetailAndEmit(routedIvemId: RoutedIvemId) {
            this._termIvemIdFetching = true;
            const cacheDetail = await symbolDetailCache.getIvemId(routedIvemId.ivemId);
            if (this._termIvemIdFetching) {
                this._termIvemIdFetching = false;
                if (cacheDetail !== undefined) {
                    this._termItem.exists = cacheDetail.exists;
                    this._termItem.name = createItemNameFromCacheDetail(routedIvemId, cacheDetail);
                    this.emitItems();
                }

                if (this._searchDelaySetTimeoutHandle === undefined) {
                    this.complete();
                }
            }
        }

        private initiateSearch() {
            this._searchDelaySetTimeoutHandle = undefined;
            this._debounceDelayStartFinishEventHandler(false);
            this._queryStartFinishEventHandler(true);

            const orderRoute = this._term.orderRoute;
            let marketIds: MarketId[] | undefined;
            if (orderRoute === undefined) {
                marketIds = undefined;
            } else {
                if (!OrderRoute.isMarketRoute(orderRoute)) {
                    marketIds = undefined;
                } else {
                    marketIds = [orderRoute.marketId];
                }
            }

            const definition = new SearchSymbolsDataDefinition();
            definition.searchText = this._term.codeOrName;
            definition.exchangeId = this._term.exchangeId;
            definition.marketIds = marketIds;
            definition.fieldIds = [SearchSymbolsDataDefinition.FieldId.Code, SearchSymbolsDataDefinition.FieldId.Name];
            definition.isPartial = true;
            definition.showFull = false;
            definition.isCaseSensitive = false;
            definition.count = 100;
            this._dataItem = this._adiService.subscribe(definition) as SymbolsDataItem;
            if (this._dataItem.incubated) {
                this.processDataItemIncubated(this._dataItem);
            } else {
                this._dataItemCorrectnessChangeSubcriptionId = this._dataItem.subscribeCorrectnessChangeEvent(
                    () => this.handleDataItemCorrectnessChange()
                );
            }
        }

        private handleDataItemCorrectnessChange() {
            if (this._dataItem === undefined) {
                throw new AssertInternalError('RIISCIAOHDICC19866434');
            } else {
                if (this._dataItem.incubated) {
                    this.processDataItemIncubated(this._dataItem);
                }
            }
        }

        private checkUnsubscribeDataItem() {
            if (this._dataItem !== undefined) {
                this._dataItem.unsubscribeCorrectnessChangeEvent(this._dataItemCorrectnessChangeSubcriptionId);
                this._dataItemCorrectnessChangeSubcriptionId = undefined;
                this._adiService.unsubscribe(this._dataItem);
                this._dataItem = undefined;
                this._queryStartFinishEventHandler(false);
            }
        }

        private processDataItemIncubated(dataItem: SymbolsDataItem) {
            if (dataItem.error) {
                this._observer.error(dataItem.errorText);
            } else {
                const records = dataItem.records;
                const count = records.length;
                if (count === 0) {
                    this.emitItems();
                } else {
                    records.sort((left, right) => IvemId.compare(left.litIvemId.ivemId, right.litIvemId.ivemId));
                    const items = new Array<Item>(count * 3); // guess
                    let itemCount = 0;
                    const firstRecord = records[0];
                    let activeIvemId = firstRecord.litIvemId.ivemId;
                    let activeDefaultMarketId = ExchangeInfo.idToDefaultMarketId(activeIvemId.exchangeId);
                    let activeIvemName = firstRecord.name;
                    let tradingMarketIds = firstRecord.tradingMarketIds;
                    let tradingMarketIdCount = tradingMarketIds.length;
                    for (let i = 1; i < count; i++) {
                        const record = records[i];
                        const litIvemId = record.litIvemId;
                        const recordIvemId = litIvemId.ivemId;
                        if (IvemId.isUndefinableEqual(recordIvemId, activeIvemId)) {
                            if (litIvemId.litId === activeDefaultMarketId) {
                                activeIvemName = record.name;
                            }
                            tradingMarketIdCount = addToGrow15ArrayUniquely(tradingMarketIds, tradingMarketIdCount,
                                record.tradingMarketIds);
                        } else {
                            itemCount = this.addIvemIdToItems(items, itemCount,
                                activeIvemId, activeIvemName, tradingMarketIds, tradingMarketIdCount);

                            activeIvemId = recordIvemId;
                            activeDefaultMarketId = ExchangeInfo.idToDefaultMarketId(activeIvemId.exchangeId);
                            activeIvemName = record.name;
                            tradingMarketIds = record.tradingMarketIds;
                            tradingMarketIdCount = tradingMarketIds.length;
                        }
                    }
                    itemCount = this.addIvemIdToItems(items, itemCount,
                        activeIvemId, activeIvemName, tradingMarketIds, tradingMarketIdCount);
                    items.length = itemCount;

                    items.sort((left, right) => {
                        const leftRoutedIvemId = left.routedIvemId;
                        const leftIvemId = leftRoutedIvemId.ivemId;
                        const rightRoutedIvemId = right.routedIvemId;
                        const rightIvemId = rightRoutedIvemId.ivemId;
                        let result = ExchangeInfo.priorityCompareId(leftIvemId.exchangeId, rightIvemId.exchangeId,
                            this._symbolsService.defaultExchangeId);
                        if (result === ComparisonResult.LeftEqualsRight) {
                            result = OrderRoute.compareByDisplayPriority(leftRoutedIvemId.route, rightRoutedIvemId.route);
                            if (result === ComparisonResult.LeftEqualsRight) {
                                result = compareString(leftIvemId.code, rightIvemId.code);
                            }
                        }
                        return result;
                    });

                    this._searchItems = items;
                    this.emitItems();
                }
            }
            this.checkUnsubscribeDataItem();

            if (!this._termIvemIdFetching) {
                this.complete();
            }
        }

        private addIvemIdToItems(items: Item[], itemCount: Integer,
            ivemId: IvemId, ivemName: string, tradingMarketIds: MarketId[], tradingMarketIdCount: Integer
        ) {
            for (let i = 0; i < tradingMarketIdCount; i++) {
                const orderRoute = new MarketOrderRoute(tradingMarketIds[i]);
                const routedIvemId = new RoutedIvemId(ivemId, orderRoute);
                const item: Item = {
                    exists: true,
                    routedIvemId,
                    name: createItemNameFromIvemNameAndOrderRoute(ivemName, routedIvemId.route),
                    idDisplay: this._symbolsService.routedIvemIdToDisplay(routedIvemId),
                };

                if (itemCount >= items.length) {
                    items.length = items.length * 2;
                }
                items[itemCount++] = item;
            }

            return itemCount;
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
                        const termRoutedIvemId = termItem.routedIvemId;
                        if (RoutedIvemId.isUndefinableEqual(termRoutedIvemId, searchItems[0].routedIvemId)) {
                            this._observer.next(searchItems);
                        } else {
                            const combinedItems = new Array<Item>(searchItemCount + 1);
                            combinedItems[0] = termItem;
                            combinedItems[1] = searchItems[0];
                            let count = 2;
                            for (let i = 1; i < searchItemCount; i++) {
                                const searchItem = searchItems[i];
                                if (!RoutedIvemId.isUndefinableEqual(termRoutedIvemId, searchItem.routedIvemId)) {
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
        private _observer: Observer<Observable<Item[]>>;
        private _selected: Item | null;

        constructor() {
            super((observer) => this.subscribeFtn(observer));
        }

        setSelected(value: Item | null) {
            this._selected = value;
            if (this._selected !== null) {
                this._observer.next(of([this._selected]));
            } else {
                this._observer.next(of([]));
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

    /*
    export class Typeahead {
        private _itemsObservable = new Observable<Item[]>(() => this.subscribeFtn());
        private _itemsObserver: Observer<Item[]> = {
            next: (items) => this.next(items),
            complete: () => this.complete(),
            error: (err) => this.error(err),
        };
        private _searchTermObserverable = new SearchTermObservable();
        private _loadingCount = 0;

        loadingChangedEvent: Typeahead.LoadingChangedEvent;
        itemsEvent: Typeahead.ItemsEvent;
        errorEvent: Typeahead.ErrorEvent;

        constructor(private _adiService: PariAdi,
            private _symbolsService: SymbolsManager,
            private _term: ParsedSearchTerm,
            private _minCodeLength: Integer,
            private _exchangeMarketParsingActive: boolean,
        ) {
            this._searchTermObserverable = new SearchTermObservable();

            this._itemsObservable = concat(
                of([]),
                this._searchTermObserverable.pipe(
                    map((term) => this.createParsedSearchTerm(term)),
                    // filter((parsedTerm) => {
                    //     return parsedTerm.code.length >= this.minCodeLength;
                    // }),
                    distinctUntilChanged(
                        (prev, curr) => RoutedIvemIdSelectComponent.ParsedSearchTerm.isEqual(prev, curr)
                    ),
                    debounceTime(800),
                    switchMap((parsedTerm) => {
                        const itemsObservable = new RoutedIvemIdSelectComponent.ItemArrayObservable(this._adiService, this._symbolsService,
                            parsedTerm, this._minCodeLength, (loading) => this.loadingNotifier(loading));
                        return itemsObservable.pipe(
                            tap((items) => { this.loadingChangedEvent(false); })
                        );
                    })
                )
            );

            this._itemsObservable.subscribe(this._itemsObserver);
        }

        setSearchTerm(value: string) {
            this._searchTermObserverable.setTerm(value);
        }

        private loadingNotifier(loading: boolean) {
            if (loading) {
                if (this._loadingCount++ === 0) {
                    this.loadingChangedEvent(true);
                }
            } else {
                if (--this._loadingCount === 0) {
                    this.loadingChangedEvent(false);
                }
            }
        }

        private dispose() {
            if (this._loadingCount !== 0) {
                this.loadingChangedEvent(false);
            }
        }

        private subscribeFtn() {
            const result: Unsubscribable = {
                unsubscribe: () => this.dispose()
            };
            return result;
        }

        next(items: Item[]) {
            this.itemsEvent(items);
        }

        complete() {
            // nothing to do
        }

        error(err: unknown) {
            this.errorEvent(err);
        }

        private createParsedSearchTerm(term: string | null): RoutedIvemIdSelectComponent.ParsedSearchTerm {
            if (term === null) {
                return {
                    valid: false,
                    searchable: false,
                    codeOrName: '',
                    exchangeId: undefined,
                    marketId: undefined,
                };
            } else {
                if (this._exchangeMarketParsingActive) {
                    const parseDetails = this._symbolsService.parseRoutedIvemId(term);
                    if (!parseDetails.success || parseDetails.routedIvemId === undefined) {
                        return {
                            valid: false,
                            searchable: false,
                            codeOrName: term,
                            exchangeId: undefined,
                            marketId: undefined,
                        };
                    } else {
                        const code = parseDetails.routedIvemId.ivemId.code;
                        return {
                            valid: true,
                            searchable: code.length >= this._minCodeLength,
                            codeOrName: code,
                            exchangeId: parseDetails.sourceIdExplicit ? parseDetails.routedIvemId.ivemId.exchangeId : undefined,
                            marketId: parseDetails.marketIdExplicit ? parseDetails.routedIvemId.route.getBestLitMarketId() : undefined,
                        };
                    }
                } else {
                    return {
                        valid: true,
                        searchable: term.length >= this._minCodeLength,
                        codeOrName: term,
                        exchangeId: undefined,
                        marketId: undefined,
                    };
                }
            }
        }
    }

    export namespace Typeahead {
        export type LoadingChangedEvent = (this: void, loading: boolean) => void;
        export type ItemsEvent = (this: void, items: Item[]) => void;
        export type ErrorEvent = (this: void, err: unknown) => void;
    }*/
}
