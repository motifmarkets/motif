/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    ComponentFactoryResolver, ElementRef, Inject,
    OnDestroy, OnInit, ViewChild,
    ViewContainerRef
} from '@angular/core';
import { ComponentContainer } from 'golden-layout';
import { ExchangeId, ExchangeInfo, MarketId, SymbolField, SymbolFieldId } from 'src/adi/internal-api';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'src/component-services/ng-api';
import { MotifGrid } from 'src/content/internal-api';
import { ContentGridLayoutEditorNgComponent, TableNgComponent } from 'src/content/ng-api';
import {
    ButtonInputNgComponent,
    CaptionedCheckboxNgComponent,
    CaptionedEnumArrayCheckboxNgComponent,
    CaptionedRadioNgComponent,
    CaptionLabelNgComponent,
    EnumArrayInputNgComponent,
    EnumInputNgComponent,
    IntegerLabelNgComponent,
    IntegerTextInputNgComponent,
    SvgButtonNgComponent,
    TextInputNgComponent
} from 'src/controls/ng-api';
import {
    AllowedExchangesEnumUiAction,
    AllowedMarketsEnumArrayUiAction,
    BooleanUiAction,
    EnumArrayUiAction,
    ExplicitElementsEnumArrayUiAction,
    IconButtonUiAction,
    IntegerUiAction,
    InternalCommand,
    StringUiAction,
    SymbolsService
} from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { delay1Tick, Integer, JsonElement, Logger } from 'src/sys/internal-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { SymbolsDitemFrame } from '../symbols-ditem-frame';

