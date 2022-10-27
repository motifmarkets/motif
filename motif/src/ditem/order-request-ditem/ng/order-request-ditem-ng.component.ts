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
    ElementRef, Inject,
    OnDestroy,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import {
    BooleanUiAction,
    ButtonUiAction,
    ColorScheme,
    delay1Tick,
    HtmlTypes,
    IconButtonUiAction,
    InternalCommand,
    JsonElement,
    ModifierKey,
    ModifierKeyId,
    numberToPixels,
    OrderPad,
    OrderRequestType,
    StringId,
    Strings,
    UiAction
} from '@motifmarkets/motif-core';
import {
    AdiNgService,
    CommandRegisterNgService,
    SettingsNgService,
    SymbolDetailCacheNgService,
    SymbolsNgService
} from 'component-services-ng-api';
import {
    OrderRequestStepComponentNgDirective
} from 'content-ng-api';
import { ButtonInputNgComponent, CaptionedCheckboxNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { OrderRequestStepFrame } from 'src/content/order-request-step/order-request-step-frame';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { OrderRequestDitemFrame } from '../order-request-ditem-frame';

@Component({
    selector: 'app-order-request-ditem',
    templateUrl: './order-request-ditem-ng.component.html',
    styleUrls: ['./order-request-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderRequestDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective
    implements OnDestroy, AfterViewInit, OrderRequestDitemFrame.ComponentAccess {

    @ViewChild('pad', { static: true }) private _padElementRef: ElementRef<HTMLDivElement>;
    @ViewChild('primaryButton', { static: true }) private _primaryButtonComponent: SvgButtonNgComponent;
    @ViewChild('symbolLinkButton', { static: true }) private _symbolLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('accountLinkButton', { static: true }) private _accountLinkButtonComponent: SvgButtonNgComponent;
    @ViewChild('reviewMessageCheckBox', { static: true }) private _reviewMessageCheckBoxComponent: CaptionedCheckboxNgComponent;
    @ViewChild('newButton', { static: true }) private _newButtonComponent: ButtonInputNgComponent;
    @ViewChild('reviewBackSection', { static: true }) private _reviewBackSectionElement: ElementRef<HTMLElement>;
    @ViewChild('backButton', { static: true }) private _backButtonComponent: ButtonInputNgComponent;
    @ViewChild('reviewButton', { static: true }) private _reviewButtonComponent: ButtonInputNgComponent;
    @ViewChild('sendButton', { static: true }) private _sendButtonComponent: ButtonInputNgComponent;
    // @ViewChild('padStep', { static: true }) private _padStepFrameContainer: PadOrderRequestStepComponent;
    // @ViewChild('reviewStep', { static: true }) private _reviewStepFrameContainer: ReviewOrderRequestStepComponent;
    // @ViewChild('resultStep', { static: true }) private _resultStepFrameContainer: ResultOrderRequestStepComponent;

    @ViewChildren('padStep, reviewStep, resultStep') private _stepComponentList: QueryList<OrderRequestStepComponentNgDirective>;

    public StepId = OrderRequestDitemFrame.StepId;
    public stepId: OrderRequestStepFrame.StepId;
    public panelDividerColor: string;

    public linkButtonDisplayed: boolean;
    public reviewMessageCheckboxDisplayed: boolean;

    public reviewBackSectionDisplayed = false;
    public reviewBackSectionWidth: string = HtmlTypes.Width.MaxContent;
    public reviewButtonInitDisplayed: boolean;

    public newAmendRequestPossibleFlagVisibility = HtmlTypes.Visibility.Hidden;
    public newAmendRequestPossibleFlagChar = Strings[StringId.OrderRequest_NewAmendPossibleFlagChar];

    private readonly _primaryUiAction: IconButtonUiAction;
    private readonly _toggleSymbolLinkingUiAction: IconButtonUiAction;
    private readonly _toggleAccountLinkingUiAction: IconButtonUiAction;
    private readonly _reviewZenithMessageActiveUiAction: BooleanUiAction;
    private readonly _newUiAction: ButtonUiAction;
    private readonly _backUiAction: ButtonUiAction;
    private readonly _reviewUiAction: ButtonUiAction;
    private readonly _sendUiAction: ButtonUiAction;

    private readonly _frame: OrderRequestDitemFrame;

    private _padHtmlElement: HTMLDivElement;

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        adiNgService: AdiNgService,
        symbolsNgService: SymbolsNgService,
        symbolDetailCacheNgService: SymbolDetailCacheNgService,
    ) {
        super(cdr, container, elRef, settingsNgService.settingsService, commandRegisterNgService.service);

        this._frame = new OrderRequestDitemFrame(
            this,
            this.settingsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service,
            symbolDetailCacheNgService.service,
        );

        this._primaryUiAction = this.createPrimaryUiAction();
        this._toggleSymbolLinkingUiAction = this.createToggleSymbolLinkingUiAction();
        this._toggleAccountLinkingUiAction = this.createToggleAccountLinkingUiAction();
        this._reviewZenithMessageActiveUiAction = this.createReviewZenithMessageActiveUiAction();
        this._newUiAction = this.createNewUiAction();
        this._backUiAction = this.createBackUiAction();
        this._reviewUiAction = this.createReviewUiAction();
        this._sendUiAction = this.createSendUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.reviewButtonInitDisplayed = this.settingsService.core.orderPad_ReviewEnabled;

        this.pushPrimarySelectState();
        this.pushSymbolLinkedSelectState();
        this.pushAccountLinkedSelectState();
        this.pushSymbolAccountIncomingLinkableChanged();
    }

    get frame() { return this._frame; }
    get ditemFrame() { return this._frame; }

    protected get stateSchemaVersion() { return OrderRequestDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    setOrderPad(pad: OrderPad) {
        this._frame.setOrderPad(pad);
    }

    // component access methods
    public pushStepId(stepId: OrderRequestStepFrame.StepId) {
        if (stepId === OrderRequestStepFrame.StepId.Pad) {
            this._padHtmlElement.style.width = HtmlTypes.Width.MaxContent;
            this._padHtmlElement.style.height = HtmlTypes.Height.MaxContent;
        } else {
            if (this.stepId === OrderRequestStepFrame.StepId.Pad) {
                const padWidth = this._padHtmlElement.offsetWidth;
                if (padWidth > 0) {
                    this._padHtmlElement.style.width = numberToPixels(padWidth);
                }
                const padHeight = this._padHtmlElement.offsetHeight;
                if (padHeight > 0) {
                    this._padHtmlElement.style.height = numberToPixels(padHeight);
                }
            }
        }

        this.stepId = stepId;
        this.markForCheck();
    }

    public orderPadApplied() {
        const requestTypeDisplay = OrderRequestType.idToDisplay(this._frame.orderPad.requestTypeId);
        this._sendUiAction.pushCaption(`${Strings[StringId.OrderRequest_SendCaption]} ${requestTypeDisplay}`);
    }

    public pushSymbolAccountIncomingLinkableChanged() {
        if (this._frame.symbolAccountIncomingLinkable !== this.linkButtonDisplayed) {
            this.linkButtonDisplayed = this._frame.symbolAccountIncomingLinkable;
            this.markForCheck();
        }
    }

    public pushSendEnabled(enabled: boolean) {
        if (enabled) {
            this._sendUiAction.pushAccepted();
        } else {
            this._sendUiAction.pushDisabled();
        }
    }

    public pushReviewBackNotDisplayed() {
        this.pushReviewBackSectionDisplayed(false);
    }

    public pushBackButtonEnabled(value: boolean) {
        this.pushBackButtonDisplayedTrue(); // make sure visible
        if (value) {
            this._backUiAction.pushAccepted();
        } else {
            this._backUiAction.pushDisabled();
        }
    }

    public pushReviewEnabled(value: boolean) {
        this.pushReviewButtonDisplayedTrue();
        if (value) {
            this._reviewUiAction.pushAccepted();
        } else {
            this._reviewUiAction.pushDisabled();
        }
    }

    public pushNewAmendRequestPossible(value: boolean) {
        if (value) {
            this.newAmendRequestPossibleFlagVisibility = HtmlTypes.Visibility.Visible;
        } else {
            this.newAmendRequestPossibleFlagVisibility = HtmlTypes.Visibility.Hidden;
        }
        this.markForCheck();
    }

    public pushReviewZenithMessageNotDisplayed() {
        this.pushReviewMessageCheckboxDisplayed(false);
    }

    public pushReviewZenithMessageActive(value: boolean) {
        this.pushReviewMessageCheckboxDisplayed(true);
        this._reviewZenithMessageActiveUiAction.pushValue(value);
    }

    public override processPrimaryChanged() {
        this.pushPrimarySelectState();
    }

    public override processSymbolLinkedChanged() {
        this.pushSymbolLinkedSelectState();
    }

    public override processBrokerageAccountGroupLinkedChanged() {
        this.pushAccountLinkedSelectState();
    }

    public pushReviewBackSectionDisplayed(value: boolean) {
        if (this.reviewBackSectionDisplayed !== value) {
            this.reviewBackSectionDisplayed = value;

            this.markForCheck();
        }
    }

    public pushReviewButtonDisplayedTrue() {
        this.pushReviewBackSectionDisplayed(true); // make sure visible
        if (!this._reviewButtonComponent.displayed) {
            this.reviewBackSectionWidth = HtmlTypes.Width.MaxContent;
            this._backButtonComponent.displayed = false;
            this._reviewButtonComponent.displayed = true;

            this.markForCheck();
        }
    }

    public pushBackButtonDisplayedTrue() {
        this.pushReviewBackSectionDisplayed(true); // make sure visible
        if (!this._backButtonComponent.displayed) {
            if (!this._reviewButtonComponent.displayed) {
                this.reviewBackSectionWidth = HtmlTypes.Width.MaxContent;
            } else {
                const sectionWidth = this._reviewBackSectionElement.nativeElement.offsetWidth;
                if (sectionWidth > 0) {
                    this.reviewBackSectionWidth = numberToPixels(sectionWidth);
                } else {
                    this.reviewBackSectionWidth = HtmlTypes.Width.MaxContent;
                }
                this._reviewButtonComponent.displayed = false;
            }
            this._backButtonComponent.displayed = true;

            this.markForCheck();
        }
    }

    protected override initialise() {
        this._padHtmlElement = this._padElementRef.nativeElement;

        this._stepComponentList.changes.subscribe(() => this.handleStepComponentChange());
        const componentStateElement = this.getInitialComponentStateJsonElement();
        this._frame.initialise(componentStateElement);

        this._primaryButtonComponent.initialise(this._primaryUiAction);
        this._symbolLinkButtonComponent.initialise(this._toggleSymbolLinkingUiAction);
        this._accountLinkButtonComponent.initialise(this._toggleAccountLinkingUiAction);
        this._reviewMessageCheckBoxComponent.initialise(this._reviewZenithMessageActiveUiAction);
        this._newButtonComponent.initialise(this._newUiAction);
        this._backButtonComponent.initialise(this._backUiAction);
        this._backButtonComponent.displayed = false;
        this._reviewButtonComponent.initialise(this._reviewUiAction);
        this._sendButtonComponent.initialise(this._sendUiAction);

        super.initialise();
    }

    protected override finalise() {
        this._primaryUiAction.finalise();
        this._toggleSymbolLinkingUiAction.finalise();
        this._toggleAccountLinkingUiAction.finalise();
        this._reviewZenithMessageActiveUiAction.finalise();
        this._newUiAction.finalise();
        this._backUiAction.finalise();
        this._reviewUiAction.finalise();
        this._sendUiAction.finalise();

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

    protected override applySettings() {
        this.panelDividerColor = this.settingsService.color.getFore(ColorScheme.ItemId.Panel_Divider);
        this.markForCheck();
        super.applySettings();
    }

    private handlePrimaryUiActionSignalEvent() {
        this._frame.primary = !this._frame.primary;
    }

    private handleSymbolLinkUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.litIvemIdLinked = !this._frame.litIvemIdLinked;
    }

    private handleAccountLinkUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.brokerageAccountGroupLinked = !this._frame.brokerageAccountGroupLinked;
    }

    private handleReviewZenithMessageActiveCommitEvent() {
        this._frame.setReviewZenithMessageActive(this._reviewZenithMessageActiveUiAction.definedValue);
    }

    private handleNewUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        switch (downKeys) {
            case 0:
                this._frame.newOrderPad();
                break;
            case ModifierKeyId.Shift:
                this._frame.newPlaceOrderPadFromPrevious();
                break;
            case ModifierKeyId.Ctrl:
                this._frame.newAmendOrderPadFromResult();
                break;
        }
    }

    private handleBackUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.back();
    }

    private handleReviewUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.review();
    }

    private handleSendUiActionSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this._frame.send();
    }

    private handleStepComponentChange() {
        const stepComponent = this._stepComponentList.first;
        const stepFrame = stepComponent.frame;
        delay1Tick(() => this._frame.setActiveStepFrame(stepFrame));
    }

    private createPrimaryUiAction() {
        const commandName = InternalCommand.Id.OrderRequest_TogglePrimary;
        const displayId = StringId.OrderRequest_PrimaryCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.OrderRequest_PrimaryTitle]);
        action.pushIcon(IconButtonUiAction.IconId.PrimaryDitemFrame);
        action.signalEvent = () => this.handlePrimaryUiActionSignalEvent();
        return action;
    }

    private createToggleSymbolLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleSymbolLinking;
        const displayId = StringId.ToggleSymbolLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleSymbolLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SymbolLink);
        action.signalEvent = (signalTypeId, downKeys) => this.handleSymbolLinkUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createToggleAccountLinkingUiAction() {
        const commandName = InternalCommand.Id.ToggleAccountLinking;
        const displayId = StringId.ToggleAccountLinkingCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ToggleAccountLinkingTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AccountGroupLink);
        action.signalEvent = (signalTypeId, downKeys) => this.handleAccountLinkUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createReviewZenithMessageActiveUiAction() {
        const action = new BooleanUiAction();
        action.pushTitle(Strings[StringId.OrderRequest_ReviewZenithMessageActiveTitle]);
        action.pushCaption(Strings[StringId.OrderRequest_ReviewZenithMessageActiveCaption]);
        action.commitEvent = () => this.handleReviewZenithMessageActiveCommitEvent();
        return action;
    }

    private createNewUiAction() {
        const commandName = InternalCommand.Id.OrderRequest_New;
        const displayId = StringId.OrderRequest_NewCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.OrderRequest_NewTitle]);
        action.signalEvent = (signalTypeId, downKeys) => this.handleNewUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createBackUiAction() {
        const commandName = InternalCommand.Id.OrderRequest_Back;
        const displayId = StringId.OrderRequest_BackCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.OrderRequest_BackTitle]);
        action.signalEvent = (signalTypeId, downKeys) => this.handleBackUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createReviewUiAction() {
        const commandName = InternalCommand.Id.OrderRequest_Review;
        const displayId = StringId.OrderRequest_ReviewCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.OrderRequest_ReviewTitle]);
        action.signalEvent = (signalTypeId, downKeys) => this.handleReviewUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private createSendUiAction() {
        const commandName = InternalCommand.Id.OrderRequest_Send;
        const displayId = StringId.OrderRequest_SendCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.OrderRequest_SendTitle]);
        action.signalEvent = (signalTypeId, downKeys) => this.handleSendUiActionSignalEvent(signalTypeId, downKeys);
        return action;
    }

    private pushPrimarySelectState() {
        if (this._frame.primary) {
            this._primaryUiAction.pushSelected();
        } else {
            this._primaryUiAction.pushUnselected();
        }
    }

    private pushSymbolLinkedSelectState() {
        if (this._frame.litIvemIdLinked) {
            this._toggleSymbolLinkingUiAction.pushSelected();
        } else {
            this._toggleSymbolLinkingUiAction.pushUnselected();
        }
    }

    private pushAccountLinkedSelectState() {
        if (this._frame.brokerageAccountGroupLinked) {
            this._toggleAccountLinkingUiAction.pushSelected();
        } else {
            this._toggleAccountLinkingUiAction.pushUnselected();
        }
    }

    private pushReviewMessageCheckboxDisplayed(value: boolean) {
        if (value !== this.reviewMessageCheckboxDisplayed) {
            this.reviewMessageCheckboxDisplayed = value;
            this.markForCheck();
        }
    }
}

export namespace OrderRequestDitemNgComponent {
    export const stateSchemaVersion = '2';
}
