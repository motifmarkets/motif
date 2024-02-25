/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { BooleanUiAction, StringId, Strings } from '@motifmarkets/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionedCheckboxNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { HasValueScanFieldConditionOperandsEditorFrame } from '../has-value-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-has-value-scan-field-condition-operands-editor',
    templateUrl: './has-value-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./has-value-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HasValueScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective {
    @ViewChild('notControl', { static: true }) private _notControlComponent: CaptionedCheckboxNgComponent;

    declare readonly _frame: HasValueScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notUiAction: BooleanUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: HasValueScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++HasValueScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this.pushAll();
    }

    protected override initialise() {
        super.initialise();
        this._notControlComponent.initialise(this._notUiAction);
    }

    protected override finalise() {
        this._notUiAction.finalise();
        super.finalise();
    }

    protected override pushAll() {
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotHasValue]);
        action.commitEvent = () => {
            if (this._frame.negateOperator(this._modifier)) {
                this.markForCheck();
            }
        };

        return action;
    }
}

export namespace HasValueScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = HasValueScanFieldConditionOperandsEditorFrame;
}
