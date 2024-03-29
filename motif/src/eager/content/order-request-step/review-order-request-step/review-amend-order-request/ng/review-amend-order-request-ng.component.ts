/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, OnDestroy } from '@angular/core';
import {
    AssertInternalError,
    ColorScheme,
    MultiEvent, OrderExtendedSideId, OrderPad,
    OrderRequestDataDefinition,
    SettingsService, StringId,
    Strings
} from '@motifmarkets/motif-core';
import { SettingsNgService, SymbolsNgService, TextFormatterNgService } from 'component-services-ng-api';
import { ReviewOrderRequestComponentNgDirective } from '../../ng/review-order-request-component-ng.directive';

@Component({
    selector: 'app-review-amend-order-request',
    templateUrl: './review-amend-order-request-ng.component.html',
    styleUrls: ['./review-amend-order-request-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewAmendOrderRequestNgComponent extends ReviewOrderRequestComponentNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.--color-grid-base-bkgd') gridBkgdColor: string;
    @HostBinding('style.--color-grid-base-alt-bkgd') gridAltBkgdColor: string;
    @HostBinding('style.--color-grid-order-side') gridOrderSideColor: string;

    public readonly requestType = Strings[StringId.OrderRequestTypeDisplay_Amend];
    public readonly orderIdCaption: string;
    public readonly orderId: string;
    public readonly accountCaption: string;
    public readonly accountId: string;
    public readonly accountName: string;
    public readonly accountModified: boolean;
    public readonly sideCaption: string;
    public readonly side: string;
    public readonly sideModified: boolean;
    public readonly symbolCaption: string;
    public readonly symbolCode: string;
    public readonly symbolName: string;
    public readonly symbolModified: boolean;
    public readonly orderTypeCaption: string;
    public readonly orderType: string;
    public readonly orderTypeModified: boolean;
    public readonly timeInForceCaption: string;
    public readonly timeInForce: string;
    public readonly expiryDate: string;
    public readonly timeInForceModified: boolean;
    public readonly quantityCaption: string;
    public readonly quantity: string;
    public readonly quantityModified: boolean;
    public readonly priceCaption: string;
    public readonly price: string;
    public readonly priceModified: boolean;

    private _settingsService: SettingsService;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private readonly _sideId: OrderExtendedSideId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        symbolsNgService: SymbolsNgService,
        textFormatterNgService: TextFormatterNgService,
        @Inject(ReviewOrderRequestComponentNgDirective.orderPadInjectionToken) orderPad: OrderPad,
        @Inject(ReviewOrderRequestComponentNgDirective.definitionInjectionToken) definition: OrderRequestDataDefinition
    ) {
        super(elRef, ++ReviewAmendOrderRequestNgComponent.typeInstanceCreateCount, cdr, orderPad, definition);

        this._settingsService = settingsNgService.service;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.applySettings());

        const symbolsService = symbolsNgService.service;
        const textFormatterService = textFormatterNgService.service;

        this.orderIdCaption = Strings[StringId.OrderPadExistingOrderIdCaption];
        const orderId = orderPad.existingOrderId;
        if (orderId === undefined) {
            throw new AssertInternalError('RAIRCCOI9888332312');
        } else {
            this.orderId = orderId;
        }

        this.accountCaption = Strings[StringId.OrderPadAccountCaption];
        this.accountModified = this.orderPad.isFieldModified(OrderPad.FieldId.Account);

        const accountId = orderPad.getAccountIdIfOk();
        if (accountId === undefined) {
            throw new AssertInternalError('RAIRCCAI9888332312');
        } else {
            this.accountId = accountId;

            if (orderPad.account === undefined) {
                throw new AssertInternalError('RAIRCCAN9888332312');
            } else {
                this.accountName = orderPad.account.name;
            }
        }

        this.sideCaption = Strings[StringId.OrderPadSideCaption];
        this.sideModified = this.orderPad.isFieldModified(OrderPad.FieldId.Side);

        const sideId = orderPad.getSideIdIfOk();
        if (sideId === undefined) {
            throw new AssertInternalError('RAIRCCSI9888332312');
        } else {
            this._sideId = sideId;
            this.side = textFormatterService.formatOrderExtendedSideId(sideId);
        }

        this.symbolCaption = Strings[StringId.OrderPadSymbolCaption];
        this.symbolModified = this.orderPad.isFieldModified(OrderPad.FieldId.Symbol);

        if (orderPad.routedIvemId === undefined) {
            throw new AssertInternalError('RAIRCCRI9888332312');
        } else {
            this.symbolCode = symbolsService.routedIvemIdToNothingHiddenDisplay(orderPad.routedIvemId);

            const detail = orderPad.getSymbolDetailIfOk();
            if (detail === undefined) {
                throw new AssertInternalError('RAIRCCSD9888332312');
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
        this.orderTypeModified = this.orderPad.isFieldModified(OrderPad.FieldId.OrderType);

        const orderTypeId = orderPad.getOrderTypeIdIfOk();
        if (orderTypeId === undefined) {
            throw new AssertInternalError('RAIRCCOT9888332312');
        } else {
            this.orderType = textFormatterService.formatOrderTypeId(orderTypeId);
        }

        this.timeInForceCaption = Strings[StringId.OrderPadTimeInForceCaption];
        this.timeInForceModified = this.orderPad.isFieldModified(OrderPad.FieldId.TimeInForce) ||
            this.orderPad.isFieldModified(OrderPad.FieldId.ExpiryDate);

        const timeInForceId = orderPad.getTimeInForceIdIfOk();
        if (timeInForceId === undefined) {
            throw new AssertInternalError('RAIRCCTF9888332312');
        } else {
            this.timeInForce = textFormatterService.formatTimeInForceId(timeInForceId);

            if (!orderPad.isFieldValid(OrderPad.FieldId.ExpiryDate)) {
                throw new AssertInternalError('RAIRCCED9888332312');
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
        this.quantityModified = this.orderPad.isFieldModified(OrderPad.FieldId.TotalQuantity);

        const totalQuantity = orderPad.getTotalQuantityIdIfOk();
        if (totalQuantity === undefined) {
            throw new AssertInternalError('RAIRCCTC9888332312');
        } else {
            this.quantity = textFormatterService.formatQuantity(totalQuantity);
        }

        this.priceCaption = Strings[StringId.OrderPadLimitValueCaption];
        this.priceModified = this.orderPad.isFieldModified(OrderPad.FieldId.LimitValue);

        if (!orderPad.isFieldValid(OrderPad.FieldId.LimitValue)) {
            throw new AssertInternalError('RAIRCCLV9888332312');
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
