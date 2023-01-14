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
    SymbolsService
} from '@motifmarkets/motif-core';
import { RecordGrid, TradesFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class TradesDitemFrame extends BuiltinDitemFrame {
    private _contentFrame: TradesFrame;

    constructor(
        private _componentAccess: TradesDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsMgr: SymbolsService,
        adi: AdiService
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Trades, _componentAccess,
            commandRegisterService, desktopAccessService, symbolsMgr, adi
        );
    }

    get initialised() { return this._contentFrame !== undefined; }

    initialise(tradesContentFrame: TradesFrame, frameElement: JsonElement | undefined): void {
        this._contentFrame = tradesContentFrame;

        if (frameElement === undefined) {
            this._contentFrame.loadConfig(undefined);
        } else {
            const contentElementResult = frameElement.tryGetElementType(TradesDitemFrame.JsonName.content);
            if (contentElementResult.isErr()) {
                this._contentFrame.loadConfig(undefined);
            } else {
                this._contentFrame.loadConfig(contentElementResult.value);
            }
        }

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(TradesDitemFrame.JsonName.content);
        this._contentFrame.saveLayoutToConfig(contentElement);
    }

    open() {
        const litIvemId = this.litIvemId;
        if (litIvemId === undefined) {
            this._contentFrame.close();
            this._componentAccess.notifyOpenedClosed(undefined, undefined);
        } else {
            const historicalDate = this._componentAccess.getHistoricalDate();
            this._contentFrame.open(litIvemId, historicalDate);

            this._componentAccess.notifyOpenedClosed(litIvemId, historicalDate);
        }
    }

    historicalDateCommit() {
        if (this.litIvemId !== undefined) {
            this.open();
        }
    }

    autoSizeAllColumnWidths() {
        this._contentFrame.autoSizeAllColumnWidths();
    }

    createAllowedFieldsAndLayoutDefinition(): RecordGrid.AllowedFieldsAndLayoutDefinition | undefined {
        return this._contentFrame?.createAllowedFieldsAndLayoutDefinition();
    }

    applyGridLayoutDefinition(layoutDefinition: GridLayoutDefinition): void {
        if (!this._contentFrame) {
            throw new Error('Condition not handled [ID:5326171853]');
        }
        this._contentFrame.applyGridLayoutDefinition(layoutDefinition);
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
