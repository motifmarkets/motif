/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { AssertInternalError, BooleanUiAction, StringId, StringUiAction, Strings } from '@motifmarkets/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionedCheckboxNgComponent, CheckboxInputNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { TextContainsScanFieldConditionOperandsEditorFrame } from '../text-contains-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-text-value-scan-field-condition-operands-editor',
    templateUrl: './text-contains-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./text-contains-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextContainsScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective {
    @ViewChild('notControl', { static: true }) private _notControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('valueControl', { static: true }) private _valueControlComponent: TextInputNgComponent;
    // @ViewChild('fromStartLabel', { static: true }) private _fromStartLabelComponent: CaptionLabelNgComponent;
    @ViewChild('fromStartControl', { static: true }) private _fromStartControlComponent: CheckboxInputNgComponent;
    // @ViewChild('fromEndLabel', { static: true }) private _fromEndLabelComponent: CaptionLabelNgComponent;
    @ViewChild('fromEndControl', { static: true }) private _fromEndControlComponent: CheckboxInputNgComponent;
    @ViewChild('exactControl', { static: true }) private _exactControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('ignoreCaseControl', { static: true }) private _ignoreCaseControlComponent: CaptionedCheckboxNgComponent;

    declare readonly _frame: TextContainsScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notUiAction: BooleanUiAction;
    private readonly _valueUiAction: StringUiAction;
    private readonly _fromStartUiAction: BooleanUiAction;
    private readonly _fromEndUiAction: BooleanUiAction;
    private readonly _exactUiAction: BooleanUiAction;
    private readonly _ignoreCaseUiAction: BooleanUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: TextContainsScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++TextContainsScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this._valueUiAction = this.createValueUiAction();
        this._fromStartUiAction = this.createFromStartUiAction();
        this._fromEndUiAction = this.createFromEndUiAction();
        this._exactUiAction = this.createExactUiAction();
        this._ignoreCaseUiAction = this.createIgnoreCaseUiAction();

        this.pushAll();
    }

    protected override initialise() {
        super.initialise();
        this._notControlComponent.initialise(this._notUiAction);
        this._valueControlComponent.initialise(this._valueUiAction);
        // this._fromStartLabelComponent.initialise(this._fromStartUiAction);
        this._fromStartControlComponent.initialise(this._fromStartUiAction);
        // this._fromEndLabelComponent.initialise(this._fromEndUiAction);
        this._fromEndControlComponent.initialise(this._fromEndUiAction);
        this._exactControlComponent.initialise(this._exactUiAction);
        this._ignoreCaseControlComponent.initialise(this._ignoreCaseUiAction);
    }

    protected override finalise() {
        this._notUiAction.finalise();
        this._valueUiAction.finalise();
        this._fromStartUiAction.finalise();
        this._fromEndUiAction.finalise();
        this._exactUiAction.finalise();
        this._ignoreCaseUiAction.finalise();
        super.finalise();
    }


    protected override pushAll() {
        this._notUiAction.pushValue(this._frame.not);
        this._valueUiAction.pushValue(this._frame.value);
        this._fromStartUiAction.pushValue(this._frame.fromStart);
        this._fromEndUiAction.pushValue(this._frame.fromEnd);
        this._exactUiAction.pushValue(this._frame.exact);
        this._ignoreCaseUiAction.pushValue(this._frame.ignoreCase);
        super.pushAll();
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotContainsValue]);
        action.commitEvent = () => {
            if (this._frame.negateOperator(this._modifier)) {
                this.markForCheck();
            }
        };

        return action;
    }

    private createValueUiAction() {
        const action = new StringUiAction(false);
        action.commitOnAnyValidInput = true;
        action.pushCaption(Strings[StringId.ValueScanFieldConditionOperandsCaption_Value]);
        action.pushTitle(Strings[StringId.TextContainsScanFieldConditionOperandsTitle_Value]);
        action.commitEvent = () => {
            const value = this._valueUiAction.value;
            if (value === undefined) {
                throw new AssertInternalError('TCSFCOOENCCVUA55598');
            } else {
                if (this._frame.setValue(value, this._modifier)) {
                    this.markForCheck();
                }
            }
        }

        return action;
    }

    private createFromStartUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.FromStart]);
        action.pushTitle(Strings[StringId.TextContainsScanFieldConditionOperandsTitle_FromStart]);
        action.commitEvent = () => {
            const value = this._fromStartUiAction.value;
            if (value === undefined) {
                throw new AssertInternalError('TCSFCOOENCCFSUA55598');
            } else {
                if (this._frame.setFromStart(value, this._modifier)) {
                    this.markForCheck();
                }
                this._fromEndUiAction.pushValue(this._frame.fromEnd);
                this._exactUiAction.pushValue(this._frame.exact);
            }
        };

        return action;
    }

    private createFromEndUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.FromEnd]);
        action.pushTitle(Strings[StringId.TextContainsScanFieldConditionOperandsTitle_FromEnd]);
        action.commitEvent = () => {
            const value = this._fromEndUiAction.value;
            if (value === undefined) {
                throw new AssertInternalError('TCSFCOOENCCFEUA55598');
            } else {
                if (this._frame.setFromEnd(value, this._modifier)) {
                    this.markForCheck();
                }
                this._fromStartUiAction.pushValue(this._frame.fromStart);
                this._exactUiAction.pushValue(this._frame.exact);
            }
        };

        return action;
    }

    private createExactUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Exact]);
        action.pushTitle(Strings[StringId.TextContainsScanFieldConditionOperandsTitle_Exact]);
        action.commitEvent = () => {
            const value = this._exactUiAction.value;
            if (value === undefined) {
                throw new AssertInternalError('TCSFCOOENCCEUA55598');
            } else {
                if (this._frame.setExact(value, this._modifier)) {
                    this.markForCheck();
                }
                this._fromStartUiAction.pushValue(this._frame.fromStart);
                this._fromEndUiAction.pushValue(this._frame.fromEnd);
            }
        };

        return action;
    }

    private createIgnoreCaseUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.IgnoreCase]);
        action.pushTitle(Strings[StringId.TextContainsScanFieldConditionOperandsTitle_IgnoreCase]);
        action.commitEvent = () => {
            const value = this._ignoreCaseUiAction.value;
            if (value === undefined) {
                throw new AssertInternalError('TCSFCOOENCCICUA55598');
            } else {
                if (this._frame.setIgnoreCase(value, this._modifier)) {
                    this.markForCheck();
                }
            }
        };

        return action;
    }
}

export namespace TextContainsScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = TextContainsScanFieldConditionOperandsEditorFrame;
}
