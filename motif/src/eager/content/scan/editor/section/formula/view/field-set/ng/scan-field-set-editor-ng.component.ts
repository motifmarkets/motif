/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Injector, OnDestroy, ViewChild } from '@angular/core';
import { AssertInternalError, EnumUiAction, ExplicitElementsEnumUiAction, Integer, MultiEvent, ScanEditor, ScanFormula, StringId, Strings, delay1Tick } from '@motifmarkets/motif-core';
import { AngularSplitTypes } from 'controls-internal-api';
import { CaptionLabelNgComponent, EnumInputNgComponent } from 'controls-ng-api';
import { ScanFormulaViewNgDirective } from '../../scan-formula-view-ng.directive';
import { ScanFieldEditorFrame } from '../field/internal-api';
import { ScanFieldEditorNgComponent } from '../field/ng-api';
import { ScanFieldEditorFramesGridNgComponent } from '../fields-grid/ng-api';
import { ScanFieldEditorFramesGridFrame } from '../internal-api';
import { ScanFieldSetEditorFrame } from '../scan-field-set-editor-frame';

@Component({
    selector: 'app-scan-field-set-editor',
    templateUrl: './scan-field-set-editor-ng.component.html',
    styleUrls: ['./scan-field-set-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanFieldSetEditorNgComponent extends ScanFormulaViewNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('fieldEditorFrameComponent', { static: true }) private _fieldEditorFrameComponent: ScanFieldEditorNgComponent;
    @ViewChild('fieldsGrid', { static: true }) private _fieldEditorFramesGridComponent: ScanFieldEditorFramesGridNgComponent;
    // @ViewChild('addFieldLabel', { static: true }) private _addFieldLabelComponent: CaptionLabelNgComponent;
    @ViewChild('addFieldControl', { static: true }) private _addFieldControlComponent: EnumInputNgComponent;
    @ViewChild('addAttributeFieldLabel', { static: true }) private _addAttributeFieldLabelComponent: CaptionLabelNgComponent;
    @ViewChild('addAttributeFieldControl', { static: true }) private _addAttributeFieldControlComponent: EnumInputNgComponent;
    @ViewChild('addAltCodeFieldLabel', { static: true }) private _addAltCodeFieldLabelComponent: CaptionLabelNgComponent;
    @ViewChild('addAltCodeFieldControl', { static: true }) private _addAltCodeFieldControlComponent: EnumInputNgComponent;

    public gridSize: AngularSplitTypes.AreaSize.Html;
    public gridMinSize: AngularSplitTypes.AreaSize.Html;
    public splitterGutterSize = 3;
    public fieldsLabel: string;
    public criteriaCompatible: boolean;
    public criteriaNotCompatibleReason: string;

    private readonly _addFieldUiAction: ExplicitElementsEnumUiAction;
    private readonly _addAttributeFieldUiAction: ExplicitElementsEnumUiAction;
    private readonly _addAltCodeFieldUiAction: ExplicitElementsEnumUiAction;

    private _frame: ScanFieldSetEditorFrame | undefined;
    private _frameChangedEventSubscriptionId: MultiEvent.SubscriptionId;
    private _frameBeforeFieldsDeleteSubscriptionId: MultiEvent.SubscriptionId;
    private _fieldEditorFramesGridFrame: ScanFieldEditorFramesGridFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _injector: Injector,
    ) {
        super(elRef, ++ScanFieldSetEditorNgComponent.typeInstanceCreateCount);

        this._addFieldUiAction = this.createAddFieldUiAction();
        this._addAttributeFieldUiAction = this.createAddAttributeFieldUiAction();
        this._addAltCodeFieldUiAction = this.createAddAltCodeFieldUiAction();
    }

    ngOnDestroy(): void {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this.initialiseComponents();
    }

    public handleSplitterDragEnd() {

    }

    public isCriteriaCompatible() {
        return true;
    }

    override setEditor(value: ScanEditor | undefined) {
        this._scanEditor = value;
        if (value === undefined) {
            this._fieldEditorFrameComponent.setFrame(undefined, false);
            this._fieldEditorFramesGridComponent.setList(undefined);
            if (this._frame !== undefined) {
                this._frame.unsubscribeChangedEvent(this._frameChangedEventSubscriptionId);
                this._frameChangedEventSubscriptionId = undefined;
                this._frame.unsubscribeBeforeFieldsDeleteEvent(this._frameBeforeFieldsDeleteSubscriptionId);
                this._frameBeforeFieldsDeleteSubscriptionId = undefined;
            }
            this._frame = undefined;
        } else {
            const criteriaAsFieldSet = value.criteriaAsFieldSet;
            if (criteriaAsFieldSet === undefined) {
                throw new AssertInternalError('SFSENC99551');
            } else {
                const frame = criteriaAsFieldSet as ScanFieldSetEditorFrame;
                this._frame = frame;
                this._frameChangedEventSubscriptionId = this._frame.subscribeChangedEvent(
                    (framePropertiesChanged, fieldCountChanged, modifierRoot) => this.processFrameChanged(
                        framePropertiesChanged, fieldCountChanged, modifierRoot
                    )
                );
                this._frameBeforeFieldsDeleteSubscriptionId = this._frame.subscribeBeforeFieldsDeleteEvent(
                    (idx, count) => this.processBeforeFieldsDelete(idx, count)
                );
                this._fieldEditorFramesGridComponent.setList(frame.fields);
            }
        }
    }

    // override processScanEditorFieldChanges(fieldIds: ScanEditor.FieldId[], fieldChanger: ComponentBaseNgDirective.InstanceId) {
    //     if (fieldChanger !== this.instanceId) {
    //         if (fieldIds.includes(ScanEditor.FieldId.CriteriaAsFieldSet)) {
    //             const frame = this._frame;
    //             if (frame === undefined) {
    //                 throw new AssertInternalError('SFSENCPSEFC87743');
    //             } else {
    //                 // I do not think there is anything required to do here as subscriptions to Frame changes should handle this
    //             }
    //         }
    //     }
    // }

    private initialiseComponents() {
        this._fieldEditorFrameComponent.setRootComponentInstanceId(this.instanceId);
        // this._addFieldLabelComponent.initialise(this._addFieldUiAction);
        this._addFieldControlComponent.initialise(this._addFieldUiAction);
        this._addFieldControlComponent.openEventer = () => this.pushAddFieldFilter();
        this._addAttributeFieldLabelComponent.initialise(this._addAttributeFieldUiAction);
        this._addAttributeFieldControlComponent.initialise(this._addAttributeFieldUiAction);
        this._addAttributeFieldControlComponent.openEventer = () => this.pushAddAttributeFieldFilter();
        this._addAltCodeFieldLabelComponent.initialise(this._addAltCodeFieldUiAction);
        this._addAltCodeFieldControlComponent.initialise(this._addAltCodeFieldUiAction);
        this._addAltCodeFieldControlComponent.openEventer = () => this.pushAddAltCodeFieldFilter();
        this._fieldEditorFramesGridFrame = this._fieldEditorFramesGridComponent.frame;
        this._fieldEditorFramesGridFrame.recordFocusedEventer = (index) => this.processFieldEditorFrameFocusChange(index);
    }

    private finalise() {
        this._fieldEditorFrameComponent.setFrame(undefined, true);
        this._addFieldUiAction.finalise();
        this._addAttributeFieldUiAction.finalise();
        this._addAltCodeFieldUiAction.finalise();
    }

    private createAddFieldUiAction() {
        const action = new ExplicitElementsEnumUiAction(false);
        action.pushCaption(Strings[StringId.AddField]);
        action.pushPlaceholder(Strings[StringId.AddField]);
        action.pushTitle(Strings[StringId.ScanFieldSetEditor_AddAField]);
        const fieldDefinitions = ScanFieldEditorFrame.allDefinitions;

        this.pushElementsAndAddCommitHandlerToAddFieldUiAction(action, fieldDefinitions);

        return action;
    }

    private createAddAttributeFieldUiAction() {
        const action = new ExplicitElementsEnumUiAction(false);
        action.pushCaption(Strings[StringId.AddAttributeField]);
        action.pushTitle(Strings[StringId.ScanFieldSetEditor_AddAnAttributeBasedField]);
        const fieldDefinitions = ScanFieldEditorFrame.allDefinitions.filter(
            (definition) => definition.scanFormulaFieldId === ScanFormula.FieldId.AttributeSubbed
        );

        this.pushElementsAndAddCommitHandlerToAddFieldUiAction(action, fieldDefinitions);

        return action;
    }

    private createAddAltCodeFieldUiAction() {
        const action = new ExplicitElementsEnumUiAction(false);
        action.pushCaption(Strings[StringId.AddAltCodeField]);
        action.pushTitle(Strings[StringId.ScanFieldSetEditor_AddAnAltCodeBasedField]);
        const fieldDefinitions = ScanFieldEditorFrame.allDefinitions.filter(
            (definition) => definition.scanFormulaFieldId === ScanFormula.FieldId.AltCodeSubbed
        );

        this.pushElementsAndAddCommitHandlerToAddFieldUiAction(action, fieldDefinitions);

        return action;
    }

    private pushElementsAndAddCommitHandlerToAddFieldUiAction(
        action: ExplicitElementsEnumUiAction,
        fieldDefinitions: readonly ScanFieldEditorFrame.Definition[],
    ) {
        const elementPropertiesArray = fieldDefinitions.map<EnumUiAction.ElementProperties>(
            (definition) => ({
                    element: definition.id,
                    caption: definition.name,
                    title: '',
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            const frame = this._frame;
            if (frame === undefined) {
                throw new AssertInternalError('SFSENCPEAACHTAFUA44487');
            } else {
                const idx = frame.addField(action.definedValue);
                this._fieldEditorFramesGridFrame.focusItem(idx);
                delay1Tick(() => action.pushValue(undefined));
            }
        }
    }

    private pushAddFieldFilter() {
        const frame = this._frame;
        if (frame === undefined) {
            throw new AssertInternalError('SFSENCPAFF77743');
        } else {
            const alreadyAddedFields = frame.fields;
            const allDefinitions = ScanFieldEditorFrame.allDefinitions;
            const allDefinitionsCount = allDefinitions.length;

            const filterDefinitionIds = new Array<number>(allDefinitionsCount);
            let filterDefinitionIdCount = 0;
            for (let i = 0; i < allDefinitionsCount; i++) {
                const definition = allDefinitions[i];
                const name = definition.name;
                if (!alreadyAddedFields.has((fieldEditorFrame) => fieldEditorFrame.name === name)) {
                    filterDefinitionIds[filterDefinitionIdCount++] = definition.id;
                }
            }

            if (filterDefinitionIdCount === allDefinitionsCount) {
                this._addFieldUiAction.pushFilter(undefined);
            } else {
                filterDefinitionIds.length = filterDefinitionIdCount;
                this._addFieldUiAction.pushFilter(filterDefinitionIds);
            }
        }
    }

    private pushAddAttributeFieldFilter() {
        const frame = this._frame;
        if (frame === undefined) {
            throw new AssertInternalError('SFSENCPAAFF77743');
        } else {
            const alreadyAddedFields = frame.fields;
            const allDefinitions = ScanFieldEditorFrame.allDefinitions;
            const allDefinitionsCount = allDefinitions.length;

            const filterDefinitionIds = new Array<number>(allDefinitionsCount);
            let hasAtLeastOne = false;
            let filterDefinitionIdCount = 0;
            for (let i = 0; i < allDefinitionsCount; i++) {
                const definition = allDefinitions[i];
                if (definition.scanFormulaFieldId === ScanFormula.FieldId.AttributeSubbed) {
                    const name = definition.name;
                    if (alreadyAddedFields.has((fieldEditorFrame) => fieldEditorFrame.name === name)) {
                        hasAtLeastOne = true;
                    } else {
                        filterDefinitionIds[filterDefinitionIdCount++] = definition.id;
                    }
                }
            }

            if (hasAtLeastOne) {
                filterDefinitionIds.length = filterDefinitionIdCount;
                this._addFieldUiAction.pushFilter(filterDefinitionIds);
            } else {
                this._addFieldUiAction.pushFilter(undefined);
            }
        }
    }

    private pushAddAltCodeFieldFilter() {
        const frame = this._frame;
        if (frame === undefined) {
            throw new AssertInternalError('SFSENCPAACFF77743');
        } else {
            const alreadyAddedFields = frame.fields;
            const allDefinitions = ScanFieldEditorFrame.allDefinitions;
            const allDefinitionsCount = allDefinitions.length;

            const filterDefinitionIds = new Array<number>(allDefinitionsCount);
            let hasAtLeastOne = false;
            let filterDefinitionIdCount = 0;
            for (let i = 0; i < allDefinitionsCount; i++) {
                const definition = allDefinitions[i];
                if (definition.scanFormulaFieldId === ScanFormula.FieldId.AltCodeSubbed) {
                    const name = definition.name;
                    if (alreadyAddedFields.has((fieldEditorFrame) => fieldEditorFrame.name === name)) {
                        hasAtLeastOne = true;
                    } else {
                        filterDefinitionIds[filterDefinitionIdCount++] = definition.id;
                    }
                }
            }

            if (hasAtLeastOne) {
                filterDefinitionIds.length = filterDefinitionIdCount;
                this._addFieldUiAction.pushFilter(filterDefinitionIds);
            } else {
                this._addFieldUiAction.pushFilter(undefined);
            }
        }
    }

    private pushFrameProperties() {
        const frame = this._frame;
        if (frame === undefined) {
            throw new AssertInternalError('SFSENCPFP77743');
        } else {
            let changed = false;
            const loadError = frame.loadError;

            let criteriaCompatible: boolean;
            if (loadError === undefined) {
                criteriaCompatible = true;
            } else {
                criteriaCompatible = false;
                let criteriaNotCompatibleReason = loadError.typeId.toString();
                const extra = loadError.extra;
                if (extra !== undefined) {
                    criteriaNotCompatibleReason += `: ${extra}`;
                }
                if (criteriaNotCompatibleReason !== this.criteriaNotCompatibleReason) {
                    this.criteriaNotCompatibleReason = criteriaNotCompatibleReason;
                    changed = true;
                }
            }

            if (criteriaCompatible !== this.criteriaCompatible) {
                this.criteriaCompatible = criteriaCompatible;
                changed = true;
            }

            if (changed) {
                this._cdr.markForCheck();
            }
        }
    }

    private processBeforeFieldsDelete(idx: Integer, count: Integer) {
        const activeFieldEditorFrame = this._fieldEditorFrameComponent.frame;
        if (activeFieldEditorFrame !== undefined) {
            const frame = this._frame;
            if (frame === undefined) {
                throw new AssertInternalError('SFSENCPBFD56081');
            } else {
                const fieldEditorFrames = frame.fields;

                for (let i = idx + count - 1; i >= idx; i--) {
                    const fieldEditorFrame = fieldEditorFrames.getAt(i);
                    if (fieldEditorFrame === activeFieldEditorFrame) {
                        this._fieldEditorFrameComponent.setFrame(undefined, false);
                        break;
                    }
                }
            }
        }
    }

    private processFrameChanged(framePropertiesChanged: boolean, fieldCountChanged: boolean, modifierRoot: ScanEditor.Modifier | undefined) {
        if (modifierRoot === this.instanceId) {
            if (this._scanEditor === undefined) {
                throw new AssertInternalError('SFSENCPFC77743');
            } else {
                this._scanEditor.flagCriteriaAsFieldSetChanged(modifierRoot);
            }
        }

        if (fieldCountChanged) {
            this.pushAddFieldFilter();
        }

        if (framePropertiesChanged) {
            this.pushFrameProperties();
        }
    }

    private processFieldEditorFrameFocusChange(index: Integer | undefined) {
        if (index === undefined) {
            this._fieldEditorFrameComponent.setFrame(undefined, false);
        } else {
            const scanFieldEditorFrame = this._fieldEditorFramesGridFrame.getScanFieldEditorFrameAt(index);
            this._fieldEditorFrameComponent.setFrame(scanFieldEditorFrame, false);
        }
    }
}

export namespace ScanFieldSetEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = ScanFieldSetEditorFrame;
}
