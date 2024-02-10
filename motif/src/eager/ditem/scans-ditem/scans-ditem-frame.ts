/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    CommandRegisterService,
    ErrorCode,
    GridLayoutOrReferenceDefinition,
    Integer,
    JsonElement,
    LockOpenListItem,
    Logger,
    ScanEditor,
    ScanList,
    ScansService,
    SettingsService,
    StandAloneScanConditionSet,
    StandAloneScanFieldSet,
    SymbolsService
} from '@motifmarkets/motif-core';
import { ScanListFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';
import { IdentifiableComponent } from '../../component/internal-api';

export class ScansDitemFrame extends BuiltinDitemFrame {
    private _scanListFrame: ScanListFrame | undefined;
    private _scanList: ScanList | undefined;
    private _scanEditor: ScanEditor<IdentifiableComponent> | undefined;
    private _newScanEditor: ScanEditor<IdentifiableComponent> | undefined;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopInterface: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _scansService: ScansService,
        private readonly _opener: LockOpenListItem.Opener,
        private readonly _setEditorEventer: ScansDitemFrame.SetEditorEventer<IdentifiableComponent>,
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

        scanListFrame.gridSourceOpenedEventer = () => {
            this._scanList = scanListFrame.scanList;
            this._scanList.suspendUnwantDetailOnScanLastClose();
        }
        scanListFrame.recordFocusedEventer = (newRecordIndex) => { this.handleScanListFrameRecordFocusedEvent(newRecordIndex); }

        let scanListFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const scanListFrameElementResult = ditemFrameElement.tryGetElement(ScansDitemFrame.JsonName.scanListFrame);
            if (scanListFrameElementResult.isOk()) {
                scanListFrameElement = scanListFrameElementResult.value;
            }
        }

        scanListFrame.initialiseGrid(this.opener, undefined, true);

        const openPromise = scanListFrame.openJsonOrDefault(scanListFrameElement, true)
        openPromise.then(
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
        this.checkCloseActiveScanEditor();

        if (this._scanList !== undefined) {
            this._scanList.unsuspendUnwantDetailOnScanLastClose();
        }

        const scanListFrame = this._scanListFrame;
        if (scanListFrame !== undefined) {
            scanListFrame.gridSourceOpenedEventer = undefined;
            scanListFrame.recordFocusedEventer = undefined;
            scanListFrame.finalise();
            this._scanListFrame = undefined;
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

    newOrFocusNewScan() {
        if (this._newScanEditor === undefined) {
            this.newScan();
        } else {
            if (this._newScanEditor.lifeCycleStateId !== ScanEditor.LifeCycleStateId.NotYetCreated) {
                this._newScanEditor = undefined;
                this.newScan();
            } else {
                if (this._scanEditor !== this._newScanEditor) {
                    this.checkCloseActiveScanEditor();
                    this._scanEditor = this._newScanEditor;
                    this._setEditorEventer(this._scanEditor);
                }
            }
        }

        if (this._scanListFrame !== undefined) {
            this._scanListFrame.focusItem(undefined);
        }
    }

    newScan() {
        this.checkCloseActiveScanEditor();
        this._scanEditor = this._scansService.openNewScanEditor<IdentifiableComponent>(this._opener, new StandAloneScanFieldSet(), new StandAloneScanConditionSet());
        this._newScanEditor = this._scanEditor;
        this._setEditorEventer(this._scanEditor);
    }

    createAllowedFieldsGridLayoutDefinition() {
        if (this._scanListFrame === undefined) {
            throw new AssertInternalError('SDFCAFALD04418');
        } else {
            return this._scanListFrame.createAllowedFieldsGridLayoutDefinition();
        }
    }

    openGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition) {
        if (this._scanListFrame === undefined) {
            throw new AssertInternalError('SLFOGLONRD04418');
        } else {
            this._scanListFrame.openGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition);
        }
    }

    private handleScanListFrameRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        this.checkCloseActiveScanEditor();
        if (newRecordIndex !== undefined) {
            const scanList = this._scanList;
            if (scanList === undefined) {
                throw new AssertInternalError('SCFHSCFRFESLU50515');
            } else {
                const scan = scanList.getAt(newRecordIndex);
                const openResultPromise = this._scansService.tryOpenScanEditor<IdentifiableComponent>(
                    scan.id,
                    this._opener,
                    () => new StandAloneScanFieldSet(),
                    undefined,
                );
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
                                this._setEditorEventer(scanEditor);
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
            this._setEditorEventer(undefined);
            this._scansService.closeScanEditor<IdentifiableComponent>(this._scanEditor, this._opener);
            this._scanEditor = undefined;
        }
    }
}


export namespace ScansDitemFrame {
    export namespace JsonName {
        export const scanListFrame = 'scanListFrame';
    }

    export type OpenedEventHandler = (this: void) => void;
    export type SetEditorEventer<Modifier> = (this: void, editor: ScanEditor<Modifier> | undefined) => void;
}
