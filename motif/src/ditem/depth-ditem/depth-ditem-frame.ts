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
    private _depthFrame: DepthFrame;

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

    get filterActive() { return this._depthFrame.filterActive; }
    get filterXrefs() { return this._depthFrame.filterXrefs; }

    get initialised() { return this._depthFrame !== undefined; }

    initialise(depthFrame: DepthFrame, frameElement: JsonElement | undefined): void {
        this._depthFrame = depthFrame;
        this._depthFrame.initialise();

        if (frameElement === undefined) {
            this._depthFrame.loadConfig(undefined);
        } else {
            const contentElementResult = frameElement.tryGetElementType(DepthDitemFrame.JsonName.content);
            if (contentElementResult.isErr()) {
                this._depthFrame.loadConfig(undefined);
            } else {
                this._depthFrame.loadConfig(contentElementResult.value);
            }
        }

        // this._contentFrame.initialiseWidths();

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(DepthDitemFrame.JsonName.content);
        this._depthFrame.saveLayoutToConfig(contentElement);
    }

    open() {
        const litIvemId = this.litIvemId;
        if (litIvemId === undefined) {
            this._depthFrame.close();
        } else {
            this._depthFrame.open(litIvemId, DepthStyleId.Full);
        }
        this._componentAccess.notifyOpenedClosed(litIvemId);
    }

    // loadConstructLayoutConfig() {
    //     super.loadConstructLayoutConfig();
    // }

    toggleFilterActive() {
        this._depthFrame.toggleFilterActive();
    }

    setFilter(xrefs: string[]) {
        this._depthFrame.setFilter(xrefs);
    }

    expand(newRecordsOnly: boolean) {
        this._depthFrame.openExpand = true;
        this._depthFrame.expand(newRecordsOnly);
    }

    rollUp(newRecordsOnly: boolean) {
        this._depthFrame.openExpand = false;
        this._depthFrame.rollup(newRecordsOnly);
    }

    autoSizeAllColumnWidths() {
        this._depthFrame.autoSizeAllColumnWidths();
    }

    createAllowedFieldsAndLayoutDefinitions() {
        return this._depthFrame.createAllowedFieldsAndLayoutDefinitions();
    }

    applyGridLayoutDefinitions(layout: DepthFrame.GridLayoutDefinitions) {
        this._depthFrame.applyGridLayoutDefinitions(layout);
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
