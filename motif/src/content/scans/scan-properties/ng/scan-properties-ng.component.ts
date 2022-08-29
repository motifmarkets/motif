import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    BooleanUiAction,
    EnumUiAction,
    ExplicitElementsEnumArrayUiAction,
    ExplicitElementsEnumUiAction,
    IntegerUiAction,
    Scan,
    StringId,
    Strings,
    StringUiAction
} from '@motifmarkets/motif-core';
import {
    CaptionedCheckboxNgComponent,
    CaptionLabelNgComponent,
    EnumArrayInputNgComponent,
    EnumInputNgComponent,
    IntegerTextInputNgComponent,
    TextInputNgComponent
} from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from 'src/content/ng/content-component-base-ng.directive';

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
    @ViewChild('viewLabel', { static: true }) private _viewLabelComponent: CaptionLabelNgComponent;
    @ViewChild('viewControl', { static: true }) private _viewControlComponent: EnumInputNgComponent;

    @ViewChild('mobileNotifierControl', { static: true }) private _mobileNotifierControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('smsNotifierControl', { static: true }) private _smsNotifierControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('emailNotifierControl', { static: true }) private _emailNotifierControlComponent: CaptionedCheckboxNgComponent;
    @ViewChild('motifNotifierControl', { static: true }) private _motifNotifierControlComponent: CaptionedCheckboxNgComponent;
    // @ViewChild('allNotifiersLabel', { static: true }) private _allNotifiersLabelComponent: CaptionLabelNgComponent;
    @ViewChild('allNotifiersControl', { static: true }) private _allNotifiersControlComponent: EnumArrayInputNgComponent;

    @ViewChild('minimumStableTimeLabel', { static: true }) private _minimumStableTimeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('minimumStableTimeControl', { static: true }) private _minimumStableTimeControlComponent: IntegerTextInputNgComponent;
    @ViewChild('minimumElapsedTimeLabel', { static: true }) private _minimumElapsedTimeLabelComponent: CaptionLabelNgComponent;
    @ViewChild('minimumElapsedTimeControl', { static: true }) private _minimumElapsedTimeControlComponent: IntegerTextInputNgComponent;

    private _scan: Scan | undefined;

    private readonly _nameUiAction: StringUiAction;
    private readonly _descriptionUiAction: StringUiAction;
    private readonly _typeUiAction: ExplicitElementsEnumUiAction;
    private readonly _viewUiAction: ExplicitElementsEnumUiAction;
    private readonly _mobileNotifierUiAction: BooleanUiAction;
    private readonly _smsNotifierUiAction: BooleanUiAction;
    private readonly _emailNotifierUiAction: BooleanUiAction;
    private readonly _motifNotifierUiAction: BooleanUiAction;
    private readonly _allNotifiersUiAction: ExplicitElementsEnumArrayUiAction;
    private readonly _minimumStableTimeUiAction: IntegerUiAction;
    private readonly _minimumElapsedTimeUiAction: IntegerUiAction;

    constructor() {
        super();

        this._nameUiAction = this.createNameUiAction();
        this._descriptionUiAction = this.createDescriptionUiAction();
        this._typeUiAction = this.createTypeUiAction();
        this._viewUiAction = this.createViewUiAction();
        this._mobileNotifierUiAction = this.createMobileNotifierUiAction();
        this._smsNotifierUiAction = this.createSmsNotifierUiAction();
        this._emailNotifierUiAction = this.createEmailNotifierUiAction();
        this._motifNotifierUiAction = this.createMotifNotifierUiAction();
        this._allNotifiersUiAction = this.createAllNotifiersUiAction();
        this._minimumStableTimeUiAction = this.createMinimumStableTimeUiAction();
        this._minimumElapsedTimeUiAction = this.createMinimumElapsedTimeUiAction();
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
        this._viewUiAction.finalise();
        this._mobileNotifierUiAction.finalise();
        this._smsNotifierUiAction.finalise();
        this._emailNotifierUiAction.finalise();
        this._motifNotifierUiAction.finalise();
        this._allNotifiersUiAction.finalise();
        this._minimumStableTimeUiAction.finalise();
        this._minimumElapsedTimeUiAction.finalise();
    }

    private initialiseComponents() {
        this._nameLabelComponent.initialise(this._nameUiAction);
        this._nameControlComponent.initialise(this._nameUiAction);
        this._descriptionLabelComponent.initialise(this._descriptionUiAction);
        this._descriptionControlComponent.initialise(this._descriptionUiAction);
        this._typeLabelComponent.initialise(this._typeUiAction);
        this._typeControlComponent.initialise(this._typeUiAction);
        this._viewLabelComponent.initialise(this._viewUiAction);
        this._viewControlComponent.initialise(this._viewUiAction);
        this._mobileNotifierControlComponent.initialise(this._mobileNotifierUiAction);
        this._smsNotifierControlComponent.initialise(this._smsNotifierUiAction);
        this._emailNotifierControlComponent.initialise(this._emailNotifierUiAction);
        this._motifNotifierControlComponent.initialise(this._motifNotifierUiAction);
        // this._allNotifiersLabelComponent.initialise(this._allNotifiersUiAction);
        this._allNotifiersControlComponent.initialise(this._allNotifiersUiAction);
        this._minimumStableTimeLabelComponent.initialise(this._minimumStableTimeUiAction);
        this._minimumStableTimeControlComponent.initialise(this._minimumStableTimeUiAction);
        this._minimumElapsedTimeLabelComponent.initialise(this._minimumElapsedTimeUiAction);
        this._minimumElapsedTimeControlComponent.initialise(this._minimumElapsedTimeUiAction);
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

    private createViewUiAction() {
        const action = new ExplicitElementsEnumUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_View]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_View]);
        const ids = Scan.CriteriaViewType.getAllIds();
        const elementPropertiesArray = ids.map<EnumUiAction.ElementProperties>(
            (id) => (
                {
                    element: id,
                    caption: Scan.CriteriaViewType.idToDisplay(id),
                    title: Scan.CriteriaViewType.idToDescription(id),
                }
            )
        );
        action.pushElements(elementPropertiesArray, undefined);
        action.commitEvent = () => {
            // this._scan.criteriaTypeId = this._typeUiAction.definedValue;
        };
        return action;
    }

    private createMobileNotifierUiAction() {
        const action = new BooleanUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_MobileNotifier]);
        action.pushTitle(Strings[StringId.ScanPropertiesDescription_MobileNotifier]);
        action.commitEvent = () => {

        };
        return action;
    }

    private createSmsNotifierUiAction() {
        const action = new BooleanUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_SmsNotifier]);
        action.pushTitle(Strings[StringId.ScanPropertiesDescription_SmsNotifier]);
        action.commitEvent = () => {

        };
        return action;
    }

    private createEmailNotifierUiAction() {
        const action = new BooleanUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_EmailNotifier]);
        action.pushTitle(Strings[StringId.ScanPropertiesDescription_EmailNotifier]);
        action.commitEvent = () => {

        };
        return action;
    }

    private createMotifNotifierUiAction() {
        const action = new BooleanUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_MotifNotifier]);
        action.pushTitle(Strings[StringId.ScanPropertiesDescription_MotifNotifier]);
        action.commitEvent = () => {

        };
        return action;
    }

    private createAllNotifiersUiAction() {
        const action = new ExplicitElementsEnumArrayUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_AllNotifiers]);
        action.pushTitle(Strings[StringId.ScanPropertiesDescription_AllNotifiers]);

        // const ids = SymbolField.allIds;
        // const entryCount = ids.length;
        // const elementPropertiesArray = new Array<ArrayUiAction.ElementProperties<SymbolFieldId>>(entryCount);
        // for (let i = 0; i < entryCount; i++) {
        //     const id = ids[i];
        //     elementPropertiesArray[i] = {
        //         element: id,
        //         caption: SymbolField.idToDisplay(id),
        //         title: SymbolField.idToDescription(id),
        //     };
        // }

        // action.pushElements(elementPropertiesArray, undefined);
        // action.commitEvent = () => {
        //     this.coreSettings.symbol_ExplicitSearchFieldIds = this._explicitSymbolSearchFieldsUiAction.definedValue as SymbolFieldId[];
        // };
        return action;
    }

    private createMinimumStableTimeUiAction() {
        const action = new IntegerUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_MinimumStableTime]);
        action.pushTitle(Strings[StringId.ScanPropertiesDescription_MinimumStableTime]);
        action.commitEvent = () => {
            // this.coreSettings.format_MinimumPriceFractionDigitsCount = this._minimumPriceFractionDigitsCountUiAction.definedValue;
        };
        return action;
    }

    private createMinimumElapsedTimeUiAction() {
        const action = new IntegerUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_MinimumElapsedTime]);
        action.pushTitle(Strings[StringId.ScanPropertiesDescription_MinimumElapsedTime]);
        action.commitEvent = () => {
            // this.coreSettings.format_MinimumPriceFractionDigitsCount = this._minimumPriceFractionDigitsCountUiAction.definedValue;
        };
        return action;
    }

    private pushValues() {
        if (this._scan === undefined) {
            this._nameUiAction.pushValue(undefined);
            this._descriptionUiAction.pushValue(undefined);
            this._typeUiAction.pushValue(undefined);
            this._viewUiAction.pushValue(undefined);
            this._mobileNotifierUiAction.pushValue(undefined);
            this._smsNotifierUiAction.pushValue(undefined);
            this._emailNotifierUiAction.pushValue(undefined);
            this._motifNotifierUiAction.pushValue(undefined);
        } else {
            this._nameUiAction.pushValue(this._scan.name);
            this._descriptionUiAction.pushValue(this._scan.description);
            this._typeUiAction.pushValue(this._scan.criteriaTypeId);
            this._viewUiAction.pushValue(Scan.CriteriaViewTypeId.Default);
            this._mobileNotifierUiAction.pushValue(true);
            this._smsNotifierUiAction.pushValue(true);
            this._emailNotifierUiAction.pushValue(false);
            this._motifNotifierUiAction.pushValue(true);
        }
    }
}
