/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    BidAskGridLayoutDefinitions,
    CommandRegisterService,
    DepthStyleId,
    JsonElement,
    LitIvemId,
    SettingsService,
    SymbolsService,
} from '@motifmarkets/motif-core';
import { DepthFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class DepthDitemFrame extends BuiltinDitemFrame {
    private _depthFrame: DepthFrame | undefined;

    constructor(
        private _componentAccess: DepthDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopInterface: DitemFrame.DesktopAccessService,
        symbolsMgr: SymbolsService,
        adi: AdiService
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Depth, _componentAccess,
            settingsService, commandRegisterService, desktopInterface, symbolsMgr, adi
        );
    }

    get filterActive() { return this._depthFrame === undefined ? false : this._depthFrame.filterActive; }
    get filterXrefs() { return this._depthFrame === undefined ? [] : this._depthFrame.filterXrefs; }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._depthFrame !== undefined; }

    initialise(ditemFrameElement: JsonElement | undefined, depthFrame: DepthFrame): void {
        this._depthFrame = depthFrame;

        let depthFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const depthFrameElementResult = ditemFrameElement.tryGetElement(DepthDitemFrame.JsonName.depthFrame);
            if (depthFrameElementResult.isOk()) {
                depthFrameElement = depthFrameElementResult.value;
            }
        }
        this._depthFrame.initialise(depthFrameElement);

        // this._contentFrame.initialiseWidths();

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFS21915');
        } else {
            const depthFrameElement = element.newElement(DepthDitemFrame.JsonName.depthFrame);
            this._depthFrame.save(depthFrameElement);
        }
    }

    override finalise() {
        if (this._depthFrame !== undefined) {
            this._depthFrame.finalise();
        }
        super.finalise();
    }

    open() {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFO21915');
        } else {
            const litIvemId = this.litIvemId;
            if (litIvemId === undefined) {
                this._depthFrame.close();
                this.updateLockerName('');
            } else {
                this._depthFrame.open(litIvemId, DepthStyleId.Full);
                this.updateLockerName(this.symbolsService.litIvemIdToDisplay(litIvemId));
            }
            this._componentAccess.notifyOpenedClosed(litIvemId);
        }
    }

    // loadConstructLayoutConfig() {
    //     super.loadConstructLayoutConfig();
    // }

    toggleFilterActive() {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFTFA21915');
        } else {
            this._depthFrame.toggleFilterActive();
        }
    }

    setFilter(xrefs: string[]) {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFSF21915');
        } else {
            this._depthFrame.setFilter(xrefs);
        }
    }

    expand(newRecordsOnly: boolean) {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFE21915');
        } else {
            this._depthFrame.openExpand = true;
            this._depthFrame.expand(newRecordsOnly);
        }
    }

    rollUp(newRecordsOnly: boolean) {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFRU21915');
        } else {
            this._depthFrame.openExpand = false;
            this._depthFrame.rollup(newRecordsOnly);
        }
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFASACW21915');
        } else {
            this._depthFrame.autoSizeAllColumnWidths(widenOnly);
        }
    }

    createAllowedFieldsGridLayoutDefinitions() {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFCAFALD21915');
        } else {
            return this._depthFrame.createAllowedFieldsGridLayoutDefinitions();
        }
    }

    applyGridLayoutDefinitions(layout: BidAskGridLayoutDefinitions) {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFAGLD21915');
        } else {
            this._depthFrame.applyGridLayoutDefinitions(layout);
        }
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
        export const depthFrame = 'depthFrame';
    }

    export type OpenedEventHandler = (this: void) => void;

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        pushSymbol(litIvemId: LitIvemId): void;
        notifyOpenedClosed(litIvemId: LitIvemId | undefined): void;
    }
}
