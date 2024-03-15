import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
    AllowedFieldsGridLayoutDefinition,
    AllowedMarketsEnumUiAction,
    AllowedMarketsExplicitElementsArrayUiAction,
    AssertInternalError,
    EnumInfoOutOfOrderError,
    GridLayoutOrReferenceDefinition,
    Integer,
    IntegerExplicitElementsEnumUiAction,
    IntegerUiAction,
    LitIvemId,
    LitIvemIdUiAction,
    MarketId,
    MultiEvent,
    ScanEditor,
    ScanTargetTypeId,
    StringId,
    Strings,
    SymbolsService,
    UiComparableList,
    UnreachableCaseError,
    delay1Tick
} from '@motifmarkets/motif-core';
import { SymbolsNgService } from 'component-services-ng-api';
import {
    CaptionLabelNgComponent,
    CaptionedRadioNgComponent,
    EnumArrayInputNgComponent,
    IntegerEnumInputNgComponent, IntegerTextInputNgComponent,
    LitIvemIdSelectNgComponent
} from 'controls-ng-api';
import { LitIvemIdListEditorNgComponent } from '../../../../../../lit-ivem-id-list-editor/ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-scan-editor-targets',
    templateUrl: './scan-editor-targets-ng.component.html',
    styleUrls: ['./scan-editor-targets-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanEditorTargetsNgComponent extends ContentComponentBaseNgDirective implements  OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('singleSymbolTargetSubTypeControl', { static: true }) private _singleSymbolTargetSubTypeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('multiSymbolTargetSubTypeControl', { static: true }) private _multiSymbolTargetSubTypeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('singleMarketTargetSubTypeControl', { static: true }) private _singleMarketTargetSubTypeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('multiMarketTargetSubTypeControl', { static: true }) private _multiMarketTargetSubTypeControlComponent: CaptionedRadioNgComponent;

    @ViewChild('singleSymbolControl', { static: true }) private _singleSymbolControlComponent: LitIvemIdSelectNgComponent;
    @ViewChild('multiSymbolEditor', { static: true }) private _multiSymbolEditorComponent: LitIvemIdListEditorNgComponent;
    @ViewChild('singleMarketControl', { static: true }) private _singleMarketControlComponent: IntegerEnumInputNgComponent;
    @ViewChild('multiMarketControl', { static: true }) private _multiMarketControlComponent: EnumArrayInputNgComponent;

    @ViewChild('maxMatchCountLabel', { static: true }) private _maxMatchCountLabelComponent: CaptionLabelNgComponent;
    @ViewChild('maxMatchCountControl', { static: true }) private _maxMatchCountControlComponent: IntegerTextInputNgComponent;

    public readonly targetSubTypeRadioName: string;

    controlInputOrCommitEventer: ScanEditorTargetsNgComponent.ControlInputOrCommitEventer | undefined;
    editGridColumnsEventer: ScanEditorTargetsNgComponent.EditGridColumnsEventer | undefined;
    popoutMultiSymbolListEditorEventer: ScanEditorTargetsNgComponent.PopoutMultiSymbolListEditorEventer | undefined;

    private readonly _symbolsService: SymbolsService;

    private readonly _targetSubTypeUiAction: IntegerExplicitElementsEnumUiAction;
    private readonly _singleSymbolUiAction: LitIvemIdUiAction;
    private readonly _singleMarketUiAction: AllowedMarketsEnumUiAction;
    private readonly _multiMarketUiAction: AllowedMarketsExplicitElementsArrayUiAction;
    private readonly _maxMatchCountUiAction: IntegerUiAction;

    private _scanEditor: ScanEditor | undefined;
    private _multiSymbolList: UiComparableList<LitIvemId>;
    // private _targetSubTypeId: ScanEditorTargetsNgComponent.TargetSubTypeId | undefined;
    // private _lastTargetTypeIdWasMulti = false;

    private _scanEditorFieldChangesSubscriptionId: MultiEvent.SubscriptionId | undefined;
    private _multiSymbolEditorComponentAfterListChangedSubscriptionId: MultiEvent.SubscriptionId | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        symbolsNgService: SymbolsNgService,
    ) {
        super(elRef, ++ScanEditorTargetsNgComponent.typeInstanceCreateCount);

        this.targetSubTypeRadioName = this.generateInstancedRadioName('targetSubType');

        this._symbolsService = symbolsNgService.service;
        this._targetSubTypeUiAction = this.createTargetSubTypeUiAction();
        this._singleSymbolUiAction = this.createSingleSymbolUiAction();
        this._singleMarketUiAction = this.createSingleMarketUiAction();
        this._multiMarketUiAction = this.createMultiMarketUiAction();
        this._maxMatchCountUiAction = this.createMaxMatchCountUiAction();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();
        this.pushInitialScanEditorValues();
    }

    public isSingleSymbolSubTargetType() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            return false;
        } else {
            if (scanEditor.targetTypeId !== ScanTargetTypeId.Symbols) {
                return false;
            } else {
                return scanEditor.lastTargetTypeIdWasMulti === false;
            }
        }
    }

    public isMultiSymbolSubTargetType() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            return false;
        } else {
            if (scanEditor.targetTypeId !== ScanTargetTypeId.Symbols) {
                return false;
            } else {
                return scanEditor.lastTargetTypeIdWasMulti === true;
            }
        }
    }

    public isSingleMarketSubTargetType() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            return false;
        } else {
            if (scanEditor.targetTypeId !== ScanTargetTypeId.Markets) {
                return false;
            } else {
                return scanEditor.lastTargetTypeIdWasMulti === false;
            }
        }
    }

    public isMultiMarketSubTargetType() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            return false;
        } else {
            if (scanEditor.targetTypeId !== ScanTargetTypeId.Markets) {
                return false;
            } else {
                return scanEditor.lastTargetTypeIdWasMulti === true;
            }
        }
    }

    setEditor(value: ScanEditor | undefined) {
        if (this._scanEditor !== undefined) {
            this._scanEditor.unsubscribeFieldChangesEvents(this._scanEditorFieldChangesSubscriptionId);
            this._scanEditorFieldChangesSubscriptionId = undefined;
        }

        this._scanEditor = value;

        if (this._scanEditor !== undefined) {
            this._scanEditorFieldChangesSubscriptionId = this._scanEditor.subscribeFieldChangesEvents(
                (fieldIds, modifier) => { this.processFieldChanges(fieldIds, modifier); }
            );
        }

        this.pushInitialScanEditorValues();
    }

    areAllControlValuesOk() {
        const targetSubTypeId = this._targetSubTypeUiAction.value as ScanEditorTargetsNgComponent.TargetSubTypeId | undefined;
        if (targetSubTypeId === undefined) {
            return false;
        } else {
            if (!this._maxMatchCountControlComponent.uiAction.isValueOk()) {
                return false;
            } else {
                switch (targetSubTypeId) {
                    case ScanEditorTargetsNgComponent.TargetSubTypeId.SingleSymbol:
                        return this._singleSymbolControlComponent.uiAction.isValueOk();
                    case ScanEditorTargetsNgComponent.TargetSubTypeId.MultiSymbol:
                        return true;
                    case ScanEditorTargetsNgComponent.TargetSubTypeId.SingleMarket:
                        return this._singleMarketControlComponent.uiAction.isValueOk();
                    case ScanEditorTargetsNgComponent.TargetSubTypeId.MultiMarket:
                        return this._multiMarketControlComponent.uiAction.isValueOk();
                    default:
                        throw new UnreachableCaseError('SETNCAACED65134', targetSubTypeId);
                }
            }
        }
    }

    cancelAllControlsEdited() {
        this._singleSymbolControlComponent.uiAction.cancelEdit();
        this._singleMarketControlComponent.uiAction.cancelEdit();
        this._maxMatchCountControlComponent.uiAction.cancelEdit();
        this._multiMarketControlComponent.uiAction.cancelEdit();
        this._multiSymbolEditorComponent.cancelAllControlsEdited();
    }

    protected finalise() {
        this._multiSymbolEditorComponent.unsubscribeAfterListChangedEvent(this._multiSymbolEditorComponentAfterListChangedSubscriptionId);
        this._multiSymbolEditorComponentAfterListChangedSubscriptionId = undefined;
        this._multiSymbolEditorComponent.editGridColumnsEventer = undefined;
        this._multiSymbolEditorComponent.popoutEventer = undefined;

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
        this._maxMatchCountLabelComponent.initialise(this._maxMatchCountUiAction);
        this._maxMatchCountControlComponent.initialise(this._maxMatchCountUiAction);
        this._multiMarketControlComponent.initialise(this._multiMarketUiAction);

        this._multiSymbolList = this._multiSymbolEditorComponent.list;
        this._multiSymbolEditorComponentAfterListChangedSubscriptionId = this._multiSymbolEditorComponent.subscribeAfterListChangedEvent(
            (ui) => {
                if (ui) {
                    const editor = this._scanEditor;
                    if (editor !== undefined) {
                        editor.beginFieldChanges(this.instanceId);
                        const litIvemIds = this._multiSymbolEditorComponent.list.toArray();
                        editor.setTargetLitIvemIds(litIvemIds);
                        editor.endFieldChanges();
                        this.notifyControlInputOrCommit();
                    }
                }
            }
        )

        this._multiSymbolEditorComponent.editGridColumnsEventer = (allowedFieldsAndLayoutDefinition) => {
            if (this.editGridColumnsEventer !== undefined) {
                return this.editGridColumnsEventer(
                    Strings[StringId.ScanEditorTargetsComponent_EditMultiSymbolGridColumns],
                    allowedFieldsAndLayoutDefinition
                );
            } else {
                return Promise.resolve(undefined);
            }
        }
        this._multiSymbolEditorComponent.popoutEventer = (list) => {
            if (this.popoutMultiSymbolListEditorEventer !== undefined) {
                this.popoutMultiSymbolListEditorEventer(
                    Strings[StringId.ScanEditorTargetsComponent_EditMultiSymbolList],
                    list,
                    Strings[StringId.ScanEditorTargetsComponent_EditMultiSymbolGridColumns],
                );
            }
        }
    }

    private createTargetSubTypeUiAction() {
        const action = new IntegerExplicitElementsEnumUiAction();
        action.commitOnAnyValidInput = true;
        action.pushCaption(Strings[StringId.ScanTargetsCaption_TargetType]);
        action.pushTitle(Strings[StringId.ScanTargetsDescription_TargetType]);
        const ids = ScanEditorTargetsNgComponent.TargetSubType.getAllIds();
        const elementPropertiesArray = ids.map<IntegerExplicitElementsEnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: ScanEditorTargetsNgComponent.TargetSubType.idToDisplay(id),
                    title: ScanEditorTargetsNgComponent.TargetSubType.idToDescription(id),
                })
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.inputEvent = () => { this.notifyControlInputOrCommit() };
        action.commitEvent = () => {
            const targetSubTypeId = this._targetSubTypeUiAction.definedValue as ScanEditorTargetsNgComponent.TargetSubTypeId;
            this.setTargetSubTypeId(targetSubTypeId);
            this.notifyControlInputOrCommit();
        };
        return action;
    }

    private createSingleSymbolUiAction() {
        const action = new LitIvemIdUiAction();
        action.commitOnAnyValidInput = true;
        action.pushCaption(Strings[StringId.ScanTargetsCaption_SingleSymbol]);
        action.pushTitle(Strings[StringId.ScanTargetsDescription_SingleSymbol]);
        action.inputEvent = () => { this.notifyControlInputOrCommit() };
        action.commitEvent = () => {
            const editor = this._scanEditor;
            if (editor !== undefined) {
                editor.beginFieldChanges(this.instanceId);
                const litItemId = this._singleSymbolUiAction.definedValue;
                editor.setTargetLitIvemIds([litItemId]);
                editor.endFieldChanges();
                this.notifyControlInputOrCommit();
            }
        };
        return action;
    }

    private createSingleMarketUiAction() {
        const action = new AllowedMarketsEnumUiAction(this._symbolsService);
        action.commitOnAnyValidInput = true;
        action.pushCaption(Strings[StringId.ScanTargetsCaption_SingleMarket]);
        action.pushTitle(Strings[StringId.ScanTargetsDescription_SingleMarket]);
        action.inputEvent = () => { this.notifyControlInputOrCommit() };
        action.commitEvent = () => {
            const editor = this._scanEditor;
            if (editor !== undefined) {
                editor.beginFieldChanges(this.instanceId);
                const id = this._singleMarketUiAction.definedValue as MarketId;
                editor.setTargetMarketIds([id]);
                editor.endFieldChanges();
                this.notifyControlInputOrCommit();
            }
        };
        return action;
    }

    private createMultiMarketUiAction() {
        const action = new AllowedMarketsExplicitElementsArrayUiAction(this._symbolsService);
        action.commitOnAnyValidInput = true;
        action.pushCaption(Strings[StringId.ScanTargetsCaption_MultiMarket]);
        action.pushTitle(Strings[StringId.ScanTargetsDescription_MultiMarket]);
        action.inputEvent = () => { this.notifyControlInputOrCommit() };
        action.commitEvent = () => {
            const editor = this._scanEditor;
            if (editor !== undefined) {
                editor.beginFieldChanges(this.instanceId);
                const ids = this._multiMarketUiAction.definedValue as readonly MarketId[];
                editor.setTargetMarketIds(ids);
                editor.endFieldChanges();
                this.notifyControlInputOrCommit();
            }
        };
        return action;
    }

    private createMaxMatchCountUiAction() {
        const action = new IntegerUiAction(true);
        action.commitOnAnyValidInput = true;
        action.pushTitle(Strings[StringId.ScanTargetsDescription_MaxMatchCount]);
        action.pushCaption(Strings[StringId.ScanTargetsCaption_MaxMatchCount]);
        action.inputEvent = () => { this.notifyControlInputOrCommit() };
        action.commitEvent = () => {
            const editor = this._scanEditor;
            if (editor !== undefined) {
                editor.beginFieldChanges(this.instanceId);
                const maxMatchCount = this._maxMatchCountUiAction.definedValue;
                editor.setMaxMatchCount(maxMatchCount);
                editor.endFieldChanges();
                const editorMaxMatchCount = editor.maxMatchCount;
                if (editorMaxMatchCount !== maxMatchCount) {
                    delay1Tick(() => this._maxMatchCountUiAction.pushValue(editorMaxMatchCount));
                }
                this.notifyControlInputOrCommit();
            }
        };
        return action;
    }

    private processFieldChanges(fieldIds: readonly ScanEditor.FieldId[], modifier: ScanEditor.Modifier | undefined) {
        if (modifier !== this.instanceId) {
            let targetTypeIdPushRequired = false;
            for (const fieldId of fieldIds) {
                switch (fieldId) {
                    case ScanEditor.FieldId.LastTargetTypeIdWasMulti:
                        targetTypeIdPushRequired = true;
                        break;
                    case ScanEditor.FieldId.TargetTypeId:
                        targetTypeIdPushRequired = true;
                        break;
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

            if (targetTypeIdPushRequired) {
                this.pushTargetTypeId();
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
                    if (scanEditor.lastTargetTypeIdWasMulti) {
                        this._targetSubTypeUiAction.pushValue(ScanEditorTargetsNgComponent.TargetSubTypeId.MultiSymbol);
                    } else {
                        this._targetSubTypeUiAction.pushValue(ScanEditorTargetsNgComponent.TargetSubTypeId.SingleSymbol);
                    }

                    this._targetSubTypeUiAction.pushValidOrMissing();
                    break;
                }
                case ScanTargetTypeId.Markets: {
                    if (scanEditor.lastTargetTypeIdWasMulti) {
                        this._targetSubTypeUiAction.pushValue(ScanEditorTargetsNgComponent.TargetSubTypeId.MultiMarket);
                    } else {
                        this._targetSubTypeUiAction.pushValue(ScanEditorTargetsNgComponent.TargetSubTypeId.SingleMarket);
                    }

                    this._targetSubTypeUiAction.pushValidOrMissing();
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
            this._maxMatchCountUiAction.pushValidOrMissing();
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
                    this._singleMarketUiAction.pushValidOrMissing();
                    this._multiMarketUiAction.pushValue([]);
                    this._multiMarketUiAction.pushValidOrMissing();
                } else {
                    this._singleMarketUiAction.pushValue(marketIds[0]);
                    this._multiMarketUiAction.pushValue(marketIds);
                    this._singleMarketUiAction.pushValidOrMissing();
                    this._multiMarketUiAction.pushValidOrMissing();
                }
            }
        }
    }

    private pushTargetLitIvemIds() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            this._singleSymbolUiAction.pushValue(undefined);
            this._singleSymbolUiAction.pushDisabled();
            this._multiSymbolEditorComponent.clearAllControls();
            this._multiSymbolEditorComponent.enabled = false;
        } else {
            const litIvemIds = scanEditor.targetLitIvemIds;
            if (litIvemIds === undefined) {
                this._singleSymbolUiAction.pushValue(undefined);
                this._multiSymbolList.clear();
            } else {
                switch (litIvemIds.length) {
                    case 0: {
                        this._singleSymbolUiAction.pushValue(undefined);
                        this._singleSymbolUiAction.pushValidOrMissing();
                        this._multiSymbolList.clear();
                        break;
                    }
                    case 1: {
                        const litIvemId = litIvemIds[0];
                        this._singleSymbolUiAction.pushValue(litIvemId);
                        this._singleMarketUiAction.pushValidOrMissing();
                        if (this._multiSymbolList.count === 1) {
                            this._multiSymbolList.setAt(0, litIvemId);
                        } else {
                            this._multiSymbolList.clear();
                            this._multiSymbolList.add(litIvemId);
                        }
                        break;
                    }
                    default: {
                        this._singleSymbolUiAction.pushValue(litIvemIds[0]);
                        this._singleMarketUiAction.pushValidOrMissing();
                        this._multiSymbolList.clear();
                        this._multiSymbolList.addRange(litIvemIds);
                    }
                }
            }
            this._multiSymbolEditorComponent.enabled = true;
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

            scanEditor.beginFieldChanges(this.instanceId);
            scanEditor.setLastTargetTypeIdWasMulti(lastTargetTypeIdWasMulti); // make sure this is set before TargetTypeId
            scanEditor.setTargetTypeId(targetTypeId);
            scanEditor.endFieldChanges();
        }
    }

    private notifyControlInputOrCommit(): void {
        if (this.controlInputOrCommitEventer !== undefined) {
            this.controlInputOrCommitEventer();
        }
    }
}

export namespace ScanEditorTargetsNgComponent {
    export type ControlInputOrCommitEventer = (this: void) => void;
    export type EditGridColumnsEventer = (
        this: void,
        caption: string,
        allowedFieldsAndLayoutDefinition: AllowedFieldsGridLayoutDefinition
    ) => Promise<GridLayoutOrReferenceDefinition | undefined>;
    export type PopoutMultiSymbolListEditorEventer = (
        this: void,
        caption: string,
        list: UiComparableList<LitIvemId>,
        columnsEditCaption: string
    ) => void;

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
