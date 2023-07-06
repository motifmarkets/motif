/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

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
    DateTimeRenderValue,
    IconButtonUiAction,
    IndexSignatureHack,
    Integer,
    IntegerRenderValue,
    InternalCommand,
    JsonElement,
    LitIvemIdUiAction,
    RenderValue,
    StringId,
    StringRenderValue,
    StringUiAction,
    Strings,
    delay1Tick
} from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { AdaptedRevgrid, RowDataArrayGrid } from 'content-internal-api';
import { RowDataArrayGridNgComponent } from 'content-ng-api';
import { LitIvemIdSelectNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { NewsHeadlinesDitemFrame } from '../news-headlines-ditem-frame';

@Component({
    selector: 'app-news-headlines-ditem',
    templateUrl: './news-headlines-ditem-ng.component.html',
    styleUrls: ['./news-headlines-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsHeadlinesDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @ViewChild('symbolInput') private _symbolEditComponent: LitIvemIdSelectNgComponent;
    @ViewChild('symbolButton', { static: true }) private _symbolButtonComponent: SvgButtonNgComponent;
    @ViewChild('filterInput') private _filterEditComponent: TextInputNgComponent;
    @ViewChild('symbolLinkButton') private _symbolLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild(RowDataArrayGridNgComponent, { static: true }) private _gridComponent: RowDataArrayGridNgComponent;
    @ViewChild('layoutEditorContainer', { read: ViewContainerRef, static: true }) private _layoutEditorContainer: ViewContainerRef;

    public isMainMode = true;
    public isLayoutEditorMode = false;

    private _grid: RowDataArrayGrid;
    private _frame: NewsHeadlinesDitemFrame;

    private _symbolEditUiAction: LitIvemIdUiAction;
    private _symbolApplyUiAction: IconButtonUiAction;
    private _filterEditUiAction: StringUiAction;
    private _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private _columnsUiAction: IconButtonUiAction;

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
        super(cdr, container, elRef, settingsNgService.service, commandRegisterNgService.service);

        this._frame = new NewsHeadlinesDitemFrame(this, this.settingsService, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this._symbolEditUiAction = this.createSymbolEditUiAction();
        this._symbolApplyUiAction = this.createSymbolApplyUiAction();
        this._filterEditUiAction = this.createFilterEditUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return NewsHeadlinesDitemNgComponent.stateSchemaVersion; }

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

        this._grid = this._gridComponent.createGrid(NewsHeadlinesDitemNgComponent.frameGridProperties);
        this._grid.rowFocusEventer = (newRowIndex) => this.handleRowFocusEvent(newRowIndex);
        this._grid.mainClickEventer = (fieldIndex, rowIndex) => this.handleGridClickEvent(fieldIndex, rowIndex);

        this.prepareGrid();

        this.initialiseComponents();

        super.initialise();
    }

    protected override finalise() {
        this._symbolEditUiAction.finalise();
        this._symbolApplyUiAction.finalise();
        this._filterEditUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._columnsUiAction.finalise();

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
        this._grid.setData(demoHeadlines.slice(), 1);
    }

    private handleRowFocusEvent(newRowIndex: Integer | undefined) {
        //
    }

    private handleGridClickEvent(columnIndex: Integer, rowIndex: Integer) {
        //
    }

    private createSymbolEditUiAction() {
        const action = new LitIvemIdUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.WatchlistSymbolInputTitle]);
        // action.commitEvent = () => this.handleSymbolCommitEvent();
        // action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createSymbolApplyUiAction() {
        const commandName = InternalCommand.Id.ApplySymbol;
        const displayId = StringId.ApplySymbolCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ApplySymbolTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.pushDisabled();
        // action.signalEvent = () => this.handleSymbolApplyUiActionSignalEvent();
        return action;
    }

    private createFilterEditUiAction() {
        const action = new StringUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.Filter]);
        action.pushPlaceholder(Strings[StringId.Filter]);
        // action.commitEvent = () => this.handleSymbolCommitEvent();
        // action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        // action.signalEvent = () => this.handleSymbolLinkUiActionSignalEvent();
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


    private initialiseComponents() {
        this._symbolEditComponent.initialise(this._symbolEditUiAction);
        this._symbolButtonComponent.initialise(this._symbolApplyUiAction);
        this._filterEditComponent.initialise(this._filterEditUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

        // this._frame.open();
    }
}

export namespace NewsHeadlinesDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const frameGridProperties: AdaptedRevgrid.FrameGridSettings = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };
}

interface Headline {
    code: string | StringRenderValue;
    name: string | StringRenderValue;
    text: string | StringRenderValue;
    sensitive: string | StringRenderValue;
    time: Date | string  | DateTimeRenderValue;
}

