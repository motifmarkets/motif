/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    CommandRegisterService,
    GridLayoutDefinition,
    JsonElement,
    LitIvemId,
    SettingsService,
    SymbolsService
} from '@motifmarkets/motif-core';
import { AllowedFieldsAndLayoutDefinition, TradesFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class TradesDitemFrame extends BuiltinDitemFrame {
    private _tradesFrame: TradesFrame;

    constructor(
        private _componentAccess: TradesDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsMgr: SymbolsService,
        adi: AdiService
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Trades, _componentAccess,
            settingsService, commandRegisterService, desktopAccessService, symbolsMgr, adi
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._tradesFrame !== undefined; }

    initialise(tradesContentFrame: TradesFrame, frameElement: JsonElement | undefined): void {
        this._tradesFrame = tradesContentFrame;

        if (frameElement === undefined) {
            this._tradesFrame.initialise(undefined);
        } else {
            const contentElementResult = frameElement.tryGetElement(TradesDitemFrame.JsonName.content);
            if (contentElementResult.isErr()) {
                this._tradesFrame.initialise(undefined);
            } else {
                this._tradesFrame.initialise(contentElementResult.value);
            }
        }

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(TradesDitemFrame.JsonName.content);
        this._tradesFrame.saveLayoutToConfig(contentElement);
    }

    open() {
        const litIvemId = this.litIvemId;
        if (litIvemId === undefined) {
            this._tradesFrame.close();
            this._componentAccess.notifyOpenedClosed(undefined, undefined);
        } else {
            const historicalDate = this._componentAccess.getHistoricalDate();
            this._tradesFrame.open(litIvemId, historicalDate);

            this._componentAccess.notifyOpenedClosed(litIvemId, historicalDate);
        }
    }

    historicalDateCommit() {
        if (this.litIvemId !== undefined) {
            this.open();
        }
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        this._tradesFrame.autoSizeAllColumnWidths(widenOnly);
    }

    createAllowedFieldsAndLayoutDefinition(): AllowedFieldsAndLayoutDefinition | undefined {
        return this._tradesFrame?.createAllowedFieldsAndLayoutDefinition();
    }

    applyGridLayoutDefinition(layoutDefinition: GridLayoutDefinition): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this._tradesFrame) {
            throw new Error('Condition not handled [ID:5326171853]');
        } else {
            this._tradesFrame.applyGridLayoutDefinition(layoutDefinition);
        }
    }

    protected override applyLitIvemId(litIvemId: LitIvemId | undefined, selfInitiated: boolean): boolean {
        super.applyLitIvemId(litIvemId, selfInitiated);
        if (litIvemId === undefined) {
            return false;
        } else {
            this._componentAccess.pushSymbol(litIvemId);
            this.open();
            return true;
        }
    }
}

export namespace TradesDitemFrame {
    export namespace JsonName {
        export const content = 'content';
    }

    export type OpenedEventHandler = (this: void) => void;

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        getHistoricalDate(): Date | undefined;
        pushSymbol(litIvemId: LitIvemId): void;
        notifyOpenedClosed(litIvemId: LitIvemId | undefined, historicalDate: Date | undefined): void;
    }
}
