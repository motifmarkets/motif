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
    AssertInternalError,
    BrokerageAccountGroup,
    BrokerageAccountGroupUiAction,
    IconButtonUiAction,
    Integer,
    InternalCommand,
    JsonElement,
    ModifierKey,
    ModifierKeyId,
    StringId,
    Strings,
    UiAction,
    delay1Tick,
    getErrorMessage
} from '@motifmarkets/motif-core';
import {
    AdiNgService,
    CommandRegisterNgService,
    SettingsNgService,
    SymbolsNgService,
    ToastNgService
} from 'component-services-ng-api';
import { BalancesNgComponent, NameableGridLayoutEditorDialogNgComponent } from 'content-ng-api';
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
    private static typeInstanceCreateCount = 0;

    @ViewChild('balances', { static: true }) private _balancesComponent: BalancesNgComponent;
    @ViewChild('accountGroupInput', { static: true }) private _accountGroupInputComponent: BrokerageAccountGroupInputNgComponent;
    @ViewChild('accountLinkButton', { static: true }) private _accountLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('columnsButton', { static: true }) private _columnsButtonComponent: SvgButtonNgComponent;
    @ViewChild('autoSizeColumnWidthsButton', { static: true }) private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    @ViewChild('dialogContainer', { read: ViewContainerRef }) private _dialogContainer: ViewContainerRef;

    private readonly _frame: BalancesDitemFrame;

    private _accountGroupUiAction: BrokerageAccountGroupUiAction;
    private _toggleAccountGroupLinkingUiAction: IconButtonUiAction;
    private _columnsUiAction: IconButtonUiAction;
    private _autoSizeColumnWidthsUiAction: IconButtonUiAction;

    private _activeDialogTypeId = BalancesDitemNgComponent.ActiveDialogTypeId.None;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        toastNgService: ToastNgService,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
    ) {
        super(
            elRef,
            ++BalancesDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsNgService.service,
            commandRegisterNgService.service
        );


        this._frame = new BalancesDitemFrame(
            this,
            this.settingsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            toastNgService.service,
            (group) => this.handleGridSourceOpenedEvent(group),
            (recordIndex) => this.handleRecordFocusedEvent(recordIndex),
        );

        this._accountGroupUiAction = this.createAccountIdUiAction();
        this._toggleAccountGroupLinkingUiAction = this.createToggleAccountGroupLinkingUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();

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

    public isDialogActive() {
        return this._activeDialogTypeId !== BalancesDitemNgComponent.ActiveDialogTypeId.None;
    }

    public override processBrokerageAccountGroupLinkedChanged() {
        this.pushAccountLinkButtonState();
    }

    protected override initialise() {
        this._accountGroupInputComponent.initialise(this._accountGroupUiAction);
        this._accountLinkButtonComponent.initialise(this._toggleAccountGroupLinkingUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const ditemFrameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(ditemFrameElement, this._balancesComponent.frame);

        super.initialise();
    }

    protected override finalise() {
        this._accountGroupUiAction.finalise();
        this._toggleAccountGroupLinkingUiAction.finalise();
        this._columnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();

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

    private handleColumnsUiActionSignalEvent() {
        this.showLayoutEditorDialog();
    }

    private handleAutoSizeColumnWidthsUiActionSignalEvent(_signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const widenOnly = ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Shift);
        this._frame.autoSizeAllColumnWidths(widenOnly);
    }

    private handleRecordFocusedEvent(_recordIndex: Integer | undefined) {
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

    private createAutoSizeColumnWidthsUiAction() {
        const commandName = InternalCommand.Id.AutoSizeGridColumnWidths;
        const displayId = StringId.AutoSizeColumnWidthsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.AutoSizeColumnWidthsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AutoSizeColumnWidths);
        action.pushUnselected();
        action.signalEvent = (signalTypeId, downKeys) => this.handleAutoSizeColumnWidthsUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private pushAccountLinkButtonState() {
        if (this._frame.brokerageAccountGroupLinked) {
            this._toggleAccountGroupLinkingUiAction.pushSelected();
        } else {
            this._toggleAccountGroupLinkingUiAction.pushUnselected();
        }
    }

    private showLayoutEditorDialog() {
        this._activeDialogTypeId = BalancesDitemNgComponent.ActiveDialogTypeId.Layout;

        const allowedFieldsAndLayoutDefinition = this._frame.createAllowedFieldsGridLayoutDefinition();

        const closePromise = NameableGridLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._frame.opener,
            Strings[StringId.Balances_ColumnsDialogCaption],
            allowedFieldsAndLayoutDefinition
        );
        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    this._frame.openGridLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                }
                this.closeDialog();
            },
            (reason) => {
                throw new AssertInternalError('BDNCSLEDCPTR20987', getErrorMessage(reason));
            }
        );

        this.markForCheck();
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this._activeDialogTypeId = BalancesDitemNgComponent.ActiveDialogTypeId.None;
        this.markForCheck();
    }
}

export namespace BalancesDitemNgComponent {
    export const stateSchemaVersion = '2';

    export const enum ActiveDialogTypeId {
        None,
        Layout,
    }
}
