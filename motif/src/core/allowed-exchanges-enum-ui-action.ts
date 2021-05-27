/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, ExchangeInfo } from 'src/adi/internal-api';
import { Integer, MultiEvent } from 'src/sys/internal-api';
import { EnumUiAction } from './enum-ui-action';
import { SymbolsService } from './symbols-service';

export class AllowedExchangesEnumUiAction extends EnumUiAction {
    private _allowedExchangeIdsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _symbolsManager: SymbolsService) {
        super();

        this._allowedExchangeIdsChangedSubscriptionId = this._symbolsManager.subscribeAllowedExchangeIdsChangedEvent(
            () => this.handleAllowedExchangeIdsChanged()
        );
    }

    finalise() {
        this._symbolsManager.unsubscribeAllowedExchangeIdsChangedEvent(this._allowedExchangeIdsChangedSubscriptionId);
        this._allowedExchangeIdsChangedSubscriptionId = undefined;
    }

    getElementProperties(element: Integer) {
        const exchangeIds = this._symbolsManager.allowedExchangeIds;
        if (exchangeIds.includes(element)) {
            return this.createEnumUiActionElementProperties(element);
        } else {
            return undefined;
        }
    }

    getElementPropertiesArray() {
        const exchangeIds = this._symbolsManager.allowedExchangeIds;
        const count = exchangeIds.length;
        const result = new Array<EnumUiAction.ElementProperties>(count);
        for (let i = 0; i < count; i++) {
            const exchangeId = exchangeIds[i];
            result[i] = this.createEnumUiActionElementProperties(exchangeId);
        }
        return result;
    }

    private handleAllowedExchangeIdsChanged() {
        this.notifyElementsPush(undefined);
    }

    private createEnumUiActionElementProperties(exchangeId: ExchangeId) {
        const result: EnumUiAction.ElementProperties = {
            element: exchangeId,
            caption: ExchangeInfo.idToAbbreviatedDisplay(exchangeId),
            title: ExchangeInfo.idToFullDisplay(exchangeId),
        };
        return result;
    }
}
