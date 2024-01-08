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
    InternalCommand,
    JsonElement,
    RowDataArrayGrid,
    StringId,
    StringUiAction,
    Strings,
    delay1Tick
} from '@motifmarkets/motif-core';
import { AdiNgService, CellPainterFactoryNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { RowDataArrayGridNgComponent } from 'content-ng-api';
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
export class SearchDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

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
    @ViewChild(RowDataArrayGridNgComponent, { static: true }) private _gridComponent: RowDataArrayGridNgComponent;
    @ViewChild('layoutEditorContainer', { read: ViewContainerRef, static: true }) private _layoutEditorContainer: ViewContainerRef;

    public isMainMode = true;
    public isLayoutEditorMode = false;

    private _grid: RowDataArrayGrid;
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
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        cellPainterFactoryNgService: CellPainterFactoryNgService,
    ) {
        super(
            elRef,
            ++SearchDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsNgService.service,
            commandRegisterNgService.service
        );


        this._frame = new SearchDitemFrame(this, this.settingsService, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service, cellPainterFactoryNgService.service,
            this.rootHtmlElement,
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
        delay1Tick(() => this.initialise());
    }

    protected override initialise() {
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
}
