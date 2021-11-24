/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, LitIvemId } from 'adi-internal-api';
import { GridLayout, MotifGrid, TradesFrame } from 'content-internal-api';
import { CommandRegisterService, SymbolsService } from 'core-internal-api';
import { JsonElement } from 'sys-internal-api';
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
            this._contentFrame.loadLayoutConfig(undefined);
        } else {
            const contentElement = frameElement.tryGetElement(TradesDitemFrame.JsonName.content);
            this._contentFrame.loadLayoutConfig(contentElement);
        }

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(TradesDitemFrame.JsonName.content);
        this._contentFrame.saveLayoutConfig(contentElement);
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

    getGridLayoutWithHeadings(): MotifGrid.LayoutWithHeadersMap | undefined {
        return this._contentFrame && this._contentFrame.getGridLayoutWithHeadersMap();
    }

    setGridLayout(layout: GridLayout): void {
        if (!this._contentFrame) {
            throw new Error('Condition not handled [ID:5326171853]');
        }
        this._contentFrame.setGridLayout(layout);
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
