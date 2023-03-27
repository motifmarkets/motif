/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Inject, OnDestroy } from '@angular/core';
import {
    AssertInternalError,
    ColorScheme,
    MultiEvent,
    NotImplementedError, OrderExtendedSideId, OrderPad,
    OrderRequestDataDefinition,
    OrderTriggerTypeId,
    SettingsService, StringId,
    Strings,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { SettingsNgService, SymbolsNgService, TextFormatterNgService } from 'component-services-ng-api';
import { ReviewOrderRequestComponentNgDirective } from '../../ng/review-order-request-component-ng.directive';

@Component({
    selector: 'app-review-place-order-request',
    templateUrl: './review-place-order-request-ng.component.html',
    styleUrls: ['./review-place-order-request-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewPlaceOrderRequestNgComponent extends ReviewOrderRequestComponentNgDirective implements OnDestroy {
    @HostBinding('style.--color-grid-base-bkgd') gridBkgdColor: string;
    @HostBinding('style.--color-grid-base-alt-bkgd') gridAltBkgdColor: string;
    @HostBinding('style.--color-grid-order-side') gridOrderSideColor: string;

    public readonly requestType = Strings[StringId.OrderRequestTypeDisplay_Place];
    public readonly accountCaption: string;
    public readonly accountId: string;
    public readonly accountName: string;
    public readonly sideCaption: string;
    public readonly side: string;
    public readonly symbolCaption: string;
    public readonly symbolCode: string;
    public readonly symbolName: string;
    public readonly orderTypeCaption: string;
    public readonly orderType: string;
    public readonly timeInForceCaption: string;
    public readonly timeInForce: string;
    public readonly expiryDate: string;
    public readonly triggerCaption: string;
    public readonly trigger: string;
    public readonly quantityCaption: string;
    public readonly quantity: string;
    public readonly priceCaption: string;
    public readonly price: string;

    private _settingsService: SettingsService;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private readonly _sideId: OrderExtendedSideId;

    constructor(cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        symbolsNgService: SymbolsNgService,
        textFormatterNgService: TextFormatterNgService,
        @Inject(ReviewOrderRequestComponentNgDirective.orderPadInjectionToken) orderPad: OrderPad,
        @Inject(ReviewOrderRequestComponentNgDirective.definitionInjectionToken) definition: OrderRequestDataDefinition
    ) {
        super(cdr, orderPad, definition);

        this._settingsService = settingsNgService.settingsService;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.applySettings());

        const symbolsService = symbolsNgService.service;
        const textFormatterService = textFormatterNgService.service;

        this.accountCaption = Strings[StringId.OrderPadAccountCaption];

        const accountId = orderPad.getAccountIdIfOk();
        if (accountId === undefined) {
            throw new AssertInternalError('RPIRCCAI9888332312');
        } else {
            this.accountId = accountId;

            if (orderPad.account === undefined) {
                throw new AssertInternalError('RPIRCCAN9888332312');
            } else {
                this.accountName = orderPad.account.name;
            }
        }

        this.sideCaption = Strings[StringId.OrderPadSideCaption];

        const sideId = orderPad.getSideIdIfOk();
        if (sideId === undefined) {
            throw new AssertInternalError('RPIRCCSI9888332312');
        } else {
            this._sideId = sideId;
            this.side = textFormatterService.formatOrderExtendedSideId(sideId);
        }

        this.symbolCaption = Strings[StringId.OrderPadSymbolCaption];

        if (orderPad.routedIvemId === undefined) {
            throw new AssertInternalError('RPIRCCRI9888332312');
        } else {
            this.symbolCode = symbolsService.routedIvemIdToNothingHiddenDisplay(orderPad.routedIvemId);

            const detail = orderPad.getSymbolDetailIfOk();
            if (detail === undefined) {
                throw new AssertInternalError('RPIRCCSD9888332312');
            } else {
                this.symbolName = symbolsService.calculateSymbolName(
                    detail.exchangeId,
                    detail.name,
                    detail.litIvemId.code,
                    detail.alternateCodes
                );
            }
        }

        this.orderTypeCaption = Strings[StringId.OrderPadOrderTypeCaption];

        const orderTypeId = orderPad.getOrderTypeIdIfOk();
        if (orderTypeId === undefined) {
            throw new AssertInternalError('RPIRCCOT9888332312');
        } else {
            this.orderType = textFormatterService.formatOrderTypeId(orderTypeId);
        }

        this.timeInForceCaption = Strings[StringId.OrderPadTimeInForceCaption];

        const timeInForceId = orderPad.getTimeInForceIdIfOk();
        if (timeInForceId === undefined) {
            throw new AssertInternalError('RPIRCCTF9888332312');
        } else {
            this.timeInForce = textFormatterService.formatTimeInForceId(timeInForceId);

            if (!orderPad.isFieldValid(OrderPad.FieldId.ExpiryDate)) {
                throw new AssertInternalError('RPIRCCED9888332312');
            } else {
                const expiryDate = orderPad.expiryDate;
                if (expiryDate === undefined) {
                    this.expiryDate = '';
                } else {
                    this.expiryDate = textFormatterService.formatDate(expiryDate);
                }
            }
        }

        this.triggerCaption = Strings[StringId.OrderPadTriggerCaption];

        const triggerTypeId = orderPad.getTriggerTypeIdIfOk();
        if (triggerTypeId === undefined) {
            throw new AssertInternalError('RPORNGCTTIU44320002993');
        } else {
            const orderTrigger = orderPad.createOrderTrigger();
            const triggerTypeText = textFormatterService.formatOrderTriggerTypeId(triggerTypeId);
            switch (triggerTypeId) {
                case OrderTriggerTypeId.Immediate: {
                    this.trigger = triggerTypeText;
                    break;
                }
                case OrderTriggerTypeId.Price: {
                    const triggerValue = orderTrigger.value;
                    const triggerValueText = triggerValue === undefined ? '' : textFormatterService.formatPrice(triggerValue);
                    const triggerExtraParamsText = orderTrigger.extraParamsText;
                    let trigger = triggerTypeText;
                    if (triggerValueText !== '') {
                        trigger += ': ' + triggerValueText;
                    }
                    if (triggerExtraParamsText !== undefined && triggerExtraParamsText !== '') {
                        trigger += ' ' + '(' + triggerExtraParamsText + ')';
                    }
                    this.trigger = trigger;
                    break;
                }
                case OrderTriggerTypeId.TrailingPrice:
                    throw new NotImplementedError('RPORNGCTTIUT44320002993');
                case OrderTriggerTypeId.PercentageTrailingPrice:
                    throw new NotImplementedError('RPORNGCTTIUP44320002993');
                case OrderTriggerTypeId.Overnight:
                    throw new NotImplementedError('RPORNGCTTIO44320002993');
                default:
                    throw new UnreachableCaseError('RPORNGCTTIR44320002993', triggerTypeId);
            }

            if (!orderPad.isFieldValid(OrderPad.FieldId.ExpiryDate)) {
                throw new AssertInternalError('RPIRCCD9888332312');
            } else {
                const expiryDate = orderPad.expiryDate;
                if (expiryDate === undefined) {
                    this.expiryDate = '';
                } else {
                    this.expiryDate = textFormatterService.formatDate(expiryDate);
                }
            }
        }

        this.quantityCaption = Strings[StringId.OrderPadTotalQuantityCaption];

        const totalQuantity = orderPad.getTotalQuantityIdIfOk();
        if (totalQuantity === undefined) {
            throw new AssertInternalError('RPIRCCTC9888332312');
        } else {
            this.quantity = textFormatterService.formatQuantity(totalQuantity);
        }

        this.priceCaption = Strings[StringId.OrderPadLimitValueCaption];

        if (!orderPad.isFieldValid(OrderPad.FieldId.LimitValue)) {
            throw new AssertInternalError('RPIRCCLV9888332312');
        } else {
            const price = orderPad.limitValue;
            if (price === undefined) {
                this.price = '';
            } else {
                this.price = textFormatterService.formatPrice(price);
            }
        }

        this.applySettings();
    }

    ngOnDestroy() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
    }

    private applySettings() {
        this.gridBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_Base);
        this.gridAltBkgdColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_BaseAlt);
        switch (this._sideId) {
            case OrderExtendedSideId.Buy:
                this.gridOrderSideColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_PriceBuy);
                break;
            case OrderExtendedSideId.Sell:
                this.gridOrderSideColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_PriceSell);
                break;
        }
        this.markForCheck();
    }
}
