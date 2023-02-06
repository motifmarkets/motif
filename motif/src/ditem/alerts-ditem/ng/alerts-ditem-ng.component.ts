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
    ButtonUiAction, delay1Tick,
    IconButtonUiAction,
    IndexSignatureHack,
    Integer, InternalCommand,
    JsonElement, RenderValue,
    StringId,
    StringRenderValue,
    Strings,
    StringUiAction,
    TimeRenderValue
} from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { AdaptedRevgrid, SimpleGrid } from 'content-internal-api';
import { SimpleGridNgComponent } from 'content-ng-api';
import { ButtonInputNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { AlertsDitemFrame } from '../alerts-ditem-frame';

@Component({
    selector: 'app-alerts-ditem-ng',
    templateUrl: './alerts-ditem-ng.component.html',
    styleUrls: ['./alerts-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @ViewChild('filterInput') private _filterEditComponent: TextInputNgComponent;
    @ViewChild('detailsButton', { static: true }) private _detailsButtonComponent: ButtonInputNgComponent;
    @ViewChild('acknowledgeButton', { static: true }) private _acknowledgeButtonComponent: ButtonInputNgComponent;
    @ViewChild('deleteButton', { static: true }) private _deleteButtonComponent: ButtonInputNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild(SimpleGridNgComponent, { static: true }) private _gridComponent: SimpleGridNgComponent;
    @ViewChild('layoutEditorContainer', { read: ViewContainerRef, static: true }) private _layoutEditorContainer: ViewContainerRef;

    public isMainMode = true;
    public isLayoutEditorMode = false;

    private _grid: SimpleGrid;
    private _frame: AlertsDitemFrame;

    private _filterEditUiAction: StringUiAction;
    private _detailsUiAction: ButtonUiAction;
    private _acknowledgeUiAction: ButtonUiAction;
    private _deleteUiAction: ButtonUiAction;
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
        super(cdr, container, elRef, settingsNgService.settingsService, commandRegisterNgService.service);

        this._frame = new AlertsDitemFrame(this, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this._filterEditUiAction = this.createFilterEditUiAction();
        this._detailsUiAction = this.createDetailsUiAction();
        this._acknowledgeUiAction = this.createAcknowledgeUiAction();
        this._deleteUiAction = this.createDeleteUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return AlertsDitemNgComponent.stateSchemaVersion; }

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

        this._grid = this._gridComponent.createGrid(AlertsDitemNgComponent.frameGridProperties);
        this._grid.rowFocusEventer = (newRowIndex) => this.handleRowFocusEvent(newRowIndex);
        this._grid.mainClickEventer = (fieldIndex, rowIndex) => this.handleGridClickEvent(fieldIndex, rowIndex);

        this.prepareGrid();

        this.initialiseComponents();

        super.initialise();
    }

    protected override finalise() {
        this._filterEditUiAction.finalise();
        this._detailsUiAction.finalise();
        this._acknowledgeUiAction.finalise();
        this._deleteUiAction.finalise();
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
        this._grid.setData(demoAlerts.slice(), 1);
    }

    private handleRowFocusEvent(newRowIndex: Integer | undefined) {
        //
    }

    private handleGridClickEvent(columnIndex: Integer, rowIndex: Integer) {
        //
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

    private createDetailsUiAction() {
        const commandName = InternalCommand.Id.ShowSelectedAlertDetails;
        const displayId = StringId.Details;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.ShowSelectedAlertDetailsTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createAcknowledgeUiAction() {
        const commandName = InternalCommand.Id.AcknowledgeSelectedAlert;
        const displayId = StringId.Acknowledge;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.AcknowledgeSelectedAlertTitle]);
        action.pushUnselected();
        action.pushDisabled();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createDeleteUiAction() {
        const commandName = InternalCommand.Id.DeleteSelectedAlert;
        const displayId = StringId.Delete;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.DeleteSelectedAlertTitle]);
        action.pushUnselected();
        action.pushDisabled();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }


    private initialiseComponents() {
        this._filterEditComponent.initialise(this._filterEditUiAction);
        this._detailsButtonComponent.initialise(this._detailsUiAction);
        this._acknowledgeButtonComponent.initialise(this._acknowledgeUiAction);
        this._deleteButtonComponent.initialise(this._deleteUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

        // this._frame.open();
    }
}

export namespace AlertsDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const frameGridProperties: AdaptedRevgrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };
}

interface Alert {
    code: string | StringRenderValue;
    time: Date | string  | TimeRenderValue;
    eventText: string | StringRenderValue;
}

const demoAlerts: IndexSignatureHack<readonly Alert[]> = [
    {
        code: 'Code',
        time: 'Time',
        eventText: 'Event',
    },
    {
        code: 'BHP.AX',
        time: new TimeRenderValue(new Date(2022, 1, 31, 12, 43)),
        eventText: 'BHP.AX last price dropped below 45',
    },
    {
        code: createAdvertStringRenderValue('SPC.AD'),
        time: createAdvertTimeRenderValue(new Date(2022, 1, 31, 11, 48)),
        eventText: createAdvertStringRenderValue('New Arizona holiday package under $12000 announced'),
    },
    {
        code: 'CBA.AX',
        time: new TimeRenderValue(new Date(2022, 1, 31, 11, 10)),
        eventText: 'CBA.AX moving average crossing',
    },
] as const;

function createAdvertStringRenderValue(text: string) {
    const result = new StringRenderValue(text);
    result.addAttribute(RenderValue.advertAttribute);
    return result;
}

function createAdvertTimeRenderValue(value: Date) {
    const result = new TimeRenderValue(value);
    result.addAttribute(RenderValue.advertAttribute);
    return result;
}
