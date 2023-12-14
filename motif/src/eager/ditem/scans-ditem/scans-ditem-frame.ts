/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    CommandRegisterService, ErrorCode, ExchangeInfo, Integer, JsonElement,
    LockOpenListItem,
    Logger,
    ScanEditor,
    ScanList,
    ScanTargetTypeId,
    ScansService,
    SettingsService,
    SymbolsService
} from '@motifmarkets/motif-core';
import { ScanListFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class ScansDitemFrame extends BuiltinDitemFrame {
    private _scanListFrame: ScanListFrame | undefined;
    private _scanList: ScanList | undefined;
    private _scanEditor: ScanEditor | undefined;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopInterface: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _scansService: ScansService,
        private readonly _opener: LockOpenListItem.Opener,
        private readonly _setEditorEventer: ScansDitemFrame.SetEditorEventer,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Scans, ditemComponentAccess,
            settingsService, commandRegisterService, desktopInterface, symbolsService, adiService
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._scanListFrame !== undefined; }

    get scanEditor() { return this._scanEditor; }

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
        this._scanList = scanListFrame.scanList;

        scanListFrame.recordFocusedEventer = (newRecordIndex) => { this.handleScanListFrameRecordFocusedEvent(newRecordIndex); }

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

    newScan() {
        this.checkCloseActiveScanEditor();
        this._scanEditor = this._scansService.openNewScanEditor(this._opener);
        const defaultExchangeId = this.symbolsService.defaultExchangeId;
        const defaultMarketId = ExchangeInfo.idToDefaultMarketId(defaultExchangeId);
        this._scanEditor.setTargetMarketIds([defaultMarketId]);
        this._scanEditor.setTargetTypeId(ScanTargetTypeId.Markets);
        this._setEditorEventer();
    }

    private handleScanListFrameRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex === undefined) {
            this.checkCloseActiveScanEditor();
        } else {
            const scanList = this._scanList;
            if (scanList === undefined) {
                throw new AssertInternalError('SCFHSCFRFESLU50515');
            } else {
                const scan = scanList.getAt(newRecordIndex);
                const openResultPromise = this._scansService.tryOpenScanEditor(scan.id, this._opener);
                openResultPromise.then(
                    (openResult) => {
                        if (openResult.isErr()) {
                            Logger.logWarning(ErrorCode.ScanEditorFrame_RecordFocusedTryOpenEditor, scan.id);
                        } else {
                            const scanEditor = openResult.value;
                            if (scanEditor === undefined) {
                                throw new AssertInternalError('SDFHSLFRFESM50515'); // should always exist
                            } else {
                                this._scanEditor = scanEditor;
                                this._setEditorEventer();
                            }
                        }
                    },
                    (reason) => { throw AssertInternalError.createIfNotError(reason, 'SDFHSLFRFEPR50515'); }
                )
            }
        }
    }

    private checkCloseActiveScanEditor() {
        if (this._scanEditor !== undefined) {
            this._setEditorEventer();
            this._scansService.closeScanEditor(this._scanEditor, this._opener);
            this._scanEditor = undefined;
        }
    }
}


export namespace ScansDitemFrame {
    export namespace JsonName {
        export const scanListFrame = 'scanListFrame';
    }

    export type OpenedEventHandler = (this: void) => void;
    export type SetEditorEventer = (this: void) => void;
}
