/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    EnumInfoOutOfOrderError,
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    Integer,
    ScanEditor,
    StringId,
    Strings,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../../../../../expandable-collapsible-lined-heading/ng-api';
import { ScanEditorSectionNgDirective } from '../../scan-editor-section-ng.directive';
import { ConditionSetScanFormulaViewNgComponent, CriteriaZenithScanFormulaViewNgComponent, RankZenithScanFormulaViewNgComponent } from '../view/ng-api';

@Component({
    selector: 'app-formula-scan-editor-section',
    templateUrl: './formula-scan-editor-section-ng.component.html',
    styleUrls: ['./formula-scan-editor-section-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormulaScanEditorSectionNgComponent extends ScanEditorSectionNgDirective
    implements OnInit, OnDestroy, AfterViewInit {

    private static typeInstanceCreateCount = 0;

    @ViewChild('sectionHeading', { static: true }) override _sectionHeadingComponent: ExpandableCollapsibleLinedHeadingNgComponent;
    @ViewChild('zenithCriteriaView') private _zenithCriteriaViewComponent: CriteriaZenithScanFormulaViewNgComponent | undefined;
    @ViewChild('conditionSetCriteriaView') private _conditionSetCriteriaViewComponent: ConditionSetScanFormulaViewNgComponent | undefined;
    @ViewChild('rankView') private _rankViewComponent: RankZenithScanFormulaViewNgComponent | undefined;

    public sectionHeadingText: string;
    public genericSelectorCaption: string;
    public genericSelectorWidth: string;

    private readonly _viewUiAction: ExplicitElementsEnumUiAction;

    private _formulaField: FormulaScanEditorSectionNgComponent.FormulaField;
    private _viewId: FormulaScanEditorSectionNgComponent.ViewId;

    constructor(elRef: ElementRef<HTMLElement>, private readonly _cdr: ChangeDetectorRef) {
        super(elRef, ++FormulaScanEditorSectionNgComponent.typeInstanceCreateCount);

        this._viewUiAction = this.createViewUiAction();
    }

    @Input({required: true }) set formulaField(value: FormulaScanEditorSectionNgComponent.FormulaField) {
        this._formulaField = value;
        switch (value) {
            case 'Criteria':
                this.sectionHeadingText = Strings[StringId.Criteria];
                this.genericSelectorWidth = '10em';
                this.genericSelectorCaption = Strings[StringId.View] + ':';
                break;
            case 'Rank':
                this.sectionHeadingText = Strings[StringId.Rank];
                break;
            default:
                throw new UnreachableCaseError('ZSFVNC66674', value);
        }
        this._cdr.markForCheck();
    }
    public get formulaField() { return this._formulaField; }
    public isZenithView() { return this._viewId === FormulaScanEditorSectionNgComponent.ViewId.Zenith; }
    public isConditionSetView() { return this._viewId === FormulaScanEditorSectionNgComponent.ViewId.ConditionSet; }

    ngOnInit() {
        this.pushValues();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.setViewId(FormulaScanEditorSectionNgComponent.ViewId.ConditionSet); // get this from settings
        this.initialiseComponents();
    }

    override setEditor(value: ScanEditor | undefined) {
        super.setEditor(value);
        if (this._zenithCriteriaViewComponent !== undefined) {
            this._zenithCriteriaViewComponent.setEditor(value);
        }
        if (this._conditionSetCriteriaViewComponent !== undefined) {
            this._conditionSetCriteriaViewComponent.setEditor(value);
        }
        if (this._rankViewComponent !== undefined) {
            this._rankViewComponent.setEditor(value);
        }
        this.pushValues();
    }

    areAllControlValuesOk() {
        return (
            true // todo
        );
    }

    cancelAllControlsEdited() {
    }

    protected finalise() {
        this._viewUiAction.finalise();
    }

    protected override processExpandCollapseRestoreStateChanged() {

    }

    protected override processFieldChanges(fieldIds: ScanEditor.FieldId[], fieldChanger: ScanEditor.Modifier) {
        const scanEditor = this._scanEditor;
        if (scanEditor !== undefined && fieldChanger !== this) {
        // let criteriaChanged = false;
        // let criteriaChanged = false;
        // for (const fieldId of changedFieldIds) {
        //     switch (fieldId) {
        //         case Scan.FieldId.Criteria:
        //             criteriaChanged = true;
        //             break;
        //         case Scan.FieldId.CriteriaAsZenithText:
        //             criteriaChanged = true;
        //             break;
        //     }
        // }
        }
    }

    protected override processLifeCycleStateChange(): void {

    }

    protected override processModifiedStateChange(): void {

    }

    private initialiseComponents() {
        super.initialiseSectionHeadingComponent();

        if (this._formulaField === 'Criteria') {
            this._sectionHeadingComponent.genericSelectorComponent.initialise(this._viewUiAction);
        }
    }

    private createViewUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ScanCriteriaCaption_View]);
        action.pushTitle(Strings[StringId.ScanCriteriaDescription_View]);
        const ids = FormulaScanEditorSectionNgComponent.View.getAllIds();
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: FormulaScanEditorSectionNgComponent.View.idToDisplay(id),
                    title: FormulaScanEditorSectionNgComponent.View.idToDescription(id),
                })
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => { this.setViewId(action.definedValue); }
        return action;
    }

    private pushValues() {
        if (this._scanEditor === undefined) {
            this._viewUiAction.pushValue(FormulaScanEditorSectionNgComponent.ViewId.ConditionSet);
        // } else {
        //     if (this._scan.targetTypeId === Scan.TargetTypeId.Custom) {
        //         this._viewUiAction.pushValue(CriteriaScanPropertiesSectionNgComponent.ViewId.Default);
        //     } else {
        //         this._viewUiAction.pushValue(CriteriaScanPropertiesSectionNgComponent.ViewId.Default);
        //     }
        }
    }

    private setViewId(value: FormulaScanEditorSectionNgComponent.ViewId) {
        if (value !== this._viewId) {
            this._viewId = value;
            this._cdr.markForCheck();
        }
    }
}

export namespace FormulaScanEditorSectionNgComponent {
    export const enum FormulaFieldEnum {
        Criteria,
        Rank,
    }
    export type FormulaField = keyof typeof FormulaFieldEnum;

    export const enum ViewId {
        ConditionSet,
        Zenith,
    }

    export namespace View {
        export type Id = ViewId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
            readonly descriptionId: StringId;
        }

        type InfosObject = { [id in keyof typeof ViewId]: Info };

        const infosObject: InfosObject = {
            ConditionSet: {
                id: ViewId.ConditionSet,
                name: 'List',
                displayId: StringId.ScanCriteriaViewDisplay_ConditionSet,
                descriptionId: StringId.ScanCriteriaViewDescription_ConditionSet,
            },
            Zenith: {
                id: ViewId.Zenith,
                name: 'Zenith',
                displayId: StringId.ScanCriteriaViewDisplay_Zenith,
                descriptionId: StringId.ScanCriteriaViewDescription_Zenith,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as ViewId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError(
                    'FormulaScanEditorSectionNgComponent.ViewId', outOfOrderIdx, infos[outOfOrderIdx].name
                );
            }
        }

        export function getAllIds() {
            return infos.map(info => info.id);
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }

        export function idToDescriptionId(id: Id): StringId {
            return infos[id].descriptionId;
        }

        export function idToDescription(id: Id): string {
            return Strings[idToDescriptionId(id)];
        }
    }
}

export namespace FormulaScanPropertiesSectionNgComponentModule {
    export function initialiseStatic() {
        FormulaScanEditorSectionNgComponent.View.initialise();
    }
}
