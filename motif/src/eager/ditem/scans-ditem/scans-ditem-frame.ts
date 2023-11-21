/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    CommandRegisterService, JsonElement,
    SettingsService,
    SymbolsService
} from '@motifmarkets/motif-core';
import { ScanListFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class ScansDitemFrame extends BuiltinDitemFrame {
    private _scanListFrame: ScanListFrame | undefined;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopInterface: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Scans, ditemComponentAccess,
            settingsService, commandRegisterService, desktopInterface, symbolsService, adiService
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._scanListFrame !== undefined; }

    get filterText() {
        if (this._scanListFrame === undefined) {
            throw new AssertInternalError('SDFGFT49471');
        } else {
            return this._scanListFrame.filterText;
        }
    }
    set filterText(value: string) {
        if (this._scanListFrame === undefined) {
            throw new AssertInternalError('SDFSFT49471');
        } else {
            this._scanListFrame.filterText = value;
        }
    }

    initialise(ditemFrameElement: JsonElement | undefined, scanListFrame: ScanListFrame): void {
        this._scanListFrame = scanListFrame;

        let scanListFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const scanListFrameElementResult = ditemFrameElement.tryGetElement(ScansDitemFrame.JsonName.scanListFrame);
            if (scanListFrameElementResult.isOk()) {
                scanListFrameElement = scanListFrameElementResult.value;
            }
        }

        const initialisePromise = scanListFrame.initialiseGrid(
            this.opener,
            scanListFrameElement,
            false,
        );

        initialisePromise.then(
            (gridSourceOrReference) => {
                if (gridSourceOrReference === undefined) {
                    throw new AssertInternalError('SDFIPU50135');
                } else {
                    this.applyLinked();
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'SDFIPR50135') }
        );
    }

    override finalise() {
        if (this._scanListFrame !== undefined) {
            this._scanListFrame.finalise();
        }
        super.finalise();
    }

    override save(ditemFrameElement: JsonElement) {
        super.save(ditemFrameElement);

        const scanListFrame = this._scanListFrame;
        if (scanListFrame === undefined) {
            throw new AssertInternalError('SDFS29974');
        } else {
            const scanListFrameElement = ditemFrameElement.newElement(ScansDitemFrame.JsonName.scanListFrame);
            scanListFrame.save(scanListFrameElement);
        }
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        if (this._scanListFrame === undefined) {
            throw new AssertInternalError('SDFASACW49471');
        } else {
            this._scanListFrame.autoSizeAllColumnWidths(widenOnly);
        }
    }
}


export namespace ScansDitemFrame {
    export namespace JsonName {
        export const scanListFrame = 'scanListFrame';
    }

    export type OpenedEventHandler = (this: void) => void;
}
