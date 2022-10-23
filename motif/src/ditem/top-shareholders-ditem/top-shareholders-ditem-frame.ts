/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    CommandRegisterService,
    JsonElement,
    LitIvemId,
    SymbolsService,
    TableRecordDefinitionList,
    TablesService,
    TopShareholdersDataItem,
    TopShareholderTableRecordDefinitionList
} from '@motifmarkets/motif-core';
import { TableFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class TopShareholdersDitemFrame extends BuiltinDitemFrame {

    private _tableFrame: TableFrame;
    private _topShareholdersDataItem: TopShareholdersDataItem;

    private _historicalDate: Date | undefined;
    private _compareDate: Date | undefined;

    constructor(
        private readonly _componentAccess: TopShareholdersDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _tablesService: TablesService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.TopShareholders, _componentAccess,
            commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._tableFrame !== undefined; }

    initialise(contentFrame: TableFrame, frameElement: JsonElement | undefined): void {
        this._tableFrame = contentFrame;
        this._tableFrame.requireDefaultTableDefinitionEvent = () => this.handleRequireDefaultTableDefinitionEvent();
        this._tableFrame.tableOpenEvent = (recordDefinitionList) => this.handleTableOpenEvent(recordDefinitionList);

        if (frameElement === undefined) {
            this._tableFrame.loadLayoutConfig(undefined);
        } else {
            const contentElement = frameElement.tryGetElement(TopShareholdersDitemFrame.JsonName.content);
            this._tableFrame.loadLayoutConfig(contentElement);
        }

        this.applyLinked();
    }

    public override finalise() {
        super.finalise();
    }

    override save(config: JsonElement) {
        super.save(config);

        const contentElement = config.newElement(TopShareholdersDitemFrame.JsonName.content);
        this._tableFrame.saveLayoutConfig(contentElement);
    }

    ensureOpened() {
        if (!this._tableFrame.tableOpened) {
            this.newTable(false);
        }
    }

    newTable(keepCurrentLayout: boolean) {
        if (!this.getParamsFromGui() || this.litIvemId === undefined) {
            return false;
        } else {
            const tableDefinition = this._tablesService.definitionFactory.createTopShareholder(this.litIvemId,
                this._historicalDate, this._compareDate);
            this._tableFrame.newPrivateTable(tableDefinition, keepCurrentLayout);
            this._componentAccess.notifyNewTable({
                litIvemId: this.litIvemId,
                historicalDate: this._historicalDate,
                compareDate: this._compareDate,
            });
            return true;
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
                const done = this.newTable(true);
                if (done) {
                    return super.applyLitIvemId(litIvemId, SelfInitiated);
                } else {
                    return false;
                }
            }
        }
    }

    private handleRequireDefaultTableDefinitionEvent() {
        return undefined;
    }

    private handleTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
        const topShareholderRecordDefinitionList = recordDefinitionList as TopShareholderTableRecordDefinitionList;
        this._topShareholdersDataItem = topShareholderRecordDefinitionList.dataItem;
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
