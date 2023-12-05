import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    AllowedMarketsEnumArrayUiAction,
    AllowedMarketsEnumUiAction,
    AssertInternalError,
    EnumInfoOutOfOrderError,
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    Integer,
    IntegerUiAction,
    LitIvemIdUiAction,
    MarketId,
    MultiEvent,
    ScanEditor,
    ScanTargetTypeId,
    StringId,
    Strings,
    SymbolsService,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { SymbolsNgService } from 'component-services-ng-api';
import {
    CaptionLabelNgComponent,
    CaptionedRadioNgComponent,
    EnumArrayInputNgComponent,
    EnumInputNgComponent, IntegerTextInputNgComponent,
    LitIvemIdSelectNgComponent
} from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-scan-editor-targets',
    templateUrl: './scan-editor-targets-ng.component.html',
    styleUrls: ['./scan-editor-targets-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanEditorTargetsNgComponent extends ContentComponentBaseNgDirective implements  OnInit, OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('singleSymbolTargetSubTypeControl', { static: true })
        private _singleSymbolTargetSubTypeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('multiSymbolTargetSubTypeControl', { static: true })
        private _multiSymbolTargetSubTypeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('singleMarketTargetSubTypeControl', { static: true })
        private _singleMarketTargetSubTypeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('multiMarketTargetSubTypeControl', { static: true })
        private _multiMarketTargetSubTypeControlComponent: CaptionedRadioNgComponent;

    @ViewChild('singleSymbolControl', { static: true })
        private _singleSymbolControlComponent: LitIvemIdSelectNgComponent;
    @ViewChild('singleMarketControl', { static: true })
        private _singleMarketControlComponent: EnumInputNgComponent;
    @ViewChild('singleMarketMaxMatchCountLabel', { static: true })
        private _singleMarketMaxMatchCountLabelComponent: CaptionLabelNgComponent;
    @ViewChild('singleMarketMaxMatchCountControl', { static: true })
        private _singleMarketMaxMatchCountControlComponent: IntegerTextInputNgComponent;
    @ViewChild('multiMarketControl', { static: true })
        private _multiMarketControlComponent: EnumArrayInputNgComponent;
    @ViewChild('multiMarketMaxMatchCountLabel', { static: true })
        private _multiMarketMaxMatchCountLabelComponent: CaptionLabelNgComponent;
    @ViewChild('multiMarketMaxMatchCountControl', { static: true })
        private _multiMarketMaxMatchCountControlComponent: IntegerTextInputNgComponent;

    public readonly targetSubTypeRadioName: string;

    private readonly _symbolsService: SymbolsService;

    private readonly _targetSubTypeUiAction: ExplicitElementsEnumUiAction;
    private readonly _singleSymbolUiAction: LitIvemIdUiAction;
    private readonly _singleMarketUiAction: AllowedMarketsEnumUiAction;
    private readonly _multiMarketUiAction: AllowedMarketsEnumArrayUiAction;
    private readonly _maxMatchCountUiAction: IntegerUiAction;

    private _scanEditor: ScanEditor | undefined;
    private _targetSubTypeId: ScanEditorTargetsNgComponent.TargetSubTypeId;

    private _scanEditorFieldChangesSubscriptionId: MultiEvent.SubscriptionId | undefined;

    constructor(elRef: ElementRef<HTMLElement>, private readonly _cdr: ChangeDetectorRef, symbolsNgService: SymbolsNgService) {
        super(elRef, ++ScanEditorTargetsNgComponent.typeInstanceCreateCount);

        this.targetSubTypeRadioName = this.generateInstancedRadioName('targetSubType');

        this._symbolsService = symbolsNgService.service;

        this._targetSubTypeUiAction = this.createTargetSubTypeUiAction();
        this._singleSymbolUiAction = this.createSingleSymbolUiAction();
        this._singleMarketUiAction = this.createSingleMarketUiAction();
        this._multiMarketUiAction = this.createMultiMarketUiAction();
        this._maxMatchCountUiAction = this.createMaxMatchCountUiAction();

        this._targetSubTypeId = ScanEditorTargetsNgComponent.TargetSubTypeId.SingleSymbol;
    }

    ngOnInit() {
        this.pushValues();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();
    }

    public isSingleSymbolSubTargetType() {
        return this._targetSubTypeId === ScanEditorTargetsNgComponent.TargetSubTypeId.SingleSymbol;
    }

    public isMultiSymbolSubTargetType() {
        return this._targetSubTypeId === ScanEditorTargetsNgComponent.TargetSubTypeId.MultiSymbol;
    }

    public isSingleMarketSubTargetType() {
        return this._targetSubTypeId === ScanEditorTargetsNgComponent.TargetSubTypeId.SingleMarket;
    }

    public isMultiMarketSubTargetType() {
        return this._targetSubTypeId === ScanEditorTargetsNgComponent.TargetSubTypeId.MultiMarket;
    }

    setEditor(value: ScanEditor | undefined) {
        if (this._scanEditor !== undefined) {
            this._scanEditor.unsubscribeFieldChangesEvents(this._scanEditorFieldChangesSubscriptionId);
            this._scanEditorFieldChangesSubscriptionId = undefined;
        }

        this._scanEditor = value;

        if (this._scanEditor !== undefined) {
            this._scanEditorFieldChangesSubscriptionId = this._scanEditor.subscribeFieldChangesEvents(
                (fieldIds, fieldChanger) => { this.processFieldChanges(fieldIds, fieldChanger); }
            );
        }

        this.pushValues();
    }

    protected finalise() {
        this._targetSubTypeUiAction.finalise();
        this._singleSymbolUiAction.finalise();
        this._singleMarketUiAction.finalise();
        this._multiMarketUiAction.finalise();
        this._maxMatchCountUiAction.finalise();
    }

    private initialiseComponents() {
        this._singleSymbolTargetSubTypeControlComponent.initialiseEnum(
            this._targetSubTypeUiAction, ScanEditorTargetsNgComponent.TargetSubTypeId.SingleSymbol
        );
        this._multiSymbolTargetSubTypeControlComponent.initialiseEnum(
            this._targetSubTypeUiAction, ScanEditorTargetsNgComponent.TargetSubTypeId.MultiSymbol
        );
        this._singleMarketTargetSubTypeControlComponent.initialiseEnum(
            this._targetSubTypeUiAction, ScanEditorTargetsNgComponent.TargetSubTypeId.SingleMarket
        );
        this._multiMarketTargetSubTypeControlComponent.initialiseEnum(
            this._targetSubTypeUiAction, ScanEditorTargetsNgComponent.TargetSubTypeId.MultiMarket
        );
        this._singleSymbolControlComponent.initialise(this._singleSymbolUiAction);
        this._singleMarketControlComponent.initialise(this._singleMarketUiAction);
        this._singleMarketMaxMatchCountLabelComponent.initialise(this._maxMatchCountUiAction);
        this._singleMarketMaxMatchCountControlComponent.initialise(this._maxMatchCountUiAction);
        this._multiMarketControlComponent.initialise(this._multiMarketUiAction);
        this._multiMarketMaxMatchCountLabelComponent.initialise(this._maxMatchCountUiAction);
        this._multiMarketMaxMatchCountControlComponent.initialise(this._maxMatchCountUiAction);
    }

    private createTargetSubTypeUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ScanTargetsCaption_TargetType]);
        action.pushTitle(Strings[StringId.ScanTargetsDescription_TargetType]);
        const ids = ScanEditorTargetsNgComponent.TargetSubType.getAllIds();
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: ScanEditorTargetsNgComponent.TargetSubType.idToDisplay(id),
                    title: ScanEditorTargetsNgComponent.TargetSubType.idToDescription(id),
                })
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            this._targetSubTypeId = this._targetSubTypeUiAction.definedValue;
            this._cdr.markForCheck();
        };
        return action;
    }

    private createSingleSymbolUiAction() {
        const action = new LitIvemIdUiAction();
        action.pushCaption(Strings[StringId.ScanTargetsCaption_SingleSymbol]);
        action.pushTitle(Strings[StringId.ScanTargetsDescription_SingleSymbol]);
        action.commitEvent = () => {
            if (this._scanEditor !== undefined) {
                const litItemId = this._singleSymbolUiAction.definedValue;
                this._scanEditor.targetLitIvemIds = [litItemId];
            }
        };
        return action;
    }

    private createSingleMarketUiAction() {
        const action = new AllowedMarketsEnumUiAction(this._symbolsService);
        action.pushCaption(Strings[StringId.ScanTargetsCaption_SingleMarket]);
        action.pushTitle(Strings[StringId.ScanTargetsDescription_SingleMarket]);
        action.commitEvent = () => {
            if (this._scanEditor !== undefined) {
                const id = this._singleMarketUiAction.definedValue as MarketId;
                this._scanEditor.targetMarketIds = [id];
            }
        };
        return action;
    }

    private createMultiMarketUiAction() {
        const action = new AllowedMarketsEnumArrayUiAction(this._symbolsService);
        action.pushCaption(Strings[StringId.ScanTargetsCaption_MultiMarket]);
        action.pushTitle(Strings[StringId.ScanTargetsDescription_MultiMarket]);
        action.commitEvent = () => {
            if (this._scanEditor !== undefined) {
                const ids = this._multiMarketUiAction.definedValue as readonly MarketId[];
                this._scanEditor.targetMarketIds = ids;
            }
        };
        return action;
    }

    private createMaxMatchCountUiAction() {
        const action = new IntegerUiAction();
        action.pushTitle(Strings[StringId.ScanTargetsDescription_MaxMatchCount]);
        action.pushCaption(Strings[StringId.ScanTargetsCaption_MaxMatchCount]);
        action.commitEvent = () => {
            if (this._scanEditor !== undefined) {
                const ids = this._multiMarketUiAction.definedValue as readonly MarketId[];
                this._scanEditor.targetMarketIds = ids;
            }
        };
        return action;
    }

    private processFieldChanges(fieldIds: readonly ScanEditor.FieldId[], fieldChanger: ScanEditor.FieldChanger | undefined) {
        if (fieldChanger !== this) {
            for (const fieldId of fieldIds) {
                switch (fieldId) {
                    case ScanEditor.FieldId.TargetTypeId: {
                        const symbolTargetSubTypeId = this.pushTargetLitIvemIds();
                        const marketTargetSubTypeId = this.pushTargetMarketIds();
                        this.pushTargetTypeId(symbolTargetSubTypeId, marketTargetSubTypeId);
                        break;
                    }
                    case ScanEditor.FieldId.TargetMarkets:
                        this.pushTargetMarketIds();
                        break;
                    case ScanEditor.FieldId.TargetLitIvemIds:
                        this.pushTargetLitIvemIds();
                        break;
                    case ScanEditor.FieldId.MaxMatchCount:
                        this.pushMaxMatchCount();
                        break;
                }
            }
        }
    }

    private pushValues() {
        if (this._scanEditor === undefined) {
            this._targetSubTypeUiAction.pushValue(ScanEditorTargetsNgComponent.TargetSubTypeId.SingleSymbol);
        } else {
            this.pushMaxMatchCount();
            const symbolTargetSubTypeId = this.pushTargetLitIvemIds();
            const marketTargetSubTypeId = this.pushTargetMarketIds();
            this.pushTargetTypeId(symbolTargetSubTypeId, marketTargetSubTypeId);
        }
        this._cdr.markForCheck();
    }

    private pushTargetTypeId(
        symbolTargetSubTypeId: ScanEditorTargetsNgComponent.TargetSubTypeId | undefined,
        marketTargetSubTypeId: ScanEditorTargetsNgComponent.TargetSubTypeId | undefined
    ) {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            this._targetSubTypeUiAction.pushValue(ScanEditorTargetsNgComponent.TargetSubTypeId.SingleSymbol);
        } else {
            switch (scanEditor.targetTypeId) {
                case undefined: {
                    this._targetSubTypeUiAction.pushDisabled();
                    break;
                }
                case ScanTargetTypeId.Symbols: {
                    if (symbolTargetSubTypeId === undefined) {
                        throw new AssertInternalError('SETNCPTTIS74109');
                    } else {
                        this._targetSubTypeId = symbolTargetSubTypeId;
                        this._targetSubTypeUiAction.pushValue(symbolTargetSubTypeId);
                        break;
                    }
                }
                case ScanTargetTypeId.Markets: {
                    if (marketTargetSubTypeId === undefined) {
                        throw new AssertInternalError('SETNCPTTIM74109');
                    } else {
                        this._targetSubTypeId = marketTargetSubTypeId;
                        this._targetSubTypeUiAction.pushValue(marketTargetSubTypeId);
                    }
                    break;
                }
                default:
                    throw new UnreachableCaseError('SETNCPTTI33017', scanEditor.targetTypeId);
            }
        }
    }

    private pushMaxMatchCount() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            this._maxMatchCountUiAction.pushValue(undefined);
        } else {
            this._maxMatchCountUiAction.pushValue(scanEditor.maxMatchCount);
        }
    }

    private pushTargetMarketIds() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            this._singleMarketUiAction.pushValue(undefined);
            this._multiMarketUiAction.pushValue([]);
            return undefined;
        } else {
            const marketIds = scanEditor.targetMarketIds;
            let marketTargetSubTypeId: ScanEditorTargetsNgComponent.TargetSubTypeId;
            if (marketIds.length === 0) {
                marketTargetSubTypeId = ScanEditorTargetsNgComponent.TargetSubTypeId.SingleMarket;
                this._singleMarketUiAction.pushValue(undefined);
                this._multiMarketUiAction.pushValue([]);
            } else {
                if (marketIds.length === 1) {
                    marketTargetSubTypeId = ScanEditorTargetsNgComponent.TargetSubTypeId.SingleMarket;
                    this._singleMarketUiAction.pushValue(marketIds[0]);
                    this._multiMarketUiAction.pushValue(marketIds);
                } else {
                    marketTargetSubTypeId = ScanEditorTargetsNgComponent.TargetSubTypeId.MultiMarket;
                    this._singleMarketUiAction.pushValue(marketIds[0]);
                    this._multiMarketUiAction.pushValue(marketIds);
                }
            }
            return marketTargetSubTypeId;
        }
    }

    private pushTargetLitIvemIds() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            this._singleSymbolUiAction.pushValue(undefined);
            return undefined;
        } else {
            const litIvemIds = scanEditor.targetLitIvemIds;
            let symbolTargetSubTypeId: ScanEditorTargetsNgComponent.TargetSubTypeId;
            if (litIvemIds.length === 0) {
                symbolTargetSubTypeId = ScanEditorTargetsNgComponent.TargetSubTypeId.SingleSymbol;
                this._singleSymbolUiAction.pushValue(undefined);
            } else {
                if (litIvemIds.length === 1) {
                    symbolTargetSubTypeId = ScanEditorTargetsNgComponent.TargetSubTypeId.SingleSymbol;
                    this._singleSymbolUiAction.pushValue(litIvemIds[0]);
                } else {
                    symbolTargetSubTypeId = ScanEditorTargetsNgComponent.TargetSubTypeId.MultiSymbol;
                    this._singleSymbolUiAction.pushValue(litIvemIds[0]);
                }
            }
            return symbolTargetSubTypeId;
        }
    }
}

