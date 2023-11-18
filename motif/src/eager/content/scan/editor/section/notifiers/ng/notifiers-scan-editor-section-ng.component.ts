import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    BooleanUiAction,
    ExplicitElementsEnumArrayUiAction,
    IntegerUiAction,
    ScanEditor,
    StringId,
    Strings
} from '@motifmarkets/motif-core';
import {
    CaptionLabelNgComponent,
    CaptionedCheckboxNgComponent,
    EnumArrayInputNgComponent, IntegerTextInputNgComponent
} from 'controls-ng-api';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../../../../../expandable-collapsible-lined-heading/ng-api';
import { ScanEditorSectionNgDirective } from '../../scan-editor-section-ng.directive';

@Component({
    selector: 'app-notifiers-scan-editor-section',
    templateUrl: './notifiers-scan-editor-section-ng.component.html',
    styleUrls: ['./notifiers-scan-editor-section-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotifiersScanEditorSectionNgComponent extends ScanEditorSectionNgDirective
    implements  OnInit, OnDestroy, AfterViewInit {

    private static typeInstanceCreateCount = 0;

    @ViewChild('sectionHeading', { static: true }) override _sectionHeadingComponent: ExpandableCollapsibleLinedHeadingNgComponent;
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

    public sectionHeadingText = Strings[StringId.Notifiers];

    private readonly _mobileNotifierUiAction: BooleanUiAction;
    private readonly _smsNotifierUiAction: BooleanUiAction;
    private readonly _emailNotifierUiAction: BooleanUiAction;
    private readonly _motifNotifierUiAction: BooleanUiAction;
    private readonly _allNotifiersUiAction: ExplicitElementsEnumArrayUiAction;
    private readonly _minimumStableTimeUiAction: IntegerUiAction;
    private readonly _minimumElapsedTimeUiAction: IntegerUiAction;

    constructor(elRef: ElementRef<HTMLElement>) {
        super(elRef, ++NotifiersScanEditorSectionNgComponent.typeInstanceCreateCount);

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

    override setEditor(value: ScanEditor | undefined) {
        super.setEditor(value);
        this.pushValues();
    }

    protected finalise() {
        this._mobileNotifierUiAction.finalise();
        this._smsNotifierUiAction.finalise();
        this._emailNotifierUiAction.finalise();
        this._motifNotifierUiAction.finalise();
        this._allNotifiersUiAction.finalise();
        this._minimumStableTimeUiAction.finalise();
        this._minimumElapsedTimeUiAction.finalise();
    }

    protected override processFieldChanges(fieldIds: ScanEditor.FieldId[]) {
    }

    private initialiseComponents() {
        super.initialiseSectionHeadingComponent();

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
        if (this._scanEditor === undefined) {
            this._mobileNotifierUiAction.pushValue(undefined);
            this._smsNotifierUiAction.pushValue(undefined);
            this._emailNotifierUiAction.pushValue(undefined);
            this._motifNotifierUiAction.pushValue(undefined);
        } else {
            this._mobileNotifierUiAction.pushValue(true);
            this._smsNotifierUiAction.pushValue(true);
            this._emailNotifierUiAction.pushValue(false);
            this._motifNotifierUiAction.pushValue(true);
        }
    }
}
