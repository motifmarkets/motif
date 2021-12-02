/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService, CommandRegisterService, Integer, JsonElement, SymbolsService, TableRecordDefinitionList } from '@motifmarkets/motif-core';
import { TableFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class EtoPriceQuotationDitemFrame extends BuiltinDitemFrame {
    private _watchContentFrame: TableFrame;
    private _callPutContentFrame: TableFrame;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.EtoPriceQuotation,
            ditemComponentAccess, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._callPutContentFrame !== undefined; }

    initialise(watchContentFrame: TableFrame, callPutContentFrame: TableFrame, frameElement: JsonElement | undefined): void {
        this._watchContentFrame = watchContentFrame;
        this._callPutContentFrame = callPutContentFrame;

        if (frameElement === undefined) {
            this._watchContentFrame.loadLayoutConfig(undefined);
            this._callPutContentFrame.loadLayoutConfig(undefined);
        } else {
            const watchElement = frameElement.tryGetElement(EtoPriceQuotationDitemFrame.JsonName.watch);
            this._watchContentFrame.loadLayoutConfig(watchElement);
            const callPutElement = frameElement.tryGetElement(EtoPriceQuotationDitemFrame.JsonName.callPut);
            this._callPutContentFrame.loadLayoutConfig(callPutElement);
        }

        this.prepareContentFrame();
        this.newTable(false);

        this.applyLinked();
    }

    override save(config: JsonElement) {
        super.save(config);

        const watchElement = config.newElement(EtoPriceQuotationDitemFrame.JsonName.watch);
        this._watchContentFrame.saveLayoutConfig(watchElement);
        const callPutElement = config.newElement(EtoPriceQuotationDitemFrame.JsonName.callPut);
        this._callPutContentFrame.saveLayoutConfig(callPutElement);
    }

    private handleRecordFocusEvent(newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) {
    }

    private handleRecordFocusClickEvent(recordIndex: Integer, fieldIndex: Integer) {
    }

    private handleRecordFocusDblClickEvent(recordIndex: Integer, fieldIndex: Integer) {
    }

    private handleRequireDefaultTableDefinitionEvent() {
    }

    private handleTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
    }


    private newTable(keepCurrentLayout: boolean) {
        // TODO:HIGH
        // const tableDefinition = BrokerageAccountTableDefinition.create(this.settings, this.adi);
        // this._contentFrame.newPrivateTable(tableDefinition, undefined, keepCurrentLayout);
    }

    private prepareContentFrame() {
    }
}

export namespace EtoPriceQuotationDitemFrame {
    export namespace JsonName {
        export const watch = 'watch';
        export const callPut = 'callPut';
    }
}
