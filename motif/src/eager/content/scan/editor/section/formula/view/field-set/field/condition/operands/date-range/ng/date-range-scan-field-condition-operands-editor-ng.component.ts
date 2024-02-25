/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { BooleanUiAction, DateUiAction, SourceTzOffsetDate, StringId, Strings } from '@motifmarkets/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, CaptionedCheckboxNgComponent, DateInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { DateRangeScanFieldConditionOperandsEditorFrame } from '../date-range-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-date-range-scan-field-condition-operands-editor',
    templateUrl: './date-range-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./date-range-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective {
    @ViewChild('notControl', { static: true }) private _notControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('minLabel', { static: true }) private _minLabelComponent: CaptionLabelNgComponent;
    @ViewChild('minControl', { static: true }) private _minControlComponent: DateInputNgComponent;
    @ViewChild('maxLabel', { static: true }) private _maxLabelComponent: CaptionLabelNgComponent;
    @ViewChild('maxControl', { static: true }) private _maxControlComponent: DateInputNgComponent;

    declare readonly _frame: DateRangeScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notUiAction: BooleanUiAction;
    private readonly _minUiAction: DateUiAction;
    private readonly _maxUiAction: DateUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: DateRangeScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++DateRangeScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

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
        const min = this._frame.min;
        if (min === undefined) {
            this._minUiAction.pushValue(undefined);
        } else {
            const date = SourceTzOffsetDate.getUtcTimezonedDate(min);
            this._minUiAction.pushValue(date);
        }
        const max = this._frame.max;
        if (max === undefined) {
            this._maxUiAction.pushValue(undefined);
        } else {
            const date = SourceTzOffsetDate.getUtcTimezonedDate(max);
            this._maxUiAction.pushValue(date);
        }
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createMinUiAction() {
        const action = new DateUiAction(false);
        action.pushCaption(Strings[StringId.RangeScanFieldConditionOperandsCaption_Min]);
        action.pushTitle(Strings[StringId.DateRangeValueScanFieldConditionOperandsTitle_Min]);
        action.commitEvent = () => {
            const min = this._minUiAction.value;
            const sourceTzOffsetDate = min === undefined ? undefined : SourceTzOffsetDate.createFromLocalDate(min);
            if (this._frame.setMin(sourceTzOffsetDate, this._modifier)) {
                this.markForCheck();
            }
        }

        return action;
    }

    private createMaxUiAction() {
        const action = new DateUiAction(false);
        action.pushCaption(Strings[StringId.RangeScanFieldConditionOperandsCaption_Max]);
        action.pushTitle(Strings[StringId.DateRangeValueScanFieldConditionOperandsTitle_Max]);
        action.commitEvent = () => {
            const max = this._maxUiAction.value;
            const sourceTzOffsetDate = max === undefined ? undefined : SourceTzOffsetDate.createFromLocalDate(max);
            if (this._frame.setMax(sourceTzOffsetDate, this._modifier)) {
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

export namespace DateRangeScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = DateRangeScanFieldConditionOperandsEditorFrame;
}
