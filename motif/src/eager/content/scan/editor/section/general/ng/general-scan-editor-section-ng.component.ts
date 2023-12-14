import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
    BooleanUiAction,
    ScanEditor,
    StringId,
    StringUiAction,
    Strings
} from '@motifmarkets/motif-core';
import {
    CaptionLabelNgComponent, CheckboxInputNgComponent, TextInputNgComponent
} from 'controls-ng-api';
import { ExpandableCollapsibleLinedHeadingNgComponent } from '../../../../../expandable-collapsible-lined-heading/ng-api';
import { ScanEditorSectionNgDirective } from '../../scan-editor-section-ng.directive';
import { ScanEditorTargetsNgComponent } from '../targets/ng-api';

@Component({
    selector: 'app-general-scan-editor-section',
    templateUrl: './general-scan-editor-section-ng.component.html',
    styleUrls: ['./general-scan-editor-section-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralScanEditorSectionNgComponent extends ScanEditorSectionNgDirective implements  OnInit, OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('sectionHeading', { static: true }) override _sectionHeadingComponent: ExpandableCollapsibleLinedHeadingNgComponent;
    @ViewChild('enabledLabel', { static: true }) private _enabledLabelComponent: CaptionLabelNgComponent;
    @ViewChild('enabledControl', { static: true }) private _enabledControlComponent: CheckboxInputNgComponent;
    @ViewChild('nameLabel', { static: true }) private _nameLabelComponent: CaptionLabelNgComponent;
    @ViewChild('nameControl', { static: true }) private _nameControlComponent: TextInputNgComponent;
    @ViewChild('descriptionLabel', { static: true }) private _descriptionLabelComponent: CaptionLabelNgComponent;
    @ViewChild('descriptionControl', { static: true }) private _descriptionControlComponent: TextInputNgComponent;
    @ViewChild('targetsComponent', { static: true }) private _targetsComponent: ScanEditorTargetsNgComponent;
    @ViewChild('symbolListLabel', { static: true }) private _symbolListLabelComponent: CaptionLabelNgComponent;
    @ViewChild('symbolListControl', { static: true }) private _symbolListControlComponent: CheckboxInputNgComponent;

    public sectionHeadingText = Strings[StringId.General];
    public targetsRowHeading = Strings[StringId.Targets];
    public deleteStateText: string | undefined;
    public deletingOrDeleted = false;

    private readonly _enabledUiAction: BooleanUiAction;
    private readonly _nameUiAction: StringUiAction;
    private readonly _descriptionUiAction: StringUiAction;
    // private readonly _typeUiAction: ExplicitElementsEnumUiAction;
    private readonly _symbolListUiAction: BooleanUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
    ) {
        super(elRef, ++GeneralScanEditorSectionNgComponent.typeInstanceCreateCount);

        this._enabledUiAction = this.createEnabledUiAction();
        this._nameUiAction = this.createNameUiAction();
        this._descriptionUiAction = this.createDescriptionUiAction();
        // this._typeUiAction = this.createTypeUiAction();
        this._symbolListUiAction = this.createSymbolListUiAction();
    }

    ngOnInit() {
        this.pushValues();
        this.pushDeleteState();
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
        this.pushDeleteState();
        this._targetsComponent.setEditor(value);
    }

    isDeleted() {
        const scanEditor = this._scanEditor;
        return scanEditor !== undefined && scanEditor.lifeCycleStateId === ScanEditor.LifeCycleStateId.Deleted;
    }

    protected finalise() {
        this._enabledUiAction.finalise();
        this._nameUiAction.finalise();
        this._descriptionUiAction.finalise();
        // this._typeUiAction.finalise();
        this._symbolListUiAction.finalise();
    }

    protected override processExpandCollapseRestoreStateChanged() {

    }

    protected override processFieldChanges(fieldIds: ScanEditor.FieldId[], fieldChanger: ScanEditor.FieldChanger) {
        const scanEditor = this._scanEditor;
        if (scanEditor !== undefined && fieldChanger !== this) {
            for (const fieldId of fieldIds) {
                switch (fieldId) {
                    case ScanEditor.FieldId.Id:
                        if (scanEditor.existsOrUpdating && scanEditor.id !== undefined) {
                            this._sectionHeadingComponent.setGenericText(scanEditor.id)
                        }
                        break;
                    case ScanEditor.FieldId.Name:
                        this._nameUiAction.pushValue(scanEditor.name);
                        break;
                    case ScanEditor.FieldId.Description:
                        this._descriptionUiAction.pushValue(scanEditor.description);
                        break;
                    case ScanEditor.FieldId.Enabled:
                        this._enabledUiAction.pushValue(scanEditor.enabled);
                        break;
                    case ScanEditor.FieldId.SymbolListEnabled:
                        this._symbolListUiAction.pushValue(scanEditor.symbolListEnabled);
                        break;
                }
            }
        }
    }

    protected override processLifeCycleStateChange(): void {
        this.pushDeleteState();
    }

    protected override processModifiedStateChange(): void {
        // nothing to do
    }

    private initialiseComponents() {
        super.initialiseSectionHeadingComponent();

        this._enabledLabelComponent.initialise(this._enabledUiAction);
        this._enabledControlComponent.initialise(this._enabledUiAction);
        this._nameLabelComponent.initialise(this._nameUiAction);
        this._nameControlComponent.initialise(this._nameUiAction);
        this._descriptionLabelComponent.initialise(this._descriptionUiAction);
        this._descriptionControlComponent.initialise(this._descriptionUiAction);
        this._symbolListLabelComponent.initialise(this._symbolListUiAction);
        this._symbolListControlComponent.initialise(this._symbolListUiAction);
    }

    private createEnabledUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_Enabled]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_Enabled]);
        action.commitEvent = () => {
            if (this._scanEditor !== undefined) {
                // this._scan.enabled = this._enabledUiAction.definedValue;
            }
        };
        return action;
    }

    private createNameUiAction() {
        const action = new StringUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_Name]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_Name]);
        action.commitEvent = () => {
            if (this._scanEditor !== undefined) {
                this._scanEditor.beginFieldChanges(this);
                this._scanEditor.setName(this._nameUiAction.definedValue);
                this._scanEditor.endFieldChanges();
            }
        };
        return action;
    }

    private createDescriptionUiAction() {
        const action = new StringUiAction(false);
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_Description]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_Description]);
        action.commitEvent = () => {
            if (this._scanEditor !== undefined) {
                this._scanEditor.beginFieldChanges(this);
                this._scanEditor.setDescription(this._nameUiAction.definedValue);
                this._scanEditor.endFieldChanges();
            }
        };
        return action;
    }

    private createSymbolListUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.ScanPropertiesCaption_SymbolList]);
        action.pushTitle(Strings[StringId.ScanPropertiesTitle_SymbolList]);
        action.commitEvent = () => {
            if (this._scanEditor !== undefined) {
                this._scanEditor.beginFieldChanges(this);
                this._scanEditor.setSymbolListEnabled(this._symbolListUiAction.definedValue);
                this._scanEditor.endFieldChanges();
            }
        };
        return action;
    }

    private pushValues() {
        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            this.deletingOrDeleted = false;

            this._enabledUiAction.pushValue(undefined);
            this._nameUiAction.pushValue(undefined);
            this._descriptionUiAction.pushValue(undefined);
            this._symbolListUiAction.pushValue(undefined);
        } else {
            this._enabledUiAction.pushValue(scanEditor.enabled);
            this._nameUiAction.pushValue(scanEditor.name);
            this._descriptionUiAction.pushValue(scanEditor.description);
            this._symbolListUiAction.pushValue(scanEditor.symbolListEnabled);
        }

    }

    private pushDeleteState() {
        let newDeleteStateText: string | undefined;
        let deletingOrDeleted: boolean;

        const scanEditor = this._scanEditor;
        if (scanEditor === undefined) {
            newDeleteStateText = undefined;
            deletingOrDeleted = false;
        } else {
            switch (scanEditor.lifeCycleStateId) {
                case ScanEditor.LifeCycleStateId.Deleting:
                    newDeleteStateText = Strings[StringId.Deleting];
                    deletingOrDeleted = true;
                    break;
                case ScanEditor.LifeCycleStateId.Deleted:
                    newDeleteStateText = Strings[StringId.Deleted];
                    deletingOrDeleted = true;
                    break;
                default:
                    newDeleteStateText = undefined;
                    deletingOrDeleted = false;
            }
        }

        if (deletingOrDeleted !== this.deletingOrDeleted) {
            this.deletingOrDeleted = deletingOrDeleted;
            this._cdr.markForCheck();

            if (deletingOrDeleted) {
                this._enabledUiAction.pushReadonly();
                this._nameUiAction.pushReadonly();
                this._descriptionUiAction.pushReadonly();
                this._symbolListUiAction.pushReadonly();
            } else {
                this._enabledUiAction.pushValid();
                this._nameUiAction.pushValid();
                this._descriptionUiAction.pushValid();
                this._symbolListUiAction.pushValid();
            }
        }

        if (newDeleteStateText !== this.deleteStateText) {
            this.deleteStateText = newDeleteStateText;
            this._cdr.markForCheck();
        }
    }
}
