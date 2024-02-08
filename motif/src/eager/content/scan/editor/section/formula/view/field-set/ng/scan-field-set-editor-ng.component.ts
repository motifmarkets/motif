/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Injector, OnDestroy, ViewChild } from '@angular/core';
import { AssertInternalError, EnumUiAction, ExplicitElementsEnumUiAction, Integer, ScanEditor, ScanFormula, StringId, Strings, delay1Tick } from '@motifmarkets/motif-core';
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
    @ViewChild('addFieldLabel', { static: true }) private _addFieldLabelComponent: CaptionLabelNgComponent;
    @ViewChild('addFieldControl', { static: true }) private _addFieldControlComponent: EnumInputNgComponent;
    @ViewChild('addAttributeFieldLabel', { static: true }) private _addAttributeFieldLabelComponent: CaptionLabelNgComponent;
    @ViewChild('addAttributeFieldControl', { static: true }) private _addAttributeFieldControlComponent: EnumInputNgComponent;
    @ViewChild('addAltCodeFieldLabel', { static: true }) private _addAltCodeFieldLabelComponent: CaptionLabelNgComponent;
    @ViewChild('addAltCodeFieldControl', { static: true }) private _addAltCodeFieldControlComponent: EnumInputNgComponent;

    public gridSize: AngularSplitTypes.AreaSize.Html;
    public gridMinSize: AngularSplitTypes.AreaSize.Html;
    public splitterGutterSize = 3;
    public fieldsLabel: string;

    private _frame: ScanFieldSetEditorFrame | undefined;
    private _fieldEditorFramesGridFrame: ScanFieldEditorFramesGridFrame;

    private readonly _addFieldUiAction: ExplicitElementsEnumUiAction;
    private readonly _addAttributeFieldUiAction: ExplicitElementsEnumUiAction;
    private readonly _addAltCodeFieldUiAction: ExplicitElementsEnumUiAction;

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

    public get nonConditionalReason() { return 'Too Complicated'; }
    public get notCompatibleReason() { return ''; }

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
            this._frame = undefined;
            this._fieldEditorFrameComponent.setFrame(undefined, false);
            this._fieldEditorFramesGridComponent.setList(undefined);
        } else {
            const criteriaAsFieldSet = value.criteriaAsFieldSet;
            if (criteriaAsFieldSet === undefined) {
                throw new AssertInternalError('SFSENC99551');
            } else {
                const frame = criteriaAsFieldSet as ScanFieldSetEditorFrame;
                this._frame = frame;
                this._fieldEditorFramesGridComponent.setList(frame.fields);
            }
        }
    }

    private initialiseComponents() {
        this._addFieldLabelComponent.initialise(this._addFieldUiAction);
        this._addFieldControlComponent.initialise(this._addFieldUiAction);
        this._addAttributeFieldLabelComponent.initialise(this._addAttributeFieldUiAction);
        this._addAttributeFieldControlComponent.initialise(this._addAttributeFieldUiAction);
        this._addAltCodeFieldLabelComponent.initialise(this._addAltCodeFieldUiAction);
        this._addAltCodeFieldControlComponent.initialise(this._addAltCodeFieldUiAction);
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
                    element: definition.typeId,
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
                frame.addField(action.definedValue);
                delay1Tick(() => action.pushValue(undefined));
            }
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
