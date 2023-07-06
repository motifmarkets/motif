/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    CommandRegisterService, JsonElement,
    LitIvemId,
    SettingsService,
    SymbolsService
} from '@motifmarkets/motif-core';
import { ScansFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class ScansDitemFrame extends BuiltinDitemFrame {
    private _scansFrame: ScansFrame;

    constructor(
        private _componentAccess: ScansDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopInterface: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Scans, _componentAccess,
            settingsService, commandRegisterService, desktopInterface, symbolsService, adiService
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._scansFrame !== undefined; }

    get filterText() { return this._scansFrame.filterText; }
    set filterText(value: string) { this._scansFrame.filterText = value; }

    initialise(contentFrame: ScansFrame, frameElement: JsonElement | undefined): void {
        this._scansFrame = contentFrame;

        if (frameElement === undefined) {
            this._scansFrame.initialise(undefined);
        } else {
            const contentElementResult = frameElement.tryGetElement(ScansDitemFrame.JsonName.content);
            if (contentElementResult.isErr()) {
                this._scansFrame.initialise(undefined);
            } else {
                this._scansFrame.initialise(contentElementResult.value);
            }
        }

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        const contentElement = element.newElement(ScansDitemFrame.JsonName.content);
        this._scansFrame.save(contentElement);
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

    autoSizeAllColumnWidths(widenOnly: boolean) {
        this._scansFrame.autoSizeAllColumnWidths(widenOnly);
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
