/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, ExchangeInfo } from 'adi-internal-api';
import { Integer, MultiEvent } from 'sys-internal-api';
import { ArrayUiAction } from './array-ui-action';
import { EnumArrayUiAction } from './enum-array-ui-action';
import { SymbolsService } from './symbols-service';

export class AllowedExchangesEnumArrayUiAction extends EnumArrayUiAction {
    private _allowedExchangeIdsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _symbolsManager: SymbolsService) {
        super();

        this._allowedExchangeIdsChangedSubscriptionId = this._symbolsManager.subscribeAllowedExchangeIdsChangedEvent(
            () => this.handleAllowedExchangeIdsChanged()
        );
    }

    override finalise() {
        this._symbolsManager.unsubscribeAllowedExchangeIdsChangedEvent(this._allowedExchangeIdsChangedSubscriptionId);
        this._allowedExchangeIdsChangedSubscriptionId = undefined;
    }

    getElementProperties(element: Integer) {
        const exchangeIds = this._symbolsManager.allowedExchangeIds;
        if (exchangeIds.includes(element)) {
            return this.createEnumArrayUiActionElementProperties(element);
        } else {
            return undefined;
        }
    }

    getElementPropertiesArray() {
        const exchangeIds = this._symbolsManager.allowedExchangeIds;
        const count = exchangeIds.length;
        const result = new Array<ArrayUiAction.ElementProperties<ExchangeId>>(count);
        for (let i = 0; i < count; i++) {
            const exchangeId = exchangeIds[i];
            result[i] = this.createEnumArrayUiActionElementProperties(exchangeId);
        }
        return result;
    }

    private handleAllowedExchangeIdsChanged() {
        this.notifyElementsPush(undefined);
    }

    private createEnumArrayUiActionElementProperties(exchangeId: ExchangeId) {
        const result: ArrayUiAction.ElementProperties<ExchangeId> = {
            element: exchangeId,
            caption: ExchangeInfo.idToAbbreviatedDisplay(exchangeId),
            title: ExchangeInfo.idToFullDisplay(exchangeId),
        };
        return result;
    }
}
