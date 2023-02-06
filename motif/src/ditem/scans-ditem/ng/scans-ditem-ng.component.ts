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
    delay1Tick,
    IconButtonUiAction,
    InternalCommand,
    JsonElement,
    StringId,
    Strings,
    StringUiAction
} from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { AdaptedRevgrid } from 'content-internal-api';
import { ScansNgComponent } from 'content-ng-api';
import { ButtonInputNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { ScansDitemFrame } from '../scans-ditem-frame';

@Component({
    selector: 'app-scans-ditem-ng',
    templateUrl: './scans-ditem-ng.component.html',
    styleUrls: ['./scans-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScansDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective
    implements OnDestroy, AfterViewInit, ScansDitemFrame.ComponentAccess {

    @ViewChild('newButton', { static: true }) private _newButtonComponent: ButtonInputNgComponent;
    @ViewChild('filterEdit') private _filterEditComponent: TextInputNgComponent;
    @ViewChild('symbolLinkButton') private _symbolLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild('scansContent', { static: true }) private _scansContentComponent: ScansNgComponent;
    @ViewChild('dialogContainer', { read: ViewContainerRef, static: true }) private _dialogContainer: ViewContainerRef;

    public dialogActive = false;

    private _newUiAction: ButtonUiAction;
    private _filterEditUiAction: StringUiAction;
    private _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private _columnsUiAction: IconButtonUiAction;
    private _toggleSymbolLinkingUiAction: IconButtonUiAction;

    private _frame: ScansDitemFrame;

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

        this._frame = new ScansDitemFrame(this, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this._newUiAction = this.createNewUiAction();
        this._filterEditUiAction = this.createFilterEditUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
        this.pushSymbolLinkSelectState();
    }

    public get frameGridProperties(): AdaptedRevgrid.FrameGridProperties {
        return {
            fixedColumnCount: 1,
            gridRightAligned: false,
        };
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return ScansDitemNgComponent.stateSchemaVersion; }

    public ngOnDestroy() {
        this.finalise();
    }

    public ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    override processSymbolLinkedChanged() {
        this.pushSymbolLinkSelectState();
    }

    protected override initialise() {
        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(this._scansContentComponent.frame, frameElement);

        // this.pushFilterSelectState();
        this.pushFilterEditValue();

        this.initialiseChildComponents();

        // this._frame.open();

        super.initialise();
    }

    protected override finalise() {
        this._newUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
        this._filterEditUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._columnsUiAction.finalise();

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

    private handleNewUiActionSignalEvent() {
        //
    }

    private handleFilterEditUiActionCommitEvent() {
        this._frame.filterText = this._filterEditUiAction.definedValue;
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent() {
        this._frame.autoSizeAllColumnWidths();
    }

    private handleColumnsUiActionSignalEvent() {
        // this.showLayoutEditor();
    }

    private handleSymbolLinkUiActionSignalEvent() {
        this._frame.litIvemIdLinked = !this._frame.litIvemIdLinked;
    }

    private createNewUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.NewScan;
        const displayId = StringId.NewScan;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.BannerAdvert_ContactMeTitle]);
        action.pushUnselected();
        action.signalEvent = () => this.handleNewUiActionSignalEvent();
        return action;
    }

    private createFilterEditUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.Filter]);
        action.pushPlaceholder(Strings[StringId.Filter]);
        action.commitEvent = () => this.handleFilterEditUiActionCommitEvent();
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
        action.signalEvent = () => this.handleAutoSizeColumnWidthsUiActionSignalEvent();
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
        action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => this.handleSymbolLinkUiActionSignalEvent();
        return action;
    }

    private initialiseChildComponents() {
        this._newButtonComponent.initialise(this._newUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._filterEditComponent.initialise(this._filterEditUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);

        // this._frame.open();
    }

    private pushSymbolLinkSelectState() {
        if (this._frame.litIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private pushFilterEditValue() {
        this._filterEditUiAction.pushValue(this._frame.filterText);
    }

}

export namespace ScansDitemNgComponent {
    export const stateSchemaVersion = '2';
}
