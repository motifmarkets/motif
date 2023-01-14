/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AssertInternalError,
    CommandRegisterService,
    EnumInfoOutOfOrderError,
    ExchangeId,
    ExchangeInfo,
    GridLayout,
    GridLayoutRecordStore,
    Integer,
    JsonElement,
    MarketId,
    MarketInfo,
    SearchSymbolsDataDefinition,
    StringId,
    Strings,
    SymbolField,
    SymbolFieldId,
    SymbolsDataItem,
    SymbolsDataItemTableRecordDefinitionList,
    SymbolsService,
    TableRecordDefinitionList,
    TablesService,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { GridSourceFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DesktopAccessService } from '../desktop-access-service';
import { DitemFrame } from '../ditem-frame';

export class SearchSymbolsDitemFrame extends BuiltinDitemFrame {
    private _uiConditions: SearchSymbolsDataDefinition.Condition[];
    private _uiDataDefinition: SearchSymbolsDataDefinition;
    private _querySymbolsDataItem: SymbolsDataItem;
    private _queryTableFrame: GridSourceFrame;

    private _currentFocusedSymbolSetting: boolean;
    private _symbolApplying: boolean;

    private _queryShowFull: boolean;

    constructor(
        private readonly _componentAccess: SearchSymbolsDitemFrame.ComponentAccess,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DesktopAccessService,
        symbolsMgr: SymbolsService,
        adiService: AdiService,
        private readonly _tablesService: TablesService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Symbols, _componentAccess,
            commandRegisterService, desktopAccessService, symbolsMgr, adiService
        );

        const defaultExchangeId = this.symbolsService.defaultExchangeId;
        const defaultMarketId = ExchangeInfo.idToDefaultMarketId(defaultExchangeId);

