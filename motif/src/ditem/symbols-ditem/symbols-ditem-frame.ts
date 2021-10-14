/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    ExchangeId,
    ExchangeInfo,
    IvemClass,
    IvemClassId,
    MarketId,
    MarketInfo,
    QuerySymbolsDataDefinition,
    SymbolsDataDefinition,
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
    private _isQueryRequest = true;

    private _uiQueryRequest: SymbolsDataItemTableRecordDefinitionList.QueryRequest;
    private _querySymbolsDataItem: SymbolsDataItem;
    private _queryTableFrame: TableFrame;

    private _uiSubscriptionRequest: SymbolsDataItemTableRecordDefinitionList.SubscriptionRequest;
    private _subscriptionSymbolsDataItem: SymbolsDataItem;
    private _subscriptionTableFrame: TableFrame;

    private _currentFocusedSymbolSetting: boolean;
    private _symbolApplying: boolean;

    private _queryShowFull: boolean;

    get isQueryRequest() { return this._isQueryRequest; }
    set isQueryRequest(value: boolean) { this._isQueryRequest = value; }

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
    set queryFieldIds(value: readonly QuerySymbolsDataDefinition.FieldId[] | undefined) { this._uiQueryRequest.fieldIds = value?.slice(); }
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

    get subscriptionMarketId() { return this._uiSubscriptionRequest.marketId; }
    set subscriptionMarketId(value: MarketId) { this._uiSubscriptionRequest.marketId = value; }
    get subscriptionClassId() { return this._uiSubscriptionRequest.classId; }
    set subscriptionClassId(value: IvemClassId) { this._uiSubscriptionRequest.classId = value; }

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

        this._uiSubscriptionRequest = {
            typeId: SymbolsDataItemTableRecordDefinitionList.Request.TypeId.Subscription,
            marketId: defaultMarketId,
            classId: IvemClassId.Market,
        };

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

    initialise(queryTableFrame: TableFrame, subscriptionTableFrame: TableFrame, frameElement: JsonElement | undefined): void {
        this._queryTableFrame = queryTableFrame;
        this._queryTableFrame.recordFocusEvent = (newRecordIndex) => this.handleQueryRecordFocusEvent(newRecordIndex);
        this._queryTableFrame.tableOpenEvent = (recordDefinitionList) => this.handleQueryTableOpenEvent(recordDefinitionList);

        this._subscriptionTableFrame = subscriptionTableFrame;
        this._subscriptionTableFrame.recordFocusEvent = (newRecordIndex) => this.handleSubscriptionRecordFocusEvent(newRecordIndex);
        this._subscriptionTableFrame.tableOpenEvent = (recordDefinitionList) => this.handleSubscriptionTableOpenEvent(recordDefinitionList);

        if (frameElement === undefined) {
            this._queryTableFrame.loadLayoutConfig(undefined);
            this._subscriptionTableFrame.loadLayoutConfig(undefined);
        } else {
            const queryContentElement = frameElement.tryGetElement(SymbolsDitemFrame.JsonName.queryContent);
            this._queryTableFrame.loadLayoutConfig(queryContentElement);
            const subscriptionContentElement = frameElement.tryGetElement(SymbolsDitemFrame.JsonName.subscriptionContent);
            this._subscriptionTableFrame.loadLayoutConfig(subscriptionContentElement);
        }

        this.applyLinked();
    }

    override finalise(): void {
        super.finalise();
    }

    override save(element: JsonElement) {
        super.save(element);

        const queryContentElement = element.newElement(SymbolsDitemFrame.JsonName.queryContent);
        this._queryTableFrame.saveLayoutConfig(queryContentElement);
        const subscriptionContentElement = element.newElement(SymbolsDitemFrame.JsonName.subscriptionContent);
        this._subscriptionTableFrame.saveLayoutConfig(subscriptionContentElement);
    }

    executeQueryRequest() {
        if (!this._isQueryRequest) {
            throw new AssertInternalError('SDFEQR1942487792');
        } else {
            this.newQueryTable();
        }
    }

    executeSubscribeRequest() {
        if (this._isQueryRequest) {
            throw new AssertInternalError('SDFESR1942487792');
        } else {
            this.newSubscriptionTable();
        }
    }

    setActiveGridLayout(value: GridLayout) {
        if (this._isQueryRequest) {
            this._queryTableFrame.setGridLayout(value);
        } else {
            this._subscriptionTableFrame.setGridLayout(value);
        }
    }

    getActiveGridLayoutWithHeadings(): MotifGrid.LayoutWithHeadersMap {
        if (this._isQueryRequest) {
            return this._queryTableFrame.getGridLayoutWithHeadersMap();
        } else {
            return this._subscriptionTableFrame.getGridLayoutWithHeadersMap();
        }
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
        if (!(definition instanceof QuerySymbolsDataDefinition)) {
            throw new AssertInternalError('SDFHQTOEQ639228436');
        } else {
            const description = this.generateQueryDescription(definition);
            this._componentAccess.processQueryTableOpen(description);
        }
    }

    private handleSubscriptionRecordFocusEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const record = this._subscriptionSymbolsDataItem.records[newRecordIndex];
            this.processRecordFocusChange(record);
            this._componentAccess.processSubscriptionRecordFocusChange(newRecordIndex);
        }
    }

    private handleSubscriptionTableOpenEvent(recordDefinitionList: TableRecordDefinitionList) {
        const symbolsRecordDefinitionList = recordDefinitionList as SymbolsDataItemTableRecordDefinitionList;
        this._subscriptionSymbolsDataItem = symbolsRecordDefinitionList.dataItem;
        const definition = this._subscriptionSymbolsDataItem.definition;
        if (!(definition instanceof SymbolsDataDefinition)) {
            throw new AssertInternalError('SDFHQTOES639228436');
        } else {
            const description = this.generateSubscriptionDescription(definition);
            this._componentAccess.processSubscriptionTableOpen(description);
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

    private generateQueryDescription(definition: QuerySymbolsDataDefinition) {
        const fieldIds = definition.fieldIds;
        const fieldCount = fieldIds.length;
        const fieldDisplays = new Array<string>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            const fieldId = fieldIds[i];
            fieldDisplays[i] = QuerySymbolsDataDefinition.Field.idToDisplay(fieldId);
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

    private generateSubscriptionDescription(definition: SymbolsDataDefinition) {
        const marketDisplay = MarketInfo.idToDisplay(definition.marketId);
        const classDisplay = IvemClass.idToDisplay(definition.classId);
        return `${Strings[StringId.Subscription]}: ${StringId.Market}: ${marketDisplay}, ${StringId.Class}: ${classDisplay}`;
    }

    private newQueryTable() {
        const request = SymbolsDataItemTableRecordDefinitionList.QueryRequest.createCopy(this._uiQueryRequest);
        const keepCurrentLayout = request.showFull === this._queryShowFull;
        this._queryShowFull = request.showFull;
        const tableDefinition = tableDefinitionFactory.createSymbolsDataItem(request);
        this._queryTableFrame.newPrivateTable(tableDefinition, keepCurrentLayout);
    }

    private newSubscriptionTable() {
        const request = SymbolsDataItemTableRecordDefinitionList.SubscriptionRequest.createCopy(this._uiSubscriptionRequest);
        const tableDefinition = tableDefinitionFactory.createSymbolsDataItem(request);
        this._subscriptionTableFrame.newPrivateTable(tableDefinition, true);
    }
}

export namespace SymbolsDitemFrame {
    export namespace JsonName {
        export const queryContent = 'queryContent';
        export const subscriptionContent = 'subscriptionContent';
    }

    export type TargetFieldId = QuerySymbolsDataDefinition.FieldId;
    export const CodeTargetFieldId = QuerySymbolsDataDefinition.FieldId.Code;
    export const NameTargetFieldId = QuerySymbolsDataDefinition.FieldId.Name;

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
        processSubscriptionTableOpen(description: string): void;
        processSubscriptionRecordFocusChange(recordIdx: Integer): void;
    }
}