export namespace ScanEditorTargetsNgComponent {
    export const enum TargetSubTypeId {
        SingleSymbol,
        MultiSymbol,
        SingleMarket,
        MultiMarket,
    }

    export namespace TargetSubType {
        export type Id = TargetSubTypeId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
            readonly descriptionId: StringId;
        }

        type InfosObject = { [id in keyof typeof TargetSubTypeId]: Info };

        const infosObject: InfosObject = {
            SingleSymbol: {
                id: TargetSubTypeId.SingleSymbol,
                name: 'SingleSymbol',
                displayId: StringId.ScanTargetsTargetSubTypeIdDisplay_SingleSymbol,
                descriptionId: StringId.ScanTargetsTargetSubTypeIdDescription_SingleSymbol,
            },
            MultiSymbol: {
                id: TargetSubTypeId.MultiSymbol,
                name: 'MultiSymbol',
                displayId: StringId.ScanTargetsTargetSubTypeIdDisplay_MultiSymbol,
                descriptionId: StringId.ScanTargetsTargetSubTypeIdDescription_MultiSymbol,
            },
            SingleMarket: {
                id: TargetSubTypeId.SingleMarket,
                name: 'SingleMarket',
                displayId: StringId.ScanTargetsTargetSubTypeIdDisplay_SingleMarket,
                descriptionId: StringId.ScanTargetsTargetSubTypeIdDescription_SingleMarket,
            },
            MultiMarket: {
                id: TargetSubTypeId.MultiMarket,
                name: 'MultiMarket',
                displayId: StringId.ScanTargetsTargetSubTypeIdDisplay_MultiMarket,
                descriptionId: StringId.ScanTargetsTargetSubTypeIdDescription_MultiMarket,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ScanTargetNgComponent.TargetSubTypeId', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }

        export function getAllIds() {
            return infos.map(info => info.id);
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }

        export function idToDescriptionId(id: Id): StringId {
            return infos[id].descriptionId;
        }

        export function idToDescription(id: Id): string {
            return Strings[idToDescriptionId(id)];
        }
    }
}


export namespace ScanTargetsNgComponentModule {
    export function initialiseStatic() {
        ScanEditorTargetsNgComponent.TargetSubType.initialise();
    }
}
