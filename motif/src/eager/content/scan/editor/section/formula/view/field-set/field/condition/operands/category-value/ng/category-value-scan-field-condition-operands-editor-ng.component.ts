/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { BooleanUiAction, EnumUiAction, ExplicitElementsEnumUiAction, ScanFormula, StringId, Strings } from '@motifmarkets/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { CaptionLabelNgComponent, CaptionedCheckboxNgComponent, EnumInputNgComponent } from 'controls-ng-api';
import { ScanFieldConditionOperandsEditorNgDirective } from '../../ng/ng-api';
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

    declare readonly _frame: CategoryValueScanFieldConditionOperandsEditorNgComponent.Frame;

    private readonly _notUiAction: BooleanUiAction;
    private readonly _categoryUiAction: ExplicitElementsEnumUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.frameInjectionToken) frame: CategoryValueScanFieldConditionOperandsEditorNgComponent.Frame,
        @Inject(ScanFieldConditionOperandsEditorNgDirective.modifierRootInjectionToken) modifierRoot: ComponentInstanceId,
    ) {
        super(elRef, ++CategoryValueScanFieldConditionOperandsEditorNgComponent.typeInstanceCreateCount, cdr, frame, modifierRoot);

        this._notUiAction = this.createNotUiAction();
        this._categoryUiAction = this.createCategoryUiAction();
        this.pushAll();
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


    protected override pushAll() {
        this._categoryUiAction.pushValue(this._frame.categoryId);
        this._notUiAction.pushValue(this._frame.not);
        super.pushAll();
    }

    private createCategoryUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.CategoryValueScanFieldConditionOperandsCaption_Category]);
        action.pushTitle(Strings[StringId.CategoryValueScanFieldConditionOperandsTitle_Category]);
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
            this._frame.setCategoryId(this._categoryUiAction.definedValue, this._modifier);
        }

        return action;
    }

    private createNotUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.Not]);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditor_NotIsCategory]);
        action.commitEvent = () => {
            this._frame.negateOperator(this._modifier);
        };

        return action;
    }
}

export namespace CategoryValueScanFieldConditionOperandsEditorNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type Frame = CategoryValueScanFieldConditionOperandsEditorFrame;
}
