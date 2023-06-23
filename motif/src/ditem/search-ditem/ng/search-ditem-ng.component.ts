import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    ButtonUiAction,
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    IconButtonUiAction,
    IndexSignatureHack,
    Integer, InternalCommand,
    JsonElement, RenderValue,
    StringId,
    StringRenderValue,
    StringUiAction,
    Strings,
    delay1Tick
} from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { AdaptedRevgrid, SimpleGrid } from 'content-internal-api';
import { SimpleGridNgComponent } from 'content-ng-api';
import {
    ButtonInputNgComponent,
    CaptionLabelNgComponent,
    EnumInputNgComponent,
    SvgButtonNgComponent,
    TextInputNgComponent
} from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { SearchDitemFrame } from '../search-ditem-frame';

@Component({
    selector: 'app-search-ditem-ng',
    templateUrl: './search-ditem-ng.component.html',
    styleUrls: ['./search-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchDitemNgComponent  extends BuiltinDitemNgComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @ViewChild('categoryControl', { static: true }) private _categoryControlComponent: EnumInputNgComponent;
    @ViewChild('searchButtonControl', { static: true }) private _searchButtonControlComponent: ButtonInputNgComponent;
    @ViewChild('detailsButtonControl', { static: true }) private _detailsButtonControlComponent: ButtonInputNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild('locationControl', { static: true }) private _locationControlComponent: EnumInputNgComponent;
    @ViewChild('priceRangeControl', { static: true }) private _priceRangeControlComponent: EnumInputNgComponent;
    @ViewChild('keywordsControl') private _keywordsControlComponent: TextInputNgComponent;
    @ViewChild('searchDescriptionLabel', { static: true }) private _searchDescriptionLabelComponent: CaptionLabelNgComponent;
    @ViewChild('alertButtonControl', { static: true }) private _alertButtonControlComponent: ButtonInputNgComponent;
    @ViewChild(SimpleGridNgComponent, { static: true }) private _gridComponent: SimpleGridNgComponent;
    @ViewChild('layoutEditorContainer', { read: ViewContainerRef, static: true }) private _layoutEditorContainer: ViewContainerRef;

    public isMainMode = true;
    public isLayoutEditorMode = false;

    private _grid: SimpleGrid;
    private _frame: SearchDitemFrame;

    private readonly _categoryUiAction: ExplicitElementsEnumUiAction;
    private readonly _searchUiAction: ButtonUiAction;
    private readonly _detailsUiAction: ButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _locationUiAction: ExplicitElementsEnumUiAction;
    private readonly _priceRangeUiAction: ExplicitElementsEnumUiAction;
    private readonly _keywordsUiAction: StringUiAction;
    private readonly _searchDescriptionUiAction: StringUiAction;
    private readonly _alertUiAction: ButtonUiAction;

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef<HTMLElement>,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
    ) {
        super(cdr, container, elRef, settingsNgService.settingsService, commandRegisterNgService.service);

        this._frame = new SearchDitemFrame(this, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service
        );

        this._categoryUiAction = this.createCategoryUiAction();
        this._searchUiAction = this.createSearchUiAction();
        this._detailsUiAction = this.createDetailsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._locationUiAction = this.createLocationUiAction();
        this._priceRangeUiAction = this.createPriceRangeUiAction();
        this._keywordsUiAction = this.createKeywordsUiAction();
        this._searchDescriptionUiAction = this.createSearchDescriptionUiAction();
        this._alertUiAction = this.createAlertsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return SearchDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this._gridComponent.destroyEventer = () => {
            this._gridComponent.destroyGrid();
        };

        delay1Tick(() => this.initialise());
    }

    protected override initialise() {
        // const componentStateElement = this.getInitialComponentStateJsonElement();
        // const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        // this._frame.initialise(this._contentComponent.frame, frameElement);

        this._grid = this._gridComponent.createGrid(SearchDitemNgComponent.frameGridProperties);
        this._grid.rowFocusEventer = (newRowIndex) => this.handleRowFocusEvent(newRowIndex);
        this._grid.mainClickEventer = (fieldIndex, rowIndex) => this.handleGridClickEvent(fieldIndex, rowIndex);

        this.prepareGrid();

        this.initialiseComponents();

        super.initialise();
    }

    protected override finalise() {
        this._categoryUiAction.finalise();
        this._searchUiAction.finalise();
        this._detailsUiAction.finalise();
        this._columnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._locationUiAction.finalise();
        this._priceRangeUiAction.finalise();
        this._keywordsUiAction.finalise();
        this._searchDescriptionUiAction.finalise();
        this._alertUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        // nothing to load
    }

    protected save(element: JsonElement) {
        // nothing to save
    }

    private prepareGrid() {
        this._grid.setData(demoSearchResults.slice(), 1);
    }

    private handleRowFocusEvent(newRowIndex: Integer | undefined) {
        //
    }

    private handleGridClickEvent(columnIndex: Integer, rowIndex: Integer) {
        //
    }

    private createCategoryUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.SearchDitem_CategoryCaption]);
        action.pushTitle(Strings[StringId.SearchDitem_CategoryTitle]);
        const elementPropertiesArray: EnumUiAction.ElementProperties[] = [
            {
                element: 0,
                caption: Strings[StringId.SearchDitem_Category_HolidayCaption],
                title: Strings[StringId.SearchDitem_Category_HolidayTitle],
            }
        ];
        action.pushElements(elementPropertiesArray, undefined);
        // action.commitEvent = () => {};
        return action;
    }

    private createSearchUiAction() {
        const commandName = InternalCommand.Id.Search;
        const displayId = StringId.SearchDitem_SearchCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.SearchDitem_SearchTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createDetailsUiAction() {
        const commandName = InternalCommand.Id.ShowSelectedSearchResultDetails;
        const displayId = StringId.Details;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.ShowSelectedAlertDetailsTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createAutoSizeColumnWidthsUiAction() {
        const commandName = InternalCommand.Id.AutoSizeGridColumnWidths;
        const displayId = StringId.AutoSizeColumnWidthsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.AutoSizeColumnWidthsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AutoSizeColumnWidths);
        action.pushUnselected();
        // action.signalEvent = () => this.handleAutoSizeColumnWidthsUiActionSignalEvent();
        return action;
    }

    private createColumnsUiAction() {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createLocationUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.valueRequired = false;
        action.pushCaption(Strings[StringId.SearchDitem_LocationCaption]);
        action.pushTitle(Strings[StringId.SearchDitem_LocationTitle]);
        const elementPropertiesArray: EnumUiAction.ElementProperties[] = [
            {
                element: 0,
                caption: Strings[StringId.SearchDitem_Location_UsArizonaCaption],
                title: Strings[StringId.SearchDitem_Location_UsArizonaTitle],
            }
        ];
        action.pushElements(elementPropertiesArray, undefined);
        // action.commitEvent = () => {};
        return action;
    }

    private createPriceRangeUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.valueRequired = false;
        action.pushCaption(Strings[StringId.SearchDitem_PriceRangeCaption]);
        action.pushTitle(Strings[StringId.SearchDitem_PriceRangeTitle]);
        const elementPropertiesArray: EnumUiAction.ElementProperties[] = [
            {
                element: 0,
                caption: Strings[StringId.SearchDitem_PriceRange_10000To20000Caption],
                title: Strings[StringId.SearchDitem_PriceRange_10000To20000Title],
            }
        ];
        action.pushElements(elementPropertiesArray, undefined);
        // action.commitEvent = () => {};
        return action;
    }

    private createKeywordsUiAction() {
        const action = new StringUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SearchDitem_KeywordsCaption]);
        action.pushTitle(Strings[StringId.SearchDitem_KeywordsTitle]);
        action.pushPlaceholder(Strings[StringId.Keywords]);
        // action.commitEvent = () => this.handleSymbolCommitEvent();
        // action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createAlertsUiAction() {
        const commandName = InternalCommand.Id.DeleteSelectedAlert;
        const displayId = StringId.SearchDitem_AlertCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.SearchDitem_AlertTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createSearchDescriptionUiAction() {
        const action = new StringUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SearchDitem_SearchDescriptionTitle]);
        action.pushCaption('(Parameters: Holiday, USA - Arizona, 10000-20000)');
        return action;
    }

    private initialiseComponents() {
        this._categoryControlComponent.initialise(this._categoryUiAction);
        this._searchButtonControlComponent.initialise(this._searchUiAction);
        this._detailsButtonControlComponent.initialise(this._detailsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._locationControlComponent.initialise(this._locationUiAction);
        this._priceRangeControlComponent.initialise(this._priceRangeUiAction);
        this._keywordsControlComponent.initialise(this._keywordsUiAction);
        this._searchDescriptionLabelComponent.initialise(this._searchDescriptionUiAction);
        this._alertButtonControlComponent.initialise(this._alertUiAction);

        // this._frame.open();
    }
}

