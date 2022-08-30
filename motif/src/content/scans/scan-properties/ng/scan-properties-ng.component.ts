import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    Scan,
    StringId,
    Strings,
    StringUiAction
} from '@motifmarkets/motif-core';
import {
    CaptionLabelNgComponent, EnumInputNgComponent, TextInputNgComponent
} from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-scan-properties',
    templateUrl: './scan-properties-ng.component.html',
    styleUrls: ['./scan-properties-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanPropertiesNgComponent extends ContentComponentBaseNgDirective implements  OnInit, OnDestroy, AfterViewInit {
    @ViewChild('nameLabel', { static: true }) private _nameLabelComponent: CaptionLabelNgComponent;
    @ViewChild('nameControl', { static: true }) private _nameControlComponent: TextInputNgComponent;
    @ViewChild('descriptionLabel', { static: true }) private _descriptionLabelComponent: CaptionLabelNgComponent;
    @ViewChild('descriptionControl', { static: true }) private _descriptionControlComponent: TextInputNgComponent;
    @ViewChild('typeLabel', { static: true }) private _typeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('typeControl', { static: true }) private _typeControlComponent: EnumInputNgComponent;

    private _scan: Scan | undefined;

    private readonly _nameUiAction: StringUiAction;
    private readonly _descriptionUiAction: StringUiAction;
    private readonly _typeUiAction: ExplicitElementsEnumUiAction;

    constructor() {
        super();

        this._nameUiAction = this.createNameUiAction();
        this._descriptionUiAction = this.createDescriptionUiAction();
        this._typeUiAction = this.createTypeUiAction();
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

    setScan(value: Scan | undefined) {
        this._scan = value;
        this.pushValues();
    }

    protected finalise() {
        this._nameUiAction.finalise();
        this._descriptionUiAction.finalise();
        this._typeUiAction.finalise();
    }

    private initialiseComponents() {
        this._nameLabelComponent.initialise(this._nameUiAction);
        this._nameControlComponent.initialise(this._nameUiAction);
        this._descriptionLabelComponent.initialise(this._descriptionUiAction);
        this._descriptionControlComponent.initialise(this._descriptionUiAction);
        this._typeLabelComponent.initialise(this._typeUiAction);
        this._typeControlComponent.initialise(this._typeUiAction);
    }

    private createNameUiAction() {
        const action = new StringUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_Name]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_Name]);
        action.commitEvent = () => {
            if (this._scan !== undefined) {
                this._scan.name = this._nameUiAction.definedValue;
            }
        };
        return action;
    }

    private createDescriptionUiAction() {
        const action = new StringUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_Description]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_Description]);
        action.commitEvent = () => {
            if (this._scan !== undefined) {
                this._scan.description = this._nameUiAction.definedValue;
            }
        };
        return action;
    }

    private createTypeUiAction() {
        const action = new ExplicitElementsEnumUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_Type]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_Type]);
        const ids = Scan.CriteriaType.getAllIds();
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => (
                {
                    element: id,
                    caption: Scan.CriteriaType.idToDisplay(id),
                    title: Scan.CriteriaType.idToDisplay(id),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            if (this._scan !== undefined) {
                this._scan.criteriaTypeId = this._typeUiAction.definedValue;
            }
        };
        return action;
    }

    private pushValues() {
        if (this._scan === undefined) {
            this._nameUiAction.pushValue(undefined);
            this._descriptionUiAction.pushValue(undefined);
            this._typeUiAction.pushValue(undefined);
        } else {
            this._nameUiAction.pushValue(this._scan.name);
            this._descriptionUiAction.pushValue(this._scan.description);
            this._typeUiAction.pushValue(this._scan.criteriaTypeId);
        }
    }
}
