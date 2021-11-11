/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    ExchangeId,
    ExchangeInfo,
    MarketId,
    MarketInfo,
    SearchSymbolsDataDefinition,
    SymbolsDataItem
} from 'src/adi/internal-api';
import { GridLayout, MotifGrid, TableFrame } from 'src/content/internal-api';
import {
    CommandRegisterService, SymbolsDataItemTableRecordDefinitionList,
    SymbolsService,
    tableDefinitionFactory,
    TableRecordDefinitionList
} from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { AssertInternalError, Integer, JsonElement } from 'src/sys/internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class SymbolsDitemFrame extends BuiltinDitemFrame {
    private _uiQueryRequest: SymbolsDataItemTableRecordDefinitionList.QueryRequest;
    private _querySymbolsDataItem: SymbolsDataItem;
    private _queryTableFrame: TableFrame;

    private _currentFocusedSymbolSetting: boolean;
    private _symbolApplying: boolean;

    private _queryShowFull: boolean;

    get querySearchText() { return this._uiQueryRequest.searchText; }
    set querySearchText(value: string) { this._uiQueryRequest.searchText = value; }
    get queryShowFull() { return this._uiQueryRequest.showFull; }
    set queryShowFull(value: boolean) { this._uiQueryRequest.showFull = value; }
    get queryExchangeId() { return this._uiQueryRequest.exchangeId; }
    set queryExchangeId(value: ExchangeId | undefined) { this._uiQueryRequest.exchangeId = value; }
    get queryMarketIds() { return this._uiQueryRequest.marketIds; }
    set queryMarketIds(value: readonly MarketId[] | undefined) { this._uiQueryRequest.marketIds = value?.slice(); }
    get queryCfi() { return this._uiQueryRequest.cfi; }
    set queryCfi(value: string | undefined) { this._uiQueryRequest.cfi = value; }
    get queryFieldIds() { return this._uiQueryRequest.fieldIds; }
    set queryFieldIds(value: readonly SearchSymbolsDataDefinition.FieldId[] | undefined) { this._uiQueryRequest.fieldIds = value?.slice(); }
    get queryIsPartial() { return this._uiQueryRequest.isPartial; }
    set queryIsPartial(value: boolean | undefined) { this._uiQueryRequest.isPartial = value; }
    get queryIsCaseSensitive() { return this._uiQueryRequest.isCaseSensitive; }
    set queryIsCaseSensitive(value: boolean | undefined) { this._uiQueryRequest.isCaseSensitive = value; }
    get queryPreferExact() { return this._uiQueryRequest.preferExact; }
    set queryPreferExact(value: boolean | undefined) { this._uiQueryRequest.preferExact = value; }
    get queryStartIndex() { return this._uiQueryRequest.startIndex; }
    set queryStartIndex(value: Integer | undefined) { this._uiQueryRequest.startIndex = value; }
    get queryCount() { return this._uiQueryRequest.count; }
    set queryCount(value: Integer | undefined) { this._uiQueryRequest.count = value; }

    get initialised() { return this._queryTableFrame !== undefined; }

    constructor(
        private readonly _componentAccess: SymbolsDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsMgr: SymbolsService,
        adi: AdiService
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Symbols, _componentAccess,
            commandRegisterService, desktopAccessService, symbolsMgr, adi
        );

        const defaultExchangeId = this.symbolsService.defaultExchangeId;
        const defaultMarketId = ExchangeInfo.idToDefaultMarketId(defaultExchangeId);

        this._uiQueryRequest = {
            typeId: SymbolsDataItemTableRecordDefinitionList.Request.TypeId.Query,
            searchText: '',
            showFull: false,
            exchangeId: defaultExchangeId,
            marketIds: [defaultMarketId],
            cfi: '',
            fieldIds: [SymbolsDitemFrame.CodeTargetFieldId],
            isPartial: true,
            isCaseSensitive: false,
            preferExact: false,
            startIndex: 0,
            count: 200,
        };
    }

    initialise(queryTableFrame: TableFrame, frameElement: JsonElement | undefined): void {
        this._queryTableFrame = queryTableFrame;
        this._queryTableFrame.recordFocusEvent = (newRecordIndex) => this.handleQueryRecordFocusEvent(newRecordIndex);
        this._queryTableFrame.tableOpenEvent = (recordDefinitionList) => this.handleQueryTableOpenEvent(recordDefinitionList);

        // if (frameElement === undefined) {
            this._queryTableFrame.loadLayoutConfig(undefined);
        // } else {
        //     const queryContentElement = frameElement.tryGetElement(SymbolsDitemFrame.JsonName.queryContent);
        //     this._queryTableFrame.loadLayoutConfig(queryContentElement);
        // }

        this.applyLinked();
    }

    override finalise(): void {
        super.finalise();
    }

    override save(element: JsonElement) {
        super.save(element);

        const queryContentElement = element.newElement(SymbolsDitemFrame.JsonName.queryContent);
        this._queryTableFrame.saveLayoutConfig(queryContentElement);
    }

    executeQueryRequest() {
        this.newQueryTable();
    }

    setActiveGridLayout(value: GridLayout) {
        this._queryTableFrame.setGridLayout(value);
    }

    getActiveGridLayoutWithHeadings(): MotifGrid.LayoutWithHeadersMap {
        return this._queryTableFrame.getGridLayoutWithHeadersMap();
    }

    private handleQueryRecordFocusEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const record = this._querySymbolsDataItem.records[newRecordIndex];
            this.processRecordFocusChange(record);
            this._componentAccess.processQueryRecordFocusChange(newRecordIndex);
        }
    }

    private handleQueryTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
        const symbolsRecordDefinitionList = recordDefinitionList as SymbolsDataItemTableRecordDefinitionList;
        this._querySymbolsDataItem = symbolsRecordDefinitionList.dataItem;
        const definition = this._querySymbolsDataItem.definition;
        if (!(definition instanceof SearchSymbolsDataDefinition)) {
            throw new AssertInternalError('SDFHQTOEQ639228436');
        } else {
            const description = this.generateQueryDescription(definition);
            this._componentAccess.processQueryTableOpen(description);
        }
    }

    private processRecordFocusChange(newFocusedRecord: SymbolsDataItem.Record) {
        if (!this._symbolApplying) {
            this._currentFocusedSymbolSetting = true;
            try {
                const litIvemId = newFocusedRecord.litIvemId;
                this.applyDitemLitIvemIdFocus(litIvemId, true);
            } finally {
                this._currentFocusedSymbolSetting = false;
            }
        }
    }

    private generateQueryDescription(definition: SearchSymbolsDataDefinition) {
        const fieldIds = definition.fieldIds;
        const fieldCount = fieldIds.length;
        const fieldDisplays = new Array<string>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            const fieldId = fieldIds[i];
            fieldDisplays[i] = SearchSymbolsDataDefinition.Field.idToDisplay(fieldId);
        }
        const fieldsDisplay = fieldDisplays.join();
        let result = `${Strings[StringId.Query]}: "${definition.searchText}", ${Strings[StringId.Fields]}: "${fieldsDisplay}"`;
        const exchangeId = definition.exchangeId;
        if (exchangeId !== undefined) {
            result += `, ${Strings[StringId.Exchange]}: ${ExchangeInfo.idToAbbreviatedDisplay(exchangeId)}`;
        }
        const marketIds = definition.marketIds;
        if (marketIds !== undefined) {
            const marketCount = marketIds.length;
            const marketDisplays = new Array<string>(marketCount);
            for (let i = 0; i < marketCount; i++) {
                const marketId = marketIds[i];
                marketDisplays[i] = MarketInfo.idToDisplay(marketId);
            }
            const marketsDisplay = fieldDisplays.join();
            result += `, ${Strings[StringId.Markets]}: "${marketsDisplay}"`;
        }
        const cfi = definition.cfi;
        if (cfi !== undefined && cfi !== '') {
            result += `, ${Strings[StringId.Cfi]}: "${cfi}"`;
        }
        const options: string[] = [];
        if (definition.isPartial) {
            options.push(Strings[StringId.Partial]);
        }
        if (definition.preferExact) {
            options.push(Strings[StringId.Exact]);
        }
        if (definition.showFull) {
            options.push(Strings[StringId.Full]);
        }
        const optionsDisplay = options.join();
        result += `, ${Strings[StringId.Options]}: "${optionsDisplay}"`;
        return result;
    }

    private newQueryTable() {
        const request = SymbolsDataItemTableRecordDefinitionList.QueryRequest.createCopy(this._uiQueryRequest);
        const keepCurrentLayout = request.showFull === this._queryShowFull;
        this._queryShowFull = request.showFull;
        const tableDefinition = tableDefinitionFactory.createSymbolsDataItem(request);
        this._queryTableFrame.newPrivateTable(tableDefinition, keepCurrentLayout);
    }
}

export namespace SymbolsDitemFrame {
    export namespace JsonName {
        export const queryContent = 'queryContent';
    }

    export type TargetFieldId = SearchSymbolsDataDefinition.FieldId;
    export const CodeTargetFieldId = SearchSymbolsDataDefinition.FieldId.Code;
    export const NameTargetFieldId = SearchSymbolsDataDefinition.FieldId.Name;

    export type RecordFocusEvent = (this: void, newRecordIndex: Integer | undefined) => void;
    export type TableOpenEvent = (this: void, description: string) => void;

    export const enum LayoutTypeId {
        QueryBase,
        QueryFull,
        Subscription,
    }

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        processQueryTableOpen(description: string): void;
        processQueryRecordFocusChange(recordIdx: Integer): void;
    }
}
