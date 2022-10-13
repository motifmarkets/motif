import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    BooleanUiAction,
    EditableScan, StringId,
    Strings,
    StringUiAction
} from '@motifmarkets/motif-core';
import {
    CaptionLabelNgComponent, CheckboxInputNgComponent, TextInputNgComponent
} from 'controls-ng-api';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../../../../../expandable-collapsible-lined-heading/ng-api';
import { ScanPropertiesSectionNgDirective } from '../../scan-properties-section-ng.directive';
import { TargetsScanPropertiesNgComponent } from '../targets-scan-properties/ng-api';

@Component({
    selector: 'app-general-scan-properties-section',
    templateUrl: './general-scan-properties-section-ng.component.html',
    styleUrls: ['./general-scan-properties-section-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralScanPropertiesSectionNgComponent extends ScanPropertiesSectionNgDirective implements  OnInit, OnDestroy, AfterViewInit {
    @ViewChild('sectionHeading', { static: true }) override _sectionHeadingComponent: ExpandableCollapsibleLinedHeadingNgComponent;
    @ViewChild('enabledLabel', { static: true }) private _enabledLabelComponent: CaptionLabelNgComponent;
    @ViewChild('enabledControl', { static: true }) private _enabledControlComponent: CheckboxInputNgComponent;
    @ViewChild('nameLabel', { static: true }) private _nameLabelComponent: CaptionLabelNgComponent;
    @ViewChild('nameControl', { static: true }) private _nameControlComponent: TextInputNgComponent;
    @ViewChild('descriptionLabel', { static: true }) private _descriptionLabelComponent: CaptionLabelNgComponent;
    @ViewChild('descriptionControl', { static: true }) private _descriptionControlComponent: TextInputNgComponent;
    // @ViewChild('typeLabel', { static: true }) private _typeLabelComponent: CaptionLabelNgComponent;
    // @ViewChild('typeControl', { static: true }) private _typeControlComponent: EnumInputNgComponent;
    @ViewChild('targetsScanProperties', { static: true }) private _targetsScanPropertiesComponent: TargetsScanPropertiesNgComponent;
    @ViewChild('symbolListLabel', { static: true }) private _symbolListLabelComponent: CaptionLabelNgComponent;
    @ViewChild('symbolListControl', { static: true }) private _symbolListControlComponent: CheckboxInputNgComponent;

    public sectionHeadingText = Strings[StringId.General];
    public targetsRowHeading = Strings[StringId.Targets];

    private readonly _enabledUiAction: BooleanUiAction;
    private readonly _nameUiAction: StringUiAction;
    private readonly _descriptionUiAction: StringUiAction;
    // private readonly _typeUiAction: ExplicitElementsEnumUiAction;
    private readonly _symbolListUiAction: BooleanUiAction;

    constructor() {
        super();

        this._enabledUiAction = this.createEnabledUiAction();
        this._nameUiAction = this.createNameUiAction();
        this._descriptionUiAction = this.createDescriptionUiAction();
        // this._typeUiAction = this.createTypeUiAction();
        this._symbolListUiAction = this.createSymbolListUiAction();
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

    override setScan(value: EditableScan | undefined) {
        super.setScan(value);
        this.pushValues();
        this._targetsScanPropertiesComponent.setScan(value);
    }

    protected finalise() {
        this._enabledUiAction.finalise();
        this._nameUiAction.finalise();
        this._descriptionUiAction.finalise();
        // this._typeUiAction.finalise();
        this._symbolListUiAction.finalise();
    }

    private initialiseComponents() {
        super.initialiseSectionHeadingComponent();

        this._enabledLabelComponent.initialise(this._enabledUiAction);
        this._enabledControlComponent.initialise(this._enabledUiAction);
        this._nameLabelComponent.initialise(this._nameUiAction);
        this._nameControlComponent.initialise(this._nameUiAction);
        this._descriptionLabelComponent.initialise(this._descriptionUiAction);
        this._descriptionControlComponent.initialise(this._descriptionUiAction);
        // this._typeLabelComponent.initialise(this._typeUiAction);
        // this._typeControlComponent.initialise(this._typeUiAction);
        this._symbolListLabelComponent.initialise(this._symbolListUiAction);
        this._symbolListControlComponent.initialise(this._symbolListUiAction);
    }

    private createEnabledUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_Enabled]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_Enabled]);
        action.commitEvent = () => {
            if (this._scan !== undefined) {
                this._scan.enabled = this._enabledUiAction.definedValue;
            }
        };
        return action;
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

    // private createTypeUiAction() {
    //     const action = new ExplicitElementsEnumUiAction(false);
    //     action.pushCaption(Strings[StringId.ScanPropertiesCaption_Type]);
    //     action.pushTitle(Strings[StringId.ScanPropertiesTitle_Type]);
    //     const ids = EditableScan.CriteriaType.getAllIds();
    //     const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
    //         (id) => (
    //             {
    //                 element: id,
    //                 caption: EditableScan.CriteriaType.idToDisplay(id),
    //                 title: EditableScan.CriteriaType.idToDisplay(id),
    //             }
    //         )
    //     );
    //     action.pushElements(elementPropertiesArray, undefined);
    //     action.commitEvent = () => {
    //         if (this._scan !== undefined) {
    //             this._scan.criteriaTypeId = this._typeUiAction.definedValue;
    //         }
    //     };
    //     return action;
    // }

    private createSymbolListUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_SymbolList]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_SymbolList]);
        action.commitEvent = () => {
            if (this._scan !== undefined) {
                this._scan.symbolListEnabled = this._symbolListUiAction.definedValue;
            }
        };
        return action;
    }

    private pushValues() {
        if (this._scan === undefined) {
            this._enabledUiAction.pushValue(undefined);
            this._nameUiAction.pushValue(undefined);
            this._descriptionUiAction.pushValue(undefined);
            // this._typeUiAction.pushValue(undefined);
            this._symbolListUiAction.pushValue(undefined);
        } else {
            this._enabledUiAction.pushValue(this._scan.enabled);
            this._nameUiAction.pushValue(this._scan.name);
            this._descriptionUiAction.pushValue(this._scan.description);
            // this._typeUiAction.pushValue(this._scan.criteriaTypeId);
            this._symbolListUiAction.pushValue(this._scan.symbolListEnabled);
        }
    }
}
