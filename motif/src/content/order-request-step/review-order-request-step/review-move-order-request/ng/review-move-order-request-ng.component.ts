/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Inject, OnDestroy } from '@angular/core';
import { OrderRequestDataDefinition, SideId } from 'src/adi/internal-api';
import { SettingsNgService, SymbolsNgService } from 'src/component-services/ng-api';
import { ColorScheme, OrderPad, SettingsService, textFormatter } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { AssertInternalError, MultiEvent } from 'src/sys/internal-api';
import { ReviewOrderRequestComponentNgDirective } from '../../ng/review-order-request-component-ng.directive';

@Component({
    selector: 'app-review-move-order-request',
    templateUrl: './review-move-order-request-ng.component.html',
    styleUrls: ['./review-move-order-request-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewMoveOrderRequestNgComponent extends ReviewOrderRequestComponentNgDirective implements OnDestroy {
    @HostBinding('style.--color-grid-base-bkgd') gridBkgdColor: string;
    @HostBinding('style.--color-grid-base-alt-bkgd') gridAltBkgdColor: string;
    @HostBinding('style.--color-grid-order-side') gridOrderSideColor: string;

    public readonly requestType = Strings[StringId.OrderRequestTypeDisplay_Move];
    public readonly orderIdCaption: string;
    public readonly orderId: string;
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
    public readonly quantityCaption: string;
    public readonly quantity: string;
    public readonly priceCaption: string;
    public readonly price: string;
    public readonly destinationAccountCaption: string;
    public readonly destinationAccountId: string;
    public readonly destinationAccountName: string;

    private _settingsService: SettingsService;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private readonly _sideId: SideId;

    constructor(cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        symbolsNgService: SymbolsNgService,
        @Inject(ReviewOrderRequestComponentNgDirective.OrderPadInjectionToken) orderPad: OrderPad,
        @Inject(ReviewOrderRequestComponentNgDirective.DefinitionInjectionToken) definition: OrderRequestDataDefinition
    ) {
        super(cdr, orderPad, definition);

        this._settingsService = settingsNgService.settingsService;
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.applySettings());

        const symbolsService = symbolsNgService.symbolsManager;

        this.orderIdCaption = Strings[StringId.OrderPadExistingOrderIdCaption];
        const orderId = orderPad.existingOrderId;
        if (orderId === undefined) {
            throw new AssertInternalError('RMIRCCOI9888332312');
        } else {
            this.orderId = orderId;
        }

        this.accountCaption = Strings[StringId.OrderPadAccountCaption];
        const accountId = orderPad.getAccountIdIfOk();
        if (accountId === undefined) {
            throw new AssertInternalError('RMIRCCAI9888332312');
        } else {
            this.accountId = accountId;

            if (orderPad.account === undefined) {
                throw new AssertInternalError('RMIRCCAN9888332312');
            } else {
                this.accountName = orderPad.account.name;
            }
        }

        this.sideCaption = Strings[StringId.OrderPadSideCaption];

        const sideId = orderPad.getSideIdIfOk();
        if (sideId === undefined) {
            throw new AssertInternalError('RMIRCCSI9888332312');
        } else {
            this._sideId = sideId;
            this.side = textFormatter.formatSideId(sideId);
        }

        this.symbolCaption = Strings[StringId.OrderPadSymbolCaption];

        if (orderPad.routedIvemId === undefined) {
            throw new AssertInternalError('RMIRCCRI9888332312');
        } else {
            this.symbolCode = symbolsService.routedIvemIdToNothingHiddenDisplay(orderPad.routedIvemId);

            const detail = orderPad.getSymbolDetailIfOk();
            if (detail === undefined) {
                throw new AssertInternalError('RMIRCCSD9888332312');
            } else {
                this.symbolName = symbolsService.calculateSymbolName(detail.exchangeId, detail.name, detail.litIvemId.code, detail.alternateCodes);
            }
        }

        this.orderTypeCaption = Strings[StringId.OrderPadOrderTypeCaption];

        const orderTypeId = orderPad.getOrderTypeIdIfOk();
        if (orderTypeId === undefined) {
            throw new AssertInternalError('RMIRCCOT9888332312');
        } else {
            this.orderType = textFormatter.formatOrderTypeId(orderTypeId);
        }

        this.timeInForceCaption = Strings[StringId.OrderPadTimeInForceCaption];

        const timeInForceId = orderPad.getTimeInForceIdIfOk();
        if (timeInForceId === undefined) {
            throw new AssertInternalError('RMIRCCTF9888332312');
        } else {
            this.timeInForce = textFormatter.formatTimeInForceId(timeInForceId);

            if (!orderPad.isFieldValid(OrderPad.FieldId.ExpiryDate)) {
                throw new AssertInternalError('RMIRCCED9888332312');
            } else {
                const expiryDate = orderPad.expiryDate;
                if (expiryDate === undefined) {
                    this.expiryDate = '';
                } else {
                    this.expiryDate = textFormatter.formatDate(expiryDate);
                }
            }
        }

        this.quantityCaption = Strings[StringId.OrderPadTotalQuantityCaption];

        const totalQuantity = orderPad.getTotalQuantityIdIfOk();
        if (totalQuantity === undefined) {
            throw new AssertInternalError('RMIRCCTC9888332312');
        } else {
            this.quantity = textFormatter.formatQuantity(totalQuantity);
        }

        this.priceCaption = Strings[StringId.OrderPadLimitValueCaption];

        if (!orderPad.isFieldValid(OrderPad.FieldId.LimitValue)) {
            throw new AssertInternalError('RMIRCCLV9888332312');
        } else {
            const price = orderPad.limitValue;
            if (price === undefined) {
                this.price = '';
            } else {
                this.price = textFormatter.formatPrice(price);
            }
        }

        this.destinationAccountCaption = Strings[StringId.OrderPadDestinationAccountCaption];

        const destinationAccountId = orderPad.getDestinationAccountIdIfOk();
        if (destinationAccountId === undefined) {
            throw new AssertInternalError('RMIRCCDAI9888332312');
        } else {
            this.destinationAccountId = destinationAccountId;

            if (orderPad.destinationAccount === undefined) {
                throw new AssertInternalError('RMIRCCDAN9888332312');
            } else {
                this.destinationAccountName = orderPad.destinationAccount.name;
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
            case SideId.Buy:
                this.gridOrderSideColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_PriceBuy);
                break;
            case SideId.Sell:
                this.gridOrderSideColor = this._settingsService.color.getBkgd(ColorScheme.ItemId.Grid_PriceSell);
                break;
        }
        this.markForCheck();
    }
}
