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
    // private _targetSubTypeId: ScanEditorTargetsNgComponent.TargetSubTypeId | undefined;
    private _lastTargetTypeIdWasMulti = false;

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
    }

    ngOnInit() {
        this.pushInitialScanEditorValues();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();
    }

    public isSingleSymbolSubTargetType() {
        return this.isSymbolsTargetTypeId() && !this._lastTargetTypeIdWasMulti;
    }

    public isMultiSymbolSubTargetType() {
        return this.isSymbolsTargetTypeId() && this._lastTargetTypeIdWasMulti;
    }

    public isSingleMarketSubTargetType() {
        return this.isMarketsTargetTypeId() && !this._lastTargetTypeIdWasMulti;
    }

    public isMultiMarketSubTargetType() {
        return this.isMarketsTargetTypeId() && this._lastTargetTypeIdWasMulti;
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

        this.pushInitialScanEditorValues();
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
            const targetSubTypeId = this._targetSubTypeUiAction.definedValue as ScanEditorTargetsNgComponent.TargetSubTypeId;
            this.setTargetSubTypeId(targetSubTypeId);
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
                this._scanEditor.setTargetLitIvemIds([litItemId]);
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
                this._scanEditor.setTargetMarketIds([id]);
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
                this._scanEditor.setTargetMarketIds(ids);
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
                const maxMatchCount = this._maxMatchCountUiAction.definedValue;
                this._scanEditor.setMaxMatchCount(maxMatchCount);
            }
        };
        return action;
    }

    private processFieldChanges(fieldIds: readonly ScanEditor.FieldId[], fieldChanger: ScanEditor.FieldChanger | undefined) {
        if (fieldChanger !== this) {
            for (const fieldId of fieldIds) {
                switch (fieldId) {
                    case ScanEditor.FieldId.TargetTypeId: {
                        this.pushTargetTypeId();
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

    private isSymbolsTargetTypeId() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            return false;
        } else {
            return scanEditor.targetTypeId === ScanTargetTypeId.Symbols;
        }
    }

    private isMarketsTargetTypeId() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            return false;
        } else {
            return scanEditor.targetTypeId === ScanTargetTypeId.Markets;
        }
    }

    private pushInitialScanEditorValues() {
        const lastTargetTypeIdWasMulti: boolean = this.calculateLastTargetTypeIdWasMultiFromScanEditor();
        this.setLastTargetTypeIdWasMulti(lastTargetTypeIdWasMulti);

        this.pushMaxMatchCount();
        this.pushTargetLitIvemIds();
        this.pushTargetMarketIds();
        this.pushTargetTypeId();
    }

    private pushTargetTypeId() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            this._targetSubTypeUiAction.pushValue(undefined);
            this._targetSubTypeUiAction.pushDisabled();
        } else {
            switch (scanEditor.targetTypeId) {
                case undefined: {
                    this._targetSubTypeUiAction.pushValue(undefined);
                    this._targetSubTypeUiAction.pushDisabled();
                    break;
                }
                case ScanTargetTypeId.Symbols: {
                    if (this._lastTargetTypeIdWasMulti) {
                        this._targetSubTypeUiAction.pushValue(ScanEditorTargetsNgComponent.TargetSubTypeId.MultiSymbol);
                    } else {
                        this._targetSubTypeUiAction.pushValue(ScanEditorTargetsNgComponent.TargetSubTypeId.SingleSymbol);
                    }

                    this._targetSubTypeUiAction.pushValid();
                    break;
                }
                case ScanTargetTypeId.Markets: {
                    if (this._lastTargetTypeIdWasMulti) {
                        this._targetSubTypeUiAction.pushValue(ScanEditorTargetsNgComponent.TargetSubTypeId.MultiMarket);
                    } else {
                        this._targetSubTypeUiAction.pushValue(ScanEditorTargetsNgComponent.TargetSubTypeId.SingleMarket);
                    }

                    this._targetSubTypeUiAction.pushValid();
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
            this._maxMatchCountUiAction.pushDisabled();
        } else {
            this._maxMatchCountUiAction.pushValue(scanEditor.maxMatchCount);
            this._maxMatchCountUiAction.pushValid();
        }
    }

    private pushTargetMarketIds() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            this._singleMarketUiAction.pushValue(undefined);
            this._singleMarketUiAction.pushDisabled();
            this._multiMarketUiAction.pushValue([]);
            this._multiMarketUiAction.pushDisabled();
        } else {
            const marketIds = scanEditor.targetMarketIds;
            if (marketIds === undefined) {
                this._singleMarketUiAction.pushValue(undefined);
                this._singleMarketUiAction.pushDisabled();
                this._multiMarketUiAction.pushValue([]);
                this._multiMarketUiAction.pushDisabled();
            } else {
                if (marketIds.length === 0) {
                    this._singleMarketUiAction.pushValue(undefined);
                    this._singleMarketUiAction.pushMissing();
                    this._multiMarketUiAction.pushValue([]);
                    this._multiMarketUiAction.pushMissing();
                } else {
                    this._singleMarketUiAction.pushValue(marketIds[0]);
                    this._multiMarketUiAction.pushValue(marketIds);
                    this._singleMarketUiAction.pushValid();
                    this._multiMarketUiAction.pushValid();
                }
            }
        }
    }

    private pushTargetLitIvemIds() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            this._singleSymbolUiAction.pushValue(undefined);
            this._singleSymbolUiAction.pushDisabled();
        } else {
            const litIvemIds = scanEditor.targetLitIvemIds;
            if (litIvemIds === undefined) {
                this._singleSymbolUiAction.pushValue(undefined);
                this._singleSymbolUiAction.pushDisabled();
            } else {
                if (litIvemIds.length === 0) {
                    this._singleSymbolUiAction.pushValue(undefined);
                    this._singleSymbolUiAction.pushMissing();
                } else {
                    this._singleSymbolUiAction.pushValue(litIvemIds[0]);
                    this._singleMarketUiAction.pushValid();
                }
            }
        }
    }

    private setTargetSubTypeId(targetSubTypeId: ScanEditorTargetsNgComponent.TargetSubTypeId) {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            throw new AssertInternalError('SETNCSTSTIS66821');
        } else {
            let lastTargetTypeIdWasMulti: boolean;
            let targetTypeId: ScanTargetTypeId;
            switch (targetSubTypeId) {
                case ScanEditorTargetsNgComponent.TargetSubTypeId.SingleSymbol:
                    lastTargetTypeIdWasMulti = false;
                    targetTypeId = ScanTargetTypeId.Symbols;
                    break;
                case ScanEditorTargetsNgComponent.TargetSubTypeId.MultiSymbol:
                    lastTargetTypeIdWasMulti = true;
                    targetTypeId = ScanTargetTypeId.Symbols;
                    break;
                case ScanEditorTargetsNgComponent.TargetSubTypeId.SingleMarket:
                    lastTargetTypeIdWasMulti = false;
                    targetTypeId = ScanTargetTypeId.Markets;
                    break;
                case ScanEditorTargetsNgComponent.TargetSubTypeId.MultiMarket:
                    lastTargetTypeIdWasMulti = true;
                    targetTypeId = ScanTargetTypeId.Markets;
                    break;
                default:
                    throw new UnreachableCaseError('SETNCSTSTIU66821', targetSubTypeId);
            }

            this.setLastTargetTypeIdWasMulti(lastTargetTypeIdWasMulti); // make sure this is set before TargetTypeId
            scanEditor.setTargetTypeId(targetTypeId);
        }
    }

    private setLastTargetTypeIdWasMulti(value: boolean) {
        if (value !== this._lastTargetTypeIdWasMulti) {
            this._lastTargetTypeIdWasMulti = value;
            this._cdr.markForCheck();
        }
    }

    private calculateLastTargetTypeIdWasMultiFromScanEditor() {
        const scanEditor = this._scanEditor;
        let lastTargetTypeIdWasMulti: boolean;
        if (scanEditor === undefined) {
            lastTargetTypeIdWasMulti = false;
        } else {
            switch (scanEditor.targetTypeId) {
                case undefined: {
                    lastTargetTypeIdWasMulti = false;
                    break;
                }
                case ScanTargetTypeId.Symbols: {
                    const targetLitIvemIds = scanEditor.targetLitIvemIds;
                    if (targetLitIvemIds === undefined) {
                        lastTargetTypeIdWasMulti = false;
                    } else {
                        lastTargetTypeIdWasMulti = targetLitIvemIds.length !== 1;
                    }
                    break;
                }
                case ScanTargetTypeId.Markets: {
                    const targetMarketIds = scanEditor.targetMarketIds;
                    if (targetMarketIds === undefined) {
                        lastTargetTypeIdWasMulti = false;
                    } else {
                        lastTargetTypeIdWasMulti = targetMarketIds.length !== 1;
                    }
                    break;
                }
                default:
                    throw new UnreachableCaseError('SETNCSE55971', scanEditor.targetTypeId);
            }
        }
        return lastTargetTypeIdWasMulti;
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
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as TargetSubTypeId);
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
