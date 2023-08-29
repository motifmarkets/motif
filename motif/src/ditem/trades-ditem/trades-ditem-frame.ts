/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AllowedFieldsGridLayoutDefinition,
    AssertInternalError,
    CommandRegisterService,
    GridLayoutDefinition,
    JsonElement,
    LitIvemId,
    SettingsService,
    SymbolsService
} from '@motifmarkets/motif-core';
import { TradesFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class TradesDitemFrame extends BuiltinDitemFrame {
    private _tradesFrame: TradesFrame | undefined;

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

    initialise(ditemFrameElement: JsonElement | undefined, tradesFrame: TradesFrame): void {
        this._tradesFrame = tradesFrame;

        let tradesFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const tradesFrameElementResult = ditemFrameElement.tryGetElement(TradesDitemFrame.JsonName.tradesFrame);
            if (tradesFrameElementResult.isOk()) {
                tradesFrameElement = tradesFrameElementResult.value;
            }
        }
        this._tradesFrame.initialise(tradesFrameElement);

        this.applyLinked();
    }

    override finalise() {
        if (this._tradesFrame !== undefined) {
            this._tradesFrame.finalise();
        }
        super.finalise();
    }

    override save(ditemFrameElement: JsonElement) {
        super.save(ditemFrameElement);

        if (this._tradesFrame === undefined) {
            throw new AssertInternalError('TDFS44407');
        } else {
            const tradesFrameElement = ditemFrameElement.newElement(TradesDitemFrame.JsonName.tradesFrame);
            this._tradesFrame.saveLayoutToConfig(tradesFrameElement);
        }
    }

    open() {
        if (this._tradesFrame === undefined) {
            throw new AssertInternalError('TDFO44407');
        } else {
            const litIvemId = this.litIvemId;
            if (litIvemId === undefined) {
                this._tradesFrame.close();
                this._componentAccess.notifyOpenedClosed(undefined, undefined);
            } else {
                const historicalDate = this._componentAccess.getHistoricalDate();
                this._tradesFrame.open(litIvemId, historicalDate);

                this.updateLockerName(this.symbolsService.litIvemIdToDisplay(litIvemId));
                this._componentAccess.notifyOpenedClosed(litIvemId, historicalDate);
            }
        }
    }

    historicalDateCommit() {
        if (this.litIvemId !== undefined) {
            this.open();
        }
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        if (this._tradesFrame === undefined) {
            throw new AssertInternalError('TDFASACW44407');
        } else {
            this._tradesFrame.autoSizeAllColumnWidths(widenOnly);
        }
    }

    createAllowedFieldsGridLayoutDefinition(): AllowedFieldsGridLayoutDefinition | undefined {
        if (this._tradesFrame === undefined) {
            throw new AssertInternalError('TDFCAFALD44407');
        } else {
            return this._tradesFrame.createAllowedFieldsGridLayoutDefinition();
        }
    }

    applyGridLayoutDefinition(layoutDefinition: GridLayoutDefinition): void {
        if (this._tradesFrame === undefined) {
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
        export const tradesFrame = 'tradesFrame';
    }

    export type OpenedEventHandler = (this: void) => void;

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        getHistoricalDate(): Date | undefined;
        pushSymbol(litIvemId: LitIvemId): void;
        notifyOpenedClosed(litIvemId: LitIvemId | undefined, historicalDate: Date | undefined): void;
    }
}
