/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { BooleanUiAction, EnumUiAction, ExplicitElementsEnumUiAction, ScanFormula, StringId, Strings } from '@motifmarkets/motif-core';
import { CaptionLabelNgComponent, CaptionedCheckboxNgComponent, EnumInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
import { ScanFieldConditionOperandsEditorFrame } from '../../scan-field-condition-operands-editor-frame';
import { CategoryValueScanFieldConditionOperandsEditorFrame } from '../category-value-scan-field-condition-operands-editor-frame';

@Component({
    selector: 'app-category-value-scan-field-condition-operands-editor',
    templateUrl: './category-value-scan-field-condition-operands-editor-ng.component.html',
    styleUrls: ['./category-value-scan-field-condition-operands-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryValueScanFieldConditionOperandsEditorNgComponent extends ScanFieldConditionOperandsEditorNgDirective {
    @ViewChild('notControl', { static: true }) private _notControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('categoryLabel', { static: true }) private _categoryLabelComponent: CaptionLabelNgComponent;
    @ViewChild('categoryControl', { static: true }) private _categoryControlComponent: EnumInputNgComponent;

    declare readonly _frame: CategoryValueScanFieldConditionOperandsEditorFrame;

    private readonly _notUiAction: BooleanUiAction;
    private readonly _categoryUiAction: ExplicitElementsEnumUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: ScanFieldConditionOperandsEditorFrame,
    ) {
        super(elRef, ++CategoryValueScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, frame);

        this._notUiAction = this.createNotUiAction();
        this._categoryUiAction = this.createCategoryUiAction();

        this._categoryUiAction.pushValue(ScanFormula.IsNode.CategoryId.Index);
        this._notUiAction.pushValue(this._frame.not);
    }

    protected override initialise() {
        super.initialise();
        this._notControlComponent.initialise(this._notUiAction);
        this._categoryLabelComponent.initialise(this._categoryUiAction);
        this._categoryControlComponent.initialise(this._categoryUiAction);
    }

    protected override finalise() {
        this._categoryUiAction.finalise();
        this._notUiAction.finalise();
        super.finalise();
    }

    private createCategoryUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ConditionSetScanFormulaViewNgComponentCaption_SetOperation]);
        action.pushTitle(Strings[StringId.ConditionSetScanFormulaViewNgComponentTitle_SetOperation]);
        const ids = ScanFormula.IsNode.Category.allIds;
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: ScanFormula.IsNode.Category.idToCaption(id),
                    title: ScanFormula.IsNode.Category.idToTitle(id),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            this._frame.categoryId = this._categoryUiAction.definedValue;
        }

        return action;
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Exclude]);
        action.pushTitle(Strings[StringId.ConditionSetScanFormulaViewNgComponentTitle_Exclude]);
        action.commitEvent = () => {
            // todo
        };

        return action;
    }
}

export namespace CategoryValueScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
}