        this._uiDataDefinition = SymbolsDataItemTableRecordDefinitionList.createDefaultDataDefinition(defaultExchangeId, defaultMarketId);
        this.setUiConditions();
    }

    get initialised() { return this._queryTableFrame !== undefined; }

    get querySearchText() { return this._uiConditions[0].text; }
    set querySearchText(value: string) { this._uiConditions[0].text = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get queryShowFull() { return this._uiDataDefinition.fullSymbol; }
    set queryShowFull(value: boolean) { this._uiDataDefinition.fullSymbol = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get queryExchangeId() { return this._uiDataDefinition.exchangeId; }
    set queryExchangeId(value: ExchangeId | undefined) {
        this._uiDataDefinition.exchangeId = value;
        if (value !== undefined) {
            const oldMarketIds = this._uiDataDefinition.marketIds;
            if (oldMarketIds !== undefined) {
                let oldMarketIdsIncludeNewExchange = false;
                for (const oldMarketId of oldMarketIds) {
                    const oldMarketExchangeId = MarketInfo.idToExchangeId(oldMarketId);
                    if (oldMarketExchangeId === value) {
                        oldMarketIdsIncludeNewExchange = true;
                        break;
                    }
                }

                if (!oldMarketIdsIncludeNewExchange) {
                    this._uiDataDefinition.marketIds = [];
                }
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get queryMarketIds() { return this._uiDataDefinition.marketIds; }
    set queryMarketIds(value: readonly MarketId[] | undefined) { this._uiDataDefinition.marketIds = value?.slice(); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get queryCfi() { return this._uiDataDefinition.cfi; }
    set queryCfi(value: string | undefined) { this._uiDataDefinition.cfi = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get queryFieldIds() { return this._uiConditions[0].fieldIds; }
    set queryFieldIds(value: readonly SymbolFieldId[] | undefined) { this._uiConditions[0].fieldIds = value?.slice(); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get indicesInclusion() {
        const index = this._uiDataDefinition.index;
        if (index === undefined) {
            return SearchSymbolsDitemFrame.IndicesInclusionId.Include;
        } else {
            if (index === true) {
                return SearchSymbolsDitemFrame.IndicesInclusionId.Only;
            } else {
                return SearchSymbolsDitemFrame.IndicesInclusionId.Exclude;
            }
        }
    }
    set indicesInclusion(value: SearchSymbolsDitemFrame.IndicesInclusionId) {
        switch (value) {
            case SearchSymbolsDitemFrame.IndicesInclusionId.Exclude:
                this._uiDataDefinition.index = false;
                break;
            case SearchSymbolsDitemFrame.IndicesInclusionId.Include:
                this._uiDataDefinition.index = undefined;
                break;
            case SearchSymbolsDitemFrame.IndicesInclusionId.Only:
                this._uiDataDefinition.index = true;
                break;
            default:
                throw new UnreachableCaseError('SSDFII10091', value);
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get queryIsPartial() {
        if (this._uiConditions[0].matchIds === undefined) {
            return true;
        } else {
            return this._uiConditions[0].matchIds.includes(SearchSymbolsDataDefinition.Condition.MatchId.exact);
        }
    }
    set queryIsPartial(value: boolean | undefined) {
        if (value === true) {
            this._uiConditions[0].matchIds = undefined;
        } else {
            this._uiConditions[0].matchIds = [SearchSymbolsDataDefinition.Condition.MatchId.exact];
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get queryIsCaseSensitive() { return this._uiConditions[0].isCaseSensitive; }
    set queryIsCaseSensitive(value: boolean | undefined) { this._uiConditions[0].isCaseSensitive = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get queryPreferExact() { return this._uiDataDefinition.preferExact; }
    set queryPreferExact(value: boolean | undefined) { this._uiDataDefinition.preferExact = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get queryStartIndex() { return this._uiDataDefinition.startIndex; }
    set queryStartIndex(value: Integer | undefined) { this._uiDataDefinition.startIndex = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get queryCount() { return this._uiDataDefinition.count; }
    set queryCount(value: Integer | undefined) { this._uiDataDefinition.count = value; }

    initialise(queryTableFrame: GridSourceFrame, frameElement: JsonElement | undefined): void {
        this._queryTableFrame = queryTableFrame;
        this._queryTableFrame.recordFocusEvent = (newRecordIndex) => this.handleQueryRecordFocusEvent(newRecordIndex);
        this._queryTableFrame.tableOpenEvent = (recordDefinitionList) => this.handleQueryTableOpenEvent(recordDefinitionList);

        // if (frameElement === undefined) {
            this._queryTableFrame.loadLayoutConfig(undefined);
        // } else {
        //     const queryContentElementResult = frameElement.tryGetElementType(SymbolsDitemFrame.JsonName.queryContent);
        //     this._queryTableFrame.loadLayoutConfig(queryContentElement);
        // }

        this.applyLinked();
    }

    override finalise(): void {
        super.finalise();
    }

    override save(element: JsonElement) {
        super.save(element);

        const queryContentElement = element.newElement(SearchSymbolsDitemFrame.JsonName.queryContent);
        this._queryTableFrame.saveLayoutConfig(queryContentElement);
    }

    executeQueryRequest() {
        this.newQueryTable();
    }

    setActiveGridLayout(value: GridLayout) {
        this._queryTableFrame.applyGridLayoutDefinition(value);
    }

    getActiveGridLayoutWithHeadings(): GridLayoutRecordStore.LayoutWithHeadersMap {
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
        let result = `${Strings[StringId.Query]}: `;
        const conditions = definition.conditions;
        const condition = (conditions !== undefined && conditions.length > 0) ? conditions[0] : undefined;
        if (condition === undefined) {
            result += `"", ${Strings[StringId.Fields]}: ""`;
        } else {
            let fieldsDisplay: string;
            const fieldIds = condition.fieldIds;
            if (fieldIds === undefined) {
                fieldsDisplay = '';
            } else {
                const fieldCount = fieldIds.length;
                const fieldDisplays = new Array<string>(fieldCount);
                for (let i = 0; i < fieldCount; i++) {
                    const fieldId = fieldIds[i];
                    fieldDisplays[i] = SymbolField.idToDisplay(fieldId);
                }
                fieldsDisplay = fieldDisplays.join();
            }
            result += `"${condition.text}", ${Strings[StringId.Fields]}: "${fieldsDisplay}"`;
        }
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
            const marketsDisplay = marketDisplays.join();
            result += `, ${Strings[StringId.Markets]}: "${marketsDisplay}"`;
        }
        const cfi = definition.cfi;
        if (cfi !== undefined && cfi !== '') {
            result += `, ${Strings[StringId.Cfi]}: "${cfi}"`;
        }
        const options: string[] = [];
        if (condition !== undefined) {
            const matchIds = condition.matchIds;
            if (matchIds === undefined || !matchIds.includes(SearchSymbolsDataDefinition.Condition.MatchId.exact)) {
                options.push(Strings[StringId.Partial]);
            }
        }
        if (definition.preferExact) {
            options.push(Strings[StringId.Exact]);
        }
        if (definition.fullSymbol) {
            options.push(Strings[StringId.Full]);
        }
        const optionsDisplay = options.join();
        result += `, ${Strings[StringId.Options]}: "${optionsDisplay}"`;
        return result;
    }

    private newQueryTable() {
        const dataDefinition = this._uiDataDefinition.createCopy();
        const keepCurrentLayout = dataDefinition.fullSymbol === this._queryShowFull;
        this._queryShowFull = dataDefinition.fullSymbol;
        const tableDefinition = this._tablesService.definitionFactory.createSymbolsDataItem(dataDefinition);
        this._queryTableFrame.newPrivateTable(tableDefinition, keepCurrentLayout);
    }

    private setUiConditions() {
        const conditions = this._uiDataDefinition.conditions;
        if (conditions !== undefined && conditions.length > 0) {
            this._uiConditions = conditions;
        } else {
            const condition = SymbolsDataItemTableRecordDefinitionList.createDefaultCondition();
            this._uiConditions = [condition];
            this._uiDataDefinition.conditions = this._uiConditions;
        }
    }
}

export namespace SearchSymbolsDitemFrame {
    export namespace JsonName {
        export const queryContent = 'queryContent';
    }

    export type TargetFieldId = SymbolFieldId;
    export const CodeTargetFieldId = SymbolFieldId.Code;
    export const NameTargetFieldId = SymbolFieldId.Name;

    export type RecordFocusEvent = (this: void, newRecordIndex: Integer | undefined) => void;
    export type TableOpenEvent = (this: void, description: string) => void;

    export const enum LayoutTypeId {
        QueryBase,
        QueryFull,
        Subscription,
    }

    export const enum IndicesInclusionId {
        Exclude,
        Include,
        Only,
    }

    export namespace IndicesInclusion {
        type Id = IndicesInclusionId;

        interface Info {
            readonly id: Id;
            readonly captionId: StringId;
            readonly titleId: StringId;
        }

        type InfosObject = { [id in keyof typeof IndicesInclusionId]: Info };

        const infosObject: InfosObject = {
            Exclude: {
                id: IndicesInclusionId.Exclude,
                captionId: StringId.SearchSymbolsIndicesInclusion_ExcludeCaption,
                titleId: StringId.SearchSymbolsIndicesInclusion_ExcludeTitle,
            },
            Include: {
                id: IndicesInclusionId.Include,
                captionId: StringId.SearchSymbolsIndicesInclusion_IncludeCaption,
                titleId: StringId.SearchSymbolsIndicesInclusion_IncludeTitle,
            },
            Only: {
                id: IndicesInclusionId.Only,
                captionId: StringId.SearchSymbolsIndicesInclusion_OnlyCaption,
                titleId: StringId.SearchSymbolsIndicesInclusion_OnlyTitle,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                if (infos[i].id !== i) {
                    throw new EnumInfoOutOfOrderError('SearchSymbolsDitemFrame.IndicesInclusion', i, idToCaption(i));
                }
            }
        }

        function idToCaptionId(id: Id) {
            return infos[id].captionId;
        }

        export function idToCaption(id: Id) {
            return Strings[idToCaptionId(id)];
        }

        function idToTitleId(id: Id) {
            return infos[id].titleId;
        }

        export function idToTitle(id: Id) {
            return Strings[idToTitleId(id)];
        }
    }

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        processQueryTableOpen(description: string): void;
        processQueryRecordFocusChange(recordIdx: Integer): void;
    }
}
