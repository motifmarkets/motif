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
    ViewChild
} from '@angular/core';
import {
    assert,
    assigned,
    delay1Tick,
    IconButtonUiAction,
    InternalCommand,
    JsonElement,
    ModifierKey,
    StringId,
    Strings,
    UiAction
} from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService, TablesNgService } from 'component-services-ng-api';
import { AdaptedRevgrid } from 'content-internal-api';
import { GridSourceNgComponent } from 'content-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { BrokerageAccountsDitemFrame } from '../brokerage-accounts-ditem-frame';

@Component({
    selector: 'app-brokerage-accounts-ditem',
    templateUrl: './brokerage-accounts-ditem-ng.component.html',
    styleUrls: ['./brokerage-accounts-ditem-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrokerageAccountsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('table', { static: true }) private _contentComponent: GridSourceNgComponent;
    @ViewChild('accountLinkButton', { static: true }) private _accountLinkButtonComponent: SvgButtonNgComponent;

    public readonly frameGridProperties: AdaptedRevgrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };

    private _frame: BrokerageAccountsDitemFrame;
    private _toggleAccountLinkingUiAction: IconButtonUiAction;

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        tablesNgService: TablesNgService,
    ) {
        super(cdr, container, elRef, settingsNgService.settingsService, commandRegisterNgService.service);

        this._frame = new BrokerageAccountsDitemFrame(
            this,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            tablesNgService.service,
        );

        this._toggleAccountLinkingUiAction = this.createToggleAccountLinkingUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
        this.pushAccountLinkButtonState();
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return BrokerageAccountsDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    public override processBrokerageAccountGroupLinkedChanged() {
        this.pushAccountLinkButtonState();
    }

    public handleSymbolChange(value: string) {

    }

    public setFilter(value: string) {

    }

    protected override initialise() {
        assert(assigned(this._contentComponent), 'ID:53255332');

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(this._contentComponent.frame, frameElement);

        this.initialiseChildComponents(); // was previously delay1Tick

        super.initialise();
    }

    protected override finalise() {
        this._toggleAccountLinkingUiAction.finalise();

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

    private createToggleAccountLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleAccountLinking;
        const displayId = StringId.ToggleAccountLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleAccountLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AccountGroupLink);
        action.signalEvent = (signalTypeId, downKeys) => this.handleAccountLinkButtonSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private handleAccountLinkButtonSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.brokerageAccountGroupLinked = !this._frame.brokerageAccountGroupLinked;
    }

    private initialiseChildComponents() {
        this._accountLinkButtonComponent.initialise(this._toggleAccountLinkingUiAction);
    }

    private pushAccountLinkButtonState() {
        if (this._frame.brokerageAccountGroupLinked) {
            this._toggleAccountLinkingUiAction.pushSelected();
        } else {
            this._toggleAccountLinkingUiAction.pushUnselected();
        }
    }
}

export namespace BrokerageAccountsDitemNgComponent {
    export const stateSchemaVersion = '2';
}
