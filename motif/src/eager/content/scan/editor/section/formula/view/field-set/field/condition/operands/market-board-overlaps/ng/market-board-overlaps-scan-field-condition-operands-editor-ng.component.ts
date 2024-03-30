/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { BooleanUiAction, EnumMappedExplicitElementsArrayUiAction, IntegerExplicitElementsEnumUiAction, MarketBoard, StringId, Strings } from '@motifmarkets/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, CaptionedCheckboxNgComponent, EnumArrayInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { MarketBoardOverlapsScanFieldConditionOperandsEditorFrame } from '../market-board-overlaps-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-market-board-overlaps-scan-field-condition-operands-editor',
    templateUrl: './market-board-overlaps-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./market-board-overlaps-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketBoardOverlapsScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective {
    @ViewChild('notControl', { static: true }) private _notControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('marketBoardLabel', { static: true }) private _marketBoardLabelComponent: CaptionLabelNgComponent;
    @ViewChild('marketBoardControl', { static: true }) private _marketBoardControlComponent: EnumArrayInputNgComponent;

    declare readonly _frame: MarketBoardOverlapsScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notUiAction: BooleanUiAction;
    private readonly _valuesUiAction: EnumMappedExplicitElementsArrayUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: MarketBoardOverlapsScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++MarketBoardOverlapsScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, settingsNgService, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this._valuesUiAction = this.createValuesUiAction();
        this.pushAll();
    }

    protected override initialise() {
        super.initialise();
        this._notControlComponent.initialise(this._notUiAction);
        this._marketBoardLabelComponent.initialise(this._valuesUiAction);
        this._marketBoardControlComponent.initialise(this._valuesUiAction);
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
        const action = new EnumMappedExplicitElementsArrayUiAction();
        action.pushCaption(Strings[StringId.MarketBoardOverlapsScanFieldConditionOperandsCaption_Values]);
        action.pushTitle(Strings[StringId.MarketBoardOverlapsScanFieldConditionOperandsTitle_Values]);
        const ids = MarketBoard.allIds;
        const elementPropertiesArray = ids.map<IntegerExplicitElementsEnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: MarketBoard.idToDisplay(id),
                    title: '',
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
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

export namespace MarketBoardOverlapsScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = MarketBoardOverlapsScanFieldConditionOperandsEditorFrame;
}
