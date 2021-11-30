/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, CommandRegisterService, DepthStyleId, JsonElement, LitIvemId, SymbolsService } from '@motifmarkets/motif-core';
import { DepthFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class DepthDitemFrame extends BuiltinDitemFrame {
    private _contentFrame: DepthFrame;

    constructor(
        private _componentAccess: DepthDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopInterface: DesktopAccessService,
        symbolsMgr: SymbolsService,
        adi: AdiService
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Depth, _componentAccess,
            commandRegisterService, desktopInterface, symbolsMgr, adi
        );
    }

    get filterActive() { return this._contentFrame.filterActive; }
    get filterXrefs() { return this._contentFrame.filterXrefs; }

    get initialised() { return this._contentFrame !== undefined; }

    initialise(depthContentFrame: DepthFrame, frameElement: JsonElement | undefined): void {
        this._contentFrame = depthContentFrame;
        this._contentFrame.initialise();

        if (frameElement === undefined) {
            this._contentFrame.loadLayoutConfig(undefined);
        } else {
            const contentElement = frameElement.tryGetElement(DepthDitemFrame.JsonName.content);
            this._contentFrame.loadLayoutConfig(contentElement);
        }

        // this._contentFrame.initialiseWidths();

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(DepthDitemFrame.JsonName.content);
        this._contentFrame.saveLayoutToConfig(contentElement);
    }

    open() {
        const litIvemId = this.litIvemId;
        if (litIvemId === undefined) {
            this._contentFrame.close();
        } else {
            this._contentFrame.open(litIvemId, DepthStyleId.Full);
        }
        this._componentAccess.notifyOpenedClosed(litIvemId);
    }

    // loadConstructLayoutConfig() {
    //     super.loadConstructLayoutConfig();
    // }

    toggleFilterActive() {
        this._contentFrame.toggleFilterActive();
    }

    setFilter(xrefs: string[]) {
        this._contentFrame.setFilter(xrefs);
    }

    expand(newRecordsOnly: boolean) {
        this._contentFrame.openExpand = true;
        this._contentFrame.expand(newRecordsOnly);
    }

    rollUp(newRecordsOnly: boolean) {
        this._contentFrame.openExpand = false;
        this._contentFrame.rollup(newRecordsOnly);
    }

    autoSizeAllColumnWidths() {
        this._contentFrame.autoSizeAllColumnWidths();
    }

    getGridLayoutsWithHeadings() {
        return this._contentFrame.getGridLayoutsWithHeadings();
    }

    setGridLayouts(layout: DepthFrame.GridLayouts) {
        this._contentFrame.setGridLayouts(layout);
    }

    // adviseShown() {
    //     setTimeout(() => this._contentFrame.initialiseWidths(), 200);
    // }

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


export namespace DepthDitemFrame {
    export namespace JsonName {
        export const content = 'content';
    }

    export type OpenedEventHandler = (this: void) => void;


    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        pushSymbol(litIvemId: LitIvemId): void;
        notifyOpenedClosed(litIvemId: LitIvemId | undefined): void;
    }
}
