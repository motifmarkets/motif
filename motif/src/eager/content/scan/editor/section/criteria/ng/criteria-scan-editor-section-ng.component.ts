/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    EnumInfoOutOfOrderError,
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    Integer,
    ScanEditor,
    StringId,
    Strings
} from '@motifmarkets/motif-core';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../../../../../expandable-collapsible-lined-heading/ng-api';
import { ScanEditorSectionNgDirective } from '../../scan-editor-section-ng.directive';

@Component({
    selector: 'app-criteria-scan-editor-section',
    templateUrl: './criteria-scan-editor-section-ng.component.html',
    styleUrls: ['./criteria-scan-editor-section-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriteriaScanEditorSectionNgComponent extends ScanEditorSectionNgDirective
    implements OnInit, OnDestroy, AfterViewInit {

    private static typeInstanceCreateCount = 0;

    @ViewChild('sectionHeading', { static: true }) override _sectionHeadingComponent: ExpandableCollapsibleLinedHeadingNgComponent;

    public readonly sectionHeadingText = Strings[StringId.Criteria];
    public readonly genericSelectorCaption = Strings[StringId.View] + ':';

    private readonly _viewUiAction: ExplicitElementsEnumUiAction;

    constructor(elRef: ElementRef<HTMLElement>, private readonly _cdr: ChangeDetectorRef) {
        super(elRef, ++CriteriaScanEditorSectionNgComponent.typeInstanceCreateCount);

        this._viewUiAction = this.createViewUiAction();
    }

    ngOnInit() {
        this.pushValues();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();
    }

    override setEditor(value: ScanEditor | undefined) {
        super.setEditor(value);
        this.pushValues();
    }

    protected finalise() {
        this._viewUiAction.finalise();
    }

    protected override processFieldChanges(fieldIds: ScanEditor.FieldId[]) {
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

    private initialiseComponents() {
        super.initialiseSectionHeadingComponent();

        this._sectionHeadingComponent.genericSelectorComponent.initialise(this._viewUiAction);
    }

    private createViewUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ScanCriteriaCaption_View]);
        action.pushTitle(Strings[StringId.ScanCriteriaDescription_View]);
        const ids = CriteriaScanEditorSectionNgComponent.View.getAllIds();
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: CriteriaScanEditorSectionNgComponent.View.idToDisplay(id),
                    title: CriteriaScanEditorSectionNgComponent.View.idToDescription(id),
                })
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            // this._targetSubTypeId = this._targetSubTypeUiAction.definedValue;
            this._cdr.markForCheck();
        };
        return action;
    }

    private pushValues() {
        if (this._scanEditor === undefined) {
            this._viewUiAction.pushValue(CriteriaScanEditorSectionNgComponent.ViewId.Default);
        // } else {
        //     if (this._scan.targetTypeId === Scan.TargetTypeId.Custom) {
        //         this._viewUiAction.pushValue(CriteriaScanPropertiesSectionNgComponent.ViewId.Default);
        //     } else {
        //         this._viewUiAction.pushValue(CriteriaScanPropertiesSectionNgComponent.ViewId.Default);
        //     }
        }
    }
}

export namespace CriteriaScanEditorSectionNgComponent {
    export const enum ViewId {
        Default,
        List,
        Formula,
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
            Default: {
                id: ViewId.Default,
                name: 'Default',
                displayId: StringId.ScanCriteriaViewDisplay_Default,
                descriptionId: StringId.ScanCriteriaViewDescription_Default,
            },
            List: {
                id: ViewId.List,
                name: 'List',
                displayId: StringId.ScanCriteriaViewDisplay_List,
                descriptionId: StringId.ScanCriteriaViewDescription_List,
            },
            Formula: {
                id: ViewId.Formula,
                name: 'Formula',
                displayId: StringId.ScanCriteriaViewDisplay_Formula,
                descriptionId: StringId.ScanCriteriaViewDescription_Formula,
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
                    'CriteriaScanPropertiesSectionNgComponent.ViewId', outOfOrderIdx, infos[outOfOrderIdx].name
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

export namespace CriteriaScanPropertiesSectionNgComponentModule {
    export function initialiseStatic() {
        CriteriaScanEditorSectionNgComponent.View.initialise();
    }
}
