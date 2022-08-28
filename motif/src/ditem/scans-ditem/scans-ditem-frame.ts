/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    CommandRegisterService,
    GridLayout,
    GridLayoutRecordStore,
    JsonElement,
    LitIvemId,
    SymbolsService,
} from '@motifmarkets/motif-core';
import { ScansFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class ScansDitemFrame extends BuiltinDitemFrame {
    private _contentFrame: ScansFrame;

    constructor(
        private _componentAccess: ScansDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopInterface: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Scans, _componentAccess,
            commandRegisterService, desktopInterface, symbolsService, adiService
        );
    }

    get initialised() { return this._contentFrame !== undefined; }

    get filterText() { return this._contentFrame.filterText; }
    set filterText(value: string) { this._contentFrame.filterText = value; }

    initialise(contentFrame: ScansFrame, frameElement: JsonElement | undefined): void {
        this._contentFrame = contentFrame;
        this._contentFrame.initialise();

        if (frameElement === undefined) {
            this._contentFrame.loadLayoutConfig(undefined);
        } else {
            const contentElement = frameElement.tryGetElement(ScansDitemFrame.JsonName.content);
            this._contentFrame.loadLayoutConfig(contentElement);
        }

        // this._contentFrame.initialiseWidths();

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(ScansDitemFrame.JsonName.content);
        this._contentFrame.saveLayoutConfig(contentElement);
    }

    // open() {
    //     const litIvemId = this.litIvemId;
    //     if (litIvemId === undefined) {
    //         this._contentFrame.close();
    //     } else {
    //         this._contentFrame.open(litIvemId, DepthStyleId.Full);
    //     }
    //     this._componentAccess.notifyOpenedClosed(litIvemId);
    // }

    // loadConstructLayoutConfig() {
    //     super.loadConstructLayoutConfig();
    // }

    autoSizeAllColumnWidths() {
        this._contentFrame.autoSizeAllColumnWidths();
    }

    getGridLayoutWithHeadings(): GridLayoutRecordStore.LayoutWithHeadersMap | undefined {
        return this._contentFrame && this._contentFrame.getGridLayoutWithHeadersMap();
    }


    setGridLayout(layout: GridLayout) {
        this._contentFrame.setGridLayout(layout);
    }

    // adviseShown() {
    //     setTimeout(() => this._contentFrame.initialiseWidths(), 200);
    // }

    protected override applyLitIvemId(litIvemId: LitIvemId | undefined, selfInitiated: boolean): boolean {
        super.applyLitIvemId(litIvemId, selfInitiated);
        if (litIvemId === undefined) {
            return false;
        } else {
            // this.open();
            return true;
        }
    }
}


export namespace ScansDitemFrame {
    export namespace JsonName {
        export const content = 'content';
    }

    export type OpenedEventHandler = (this: void) => void;


    export interface ComponentAccess extends DitemFrame.ComponentAccess {
    }
}
