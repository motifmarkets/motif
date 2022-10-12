/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    BooleanUiAction,
    EditableScan,
    EnumInfoOutOfOrderError,
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    Integer,
    StringId,
    Strings
} from '@motifmarkets/motif-core';
import { CaptionedCheckboxNgComponent, CaptionedRadioNgComponent } from 'controls-ng-api';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../../../../../expandable-collapsible-lined-heading/ng-api';
import { ScanPropertiesSectionNgDirective } from '../../scan-properties-section-ng.directive';

@Component({
    selector: 'app-criteria-scan-properties-section',
    templateUrl: './criteria-scan-properties-section-ng.component.html',
    styleUrls: ['./criteria-scan-properties-section-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriteriaScanPropertiesSectionNgComponent extends ScanPropertiesSectionNgDirective
    implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('sectionHeading', { static: true }) override _sectionHeadingComponent: ExpandableCollapsibleLinedHeadingNgComponent;
    @ViewChild('defaultViewControl', { static: true }) private _defaultViewControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('listViewControl', { static: true }) private _listViewControlComponent: CaptionedRadioNgComponent;
    @ViewChild('formulaViewControl', { static: true }) private _formulaViewControlComponent: CaptionedRadioNgComponent;
    @ViewChild('zenithViewControl', { static: true }) private _zenithViewControlComponent: CaptionedRadioNgComponent;

    public sectionHeadingText = Strings[StringId.Criteria];
    public readonly viewRadioName: string;

    private _scan: EditableScan | undefined;

    private readonly _defaultViewUiAction: BooleanUiAction;
    private readonly _viewUiAction: ExplicitElementsEnumUiAction;

    constructor(private readonly _cdr: ChangeDetectorRef) {
        super();

        this.viewRadioName = this.generateInstancedRadioName('view');

        this._defaultViewUiAction = this.createDefaultViewUiAction();
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

    setScan(value: EditableScan) {
        this._scan = value;
        this.pushValues();
    }

    protected finalise() {
        this._defaultViewUiAction.finalise();
        this._viewUiAction.finalise();
    }

    private initialiseComponents() {
        super.initialiseSectionHeadingComponent();

        this._defaultViewControlComponent.initialise(this._defaultViewUiAction);
        this._listViewControlComponent.initialiseEnum(this._viewUiAction, CriteriaScanPropertiesSectionNgComponent.ViewId.List);
        this._formulaViewControlComponent.initialiseEnum(this._viewUiAction, CriteriaScanPropertiesSectionNgComponent.ViewId.Formula);
        this._zenithViewControlComponent.initialiseEnum(this._viewUiAction, CriteriaScanPropertiesSectionNgComponent.ViewId.Zenith);
    }

    private createDefaultViewUiAction() {
        const action = new BooleanUiAction(false);
        action.pushCaption(Strings[StringId.ScanCriteriaCaption_DefaultView]);
        action.pushTitle(Strings[StringId.ScanCriteriaDescription_DefaultView]);
        action.commitEvent = () => {

        };
        return action;
    }

    private createViewUiAction() {
        const action = new ExplicitElementsEnumUiAction();
        action.pushCaption(Strings[StringId.ScanCriteriaCaption_View]);
        action.pushTitle(Strings[StringId.ScanCriteriaDescription_View]);
        const ids = CriteriaScanPropertiesSectionNgComponent.View.getAllIds();
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: CriteriaScanPropertiesSectionNgComponent.View.idToDisplay(id),
                    title: CriteriaScanPropertiesSectionNgComponent.View.idToDescription(id),
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
        if (this._scan === undefined) {
            this._defaultViewUiAction.pushValue(true);
            this._viewUiAction.pushValue(CriteriaScanPropertiesSectionNgComponent.ViewId.List);
        } else {
            this._defaultViewUiAction.pushValue(true);
            if (this._scan.criteriaTypeId === EditableScan.CriteriaTypeId.Custom) {
                this._viewUiAction.pushValue(CriteriaScanPropertiesSectionNgComponent.ViewId.Formula);
            } else {
                this._viewUiAction.pushValue(CriteriaScanPropertiesSectionNgComponent.ViewId.List);
            }
        }
    }
}

export namespace CriteriaScanPropertiesSectionNgComponent {
    export const enum ViewId {
        // Default,
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
            // Default: {
            //     id: CriteriaViewId.Default,
            //     name: 'Default',
            //     displayId: StringId.ScanCriteriaViewDisplay_Default,
            //     descriptionId: StringId.ScanCriteriaViewDescription_Default,
            // },
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
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
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
        CriteriaScanPropertiesSectionNgComponent.View.initialise();
    }
}
