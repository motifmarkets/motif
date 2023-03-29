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
    BrokerageAccountGroup,
    BrokerageAccountGroupUiAction,
    delay1Tick,
    IconButtonUiAction,
    Integer,
    InternalCommand,
    JsonElement,
    StringId,
    Strings,
    UiAction
} from '@motifmarkets/motif-core';
import {
    AdiNgService,
    CommandRegisterNgService,
    SettingsNgService,
    SymbolsNgService,
    TableRecordSourceDefinitionFactoryNgService
} from 'component-services-ng-api';
import { AdaptedRevgrid } from 'content-internal-api';
import { GridSourceNgComponent } from 'content-ng-api';
import { BrokerageAccountGroupInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { BalancesDitemFrame } from '../balances-ditem-frame';

@Component({
    selector: 'app-balances-ditem',
    templateUrl: './balances-ditem-ng.component.html',
    styleUrls: ['./balances-ditem-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalancesDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements AfterViewInit, OnDestroy {

    @ViewChild('gridSource', { static: true }) private _gridSourceComponent: GridSourceNgComponent;
    @ViewChild('accountGroupInput', { static: true }) private _accountGroupInputComponent: BrokerageAccountGroupInputNgComponent;
    @ViewChild('accountLinkButton', { static: true }) private _accountLinkButtonComponent: SvgButtonNgComponent;

    public readonly frameGridProperties: AdaptedRevgrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };

    private _accountGroupUiAction: BrokerageAccountGroupUiAction;
    private _toggleAccountGroupLinkingUiAction: IconButtonUiAction;

    private readonly _frame: BalancesDitemFrame;

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef<HTMLElement>,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        tableRecordSourceDefinitionFactoryNgService: TableRecordSourceDefinitionFactoryNgService,
    ) {
        super(cdr, container, elRef, settingsNgService.settingsService, commandRegisterNgService.service);

        this._frame = new BalancesDitemFrame(
            this,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            tableRecordSourceDefinitionFactoryNgService.service,
            (group) => this.handleGridSourceOpenedEvent(group),
            (recordIndex) => this.handleRecordFocusedEvent(recordIndex),
        );

        this._accountGroupUiAction = this.createAccountIdUiAction();
        this._toggleAccountGroupLinkingUiAction = this.createToggleAccountGroupLinkingUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushAccountLinkButtonState();
        this._accountGroupUiAction.pushValue(BrokerageAccountGroup.createAll());
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return BalancesDitemNgComponent.stateSchemaVersion; }

    public ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    public ngOnDestroy() {
        this.finalise();
    }

    public override processBrokerageAccountGroupLinkedChanged() {
        this.pushAccountLinkButtonState();
    }

    protected override initialise() {
        this._accountGroupInputComponent.initialise(this._accountGroupUiAction);
        this._accountLinkButtonComponent.initialise(this._toggleAccountGroupLinkingUiAction);

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(this._gridSourceComponent.frame, frameElement);

        super.initialise();
    }

    protected override finalise() {
        this._accountGroupUiAction.finalise();
        this._toggleAccountGroupLinkingUiAction.finalise();

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

    private handleAccountGroupCommitEvent(typeId: UiAction.CommitTypeId) {
        const accountId = this._accountGroupUiAction.definedValue;
        this._frame.setBrokerageAccountGroupFromDitem(accountId);
    }

    private handleAccountLinkSignalEvent() {
        this._frame.brokerageAccountGroupLinked = !this._frame.brokerageAccountGroupLinked;
    }

    private handleRecordFocusedEvent(recordIndex: Integer | undefined) {
        //
    }

    private handleGridSourceOpenedEvent(group: BrokerageAccountGroup) {
        this._accountGroupUiAction.pushValue(group);
        const contentName = group.isAll() ? undefined : group.id;
        this.setTitle(this._frame.baseTabDisplay, contentName);
    }

    private createAccountIdUiAction() {
        const action = new BrokerageAccountGroupUiAction();
        action.pushOptions({ allAllowed: true });
        action.pushTitle(Strings[StringId.SelectAccountTitle]);
        action.pushPlaceholder(Strings[StringId.BrokerageAccountIdInputPlaceholderText]);
        action.commitEvent = (typeId) => this.handleAccountGroupCommitEvent(typeId);
        return action;
    }

    private createToggleAccountGroupLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleAccountLinking;
        const displayId = StringId.ToggleAccountLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleAccountLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AccountGroupLink);
        action.signalEvent = () => this.handleAccountLinkSignalEvent();
        return action;
    }

    private pushAccountLinkButtonState() {
        if (this._frame.brokerageAccountGroupLinked) {
            this._toggleAccountGroupLinkingUiAction.pushSelected();
        } else {
            this._toggleAccountGroupLinkingUiAction.pushUnselected();
        }
    }
}

export namespace BalancesDitemNgComponent {
    export const stateSchemaVersion = '2';
}
