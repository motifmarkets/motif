/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MarketId, MarketInfo } from 'src/adi/internal-api';
import { Integer, MultiEvent } from 'src/sys/internal-api';
import { EnumUiAction } from './enum-ui-action';
import { SymbolsService } from './symbols-service';

export class AllowedMarketsEnumUiAction extends EnumUiAction {
    private _allowedMarketIdsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private _symbolsManager: SymbolsService) {
        super();

        this._allowedMarketIdsChangedSubscriptionId = this._symbolsManager.subscribeAllowedMarketIdsChangedEvent(
            () => this.handleAllowedMarketIdsChanged()
        );
    }

    override finalise() {
        this._symbolsManager.unsubscribeAllowedMarketIdsChangedEvent(this._allowedMarketIdsChangedSubscriptionId);
        this._allowedMarketIdsChangedSubscriptionId = undefined;
    }

    getElementProperties(element: Integer) {
        const marketIds = this._symbolsManager.allowedMarketIds;
        if (marketIds.includes(element)) {
            return this.createEnumUiActionElementProperties(element);
        } else {
            return undefined;
        }
    }

    getElementPropertiesArray() {
        const marketIds = this._symbolsManager.allowedMarketIds;
        const count = marketIds.length;
        const result = new Array<EnumUiAction.ElementProperties>(count);
        for (let i = 0; i < count; i++) {
            const marketId = marketIds[i];
            result[i] = this.createEnumUiActionElementProperties(marketId);
        }
        return result;
    }

    private handleAllowedMarketIdsChanged() {
        this.notifyElementsPush(undefined);
    }

    private createEnumUiActionElementProperties(marketId: MarketId) {
        const result: EnumUiAction.ElementProperties = {
            element: marketId,
            caption: this._symbolsManager.getMarketGlobalCode(marketId),
            title: MarketInfo.idToDisplay(marketId),
        };
        return result;
    }
}
