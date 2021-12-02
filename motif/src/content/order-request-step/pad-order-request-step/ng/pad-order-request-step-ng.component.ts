/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, ViewChild } from '@angular/core';
import {
    Account, AssertInternalError, BrokerageAccountGroup, BrokerageAccountGroupUiAction, BrokerageAccountId, ColorScheme,
    DateUiAction,
    DecimalUiAction, delay1Tick, EnumUiAction, ExchangeInfo, ExplicitElementsEnumUiAction, Integer, IntegerUiAction, Movement, MovementId, MultiEvent,
    newUndefinableDate,
    newUndefinableDecimal, Order, OrderPad, OrderRequestTypeId, OrderRoute, OrderRouteUiAction, OrderTriggerType,
    OrderTriggerTypeId,
    OrderType,
    OrderTypeId, PriceOrderTrigger, RoutedIvemId, RoutedIvemIdUiAction,
    SettingsService, Side,
    SideId, SingleBrokerageAccountGroup, StringId, Strings, StringUiAction, TimeInForce,
    TimeInForceId, UiAction, UnreachableCaseError
} from '@motifmarkets/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import {
    BrokerageAccountGroupInputNgComponent,
    BrokerageAccountGroupNameLabelNgComponent,
    CaptionedRadioNgComponent,
    CaptionLabelNgComponent,
    DateInputNgComponent,
    DecimalInputNgComponent,
    EnumCaptionNgComponent,
    EnumInputNgComponent,
    IntegerLabelNgComponent,
    IntegerTextInputNgComponent,
    OrderRouteInputNgComponent,
    RoutedIvemIdSelectNgComponent,
    SymbolNameLabelNgComponent,
    TextInputNgComponent
} from 'controls-ng-api';
import Decimal from 'decimal.js-light';
import { ContentNgService } from '../../../ng/content-ng.service';
import { OrderRequestStepComponentNgDirective } from '../../ng/order-request-step-component-ng.directive';
import { PadOrderRequestStepFrame } from '../pad-order-request-step-frame';

