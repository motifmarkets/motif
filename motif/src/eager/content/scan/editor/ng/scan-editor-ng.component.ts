/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, OnDestroy, ViewChild } from '@angular/core';
import {
    AssertInternalError,
    ButtonUiAction,
    CommandRegisterService,
    HtmlTypes,
    InternalCommand,
    MultiEvent,
    ScanEditor,
    StringId,
    Strings
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { ScanTestNgComponent } from '../../test/ng-api';
import {
    FormulaScanEditorSectionNgComponent,
    GeneralScanEditorSectionNgComponent,
    NotifiersScanEditorSectionNgComponent
} from '../section/ng-api';

@Component({
    selector: 'app-scan-editor',
    templateUrl: './scan-editor-ng.component.html',
    styleUrls: ['./scan-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanEditorNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.visibility') visibility = HtmlTypes.Visibility.Hidden;

    @ViewChild('generalSection', { static: true }) private _generalSectionComponent: GeneralScanEditorSectionNgComponent;
    @ViewChild('criteriaSection', { static: true }) private _criteriaSectionComponent: FormulaScanEditorSectionNgComponent;
    @ViewChild('rankSection', { static: true }) private _rankSectionComponent: FormulaScanEditorSectionNgComponent;
    @ViewChild('notifiersSection', { static: true }) private _notifiersSectionComponent: NotifiersScanEditorSectionNgComponent;
    @ViewChild('test', { static: true }) private _testComponent: ScanTestNgComponent;
    @ViewChild('applyButton', { static: true }) private _applyButtonComponent: ButtonInputNgComponent;
    @ViewChild('revertButton', { static: false }) private _revertButtonComponent: ButtonInputNgComponent;
    @ViewChild('deleteButton', { static: true }) private _deleteButtonComponent: ButtonInputNgComponent;
    @ViewChild('testButton', { static: true }) private _testButtonComponent: ButtonInputNgComponent;

    public criteriaFieldId = ScanEditor.FieldId.Criteria;
    public rankFieldId = ScanEditor.FieldId.Rank;

    private readonly _applyUiAction: ButtonUiAction;
    private readonly _revertUiAction: ButtonUiAction;
    private readonly _deleteUiAction: ButtonUiAction;
    private readonly _testUiAction: ButtonUiAction;

    private _scanEditor: ScanEditor | undefined;
    private _scanEditorLifeCycleStateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _scanEditorModifiedStateChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
    ) {
        super(elRef, ++ScanEditorNgComponent.typeInstanceCreateCount);

        const commandRegisterService = commandRegisterNgService.service;

        this._applyUiAction = this.createApplyUiAction(commandRegisterService);
        this._revertUiAction = this.createRevertUiAction(commandRegisterService);
        this._deleteUiAction = this.createDeleteUiAction(commandRegisterService);
        this._testUiAction = this.createTestUiAction(commandRegisterService);
    }

    ngOnDestroy(): void {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();
    }

    setEditor(scanEditor: ScanEditor | undefined) {
        this._generalSectionComponent.setEditor(scanEditor);
        this._criteriaSectionComponent.setEditor(scanEditor);
        this._rankSectionComponent.setEditor(scanEditor);
        this._notifiersSectionComponent.setEditor(scanEditor);

        if (this._scanEditor !== undefined) {
            this._scanEditor.unsubscribeLifeCycleStateChangeEvents(this._scanEditorLifeCycleStateChangeSubscriptionId);
            this._scanEditorLifeCycleStateChangeSubscriptionId = undefined;
            this._scanEditor.unsubscribeModifiedStateChangeEvents(this._scanEditorModifiedStateChangeSubscriptionId);
            this._scanEditorModifiedStateChangeSubscriptionId = undefined;
        }

        this._scanEditor = scanEditor;

        let newVisibility: HtmlTypes.Visibility;
        if (scanEditor === undefined) {
            newVisibility = HtmlTypes.Visibility.Hidden;
        } else {
            this._scanEditorLifeCycleStateChangeSubscriptionId = scanEditor.subscribeLifeCycleStateChangeEvents(
                () => this.handleScanEditorLifeCycleStateChangeEvent(scanEditor)
            )
            this._scanEditorLifeCycleStateChangeSubscriptionId = undefined;
            this._scanEditorModifiedStateChangeSubscriptionId = scanEditor.subscribeModifiedStateChangeEvents(
                () => this.handleScanEditorModifiedStateChangeEvent(scanEditor)
            )
            this._scanEditorModifiedStateChangeSubscriptionId = undefined;
            newVisibility = HtmlTypes.Visibility.Visible;
        }

        if (newVisibility !== this.visibility) {
            this.visibility = newVisibility;
            this._cdr.markForCheck();
        }
    }

    protected finalise() {
        this.setEditor(undefined);

        this._applyUiAction.finalise();
        this._revertUiAction.finalise();
        this._deleteUiAction.finalise();
        this._testUiAction.finalise();
    }

    private handleScanEditorLifeCycleStateChangeEvent(editor: ScanEditor) {
        switch (editor.lifeCycleStateId) {
            case ScanEditor.LifeCycleStateId.NotYetCreated:
            case ScanEditor.LifeCycleStateId.Creating:
            case ScanEditor.LifeCycleStateId.Exists:
            case ScanEditor.LifeCycleStateId.Updating:
            case ScanEditor.LifeCycleStateId.Deleted:
        }
    }

    private handleScanEditorModifiedStateChangeEvent(editor: ScanEditor) {
        switch (editor.modifiedStatedId) {
            case ScanEditor.ModifiedStateId.Unmodified:
            case ScanEditor.ModifiedStateId.Modified:
            case ScanEditor.ModifiedStateId.Conflict:
        }
    }

    private createApplyUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanEditor_Apply;
        const displayId = StringId.Apply;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.ScanEditorComponent_ApplyTitle]);
        action.pushUnselected();
        action.signalEvent = () => this.handleApplyUiActionSignalEvent();
        return action;
    }

    private createRevertUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanEditor_Revert;
        const displayId = StringId.Revert;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.ScanEditorComponent_RevertTitle]);
        action.pushUnselected();
        action.signalEvent = () => this.handleRevertUiActionSignalEvent();
        return action;
    }

    private createDeleteUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanEditor_Delete;
        const displayId = StringId.Delete;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.ScanEditorComponent_DeleteTitle]);
        action.pushUnselected();
        action.signalEvent = () => this.handleDeleteUiActionSignalEvent();
        return action;
    }

    private createTestUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanEditor_Test;
        const displayId = StringId.Test;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.ScanEditorComponent_TestTitle]);
        action.pushUnselected();
        action.signalEvent = () => this.handleTestUiActionSignalEvent();
        return action;
    }

    private initialiseComponents() {
        this._applyButtonComponent.initialise(this._applyUiAction);
        this._revertButtonComponent.initialise(this._revertUiAction);
        this._deleteButtonComponent.initialise(this._deleteUiAction);
        this._testButtonComponent.initialise(this._testUiAction);
    }

    private handleApplyUiActionSignalEvent() {
        const editor = this._scanEditor;
        if (editor === undefined) {
            throw new AssertInternalError('SENCHAUASE20241');
        } else {
            editor.apply();
        }
    }

    private handleRevertUiActionSignalEvent() {
        const editor = this._scanEditor;
        if (editor === undefined) {
            throw new AssertInternalError('SENCHRUASE20241');
        } else {
            editor.revert();
        }
    }

    private handleDeleteUiActionSignalEvent() {
        const editor = this._scanEditor;
        if (editor === undefined) {
            throw new AssertInternalError('SENCHDUASE20241');
        } else {
            editor.deleteScan();
        }
    }

    private handleTestUiActionSignalEvent() {
        const editor = this._scanEditor;
        if (editor === undefined) {
            throw new AssertInternalError('SENCHTUASE20241');
        } else {
            this._testComponent.execute(
                editor.name,
                editor.description,
                editor.targetTypeId,
                editor.targets,
                editor.criteriaAsZenithEncoded,
                editor.rankAsZenithEncoded,
            );
        }
    }
}