const demoHeadlines: IndexSignatureHack<readonly Headline[]> = [
    {
        code: 'Code',
        name: 'Name',
        text: 'Headline',
        sensitive: 'Sensitive',
        time: 'Time',
    },
    {
        code: 'TNR.AX',
        name: 'TORIAN RESOURCES LIMITED',
        text: 'Mt Stirling Central HREE Discovery Confirmed',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 10),
    },
    {
        code: 'CHR.AX',
        name: 'CHARGER METALS NL',
        text: 'Quarterly Cashflow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 10),
    },
    {
        code: 'CAQ.AX',
        name: 'CAQ HOLDINGS LIMITED',
        text: 'Appendix 4C',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 9),
    },
    {
        code: 'CCR.AX',
        name: 'CREDIT CLEAR LIMITED',
        text: 'Results of Meeting',
        sensitive: '',
        time: new Date(2022, 1, 31, 13, 9),
    },
    {
        code: 'RBX.AX',
        name: 'RESOURCE BASE LIMITED',
        text: 'Quarterly Activities/Appendix 5B Cash Flow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 6),
    },
    {
        code: createAdvertStringRenderValue('SPC.AD'),
        name: createAdvertStringRenderValue('Spectaculix Travel'),
        text: createAdvertStringRenderValue('New magical Arizona holiday now available'),
        sensitive: createAdvertStringRenderValue(''),
        time: createAdvertDateTimeRenderValue(new Date(2022, 1, 31, 13, 6)),
    },
    {
        code: 'SCP.AX',
        name: 'SHOPPING CENTRES AUSTRALASIA PROPERTY GROUP',
        text: 'Application for quotation of securities - SCP',
        sensitive: '',
        time: new Date(2022, 1, 31, 13, 6),
    },
    {
        code: 'BMM.AX',
        name: 'BALKAN MINING AND MINERALS LIMITED',
        text: 'Quarterly Activities/Appendix 5B Cash Flow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 6),
    },
    {
        code: 'SCU.AX',
        name: 'STEMCELL UNITED LIMITED',
        text: 'Chairman\'s address to the FY2021 Annual General Meeting',
        sensitive: '',
        time: new Date(2022, 1, 31, 13, 3),
    },
    {
        code: 'DUB.AX',
        name: 'DUBBER CORPORATION LIMITED',
        text: 'Quarterly Activities/Appendix 4C Cash Flow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 3),
    },
    {
        code: 'AGR.AX',
        name: 'AGUIA RESOURCES LIMITED',
        text: 'Quarterly Appendix 5B Cash Flow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 3),
    },
    {
        code: 'ADX.AX',
        name: 'ADX ENERGY LTD',
        text: 'Quarterly Cashflow Report - Dec 2021',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 2),
    },
    {
        code: 'SUB.AX',
        name: 'SUNBASE CHINA LIMITED',
        text: 'Final Dividend/Distribution for period ending 31 Jan 2022',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 2),
    },
    {
        code: 'GCA.AX',
        name: 'GEC ASIAN VALUE FUND',
        text: 'Final Dividend/Distribution for period ending 31 Jan 2022',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 2),
    },
    {
        code: 'FLO.AX',
        name: 'FLOWCOM LIMITED',
        text: 'Final Dividend/Distribution for period ending 31 Jan 2022',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 2),
    },
    {
        code: 'KGD.AX',
        name: 'KULA GOLD LIMITED',
        text: 'Quarterly Activities/Appendix 5B Cash Flow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 13, 0),
    },
    {
        code: 'AEV.AX',
        name: 'AVENIRA LIMITED',
        text: 'Quarterly Activities/Appendix 5B Cash Flow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 12, 58),
    },
    {
        code: 'TPO.AX',
        name: 'TIAN POH RESOURCES LIMITED',
        text: 'Nuurst Coal Resource Estimate Restated',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 12, 57),
    },
    {
        code: 'RMT.AX',
        name: 'RMA ENERGY LIMITED',
        text: 'Quarterly Activities and Cashflow Report',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 12, 57),
    },
    {
        code: 'GFL.AX',
        name: 'GLOBAL MASTERS FUND LIMITED',
        text: 'GFL Notes - Quarterly Report December 2021',
        sensitive: 'sensitive',
        time: new Date(2022, 1, 31, 12, 56),
    },
] as const;

function createAdvertStringRenderValue(text: string) {
    const result = new StringRenderValue(text);
    result.addAttribute(RenderValue.advertAttribute);
    return result;
}

function createAdvertIntegerRenderValue(value: Integer) {
    const result = new IntegerRenderValue(value);
    result.addAttribute(RenderValue.advertAttribute);
    return result;
}

function createAdvertDateTimeRenderValue(value: Date) {
    const result = new DateTimeRenderValue(value);
    result.addAttribute(RenderValue.advertAttribute);
    return result;
}