@Component({
    selector: 'app-symbols-ditem',
    templateUrl: './symbols-ditem-ng.component.html',
    styleUrls: ['./symbols-ditem-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SymbolsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective
    implements OnInit, OnDestroy, SymbolsDitemFrame.ComponentAccess {

    @ViewChild('toolbarExecuteButton', { static: true }) private _toolbarExecuteButtonComponent: SvgButtonNgComponent;
    @ViewChild('symbolLinkButton', { static: true }) private _symbolLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;

    // Parameters
    @ViewChild('exchangeLabel', { static: true }) private _exchangeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('defaultExchangeControl', { static: true }) private _defaultExchangeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('exchangeControl', { static: true }) private _exchangeControlComponent: EnumInputNgComponent;
    @ViewChild('marketsLabel', { static: true }) private _marketsLabelComponent: CaptionLabelNgComponent;
    @ViewChild('defaultMarketControl', { static: true }) private _defaultMarketControlComponent: CaptionedEnumArrayCheckboxNgComponent;
    @ViewChild('marketsControl', { static: true }) private _marketsControlComponent: EnumArrayInputNgComponent;
    @ViewChild('cfiLabel', { static: true }) private _cfiLabelComponent: CaptionLabelNgComponent;
    @ViewChild('cfiControl', { static: true }) private _cfiControlComponent: TextInputNgComponent;
    @ViewChild('fieldsLabel', { static: true }) private _fieldsLabelComponent: CaptionLabelNgComponent;
    @ViewChild('codeControl', { static: true }) private _codeControlComponent: CaptionedEnumArrayCheckboxNgComponent;
    @ViewChild('nameControl', { static: true }) private _nameControlComponent: CaptionedEnumArrayCheckboxNgComponent;
    @ViewChild('fieldsControl', { static: true }) private _fieldsControlComponent: EnumArrayInputNgComponent;
    @ViewChild('optionsLabel', { static: true }) private _optionsLabelComponent: CaptionLabelNgComponent;
    @ViewChild('partialControl', { static: true }) private _partialControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('preferExactControl', { static: true }) private _preferExactControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('showFullControl', { static: true }) private _showFullControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('pageSizeLabel', { static: true }) private _pageSizeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('pageSizeControl', { static: true }) private _pageSizeControlComponent: IntegerTextInputNgComponent;
    @ViewChild('searchTextLabel', { static: true }) private _searchTextLabelComponent: CaptionLabelNgComponent;
    @ViewChild('searchTextControl', { static: true }) private _searchTextControlComponent: TextInputNgComponent;
    @ViewChild('searchTextButton', { static: true }) private _searchTextButtonComponent: SvgButtonNgComponent;

    // Parameters Description
    @ViewChild('descriptionLabel', { static: true }) private _descriptionLabelComponent: CaptionLabelNgComponent;

    // Top page indicator
    @ViewChild('topPageLabel', { static: true }) private _topPageLabel: CaptionLabelNgComponent;
    @ViewChild('topPageNumberLabel', { static: true }) private _topPageNumberLabelComponent: IntegerLabelNgComponent;
    @ViewChild('topOfLabel', { static: true }) private _topOfLabel: CaptionLabelNgComponent;
    @ViewChild('topPageCountLabel', { static: true }) private _topPageCountLabel: IntegerLabelNgComponent;
    @ViewChild('topNextButton', { static: true }) private _topNextButtonComponent: ButtonInputNgComponent;

    // Query Search results
    @ViewChild('table', { static: true }) private _tableComponent: TableNgComponent;

    // Bottom Query page indicator
    @ViewChild('bottomPageLabel', { static: true }) private _bottomPageLabel: CaptionLabelNgComponent;
    @ViewChild('bottomPageNumberLabel', { static: true }) private _bottomPageNumberLabelComponent: IntegerLabelNgComponent;
    @ViewChild('bottomOfLabel', { static: true }) private _bottomOfLabel: CaptionLabelNgComponent;
    @ViewChild('bottomPageCountLabel', { static: true }) private _bottomPageCountLabel: IntegerLabelNgComponent;
    @ViewChild('bottomNextButton', { static: true }) private _bottomNextButtonComponent: ButtonInputNgComponent;

    @ViewChild('layoutEditorContainer', { read: ViewContainerRef, static: true }) private _layoutEditorContainer: ViewContainerRef;

    public readonly frameGridProperties: MotifGrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };

    public paginationActive = false; // hide this until implemented

    private _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private _columnsUiAction: IconButtonUiAction;

    // Query
    private _sourceUiAction: StringUiAction;
    private _exchangeUiAction: AllowedExchangesEnumUiAction;
    private _marketsUiAction: AllowedMarketsEnumArrayUiAction;
    private _cfiUiAction: StringUiAction;
    private _fieldsUiAction: ExplicitElementsEnumArrayUiAction;
    private _optionsUiAction: StringUiAction;
    private _partialUiAction: BooleanUiAction;
    private _preferExactUiAction: BooleanUiAction;
    private _showFullUiAction: BooleanUiAction;
    private _pageSizeUiAction: IntegerUiAction;
    private _searchUiAction: StringUiAction;
    private _queryUiAction: IconButtonUiAction;

    // Description
    private _descriptionUiAction: StringUiAction;

    // Top page indicator
    private _pageUiAction: StringUiAction;
    private _pageNumberUiAction: IntegerUiAction;
    private _ofUiAction: StringUiAction;
    private _pageCountUiAction: IntegerUiAction;
    private _nextPageUiAction: BooleanUiAction;

    private _symbolsManager: SymbolsService;
    private _frame: SymbolsDitemFrame;

    private _modeId = SymbolsDitemNgComponent.ModeId.Main;

    protected get stateSchemaVersion() { return SymbolsDitemNgComponent.stateSchemaVersion; }

    get ditemFrame() { return this._frame; }

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        private _resolver: ComponentFactoryResolver,
    ) {
        super(cdr, container, elRef, settingsNgService.settingsService, commandRegisterNgService.service);

        this._symbolsManager = symbolsNgService.symbolsManager;

        this._frame = new SymbolsDitemFrame(this, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.symbolsManager, adiNgService.adiService);

        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._sourceUiAction = this.createSourceUiAction();
        this._exchangeUiAction = this.createExchangeUiAction();
        this._marketsUiAction = this.createMarketsUiAction();
        this._cfiUiAction = this.createCfiUiAction();
        this._fieldsUiAction = this.createFieldsUiAction();
        this._optionsUiAction = this.createOptionsUiAction();
        this._partialUiAction = this.createPartialUiAction();
        this._preferExactUiAction = this.createPreferExactUiAction();
        this._showFullUiAction = this.createShowFullUiAction();
        this._pageSizeUiAction = this.createPageSizeUiAction();
        this._searchUiAction = this.createSearchUiAction();
        this._queryUiAction = this.createQueryUiAction();
        this._descriptionUiAction = this.createQuerySearchDescriptionUiAction();
        this._pageUiAction = this.createPageUiAction();
        this._pageNumberUiAction = this.createPageNumberUiAction();
        this._ofUiAction = this.createOfUiAction();
        this._pageCountUiAction = this.createPageCountUiAction();
        this._nextPageUiAction = this.createNextPageUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushSymbolLinkButtonState();
        this._exchangeUiAction.pushValue(this._frame.queryExchangeId);
        this._marketsUiAction.pushValue(this._frame.queryMarketIds);
        this._cfiUiAction.pushValue(this._frame.queryCfi);
        this._fieldsUiAction.pushValue(this._frame.queryFieldIds);
        this._partialUiAction.pushValue(this._frame.queryIsPartial);
        this._preferExactUiAction.pushValue(this._frame.queryPreferExact);
        this._showFullUiAction.pushValue(this._frame.queryShowFull);
        this._pageSizeUiAction.pushValue(this._frame.queryCount);
        this._searchUiAction.pushValue(this._frame.querySearchText);
    }

    public ngOnInit() {
        delay1Tick(() => this.initialise());
    }

    public ngOnDestroy() {
        this.finalise();
    }

    public isMainMode() {
        return this._modeId === SymbolsDitemNgComponent.ModeId.Main;
    }

    public isLayoutEditorMode() {
        return this._modeId === SymbolsDitemNgComponent.ModeId.LayoutEditor;
    }

    // Component Access Methods
    public processQueryTableOpen(description: string) {
        this._descriptionUiAction.pushCaption(description);
    }

    public processQueryRecordFocusChange(recordIdx: Integer) {
        // nothing implemented
    }

    public processSubscriptionRecordFocusChange(recordIdx: Integer) {
        // nothing implemented
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkButtonState();
    }

    protected override initialise() {
        const defaultExchangeId = this._symbolsManager.defaultDefaultExchangeId;
        const defaultMarketId = ExchangeInfo.idToDefaultMarketId(defaultExchangeId);

        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._exchangeLabelComponent.initialise(this._exchangeUiAction);
        this._defaultExchangeControlComponent.initialiseEnum(this._exchangeUiAction, defaultExchangeId);
        this._exchangeControlComponent.initialise(this._exchangeUiAction);
        this._marketsLabelComponent.initialise(this._marketsUiAction);
        this._defaultMarketControlComponent.initialiseEnum(this._marketsUiAction, defaultMarketId);
        this._marketsControlComponent.initialise(this._marketsUiAction);
        this._cfiLabelComponent.initialise(this._cfiUiAction);
        this._cfiControlComponent.initialise(this._cfiUiAction);
        this._fieldsLabelComponent.initialise(this._fieldsUiAction);
        this._optionsLabelComponent.initialise(this._optionsUiAction);
        this._codeControlComponent.initialiseEnum(this._fieldsUiAction, SymbolFieldId.Code);
        // this._codeLabelComponent.initialiseEnum(this._fieldsUiAction, SymbolFieldId.Code);
        this._nameControlComponent.initialiseEnum(this._fieldsUiAction, SymbolFieldId.Name);
        // this._nameLabelComponent.initialiseEnum(this._fieldsUiAction, SymbolFieldId.Name);
        this._fieldsControlComponent.initialise(this._fieldsUiAction);
        this._partialControlComponent.initialise(this._partialUiAction);
        // this._partialLabelComponent.initialise(this._partialUiAction);
        this._preferExactControlComponent.initialise(this._preferExactUiAction);
        // this._preferExactLabelComponent.initialise(this._preferExactUiAction);
        this._showFullControlComponent.initialise(this._showFullUiAction);
        // this._showFullLabelComponent.initialise(this._showFullUiAction);
        this._pageSizeLabelComponent.initialise(this._pageSizeUiAction);
        this._pageSizeControlComponent.initialise(this._pageSizeUiAction);
        this._searchTextLabelComponent.initialise(this._searchUiAction);
        this._searchTextControlComponent.initialise(this._searchUiAction);
        this._toolbarExecuteButtonComponent.initialise(this._queryUiAction);
        this._searchTextButtonComponent.initialise(this._queryUiAction);
        this._descriptionLabelComponent.initialise(this._descriptionUiAction);
        this._topPageLabel.initialise(this._pageUiAction);
        this._topPageNumberLabelComponent.initialise(this._pageNumberUiAction);
        this._topOfLabel.initialise(this._ofUiAction);
        this._topPageCountLabel.initialise(this._pageCountUiAction);
        this._topNextButtonComponent.initialise(this._nextPageUiAction);
        this._bottomPageLabel.initialise(this._pageUiAction);
        this._bottomPageNumberLabelComponent.initialise(this._pageNumberUiAction);
        this._bottomOfLabel.initialise(this._ofUiAction);
        this._bottomPageCountLabel.initialise(this._pageCountUiAction);
        this._bottomNextButtonComponent.initialise(this._nextPageUiAction);

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(this._tableComponent.frame, frameElement);

        super.initialise();
    }

    protected override finalise() {
        this._toggleSymbolLinkingUiAction.finalise();
        this._columnsUiAction.finalise();
        this._sourceUiAction.finalise();
        this._exchangeUiAction.finalise();
        this._marketsUiAction.finalise();
        this._cfiUiAction.finalise();
        this._fieldsUiAction.finalise();
        this._optionsUiAction.finalise();
        this._partialUiAction.finalise();
        this._preferExactUiAction.finalise();
        this._showFullUiAction.finalise();
        this._pageSizeUiAction.finalise();
        this._searchUiAction.finalise();
        this._queryUiAction.finalise();
        this._descriptionUiAction.finalise();
        this._pageUiAction.finalise();
        this._pageNumberUiAction.finalise();
        this._ofUiAction.finalise();
        this._pageCountUiAction.finalise();
        this._nextPageUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);
    }

    protected save(element: JsonElement) {
        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    private handleSymbolLinkSignalEvent() {
        this._frame.litIvemIdLinked = !this._frame.litIvemIdLinked;
    }

    private handleColumnsUiActionSignalEvent() {
        this.showLayoutEditor();
    }

    private handleExchangeCommitEvent() {
        const id = this._exchangeUiAction.definedValue as ExchangeId;
        this._frame.queryExchangeId = id;
    }

    private handleMarketsCommitEvent() {
        const ids = this._marketsUiAction.definedValue as readonly MarketId[];
        this._frame.queryMarketIds = ids;
    }

    private handleCfiCommitEvent() {
        const cfi = this._cfiUiAction.definedValue;
        this._frame.queryCfi = cfi;
    }

    private handleFieldsCommitEvent() {
        const ids = this._fieldsUiAction.definedValue as readonly SymbolFieldId[];
        this._frame.queryFieldIds = ids;
    }

    private handlePartialCommitEvent() {
        this._frame.queryIsPartial = this._partialUiAction.definedValue;
    }

    private handlePreferExactCommitEvent() {
        this._frame.queryPreferExact = this._preferExactUiAction.definedValue;
    }

    private handleShowFullCommitEvent() {
        this._frame.queryShowFull = this._showFullUiAction.definedValue;
    }

    private handlePageSizeCommitEvent() {
        this._frame.queryCount = this._pageSizeUiAction.definedValue;
    }

    private handleSearchCommitEvent() {
        this._frame.querySearchText = this._searchUiAction.definedValue;
    }

    private handleQuerySignalEvent() {
        this._frame.executeQueryRequest();
    }

    private handleNextPageSignalEvent() {
        // not sure about this yet
    }

    private showLayoutEditor() {
        this._modeId = SymbolsDitemNgComponent.ModeId.LayoutEditor;
        const layoutWithHeadings = this._frame.getActiveGridLayoutWithHeadings();

        if (layoutWithHeadings !== undefined) {
            const closePromise = ContentGridLayoutEditorNgComponent.open(this._layoutEditorContainer, this._resolver, layoutWithHeadings);
            closePromise.then(
                (layout) => {
                    if (layout !== undefined) {
                        this._frame.setActiveGridLayout(layout);
                    }
                    this.closeLayoutEditor();
                },
                (reason) => {
                    Logger.logError(`Symbols Ditem Layout Editor error: ${reason}`);
                    this.closeLayoutEditor();
                }
            );
        }

        this.markForCheck();
    }

    private closeLayoutEditor() {
        this._layoutEditorContainer.clear();
        this._modeId = SymbolsDitemNgComponent.ModeId.Main;
        this.markForCheck();
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Name.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => this.handleSymbolLinkSignalEvent();
        return action;
    }

    private createColumnsUiAction() {
        const commandName = InternalCommand.Name.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createSourceUiAction() {
        const action = new StringUiAction();
        action.pushCaption(Strings[StringId.Source]);
        return action;
    }

    private createExchangeUiAction() {
        const action = new AllowedExchangesEnumUiAction(this._symbolsManager);
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Exchange]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Exchange]);
        action.commitEvent = () => this.handleExchangeCommitEvent();
        return action;
    }

    private createMarketsUiAction() {
        const action = new AllowedMarketsEnumArrayUiAction(this._symbolsManager);
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Markets]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Markets]);
        action.commitEvent = () => this.handleMarketsCommitEvent();
        return action;
    }

    private createCfiUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Cfi]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Cfi]);
        action.commitEvent = () => this.handleCfiCommitEvent();
        return action;
    }

    private createFieldsUiAction() {
        const action = new ExplicitElementsEnumArrayUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Fields]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Fields]);

        const entryCount = SymbolField.idCount;
        const elementPropertiesArray = new Array<EnumArrayUiAction.ElementProperties>(entryCount);
        for (let id = 0; id < entryCount; id++) {
            elementPropertiesArray[id] = {
                element: id,
                caption: SymbolField.idToDisplay(id),
                title: SymbolField.idToDescription(id),
            };
        }

        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => this.handleFieldsCommitEvent();
        return action;
    }

    private createOptionsUiAction() {
        const action = new StringUiAction();
        action.valueRequired = false;
        action.pushCaption(Strings[StringId.Options]);
        return action;
    }

    private createPartialUiAction() {
        const action = new BooleanUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Partial]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Partial]);
        action.commitEvent = () => this.handlePartialCommitEvent();
        return action;
    }

    private createPreferExactUiAction() {
        const action = new BooleanUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_PreferExact]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_PreferExact]);
        action.commitEvent = () => this.handlePreferExactCommitEvent();
        return action;
    }

    private createShowFullUiAction() {
        const action = new BooleanUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_ShowFull]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_ShowFull]);
        action.commitEvent = () => this.handleShowFullCommitEvent();
        return action;
    }

    private createPageSizeUiAction() {
        const action = new IntegerUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_PageSize]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_PageSize]);
        action.commitEvent = () => this.handlePageSizeCommitEvent();
        return action;
    }

    private createSearchUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Search]);
        action.pushCaption(Strings[StringId.SymbolsDitemControlCaption_Search]);
        action.commitEvent = () => this.handleSearchCommitEvent();
        return action;
    }

    private createQueryUiAction() {
        const commandName = InternalCommand.Name.Symbols_Query;
        const displayId = StringId.SymbolsDitemControlCaption_Query;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_Query]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.signalEvent = () => this.handleQuerySignalEvent();
        return action;
    }

    private createQuerySearchDescriptionUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_QuerySearchDescription]);
        return action;
    }

    private createPageUiAction() {
        const action = new StringUiAction();
        action.pushValue(Strings[StringId.Page]);
        return action;
    }

    private createPageNumberUiAction() {
        const action = new IntegerUiAction();
        return action;
    }

    private createOfUiAction() {
        const action = new StringUiAction();
        action.pushValue(Strings[StringId.Of]);
        return action;
    }

    private createPageCountUiAction() {
        const action = new IntegerUiAction();
        return action;
    }

    private createNextPageUiAction() {
        const commandName = InternalCommand.Name.Symbols_NextPage;
        const displayId = StringId.SymbolsDitemControlCaption_NextPage;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SymbolsDitemControlTitle_NextPage]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.signalEvent = () => this.handleNextPageSignalEvent();
        return action;
    }

    private pushSymbolLinkButtonState() {
        if (this._frame.litIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }
}

export namespace SymbolsDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const enum ModeId {
        Main,
        LayoutEditor,
    }

}
