/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { BooleanUiAction, NumberUiAction, StringId, Strings } from '@motifmarkets/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, CaptionedCheckboxNgComponent, NumberInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { NumericRangeScanFieldConditionOperandsEditorFrame } from '../numeric-range-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-numeric-range-scan-field-condition-operands-editor',
    templateUrl: './numeric-range-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./numeric-range-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericRangeScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective {
    @ViewChild('notControl', { static: true }) private _notControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('minLabel', { static: true }) private _minLabelComponent: CaptionLabelNgComponent;
    @ViewChild('minControl', { static: true }) private _minControlComponent: NumberInputNgComponent;
    @ViewChild('maxLabel', { static: true }) private _maxLabelComponent: CaptionLabelNgComponent;
    @ViewChild('maxControl', { static: true }) private _maxControlComponent: NumberInputNgComponent;

    declare readonly _frame: NumericRangeScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notUiAction: BooleanUiAction;
    private readonly _minUiAction: NumberUiAction;
    private readonly _maxUiAction: NumberUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: NumericRangeScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++NumericRangeScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this._minUiAction = this.createMinUiAction();
        this._maxUiAction = this.createMaxUiAction();
        this.pushAll();
    }

    protected override initialise() {
        super.initialise();
        this._notControlComponent.initialise(this._notUiAction);
        this._minLabelComponent.initialise(this._minUiAction);
        this._minControlComponent.initialise(this._minUiAction);
        this._maxLabelComponent.initialise(this._maxUiAction);
        this._maxControlComponent.initialise(this._maxUiAction);
    }

    protected override finalise() {
        this._minUiAction.finalise();
        this._maxUiAction.finalise();
        this._notUiAction.finalise();
        super.finalise();
    }


    protected override pushAll() {
        this._minUiAction.pushValue(this._frame.min);
        this._maxUiAction.pushValue(this._frame.max);
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createMinUiAction() {
        const action = new NumberUiAction(false);
        action.pushCaption(Strings[StringId.RangeScanFieldConditionOperandsCaption_Min]);
        action.pushTitle(Strings[StringId.NumericRangeValueScanFieldConditionOperandsTitle_Min]);
        action.commitEvent = () => {
            if (this._frame.setMin(this._minUiAction.value, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private createMaxUiAction() {
        const action = new NumberUiAction(false);
        action.pushCaption(Strings[StringId.RangeScanFieldConditionOperandsCaption_Max]);
        action.pushTitle(Strings[StringId.NumericRangeValueScanFieldConditionOperandsTitle_Max]);
        action.commitEvent = () => {
            if (this._frame.setMax(this._maxUiAction.value, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotIsCategory]);
        action.commitEvent = () => {
            if (this._frame.negateOperator(this._modifier)) {
                this.markForCheck();
            }
        };

        return action;
    }
}

export namespace NumericRangeScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = NumericRangeScanFieldConditionOperandsEditorFrame;
}
