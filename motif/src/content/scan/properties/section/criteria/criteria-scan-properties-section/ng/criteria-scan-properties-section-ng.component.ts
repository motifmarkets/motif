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
import { ScanPropertiesSectionNgDirective } from '../../../scan-properties-section-ng.directive';

@Component({
    selector: 'app-criteria-scan-properties-section',
    templateUrl: './criteria-scan-properties-section-ng.component.html',
    styleUrls: ['./criteria-scan-properties-section-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanCriteriaNgComponent extends ScanPropertiesSectionNgDirective implements  OnInit, OnDestroy, AfterViewInit {
    @ViewChild('defaultViewControl', { static: true }) private _defaultViewControlComponent: CaptionedCheckboxNgComponent;

    @ViewChild('filterViewTypeControl', { static: true }) private _filterViewTypeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('formulaViewTypeControl', { static: true }) private _formulaViewTypeControlComponent: CaptionedRadioNgComponent;
    @ViewChild('zenithViewTypeControl', { static: true }) private _zenithViewTypeControlComponent: CaptionedRadioNgComponent;

    public criteriaHeading = Strings[StringId.Criteria];
    public readonly viewTypeRadioName: string;

    private _scan: EditableScan | undefined;

    private readonly _defaultViewUiAction: BooleanUiAction;
    private readonly _viewTypeUiAction: ExplicitElementsEnumUiAction;

    constructor(private readonly _cdr: ChangeDetectorRef) {
        super();

        this.viewTypeRadioName = this.generateInstancedRadioName('viewType');

        this._defaultViewUiAction = this.createDefaultViewUiAction();
        this._viewTypeUiAction = this.createViewUiAction();
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
        this._viewTypeUiAction.finalise();
    }

    private initialiseComponents() {
        this._defaultViewControlComponent.initialise(this._defaultViewUiAction);

        this._filterViewTypeControlComponent.initialiseEnum(this._viewTypeUiAction, ScanCriteriaNgComponent.ViewTypeId.Filter);
        this._formulaViewTypeControlComponent.initialiseEnum(this._viewTypeUiAction, ScanCriteriaNgComponent.ViewTypeId.Formula);
        this._zenithViewTypeControlComponent.initialiseEnum(this._viewTypeUiAction, ScanCriteriaNgComponent.ViewTypeId.Zenith);
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
        action.pushCaption(Strings[StringId.ScanCriteriaCaption_ViewType]);
        action.pushTitle(Strings[StringId.ScanCriteriaDescription_ViewType]);
        const ids = ScanCriteriaNgComponent.ViewType.getAllIds();
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => ({
                    element: id,
                    caption: ScanCriteriaNgComponent.ViewType.idToDisplay(id),
                    title: ScanCriteriaNgComponent.ViewType.idToDescription(id),
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
            this._viewTypeUiAction.pushValue(ScanCriteriaNgComponent.ViewTypeId.Filter);
        } else {
            this._defaultViewUiAction.pushValue(true);
            if (this._scan.criteriaTypeId === EditableScan.CriteriaTypeId.Custom) {
                this._viewTypeUiAction.pushValue(ScanCriteriaNgComponent.ViewTypeId.Formula);
            } else {
                this._viewTypeUiAction.pushValue(ScanCriteriaNgComponent.ViewTypeId.Filter);
            }
        }
    }
}

export namespace ScanCriteriaNgComponent {
    export const enum ViewTypeId {
        // Default,
        Filter,
        Formula,
        Zenith,
    }

    export namespace ViewType {
        export type Id = ViewTypeId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
            readonly descriptionId: StringId;
        }

        type InfosObject = { [id in keyof typeof ViewTypeId]: Info };

        const infosObject: InfosObject = {
            // Default: {
            //     id: CriteriaViewTypeId.Default,
            //     name: 'Default',
            //     displayId: StringId.ScanCriteriaViewTypeDisplay_Default,
            //     descriptionId: StringId.ScanCriteriaViewTypeDescription_Default,
            // },
            Filter: {
                id: ViewTypeId.Filter,
                name: 'Filter',
                displayId: StringId.ScanCriteriaViewTypeDisplay_Filter,
                descriptionId: StringId.ScanCriteriaViewTypeDescription_Filter,
            },
            Formula: {
                id: ViewTypeId.Formula,
                name: 'Formula',
                displayId: StringId.ScanCriteriaViewTypeDisplay_Formula,
                descriptionId: StringId.ScanCriteriaViewTypeDescription_Formula,
            },
            Zenith: {
                id: ViewTypeId.Zenith,
                name: 'Zenith',
                displayId: StringId.ScanCriteriaViewTypeDisplay_Zenith,
                descriptionId: StringId.ScanCriteriaViewTypeDescription_Zenith,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ScanCriteriaNgComponent.ViewTypeId', outOfOrderIdx, infos[outOfOrderIdx].name);
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

export namespace ScanCriteriaNgComponentModule {
    export function initialiseStatic() {
        ScanCriteriaNgComponent.ViewType.initialise();
    }
}
