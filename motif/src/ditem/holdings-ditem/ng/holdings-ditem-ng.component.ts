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
    AssertInternalError,
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
import { SplitComponent } from 'angular-split';
import { IOutputData } from 'angular-split/lib/interface';
import {
    AdiNgService,
    CommandRegisterNgService,
    SettingsNgService,
    SymbolDetailCacheNgService,
    SymbolsNgService,
    TablesNgService
} from 'component-services-ng-api';
import { AdaptedRevgrid } from 'content-internal-api';
import { TableNgComponent } from 'content-ng-api';
import { AngularSplitTypes } from 'controls-internal-api';
import { BrokerageAccountGroupInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { HoldingsDitemFrame } from '../holdings-ditem-frame';

@Component({
    selector: 'app-holdings-ditem',
    templateUrl: './holdings-ditem-ng.component.html',
    styleUrls: ['./holdings-ditem-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @ViewChild('balancesTable', { static: true }) private _balancesTableComponent: TableNgComponent;
    @ViewChild('holdingsTable', { static: true }) private _holdingsTableComponent: TableNgComponent;
    @ViewChild('accountGroupInput', { static: true }) private _accountGroupInputComponent: BrokerageAccountGroupInputNgComponent;
    @ViewChild('sellButton', { static: true }) private _sellButtonComponent: SvgButtonNgComponent;
    @ViewChild('accountLinkButton', { static: true }) private _accountLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('symbolLinkButton', { static: true }) private _symbolLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild(SplitComponent) private _balancesHoldingsSplitComponent: SplitComponent;

    public readonly frameGridProperties: AdaptedRevgrid.FrameGridProperties = {
        fixedColumnCount: 0,
        gridRightAligned: false,
    };

    public splitterGutterSize = 3;
    public balancesVisible = false;
    public balancesHeight: AngularSplitTypes.AreaSize.Html = 50;

    private _accountGroupUiAction: BrokerageAccountGroupUiAction;
    private _sellUiAction: IconButtonUiAction;
    private _accountGroupLinkUiAction: IconButtonUiAction;
    private _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private _explicitBalancesHeight = false;

    private _frame: HoldingsDitemFrame;

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
        symbolDetailCacheNgService: SymbolDetailCacheNgService,
        tablesNgService: TablesNgService,
    ) {
        super(cdr, container, elRef, settingsNgService.settingsService, commandRegisterNgService.service);

        this._frame = new HoldingsDitemFrame(
            this,
            this.settingsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            symbolDetailCacheNgService.service,
            tablesNgService.service
        );
        this._frame.holdingsRecordFocusEvent = (recordIndex) => this.handleHoldingsRecordFocusEvent(recordIndex);
        this._frame.groupOpenedEvent = (group) => this.handleGroupOpenedEvent(group);

        this._accountGroupUiAction = this.createAccountIdUiAction();
        this._sellUiAction = this.createSellUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._accountGroupLinkUiAction = this.createToggleAccountGroupLinkingUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.pushAccountLinkButtonState();
        this.pushSymbolLinkButtonState();
        this._accountGroupUiAction.pushValue(BrokerageAccountGroup.createAll());
    }

    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return HoldingsDitemNgComponent.stateSchemaVersion; }

    public ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    public ngOnDestroy() {
        this.finalise();
    }

    public splitDragEnd(data: IOutputData) {
        this._explicitBalancesHeight = true;
    }

    // component interface methods

    public loadConstructLayoutConfig(config: JsonElement | undefined) {
        if (config === undefined) {
            this._explicitBalancesHeight = false;
        } else {
            const balancesHeight = config.tryGetInteger(HoldingsDitemNgComponent.JsonName.balancesHeight);
            if (balancesHeight === undefined) {
                this._explicitBalancesHeight = false;
            } else {
                this.balancesHeight = balancesHeight;
                this._explicitBalancesHeight = true;
            }
        }
    }

    public setBalancesVisible(value: boolean) {
        if (value !== this.balancesVisible) {
            this.balancesVisible = value;
            this.markForCheck();
        }
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkButtonState();
    }

    public override processBrokerageAccountGroupLinkedChanged() {
        this.pushAccountLinkButtonState();
    }

    protected override initialise() {
        this._accountGroupInputComponent.initialise(this._accountGroupUiAction);
        this._sellButtonComponent.initialise(this._sellUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._accountLinkButtonComponent.initialise(this._accountGroupLinkUiAction);

        const componentStateElement = this.getInitialComponentStateJsonElement();
        const frameElement = this.tryGetChildFrameJsonElement(componentStateElement);
        this._frame.initialise(this._holdingsTableComponent.frame, this._balancesTableComponent.frame, frameElement);

        if (!this._explicitBalancesHeight) {
            const gridRowHeight = this._balancesTableComponent.gridRowHeight;
            const gridHeaderHeight = this._balancesTableComponent.getHeaderPlusFixedLineHeight();
            const gridHorizontalScrollbarMarginedHeight = this._balancesTableComponent.gridHorizontalScrollbarMarginedHeight;
            this.balancesHeight = gridHeaderHeight + gridRowHeight + gridHorizontalScrollbarMarginedHeight;
            this.markForCheck();
        }

        this.pushSellButtonState(this._frame.focusedRecordIndex);

        super.initialise();
    }

    protected override finalise() {
        this._accountGroupUiAction.finalise();
        this._sellUiAction.finalise();
        this._accountGroupLinkUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);

        if (element === undefined) {
            this._explicitBalancesHeight = false;
        } else {
            const balancesHeight = element.tryGetInteger(HoldingsDitemNgComponent.JsonName.balancesHeight);
            if (balancesHeight === undefined) {
                this._explicitBalancesHeight = false;
            } else {
                this.balancesHeight = balancesHeight;
                this._explicitBalancesHeight = true;
            }
        }
    }

    protected save(element: JsonElement) {
        if (this._explicitBalancesHeight) {
            const balancesHeight = this.getBalancesHeight();
            element.setInteger(HoldingsDitemNgComponent.JsonName.balancesHeight, balancesHeight);
        }

        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    private handleAccountGroupCommitEvent(typeId: UiAction.CommitTypeId) {
        const accountId = this._accountGroupUiAction.definedValue;
        this._frame.setBrokerageAccountGroupFromDitem(accountId);
    }

    private handleSellSignalEvent() {
        this._frame.sellFocused();
    }

    private handleAccountLinkSignalEvent() {
        this._frame.brokerageAccountGroupLinked = !this._frame.brokerageAccountGroupLinked;
    }

    private handleToggleSymbolLinkingSignalEvent() {
        this._frame.litIvemIdLinked = !this._frame.litIvemIdLinked;
    }

    private handleHoldingsRecordFocusEvent(recordIndex: Integer | undefined) {
        this.pushSellButtonState(this._frame.focusedRecordIndex);
    }

    private handleGroupOpenedEvent(group: BrokerageAccountGroup) {
        this._accountGroupUiAction.pushValue(group);
    }

    private createAccountIdUiAction() {
        const action = new BrokerageAccountGroupUiAction();
        action.pushOptions({ allAllowed: true });
        action.pushTitle(Strings[StringId.SelectAccountTitle]);
        action.pushPlaceholder(Strings[StringId.BrokerageAccountIdInputPlaceholderText]);
        action.commitEvent = (typeId) => this.handleAccountGroupCommitEvent(typeId);
        return action;
    }

    private createSellUiAction() {
        const commandName = InternalCommand.Id.SellOrderPad;
        const displayId = StringId.SellOrderPadCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SellOrderPadTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SellOrderPad);
        action.pushUnselected();
        action.signalEvent = () => this.handleSellSignalEvent();
        return action;
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = () => this.handleToggleSymbolLinkingSignalEvent();
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

    private pushSellButtonState(newRecordIndex: Integer | undefined) {
        if (newRecordIndex === undefined) {
            this._sellUiAction.pushDisabled();
        } else {
            this._sellUiAction.pushValid();
        }
    }

    private pushAccountLinkButtonState() {
        if (this._frame.brokerageAccountGroupLinked) {
            this._accountGroupLinkUiAction.pushSelected();
        } else {
            this._accountGroupLinkUiAction.pushUnselected();
        }
    }

    private pushSymbolLinkButtonState() {
        if (this._frame.litIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private getBalancesHeight() {
        const sizes = this._balancesHoldingsSplitComponent.getVisibleAreaSizes();
        if (sizes.length !== 2) {
            throw new AssertInternalError('HDNCGBHHL23239', sizes.length.toString(10));
        } else {
            const balancesHeight = sizes[0];
            if (balancesHeight === '*') {
                throw new AssertInternalError('HDNCGBHH023239');
            } else {
                return balancesHeight;
            }
        }
    }
}

export namespace HoldingsDitemNgComponent {
    export const stateSchemaVersion = '2';

    export namespace JsonName {
        export const balancesHeight = 'balancesHeight';
    }
}
