/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { BooleanUiAction, StringArrayUiAction, StringId, Strings } from '@motifmarkets/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, CaptionedCheckboxNgComponent, StringArrayInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { StringOverlapsScanFieldConditionOperandsEditorFrame } from '../string-overlaps-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-string-overlaps-scan-field-condition-operands-editor',
    templateUrl: './string-overlaps-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./string-overlaps-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringOverlapsScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective {
    @ViewChild('notControl', { static: true }) private _notControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('valuesLabel', { static: true }) private _valuesLabelComponent: CaptionLabelNgComponent;
    @ViewChild('valuesControl', { static: true }) private _valuesControlComponent: StringArrayInputNgComponent;

    declare readonly _frame: StringOverlapsScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notUiAction: BooleanUiAction;
    private readonly _valuesUiAction: StringArrayUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: StringOverlapsScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++StringOverlapsScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this._valuesUiAction = this.createValuesUiAction();
        this.pushAll();
    }

    protected override initialise() {
        super.initialise();
        this._notControlComponent.initialise(this._notUiAction);
        this._valuesLabelComponent.initialise(this._valuesUiAction);
        this._valuesControlComponent.initialise(this._valuesUiAction);
    }

    protected override finalise() {
        this._valuesUiAction.finalise();
        this._notUiAction.finalise();
        super.finalise();
    }


    protected override pushAll() {
        this._valuesUiAction.pushValue(this._frame.values);
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createValuesUiAction() {
        const action = new StringArrayUiAction();
        action.pushCaption(Strings[StringId.StringOverlapsScanFieldConditionOperandsCaption_Values]);
        action.pushTitle(Strings[StringId.StringOverlapsScanFieldConditionOperandsTitle_Values]);
        action.commitEvent = () => {
            if (this._frame.setValues(this._valuesUiAction.definedValue, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotOverlaps]);
        action.commitEvent = () => {
            if (this._frame.negateOperator(this._modifier)) {
                this.markForCheck();
            }
        };

        return action;
    }
}

export namespace StringOverlapsScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = StringOverlapsScanFieldConditionOperandsEditorFrame;
}