@Component({
    selector: 'app-pad-order-request-step',
    templateUrl: './pad-order-request-step-ng.component.html',
    styleUrls: ['./pad-order-request-step-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PadOrderRequestStepNgComponent extends OrderRequestStepComponentNgDirective
    implements OnDestroy, AfterViewInit, PadOrderRequestStepFrame.ComponentAccess {

    @HostBinding('style.--color-grid-base-bkgd') gridBkgdColor: string;
    @HostBinding('style.--color-grid-base-alt-bkgd') gridAltBkgdColor: string;

    @ViewChild('accountLabel', { static: true }) private _accountLabelComponent: CaptionLabelNgComponent;
    @ViewChild('accountIdInput', { static: true }) private _accountIdInputComponent: BrokerageAccountGroupInputNgComponent;
    @ViewChild('accountNameLabel', { static: true }) private _accountNameLabelComponent: BrokerageAccountGroupNameLabelNgComponent;
    @ViewChild('sideLabel', { static: true }) private _sideLabelComponent: CaptionLabelNgComponent;
    @ViewChild('buySideRadio', { static: true }) private _buySideRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('sellSideRadio', { static: true }) private _sellSideRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('shortSellSideRadio', { static: true }) private _shortSellSideRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('symbolLabel', { static: true }) private _symbolLabelComponent: CaptionLabelNgComponent;
    @ViewChild('symbolInput', { static: true }) private _symbolInputComponent: RoutedIvemIdSelectNgComponent;
    @ViewChild('symbolNameLabel', { static: true }) private _symbolNameLabelComponent: SymbolNameLabelNgComponent;
    @ViewChild('routeInput', { static: true }) private _routeInputComponent: OrderRouteInputNgComponent;
    @ViewChild('quantityLabel', { static: true }) private _quantityLabelComponent: CaptionLabelNgComponent;
    @ViewChild('quantityInput', { static: true }) private _quantityInputComponent: IntegerTextInputNgComponent;
    @ViewChild('orderTypeLabel', { static: true }) private _orderTypeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('limitOrderTypeRadio', { static: true }) private _limitOrderTypeRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('marketOrderTypeRadio', { static: true }) private _marketOrderTypeRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('orderTypeInput', { static: true }) private _orderTypeInputComponent: EnumInputNgComponent;
    @ViewChild('priceLabel', { static: true }) private _priceLabelComponent: CaptionLabelNgComponent;
    @ViewChild('priceInput', { static: true }) private _limitValueInputComponent: DecimalInputNgComponent;
    @ViewChild('priceUnitLabel', { static: true }) private _limitUnitLabelComponent: EnumCaptionNgComponent;
    @ViewChild('timeInForceLabel', { static: true }) private _timeInForceLabelComponent: CaptionLabelNgComponent;
    @ViewChild('untilCancelRadio', { static: true }) private _untilCancelRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('fillAndKillRadio', { static: true }) private _fillAndKillRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('fillOrKillRadio', { static: true }) private _fillOrKillRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('dayRadio', { static: true }) private _dayRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('untilDateRadio', { static: true }) private _untilDateRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('expiryDateInput', { static: true }) private _expiryDateInputComponent: DateInputNgComponent;
    @ViewChild('triggerLabel', { static: true }) private _triggerLabelComponent: CaptionLabelNgComponent;
    @ViewChild('immediateTriggerTypeRadio', { static: true }) private _immediateTriggerTypeRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('priceTriggerTypeRadio', { static: true }) private _priceTriggerTypeRadioComponent: CaptionedRadioNgComponent;
    // @ViewChild('triggerTypeInput', { static: true }) private _triggerTypeInputComponent: EnumInputNgComponent;
    @ViewChild('triggerValueLabel', { static: true }) private _triggerValueLabelComponent: CaptionLabelNgComponent;
    @ViewChild('triggerValueInput', { static: true }) private _triggerValueInputComponent: DecimalInputNgComponent;
    @ViewChild('lastTriggerFieldRadio', { static: true }) private _lastTriggerFieldRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('bestBidTriggerFieldRadio', { static: true }) private _bestBidTriggerFieldRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('bestAskTriggerFieldRadio', { static: true }) private _bestAskTriggerFieldRadioComponent: CaptionedRadioNgComponent;
    // @ViewChild('triggerFieldSelect', { static: true }) private _triggerFieldSelectComponent: EnumInputNgComponent;
    @ViewChild('noneTriggerMovementRadio', { static: true }) private _noneTriggerMovementRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('upTriggerMovementRadio', { static: true }) private _upTriggerMovementRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('downTriggerMovementRadio', { static: true }) private _downTriggerMovementRadioComponent: CaptionedRadioNgComponent;
    @ViewChild('existingOrderLabel', { static: true }) private _existingOrderLabelComponent: CaptionLabelNgComponent;
    @ViewChild('existingOrderIdControl', { static: true }) private _existingOrderIdControlComponent: TextInputNgComponent;
    @ViewChild('destinationAccountLabel', { static: true }) private _destinationAccountLabelComponent: CaptionLabelNgComponent;
    @ViewChild('destinationAccountIdControl', { static: true })
        private _destinationAccountIdControlComponent: BrokerageAccountGroupInputNgComponent;
    @ViewChild('destinationAccountNameLabel', { static: true })
        private _destinationAccountNameLabelComponent: BrokerageAccountGroupNameLabelNgComponent;
    @ViewChild('errorsLabel', { static: true }) private _errorsLabelComponent: CaptionLabelNgComponent;
    @ViewChild('errorCountLabel', { static: true }) private _errorCountComponent: IntegerLabelNgComponent;
    @ViewChild('errorsInput', { static: true }) private _errorsInputComponent: TextInputNgComponent;
    // @ViewChild('noErrorsLabel', { static: true }) private _noErrorsLabelComponent: LabelComponent;

    public readonly sideRadioName: string;
    public readonly orderTypeRadioName: string;
    public readonly timeInForceRadioName: string;
    public readonly triggerTypeRadioName: string;
    public readonly triggerFieldRadioName: string;
    public readonly triggerMovementRadioName: string;

    public priceTriggerTypeVisible = false;
    public existingOrderVisible = false;
    public destinationAccountVisible = false;

    private readonly _frame: PadOrderRequestStepFrame;
    private readonly _settingsService: SettingsService;
    private readonly _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private readonly _accountGroupUiAction: BrokerageAccountGroupUiAction;
    private readonly _sideUiAction: ExplicitElementsEnumUiAction;
    private readonly _symbolUiAction: RoutedIvemIdUiAction;
    private readonly _routeUiAction: OrderRouteUiAction;
    private readonly _totalQuantityUiAction: IntegerUiAction;
    private readonly _orderTypeUiAction: ExplicitElementsEnumUiAction;
    private readonly _limitValueUiAction: DecimalUiAction;
    private readonly _limitUnitUiAction: ExplicitElementsEnumUiAction;
    private readonly _triggerTypeUiAction: ExplicitElementsEnumUiAction;
    private readonly _triggerValueUiAction: DecimalUiAction;
    private readonly _triggerFieldUiAction: ExplicitElementsEnumUiAction;
    private readonly _triggerMovementUiAction: ExplicitElementsEnumUiAction;
    private readonly _timeInForceUiAction: ExplicitElementsEnumUiAction;
    private readonly _expiryDateUiAction: DateUiAction;
    private readonly _existingOrderIdUiAction: StringUiAction;
    private readonly _destinationAccountGroupUiAction: BrokerageAccountGroupUiAction;
    private readonly _errorCountUiAction: IntegerUiAction;
    private readonly _errorsUiAction: StringUiAction;

    constructor(cdr: ChangeDetectorRef, settingsNgService: SettingsNgService, contentNgService: ContentNgService) {
        super(cdr);

        this._settingsService = settingsNgService.settingsService;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.applySettings());

        this.sideRadioName = this.generateInstancedRadioName('side');
        this.orderTypeRadioName = this.generateInstancedRadioName('orderType');
        this.timeInForceRadioName = this.generateInstancedRadioName('timeInForce');
        this.triggerTypeRadioName = this.generateInstancedRadioName('triggerType');
        this.triggerFieldRadioName = this.generateInstancedRadioName('triggerField');
        this.triggerMovementRadioName = this.generateInstancedRadioName('triggerMovement');

        this._frame = contentNgService.createPadOrderRequestStepFrame(this);

        this._accountGroupUiAction = this.createAccountIdUiAction();
        this._sideUiAction = this.createSideUiAction();
        this._symbolUiAction = this.createSymbolUiAction();
        this._routeUiAction = this.createRouteUiAction();
        this._totalQuantityUiAction = this.createTotalQuantityUiAction();
        this._orderTypeUiAction = this.createOrderTypeUiAction();
        this._limitValueUiAction = this.createLimitValueUiAction();
        this._limitUnitUiAction = this.createLimitUnitUiAction();
        this._triggerTypeUiAction = this.createTriggerTypeUiAction();
        this._triggerValueUiAction = this.createTriggerValueUiAction();
        this._triggerFieldUiAction = this.createTriggerFieldUiAction();
        this._triggerMovementUiAction = this.createTriggerMovementUiAction();
        this._timeInForceUiAction = this.createTimeInForceUiAction();
        this._expiryDateUiAction = this.createExpiryDateUiAction();
        this._existingOrderIdUiAction = this.createExistingOrderIdUiAction();
        this._destinationAccountGroupUiAction = this.createDestinationAccountIdUiAction();
        this._errorCountUiAction = this.createErrorCountUiAction();
        this._errorsUiAction = this.createErrorsUiAction();

        this.applySettings();

        this.initialiseUiFieldErrorState(OrderPad.FieldId.Account, this._accountGroupUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.Side, this._sideUiAction);
        const symbolEditInfo = this.calculateSymbolEditInfo();
        this._frame.initialiseUiFieldErrorState(OrderPad.FieldId.Symbol,
            symbolEditInfo.edited, symbolEditInfo.valid, symbolEditInfo.missing, symbolEditInfo.errorText
        );
        this.initialiseUiFieldErrorState(OrderPad.FieldId.TotalQuantity, this._totalQuantityUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.OrderType, this._orderTypeUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.LimitValue, this._limitValueUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.TriggerType, this._triggerTypeUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.TriggerValue, this._triggerValueUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.TriggerField, this._triggerFieldUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.TriggerMovement, this._triggerMovementUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.TimeInForce, this._timeInForceUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.ExpiryDate, this._expiryDateUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.ExistingOrder, this._existingOrderIdUiAction);
        this.initialiseUiFieldErrorState(OrderPad.FieldId.DestinationAccount, this._destinationAccountGroupUiAction);
    }

    get frame() { return this._frame; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialiseComponents());
    }

    orderPadSet() {
        switch (this.frame.orderPad.requestTypeId) {
            case OrderRequestTypeId.Place:
                this.existingOrderVisible = false;
                this.destinationAccountVisible = false;
                break;
            case OrderRequestTypeId.Amend:
                this.existingOrderVisible = true;
                this.destinationAccountVisible = false;
                break;
            case OrderRequestTypeId.Cancel:
                this.existingOrderVisible = true;
                this.destinationAccountVisible = false;
                break;
            case OrderRequestTypeId.Move:
                this.existingOrderVisible = true;
                this.destinationAccountVisible = true;
                break;
            default:
                throw new UnreachableCaseError('PORSCOPS100009388', this.frame.orderPad.requestTypeId);
        }
        this.markForCheck();
    }

    pushAccount(uiActionStateId: UiAction.StateId, title: string | undefined, accountId: BrokerageAccountId | undefined) {
        let group: SingleBrokerageAccountGroup | undefined;
        if (accountId === undefined) {
            group = undefined;
        } else {
            const key = new Account.Key(accountId, ExchangeInfo.getDefaultEnvironmentId());
            group = BrokerageAccountGroup.createSingle(key);
        }
        this._accountGroupUiAction.pushValue(group);
        this._accountGroupUiAction.pushState(uiActionStateId, title);

        if (this._accountGroupUiAction.isValueOk()) {
            this._accountNameLabelComponent.displayed = true;
        } else {
            this._accountNameLabelComponent.displayed = false;
        }
    }

    pushSide(uiActionStateId: UiAction.StateId, title: string | undefined, sideId: SideId | undefined, allowedSideIds: readonly SideId[]) {
        this._sideUiAction.pushFilter(allowedSideIds);
        this._sideUiAction.pushValue(sideId);
        this._sideUiAction.pushState(uiActionStateId, title);
    }

    pushSymbol(uiActionStateId: UiAction.StateId, title: string | undefined, symbol: RoutedIvemId | undefined,
        allowedRoutes: readonly OrderRoute[]) {
        this._symbolUiAction.pushValue(symbol);
        this._symbolUiAction.pushState(uiActionStateId, title);
        this._routeUiAction.pushAllowedValues(allowedRoutes);
        this._routeUiAction.pushValue(symbol === undefined ? undefined : symbol.route);
        this._routeUiAction.pushState(uiActionStateId, title);
    }

    pushTotalQuantity(uiActionStateId: UiAction.StateId, title: string | undefined, totalQuantity: Integer | undefined) {
        this._totalQuantityUiAction.pushValue(totalQuantity);
        this._totalQuantityUiAction.pushState(uiActionStateId, title);
    }

    pushTriggerType(uiActionStateId: UiAction.StateId, title: string | undefined, triggerTypeId: OrderTriggerTypeId | undefined,
        allowedTriggerTypeIds: readonly OrderTriggerTypeId[]) {
        this._triggerTypeUiAction.pushFilter(allowedTriggerTypeIds);
        this._triggerTypeUiAction.pushValue(triggerTypeId);
        this._triggerTypeUiAction.pushState(uiActionStateId, title);

        const priceTriggerTypeVisible = triggerTypeId === OrderTriggerTypeId.Price;
        if (priceTriggerTypeVisible !== this.priceTriggerTypeVisible) {
            this.priceTriggerTypeVisible = priceTriggerTypeVisible;
            this.markForCheck();
        }
    }

    pushTriggerValue(uiActionStateId: UiAction.StateId, title: string | undefined, triggerValue: Decimal | undefined) {
        this._triggerValueUiAction.pushValue(triggerValue);
        this._triggerValueUiAction.pushState(uiActionStateId, title);
    }

    pushTriggerField(uiActionStateId: UiAction.StateId, title: string | undefined, triggerFieldId: PriceOrderTrigger.FieldId | undefined) {
        this._triggerFieldUiAction.pushValue(triggerFieldId);
        this._triggerFieldUiAction.pushState(uiActionStateId, title);
    }

    pushTriggerMovement(uiActionStateId: UiAction.StateId, title: string | undefined, triggerMovementId: MovementId | undefined) {
        this._triggerMovementUiAction.pushValue(triggerMovementId);
        this._triggerMovementUiAction.pushState(uiActionStateId, title);
    }

    pushOrderType(uiActionStateId: UiAction.StateId, title: string | undefined, orderTypeId: OrderTypeId | undefined,
        allowedOrderTypeIds: readonly OrderTypeId[]) {
        this._orderTypeUiAction.pushFilter(allowedOrderTypeIds);
        this._orderTypeUiAction.pushValue(orderTypeId);
        this._orderTypeUiAction.pushState(uiActionStateId, title);
    }

    pushLimitValue(uiActionStateId: UiAction.StateId, title: string | undefined, limitValue: Decimal | undefined) {
        this._limitValueUiAction.pushValue(limitValue);
        this._limitValueUiAction.pushState(uiActionStateId, title);
    }

    pushLimitUnit(uiActionStateId: UiAction.StateId, title: string | undefined, limitUnitId: OrderPad.PriceUnitId | undefined) {
        this._limitUnitUiAction.pushValue(limitUnitId);
        this._limitUnitUiAction.pushState(uiActionStateId, title);
    }

    pushTimeInForce(uiActionStateId: UiAction.StateId, title: string | undefined, timeInForceId: TimeInForceId | undefined,
        allowedTimeInForceIds: readonly TimeInForceId[]) {
        this._timeInForceUiAction.pushFilter(allowedTimeInForceIds);
        this._timeInForceUiAction.pushValue(timeInForceId);
        this._timeInForceUiAction.pushState(uiActionStateId, title);
    }

    pushExpiryDate(uiActionStateId: UiAction.StateId, title: string | undefined, expiryDate: Date | undefined) {
        this._expiryDateUiAction.pushValue(expiryDate);
        this._expiryDateUiAction.pushState(uiActionStateId, title);
    }

    pushExistingOrderId(uiActionStateId: UiAction.StateId, title: string | undefined, existingOrderId: Order.Id | undefined) {
        this._existingOrderIdUiAction.pushValue(existingOrderId);
        this._existingOrderIdUiAction.pushState(uiActionStateId, title);
    }

    pushDestinationAccount(uiActionStateId: UiAction.StateId, title: string | undefined,
        destinationAccountId: BrokerageAccountId | undefined) {
        let group: SingleBrokerageAccountGroup | undefined;
        if (destinationAccountId === undefined) {
            group = undefined;
        } else {
            const key = new Account.Key(destinationAccountId, ExchangeInfo.getDefaultEnvironmentId());
            group = BrokerageAccountGroup.createSingle(key);
        }
        this._destinationAccountGroupUiAction.pushValue(group);
        this._destinationAccountGroupUiAction.pushState(uiActionStateId, title);
    }

    pushErrors(title: string, errors: string) {
        if (errors === '') {
            this._errorsUiAction.pushValue('');
            const noErrorsText = Strings[StringId.NoErrors];
            this._errorsUiAction.pushTitle(noErrorsText);
            this._errorCountUiAction.pushTitle(noErrorsText);
        } else {
            this._errorsUiAction.pushValue(errors);
            this._errorsUiAction.pushTitle(title);
            this._errorCountUiAction.pushTitle(title);
        }
    }

    pushErrorCount(count: Integer) {
        this._errorCountUiAction.pushValue(count);
    }

    protected finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);

        this._existingOrderIdUiAction.finalise();
        this._accountGroupUiAction.finalise();
        this._sideUiAction.finalise();
        this._symbolUiAction.finalise();
        this._routeUiAction.finalise();
        this._totalQuantityUiAction.finalise();
        this._orderTypeUiAction.finalise();
        this._limitValueUiAction.finalise();
        this._limitUnitUiAction.finalise();
        this._triggerTypeUiAction.finalise();
        this._triggerValueUiAction.finalise();
        this._triggerFieldUiAction.finalise();
        this._triggerMovementUiAction.finalise();
        this._timeInForceUiAction.finalise();
        this._expiryDateUiAction.finalise();
        this._errorCountUiAction.finalise();
        this._errorsUiAction.finalise();

        this._frame.finalise();
    }

    private handleAccountCommitEvent() {
        const group = this._accountGroupUiAction.value;
        if (group === undefined) {
            this._frame.accountId = undefined;
        } else {
            if (group instanceof SingleBrokerageAccountGroup) {
                this._frame.accountId = group.id;
            } else {
                throw new AssertInternalError('PORSCHACE4444449');
            }
        }
    }

    private handleAccountEditedChangeEvent() {
        const uiAction = this._accountGroupUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.Account,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleSideCommitEvent() {
        this._frame.sideId = this._sideUiAction.value;
    }

    private handleSideEditedChangeEvent() {
        const uiAction = this._sideUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.Side,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleSymbolCommitEvent() {
        this._frame.routedIvemId = this._symbolUiAction.value?.createCopy();
    }

    private handleRouteCommitEvent() {
        this._frame.route = this._routeUiAction.definedValue.createCopy();
    }

    private handleSymbolOrRouteEditedChangeEvent() {
        const { edited, valid, missing, errorText } = this.calculateSymbolEditInfo();
        this._frame.setUiFieldErrorState(OrderPad.FieldId.Symbol, edited, valid, missing, errorText);
    }

    private handleTotalQuantityCommitEvent() {
        this._frame.totalQuantity = this._totalQuantityUiAction.value;
    }

    private handleTotalQuantityEditedChangeEvent() {
        const uiAction = this._totalQuantityUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.TotalQuantity,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleOrderTypeCommitEvent() {
        this._frame.orderTypeId = this._orderTypeUiAction.value;
    }

    private handleOrderTypeEditedChangeEvent() {
        const uiAction = this._orderTypeUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.OrderType,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleLimitValueCommitEvent() {
        this._frame.limitValue = newUndefinableDecimal(this._limitValueUiAction.value);
    }

    private handleLimitValueEditedChangeEvent() {
        const uiAction = this._limitValueUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.LimitValue,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleTriggerTypeCommitEvent() {
        this._frame.triggerTypeId = this._triggerTypeUiAction.value;
    }

    private handleTriggerTypeEditedChangeEvent() {
        const uiAction = this._triggerTypeUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.TriggerType,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText);
    }

    private handleTriggerValueCommitEvent() {
        this._frame.triggerValue = this._triggerValueUiAction.value;
    }

    private handleTriggerValueEditedChangeEvent() {
        const uiAction = this._triggerValueUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.TriggerValue,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleTriggerFieldCommitEvent() {
        this._frame.triggerField = this._triggerFieldUiAction.value;
    }

    private handleTriggerFieldEditedChangeEvent() {
        const uiAction = this._triggerFieldUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.TriggerField,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleTriggerMovementCommitEvent() {
        this._frame.triggerMovement = this._triggerMovementUiAction.value;
    }

    private handleTriggerMovementEditedChangeEvent() {
        const uiAction = this._triggerMovementUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.TriggerMovement,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleTimeInForceCommitEvent() {
        this._frame.timeInForceId = this._timeInForceUiAction.value;
    }

    private handleTimeInForceEditedChangeEvent() {
        const uiAction = this._timeInForceUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.TimeInForce,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleExpiryDateCommitEvent() {
        this._frame.expiryDate = newUndefinableDate(this._expiryDateUiAction.value);
    }

    private handleExpiryDateEditedChangeEvent() {
        const uiAction = this._expiryDateUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.ExpiryDate,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleExistingOrderIdCommitEvent() {
        this._frame.existingOrderId = this._existingOrderIdUiAction.value;
    }

    private handleExistingOrderIdEditedChangeEvent() {
        const uiAction = this._existingOrderIdUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.ExistingOrder,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private handleDestinationAccountCommitEvent() {
        const group = this._destinationAccountGroupUiAction.value;
        if (group === undefined) {
            this._frame.destinationAccountId = undefined;
        } else {
            if (group instanceof SingleBrokerageAccountGroup) {
                this._frame.destinationAccountId = group.id;
            } else {
                throw new AssertInternalError('PORSCHDACE2323991755');
            }
        }
    }

    private handleDestinationAccountEditedChangeEvent() {
        const uiAction = this._destinationAccountGroupUiAction;
        this._frame.setUiFieldErrorState(OrderPad.FieldId.DestinationAccount,
            uiAction.edited, uiAction.editedValid, uiAction.editedMissing, uiAction.editedInvalidErrorText
        );
    }

    private applySettings() {
        this.gridBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_Base);
        this.gridAltBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_BaseAlt);
        this.markForCheck();
    }

    private calculateSymbolEditInfo(): PadOrderRequestStepNgComponent.SymbolFieldEditInfo {
        const edited = this._symbolUiAction.edited || this._routeUiAction.edited;
        const valid = this._symbolUiAction.editedValid && this._routeUiAction.editedValid;
        const missing = this._symbolUiAction.editedMissing || this._routeUiAction.editedMissing;
        let errorText: string | undefined;
        if (this._symbolUiAction.editedInvalidErrorText === undefined) {
            if (this._routeUiAction.editedInvalidErrorText === undefined) {
                errorText = undefined;
            } else {
                errorText = this._routeUiAction.editedInvalidErrorText;
            }
        } else {
            if (this._routeUiAction.editedInvalidErrorText === undefined) {
                errorText = this._symbolUiAction.editedInvalidErrorText;
            } else {
                errorText = `${this._symbolUiAction.editedInvalidErrorText} | ${this._routeUiAction.editedInvalidErrorText}`;
            }
        }
        return { edited, valid, missing, errorText };
    }

    private setCommonActionProperties(action: UiAction) {
        action.commitOnAnyValidInput = true; // want all valid input
        action.autoEchoCommit = false; // echo is handled by OrderPad
        action.autoAcceptanceTypeId = UiAction.AutoAcceptanceTypeId.None; // OrderPad will push acceptance
        action.autoInvalid = false; // PadOrderRequestStepFrame will push Invalid state
    }

    private createAccountIdUiAction() {
        const action = new BrokerageAccountGroupUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.SelectAccountTitle]);
        action.pushCaption(Strings[StringId.OrderPadAccountCaption]);
        action.commitEvent = () => this.handleAccountCommitEvent();
        action.editedChangeEvent = () => this.handleAccountEditedChangeEvent();
        action.pushPlaceholder(Strings[StringId.BrokerageAccountIdInputPlaceholderText]);
        return action;
    }

    private getSideTitleStringId(sideId: SideId) {
        switch (sideId) {
            case SideId.Buy: return StringId.OrderPadSideTitle_Buy;
            case SideId.Sell: return StringId.OrderPadSideTitle_Sell;
            case SideId.SellShort: return StringId.OrderPadSideTitle_SellShort;
            default: return StringId.UnknownDisplayString;
        }
    }

    private createSideUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadSideTitle]);
        action.pushCaption(Strings[StringId.OrderPadSideCaption]);
        const sideIds: SideId[] = [SideId.Buy, SideId.Sell, SideId.SellShort];
        const elementPropertiesArray = sideIds.map<EnumUiAction.ElementProperties>(
            (sideId) => {
                const titleStringId = this.getSideTitleStringId(sideId);
                return {
                    element: sideId,
                    caption: Side.idToDisplay(sideId),
                    title: Strings[titleStringId],
                };
            }
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => this.handleSideCommitEvent();
        action.editedChangeEvent = () => this.handleSideEditedChangeEvent();
        return action;
    }

    private createSymbolUiAction() {
        const action = new RoutedIvemIdUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadSymbolTitle]);
        action.pushCaption(Strings[StringId.OrderPadSymbolCaption]);
        action.commitEvent = () => this.handleSymbolCommitEvent();
        action.editedChangeEvent = () => this.handleSymbolOrRouteEditedChangeEvent();
        return action;
    }

    private createRouteUiAction() {
        const action = new OrderRouteUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadRouteTitle]);
        action.commitEvent = () => this.handleRouteCommitEvent();
        action.editedChangeEvent = () => this.handleSymbolOrRouteEditedChangeEvent();
        return action;
    }

    private createTotalQuantityUiAction() {
        const action = new IntegerUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadTotalQuantityTitle]);
        action.pushCaption(Strings[StringId.OrderPadTotalQuantityCaption]);
        action.commitEvent = () => this.handleTotalQuantityCommitEvent();
        action.editedChangeEvent = () => this.handleTotalQuantityEditedChangeEvent();
        return action;
    }

    private getOrderTypeTitleStringId(orderTypeId: OrderTypeId) {
        switch (orderTypeId) {
            case OrderTypeId.Market: return StringId.OrderPadOrderTypeTitle_Market;
            case OrderTypeId.MarketToLimit: return StringId.OrderPadOrderTypeTitle_MarketToLimit;
            case OrderTypeId.Limit: return StringId.OrderPadOrderTypeTitle_Limit;
            case OrderTypeId.MarketAtBest: return StringId.OrderPadOrderTypeTitle_MarketAtBest;
            default: return StringId.UnknownDisplayString;
        }
    }

    private createOrderTypeUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadOrderTypeTitle]);
        action.pushCaption(Strings[StringId.OrderPadOrderTypeCaption]);
        const orderTypeIds: OrderTypeId[] = [OrderTypeId.Market, OrderTypeId.MarketToLimit, OrderTypeId.Limit, OrderTypeId.MarketAtBest];
        const elementPropertiesArray = orderTypeIds.map<EnumUiAction.ElementProperties>(
            (orderTypeId) => {
                const titleStringId = this.getOrderTypeTitleStringId(orderTypeId);
                return {
                    element: orderTypeId,
                    caption: OrderType.idToDisplay(orderTypeId),
                    title: Strings[titleStringId],
                };
            }
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => this.handleOrderTypeCommitEvent();
        action.editedChangeEvent = () => this.handleOrderTypeEditedChangeEvent();
        return action;
    }

    private createLimitValueUiAction() {
        const action = new DecimalUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadLimitValueTitle]);
        action.pushCaption(Strings[StringId.OrderPadLimitValueCaption]);
        action.commitEvent = () => this.handleLimitValueCommitEvent();
        action.editedChangeEvent = () => this.handleLimitValueEditedChangeEvent();
        return action;
    }

    private createLimitUnitUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadLimitUnitTitle]);
        const priceUnitIds: OrderPad.PriceUnitId[] = OrderPad.PriceUnit.all;
        const elementPropertiesArray = priceUnitIds.map<EnumUiAction.ElementProperties>(
            (priceUnitId) => (
                {
                    element: priceUnitId,
                    caption: '$',
                    title: '', /*OrderPad.PriceUnit.idToDisplay(priceUnitId)*/
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        return action;
    }

    private getTriggerTypeTitleStringId(triggerTypeId: OrderTriggerTypeId) {
        switch (triggerTypeId) {
            case OrderTriggerTypeId.Immediate: return StringId.OrderPadTriggerTypeTitle_Immediate;
            case OrderTriggerTypeId.Price: return StringId.OrderPadTriggerTypeTitle_Price;
            case OrderTriggerTypeId.TrailingPrice: return StringId.OrderPadTriggerTypeTitle_TrailingPrice;
            case OrderTriggerTypeId.PercentageTrailingPrice: return StringId.OrderPadTriggerTypeTitle_PercentageTrailingPrice;
            case OrderTriggerTypeId.Overnight: return StringId.OrderPadTriggerTypeTitle_Overnight;
            default: throw new UnreachableCaseError('OPDCGTTTD3886439', triggerTypeId);
        }
    }

    private createTriggerTypeUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadTriggerTitle]);
        action.pushCaption(Strings[StringId.OrderPadTriggerCaption]);
        const triggerTypeIds = OrderTriggerType.all;
        const elementPropertiesArray = triggerTypeIds.map<EnumUiAction.ElementProperties>(
            (triggerTypeId) => {
                const titleStringId = this.getTriggerTypeTitleStringId(triggerTypeId);
                return {
                    element: triggerTypeId,
                    caption: OrderTriggerType.idToDisplay(triggerTypeId),
                    title: Strings[titleStringId],
                };
            }
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => this.handleTriggerTypeCommitEvent();
        action.editedChangeEvent = () => this.handleTriggerTypeEditedChangeEvent();
        return action;
    }

    private createTriggerValueUiAction() {
        const action = new DecimalUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadTriggerValueTitle]);
        action.pushCaption(Strings[StringId.OrderPadTriggerValueCaption]);
        action.commitEvent = () => this.handleTriggerValueCommitEvent();
        action.editedChangeEvent = () => this.handleTriggerValueEditedChangeEvent();
        return action;
    }

    private getTriggerFieldTitleStringId(triggerFieldId: PriceOrderTrigger.FieldId) {
        switch (triggerFieldId) {
            case PriceOrderTrigger.FieldId.Last: return StringId.OrderPadTriggerFieldTitle_Last;
            case PriceOrderTrigger.FieldId.BestBid: return StringId.OrderPadTriggerFieldTitle_BestBid;
            case PriceOrderTrigger.FieldId.BestAsk: return StringId.OrderPadTriggerFieldTitle_BestAsk;
            default: throw new UnreachableCaseError('OPDCGTFTSI677400022', triggerFieldId);
        }
    }

    private createTriggerFieldUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadTriggerFieldTitle]);
        action.pushCaption(Strings[StringId.OrderPadTriggerFieldCaption]);
        const triggerFieldIds = PriceOrderTrigger.Field.all;
        const elementPropertiesArray = triggerFieldIds.map<EnumUiAction.ElementProperties>(
            (triggerFieldId) => {
                const titleStringId = this.getTriggerFieldTitleStringId(triggerFieldId);
                return {
                    element: triggerFieldId,
                    caption: PriceOrderTrigger.Field.idToDisplay(triggerFieldId),
                    title: Strings[titleStringId],
                };
            }
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => this.handleTriggerFieldCommitEvent();
        action.editedChangeEvent = () => this.handleTriggerFieldEditedChangeEvent();
        return action;
    }

    private getTriggerMovementTitleStringId(movementId: MovementId) {
        switch (movementId) {
            case MovementId.None: return StringId.OrderApiTriggerMovementTitle_None;
            case MovementId.Up: return StringId.OrderApiTriggerMovementTitle_Up;
            case MovementId.Down: return StringId.OrderApiTriggerMovementTitle_Down;
            default: throw new UnreachableCaseError('OPDCGTMTSI49226888', movementId);
        }
    }

    private createTriggerMovementUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadTriggerMovementTitle]);
        action.pushCaption(Strings[StringId.OrderPadTriggerMovementCaption]);
        const movementIds = Movement.all;
        const elementPropertiesArray = movementIds.map<EnumUiAction.ElementProperties>(
            (movementId) => {
                const titleStringId = this.getTriggerMovementTitleStringId(movementId);
                return {
                    element: movementId,
                    caption: Movement.idToDisplay(movementId),
                    title: Strings[titleStringId],
                };
            }
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => this.handleTriggerMovementCommitEvent();
        action.editedChangeEvent = () => this.handleTriggerMovementEditedChangeEvent();
        return action;
    }

    private getTimeInForceTitleStringId(timeInForceId: TimeInForceId) {
        switch (timeInForceId) {
            case TimeInForceId.Day: return StringId.OrderPadTimeInForceTitle_Day;
            case TimeInForceId.GoodTillCancel: return StringId.OrderPadTimeInForceTitle_GoodTillCancel;
            case TimeInForceId.AtTheOpening: return StringId.OrderPadTimeInForceTitle_AtTheOpening;
            case TimeInForceId.FillAndKill: return StringId.OrderPadTimeInForceTitle_FillAndKill;
            case TimeInForceId.FillOrKill: return StringId.OrderPadTimeInForceTitle_FillOrKill;
            case TimeInForceId.AllOrNone: return StringId.OrderPadTimeInForceTitle_AllOrNone;
            case TimeInForceId.GoodTillCrossing: return StringId.OrderPadTimeInForceTitle_GoodTillCrossing;
            case TimeInForceId.GoodTillDate: return StringId.OrderPadTimeInForceTitle_GoodTillDate;
            case TimeInForceId.AtTheClose: return StringId.OrderPadTimeInForceTitle_AtTheClose;
            default: throw new UnreachableCaseError('OPDCGTIFTSI599834', timeInForceId);
        }
    }

    private createTimeInForceUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadTimeInForceTitle]);
        action.pushCaption(Strings[StringId.OrderPadTimeInForceCaption]);
        const timeInForceIds = TimeInForce.all;
        const elementPropertiesArray = timeInForceIds.map<EnumUiAction.ElementProperties>(
            (timeInForceId) => {
                const titleStringId = this.getTimeInForceTitleStringId(timeInForceId);
                return {
                    element: timeInForceId,
                    caption: TimeInForce.idToDisplay(timeInForceId),
                    title: Strings[titleStringId],
                };
            }
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => this.handleTimeInForceCommitEvent();
        action.editedChangeEvent = () => this.handleTimeInForceEditedChangeEvent();
        return action;
    }

    private createExpiryDateUiAction() {
        const action = new DateUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadExpiryDateTitle]);
        action.pushCaption(Strings[StringId.OrderPadExpiryDateCaption]);
        action.commitEvent = () => this.handleExpiryDateCommitEvent();
        action.editedChangeEvent = () => this.handleExpiryDateEditedChangeEvent();
        return action;
    }

    private createExistingOrderIdUiAction() {
        const action = new StringUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadExistingOrderIdTitle]);
        action.pushCaption(Strings[StringId.OrderPadExistingOrderIdCaption]);
        action.commitEvent = () => this.handleExistingOrderIdCommitEvent();
        action.editedChangeEvent = () => this.handleExistingOrderIdEditedChangeEvent();
        return action;
    }

    private createDestinationAccountIdUiAction() {
        const action = new BrokerageAccountGroupUiAction();
        this.setCommonActionProperties(action);
        action.pushTitle(Strings[StringId.OrderPadDestinationAccountTitle]);
        action.pushCaption(Strings[StringId.OrderPadDestinationAccountCaption]);
        action.commitEvent = () => this.handleDestinationAccountCommitEvent();
        action.editedChangeEvent = () => this.handleDestinationAccountEditedChangeEvent();
        action.pushPlaceholder(Strings[StringId.BrokerageAccountIdInputPlaceholderText]);
        return action;
    }

    private createErrorCountUiAction() {
        const action = new IntegerUiAction();
        action.pushTitle(Strings[StringId.NoErrors]);
        return action;
    }

    private createErrorsUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.NoErrors]);
        action.pushCaption(Strings[StringId.OrderPadErrorsCaption]);
        return action;
    }

    private initialiseUiFieldErrorState(fieldId: OrderPad.FieldId, action: UiAction) {
        this._frame.initialiseUiFieldErrorState(fieldId,
            action.edited, action.editedValid, action.editedMissing, action.editedInvalidErrorText
        );
    }

    private initialiseComponents() {
        this._accountLabelComponent.initialise(this._accountGroupUiAction);
        this._accountIdInputComponent.initialise(this._accountGroupUiAction);
        this._accountNameLabelComponent.initialise(this._accountGroupUiAction);
        this._sideLabelComponent.initialise(this._sideUiAction);
        this._buySideRadioComponent.initialiseEnum(this._sideUiAction, SideId.Buy);
        this._sellSideRadioComponent.initialiseEnum(this._sideUiAction, SideId.Sell);
        this._shortSellSideRadioComponent.initialiseEnum(this._sideUiAction, SideId.SellShort);
        this._symbolLabelComponent.initialise(this._symbolUiAction);
        this._symbolInputComponent.initialise(this._symbolUiAction);
        this._symbolNameLabelComponent.initialise(this._symbolUiAction);
        this._routeInputComponent.initialise(this._routeUiAction);
        this._quantityLabelComponent.initialise(this._totalQuantityUiAction);
        this._quantityInputComponent.initialise(this._totalQuantityUiAction);
        this._orderTypeLabelComponent.initialise(this._orderTypeUiAction);
        this._limitOrderTypeRadioComponent.initialiseEnum(this._orderTypeUiAction, OrderTypeId.Limit);
        this._marketOrderTypeRadioComponent.initialiseEnum(this._orderTypeUiAction, OrderTypeId.Market);
        this._orderTypeInputComponent.initialise(this._orderTypeUiAction);
        this._priceLabelComponent.initialise(this._limitValueUiAction);
        this._limitValueInputComponent.initialise(this._limitValueUiAction);
        this._limitUnitLabelComponent.initialise(this._limitUnitUiAction);
        this._timeInForceLabelComponent.initialise(this._timeInForceUiAction);
        this._untilCancelRadioComponent.initialiseEnum(this._timeInForceUiAction, TimeInForceId.GoodTillCancel);
        this._fillAndKillRadioComponent.initialiseEnum(this._timeInForceUiAction, TimeInForceId.FillAndKill);
        this._fillOrKillRadioComponent.initialiseEnum(this._timeInForceUiAction, TimeInForceId.FillOrKill);
        this._dayRadioComponent.initialiseEnum(this._timeInForceUiAction, TimeInForceId.Day);
        this._untilDateRadioComponent.initialiseEnum(this._timeInForceUiAction, TimeInForceId.GoodTillDate);
        this._expiryDateInputComponent.initialise(this._expiryDateUiAction);
        this._triggerLabelComponent.initialise(this._triggerTypeUiAction);
        this._immediateTriggerTypeRadioComponent.initialiseEnum(this._triggerTypeUiAction, OrderTriggerTypeId.Immediate);
        this._priceTriggerTypeRadioComponent.initialiseEnum(this._triggerTypeUiAction, OrderTriggerTypeId.Price);
        // this._triggerTypeInputComponent.initialise(this._triggerTypeUiAction);
        this._triggerValueLabelComponent.initialise(this._triggerValueUiAction);
        this._triggerValueInputComponent.initialise(this._triggerValueUiAction);
        this._lastTriggerFieldRadioComponent.initialiseEnum(this._triggerFieldUiAction, PriceOrderTrigger.FieldId.Last);
        this._bestBidTriggerFieldRadioComponent.initialiseEnum(this._triggerFieldUiAction, PriceOrderTrigger.FieldId.BestBid);
        this._bestAskTriggerFieldRadioComponent.initialiseEnum(this._triggerFieldUiAction, PriceOrderTrigger.FieldId.BestAsk);
        // this._triggerFieldSelectComponent.initialise(this._triggerFieldUiAction);
        this._noneTriggerMovementRadioComponent.initialiseEnum(this._triggerMovementUiAction, MovementId.None);
        this._upTriggerMovementRadioComponent.initialiseEnum(this._triggerMovementUiAction, MovementId.Up);
        this._downTriggerMovementRadioComponent.initialiseEnum(this._triggerMovementUiAction, MovementId.Down);
        this._existingOrderLabelComponent.initialise(this._existingOrderIdUiAction);
        this._existingOrderIdControlComponent.initialise(this._existingOrderIdUiAction);
        this._destinationAccountLabelComponent.initialise(this._destinationAccountGroupUiAction);
        this._destinationAccountIdControlComponent.initialise(this._destinationAccountGroupUiAction);
        this._destinationAccountNameLabelComponent.initialise(this._destinationAccountGroupUiAction);
        this._errorsLabelComponent.initialise(this._errorsUiAction);
        this._errorCountComponent.initialise(this._errorCountUiAction);
        this._errorCountComponent.readonlyAlways = true;
        this._errorsInputComponent.initialise(this._errorsUiAction);
        this._errorsInputComponent.readonlyAlways = true;
        // this._noErrorsLabelComponent.initialise(this._noErrorsUiAction);
    }
}

export namespace PadOrderRequestStepNgComponent {
    export namespace JsonName {
        export const content = 'content';
    }

    export const latestLayoutConfigJsonProtocol = '1';

    export interface SymbolFieldEditInfo {
        edited: boolean;
        valid: boolean;
        missing: boolean;
        errorText: string | undefined;
    }
}
