/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    CommandRegisterService,
    GridLayoutOrNamedReferenceDefinition,
    GridSourceDefinition,
    GridSourceOrNamedReferenceDefinition,
    JsonElement,
    LitIvemId,
    SymbolsService,
    TableRecordSourceDefinitionFactoryService,
    TopShareholder,
    TopShareholderTableRecordSource
} from '@motifmarkets/motif-core';
import { GridSourceFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class TopShareholdersDitemFrame extends BuiltinDitemFrame {

    private _gridSourceFrame: GridSourceFrame;
    private _recordSource: TopShareholderTableRecordSource;
    private _recordList: TopShareholder[];

    private _historicalDate: Date | undefined;
    private _compareDate: Date | undefined;

    constructor(
        private readonly _componentAccess: TopShareholdersDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.TopShareholders, _componentAccess,
            commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._gridSourceFrame !== undefined; }

    initialise(gridSourceFrame: GridSourceFrame, frameElement: JsonElement | undefined): void {
        this._gridSourceFrame = gridSourceFrame;
        this._gridSourceFrame.opener = this.opener;
        this._gridSourceFrame.keepPreviousLayoutIfPossible = true;

        if (frameElement !== undefined) {
            const contentElementResult = frameElement.tryGetElement(TopShareholdersDitemFrame.JsonName.content);
            if (contentElementResult.isOk()) {
                const contentElement = contentElementResult.value;
                const keptLayoutElementResult = contentElement.tryGetElement(TopShareholdersDitemFrame.JsonName.keptLayout);
                if (keptLayoutElementResult.isOk()) {
                    const keptLayoutElement = keptLayoutElementResult.value;
                    const keptLayoutResult = GridLayoutOrNamedReferenceDefinition.tryCreateFromJson(keptLayoutElement);
                    if (keptLayoutResult.isOk()) {
                        this._gridSourceFrame.keptGridLayoutOrNamedReferenceDefinition = keptLayoutResult.value;
                    }
                }
            }
        }

        this.applyLinked();
    }

    public override finalise() {
        super.finalise();
    }

    override save(frameElement: JsonElement) {
        super.save(frameElement);

        const contentElement = frameElement.newElement(TopShareholdersDitemFrame.JsonName.content);
        const keptLayoutElement = contentElement.newElement(TopShareholdersDitemFrame.JsonName.keptLayout);
        const layoutDefinition = this._gridSourceFrame.createGridLayoutOrNamedReferenceDefinition();
        layoutDefinition.saveToJson(keptLayoutElement);
    }

    ensureOpened() {
        if (!this._gridSourceFrame.opened) {
            this.tryOpenGridSource();
        }
    }

    tryOpenGridSource() {
        if (!this.getParamsFromGui() || this.litIvemId === undefined) {
            return false;
        } else {
            const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createTopShareholder(
                this.litIvemId,
                this._historicalDate,
                this._compareDate
            );
            const gridSourceDefinition = new GridSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
            const gridSourceOrNamedReferenceDefinition = new GridSourceOrNamedReferenceDefinition(gridSourceDefinition);
            const gridSourceOrNamedReference = this._gridSourceFrame.tryOpenGridSource(gridSourceOrNamedReferenceDefinition, false);
            if (gridSourceOrNamedReference === undefined) {
                return false;
            } else {
                const table = this._gridSourceFrame.openedTable;
                this._recordSource = table.recordSource as TopShareholderTableRecordSource;
                this._recordList = this._recordSource.recordList;
                return true;
            }
        }
    }

    protected override applyLitIvemId(litIvemId: LitIvemId | undefined, SelfInitiated: boolean): boolean {
        super.applyLitIvemId(litIvemId, SelfInitiated);
        if (!this._componentAccess.canNewTableOnLitIvemIdApply()) {
            return false;
        } else {
            if (litIvemId === undefined) {
                return false;
            } else {
                const done = this.tryOpenGridSource();
                if (done) {
                    return super.applyLitIvemId(litIvemId, SelfInitiated);
                } else {
                    return false;
                }
            }
        }
    }

    private getParamsFromGui() {
        const params = this._componentAccess.getGuiParams();
        if (!params.valid) {
            return false;
        } else {
            this._historicalDate = params.historicalDate;
            this._compareDate = params.compareDate;
            return true;
        }
    }
}

export namespace TopShareholdersDitemFrame {
    export namespace JsonName {
        export const historicalDate = 'historicalDate';
        export const compareDate = 'compareDate';
        export const content = 'content';
        export const keptLayout = 'keptLayout';
    }

    export class GuiParams {
        valid: boolean;
        historicalDate: Date | undefined;
        compareDate: Date | undefined;
    }

    export interface TableParams {
        litIvemId: LitIvemId;
        historicalDate: Date | undefined;
        compareDate: Date | undefined;
    }

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        getGuiParams(): GuiParams;
        notifyNewTable(params: TableParams): void;
        canNewTableOnLitIvemIdApply(): boolean;
    }
}
