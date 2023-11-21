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
    GridLayoutOrReferenceDefinition,
    Integer,
    JsonElement,
    LitIvemDetail,
    LitIvemIdFromSearchSymbolsTableRecordSource,
    MarketId,
    MarketInfo,
    SearchSymbolsDataDefinition,
    SettingsService,
    StringId,
    Strings,
    SymbolField,
    SymbolFieldId,
    SymbolsService,
    TableRecordSourceDefinitionFactoryService,
    UnexpectedUndefinedError,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { SearchSymbolsFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class SearchSymbolsDitemFrame extends BuiltinDitemFrame {
    private _uiConditions: SearchSymbolsDataDefinition.Condition[];
    private _uiDataDefinition: SearchSymbolsDataDefinition;
    private _searchSymbolsFrame: SearchSymbolsFrame | undefined;

    private _symbolApplying: boolean;

    constructor(
        private readonly _componentAccess: SearchSymbolsDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsMgr: SymbolsService,
        adiService: AdiService,
        private readonly _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Symbols, _componentAccess,
            settingsService, commandRegisterService, desktopAccessService, symbolsMgr, adiService
        );

        const defaultExchangeId = this.symbolsService.defaultExchangeId;
        const defaultMarketId = ExchangeInfo.idToDefaultMarketId(defaultExchangeId);

        this._uiDataDefinition = LitIvemIdFromSearchSymbolsTableRecordSource.createDefaultDataDefinition(
            defaultExchangeId, defaultMarketId
        );
        this.setUiConditions();
    }

    get initialised() { return this._searchSymbolsFrame !== undefined; }

    get searchText() { return this._uiConditions[0].text; }
    set searchText(value: string) { this._uiConditions[0].text = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get showFull() { return this._uiDataDefinition.fullSymbol; }
    set showFull(value: boolean) { this._uiDataDefinition.fullSymbol = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get exchangeId() { return this._uiDataDefinition.exchangeId; }
    set exchangeId(value: ExchangeId | undefined) {
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
    get marketIds() { return this._uiDataDefinition.marketIds; }
    set marketIds(value: readonly MarketId[] | undefined) { this._uiDataDefinition.marketIds = value?.slice(); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get cfi() { return this._uiDataDefinition.cfi; }
    set cfi(value: string | undefined) { this._uiDataDefinition.cfi = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get fieldIds() { return this._uiConditions[0].fieldIds; }
    set fieldIds(value: readonly SymbolFieldId[] | undefined) { this._uiConditions[0].fieldIds = value?.slice(); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get indicesInclusion() {
        const index = this._uiDataDefinition.index;
        if (index === undefined) {
            return SearchSymbolsDitemFrame.IndicesInclusionId.Include;
        } else {
            if (index) {
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
    get isPartial() {
        if (this._uiConditions[0].matchIds === undefined) {
            return true;
        } else {
            return this._uiConditions[0].matchIds.includes(SearchSymbolsDataDefinition.Condition.MatchId.exact);
        }
    }
    set isPartial(value: boolean | undefined) {
        if (value === true) {
            this._uiConditions[0].matchIds = undefined;
        } else {
            this._uiConditions[0].matchIds = [SearchSymbolsDataDefinition.Condition.MatchId.exact];
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get isCaseSensitive() { return this._uiConditions[0].isCaseSensitive; }
    set isCaseSensitive(value: boolean | undefined) { this._uiConditions[0].isCaseSensitive = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get preferExact() { return this._uiDataDefinition.preferExact; }
    set preferExact(value: boolean | undefined) { this._uiDataDefinition.preferExact = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get startIndex() { return this._uiDataDefinition.startIndex; }
    set startIndex(value: Integer | undefined) { this._uiDataDefinition.startIndex = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get count() { return this._uiDataDefinition.count; }
    set count(value: Integer | undefined) { this._uiDataDefinition.count = value; }

    initialise(ditemFrameElement: JsonElement | undefined, searchSymbolsFrame: SearchSymbolsFrame): void {
        this._searchSymbolsFrame = searchSymbolsFrame;

        searchSymbolsFrame.gridSourceOpenedEventer = (dataDefinition) => this.handleGridSourceOpenedEvent(dataDefinition);
        searchSymbolsFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex);

        let searchSymbolsFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const searchSymbolsFrameElementResult = ditemFrameElement.tryGetElement(SearchSymbolsDitemFrame.JsonName.searchSymbolsFrame);
            if (searchSymbolsFrameElementResult.isOk()) {
                searchSymbolsFrameElement = searchSymbolsFrameElementResult.value;
            }
        }

        const initialisePromise = searchSymbolsFrame.initialiseGrid(
            this.opener,
            searchSymbolsFrameElement,
            false,
        );

        initialisePromise.then(
            (gridSourceOrReference) => {
                if (gridSourceOrReference !== undefined) {
                    this.applyLinked();
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'SSDFIP50134') }
        );
    }

    override finalise(): void {
        super.finalise();
    }

    executeRequest() {
        const searchSymbolsFrame = this._searchSymbolsFrame;
        if (searchSymbolsFrame === undefined) {
            throw new UnexpectedUndefinedError('SSDFER13133');
        } else {
            const dataDefinition = this._uiDataDefinition.createCopy();
            searchSymbolsFrame.executeRequest(dataDefinition);
        }
    }

    openGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition) {
        const gridSourceFrame = this._searchSymbolsFrame;
        if (gridSourceFrame === undefined) {
            throw new UnexpectedUndefinedError('SSDFOGLONRD13133');
        } else {
            gridSourceFrame.openGridLayoutOrReferenceDefinition(gridLayoutOrReferenceDefinition);
        }
    }

    createAllowedFieldsAndLayoutDefinition() {
        const gridSourceFrame = this._searchSymbolsFrame;
        if (gridSourceFrame === undefined) {
            throw new UnexpectedUndefinedError('SSDFCAFALD13133');
        } else {
            return gridSourceFrame.createAllowedFieldsGridLayoutDefinition();
        }
    }

    private handleGridSourceOpenedEvent(dataDefinition: SearchSymbolsDataDefinition) {
        const description = this.generateQueryDescription(dataDefinition);
        this._componentAccess.processQueryTableOpen(description);
    }

    private handleRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const searchSymbolsFrame = this._searchSymbolsFrame;
            if (searchSymbolsFrame === undefined) {
                throw new UnexpectedUndefinedError('SSDHGSOE13133');
            } else {
                const record = searchSymbolsFrame.recordList[newRecordIndex];
                this.processRecordFocusChange(record);
                this._componentAccess.processQueryRecordFocusChange(newRecordIndex);
            }
        }
    }

    private processRecordFocusChange(newFocusedRecord: LitIvemDetail) {
        if (!this._symbolApplying) {
            const litIvemId = newFocusedRecord.litIvemId;
            this.applyDitemLitIvemIdFocus(litIvemId, true);
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

    private setUiConditions() {
        const conditions = this._uiDataDefinition.conditions;
        if (conditions !== undefined && conditions.length > 0) {
            this._uiConditions = conditions;
        } else {
            const condition = LitIvemIdFromSearchSymbolsTableRecordSource.createDefaultCondition();
            this._uiConditions = [condition];
            this._uiDataDefinition.conditions = this._uiConditions;
        }
    }
}

export namespace SearchSymbolsDitemFrame {
    export namespace JsonName {
        export const searchSymbolsFrame = 'searchSymbolsFrame';
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
                if (infos[i].id !== i as IndicesInclusionId) {
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