export namespace SearchDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const frameGridProperties: AdaptedRevgrid.FrameGridSettings = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };
}

interface SearchResult {
    code: string | StringRenderValue;
    company: string | StringRenderValue;
    product: string  | StringRenderValue;
    price: string | StringRenderValue;
}

const demoSearchResults: IndexSignatureHack<readonly SearchResult[]> = [
    {
        code: 'Code',
        company: 'Company',
        product: 'Product',
        price: 'Price',
    },
    {
        code: createAdvertStringRenderValue('trav1.ad'),
        company: createAdvertStringRenderValue('Example Travel Company 1'),
        product: createAdvertStringRenderValue('See Arizona in style'),
        price: createAdvertStringRenderValue('18,000'),
    },
    {
        code: createAdvertStringRenderValue('spc.ad'),
        company: createAdvertStringRenderValue('Spectaculix Travel'),
        product: createAdvertStringRenderValue('Magical Arizona'),
        price: createAdvertStringRenderValue('11,999'),
    },
    {
        code: createAdvertStringRenderValue('trav2.ad'),
        company: createAdvertStringRenderValue('Example Travel Company 1'),
        product: createAdvertStringRenderValue('The best of Arizona'),
        price: createAdvertStringRenderValue('10,500'),
    },
] as const;

function createAdvertStringRenderValue(text: string) {
    const result = new StringRenderValue(text);
    result.addAttribute(RenderValue.advertAttribute);
    return result;
}
