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
    Integer,
    InternalCommand,
    MultiEvent,
    ScanEditor,
    StringId,
    Strings,
    UnreachableCaseError,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { AngularSplitTypes } from 'controls-internal-api';
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
    // encapsulation: ViewEncapsulation.None, // needed to get splitter working  - https://github.com/angular-split/angular-split/issues/268
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
    public sectionsSize: AngularSplitTypes.AreaSize.Html;
    public sectionsMinSize: AngularSplitTypes.AreaSize.Html;
    public testSize: null | number = null;
    public splitterGutterSize = 3;

    private readonly _applyUiAction: ButtonUiAction;
    private readonly _revertUiAction: ButtonUiAction;
    private readonly _deleteUiAction: ButtonUiAction;
    private readonly _testUiAction: ButtonUiAction;

    private _scanEditor: ScanEditor | undefined;
    private _scanEditorLifeCycleStateChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _scanEditorModifiedStateChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _resizeObserver: ResizeObserver;
    private _splitterDragged = false;

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
        this._resizeObserver = new ResizeObserver(() => this.updateWidths());
        this._resizeObserver.observe(this.rootHtmlElement);
        this._testComponent.displayedChangedEventer = () => {
            this._splitterDragged = false;
            this.updateTestDisplayed();
            delay1Tick(() => this.updateWidths());
        }
        this.updateTestDisplayed();
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
                () => this.handleScanEditorLifeCycleStateChangeEvent()
            )
            this._scanEditorModifiedStateChangeSubscriptionId = scanEditor.subscribeModifiedStateChangeEvents(
                () => this.handleScanEditorModifiedStateChangeEvent()
            )

            newVisibility = HtmlTypes.Visibility.Visible;
        }

        this.updateApplyButton();
        this.updateRevertButton();
        this.updateDeleteButton();

        if (newVisibility !== this.visibility) {
            this.visibility = newVisibility;
            this._cdr.markForCheck();
        }
    }

    public handleSplitterDragEnd() {
        this._splitterDragged = true;
    }

    protected finalise() {
        this._testComponent.displayedChangedEventer = undefined;
        this._resizeObserver.disconnect();

        this.setEditor(undefined);

        this._applyUiAction.finalise();
        this._revertUiAction.finalise();
        this._deleteUiAction.finalise();
        this._testUiAction.finalise();
    }

    private handleScanEditorLifeCycleStateChangeEvent() {
        this.updateApplyButton();
        this.updateRevertButton();
        this.updateDeleteButton();
    }

    private handleScanEditorModifiedStateChangeEvent() {
        this.updateApplyButton();
        this.updateRevertButton();
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
        action.pushCaption(Strings[StringId.Revert]);
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
        action.pushCaption(Strings[StringId.Delete]);
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
            throw new AssertInternalError('SENCHTUASEE20241');
        } else {
            const targetTypeId = editor.targetTypeId;
            if (targetTypeId === undefined) {
                throw new AssertInternalError('SENCHTUASETT20241');
            } else {
                const targets = editor.targets;
                if (targets === undefined) {
                    throw new AssertInternalError('SENCHTUASET20241');
                } else {
                    const criteriaAsZenithEncoded = editor.criteriaAsZenithEncoded;
                    if (criteriaAsZenithEncoded === undefined) {
                        throw new AssertInternalError('SENCHTUASEC20241');
                    } else {
                        const rankAsZenithEncoded = editor.rankAsZenithEncoded;
                        if (rankAsZenithEncoded === undefined) {
                            throw new AssertInternalError('SENCHTUASER20241');
                        } else {
                            this._testComponent.execute(
                                editor.name,
                                editor.description,
                                targetTypeId,
                                targets,
                                criteriaAsZenithEncoded,
                                rankAsZenithEncoded,
                            );
                        }
                    }
                }
            }
        }
    }

    private updateApplyButton() {
        const editor = this._scanEditor;
        const action = this._applyUiAction;
        if (editor === undefined) {
            action.pushCaption(Strings[StringId.Apply]);
            action.pushDisabled();
        } else {
            switch (editor.lifeCycleStateId) {
                case ScanEditor.LifeCycleStateId.NotYetCreated:
                    action.pushCaption(Strings[StringId.Create]);
                    action.pushValid();
                    break;
                case ScanEditor.LifeCycleStateId.Creating:
                case ScanEditor.LifeCycleStateId.initialDetailLoading:
                    action.pushDisabled();
                    break;
                case ScanEditor.LifeCycleStateId.Exists:
                    switch (editor.modifiedStateId) {
                        case ScanEditor.ModifiedStateId.Unmodified:
                            action.pushDisabled();
                            break;
                        case ScanEditor.ModifiedStateId.Modified:
                            action.pushCaption(Strings[StringId.Update]);
                            action.pushValid();
                            break;
                        case ScanEditor.ModifiedStateId.Conflict:
                            action.pushCaption(Strings[StringId.Overwrite]);
                            action.pushValid();
                            break;
                        default:
                            throw new UnreachableCaseError('SENCUABMD32221', editor.modifiedStateId);
                    }
                    break;
                case ScanEditor.LifeCycleStateId.Updating:
                case ScanEditor.LifeCycleStateId.Deleting:
                case ScanEditor.LifeCycleStateId.Deleted:
                    action.pushDisabled();
                    break;
                default:
                    throw new UnreachableCaseError('SENCUABLD32221', editor.lifeCycleStateId);
            }
        }
    }

    private updateRevertButton() {
        const editor = this._scanEditor;
        const action = this._revertUiAction;
        if (editor === undefined) {
            action.pushDisabled();
        } else {
            switch (editor.lifeCycleStateId) {
                case ScanEditor.LifeCycleStateId.NotYetCreated:
                case ScanEditor.LifeCycleStateId.Exists:
                    switch (editor.modifiedStateId) {
                        case ScanEditor.ModifiedStateId.Unmodified:
                            action.pushDisabled();
                            break;
                        case ScanEditor.ModifiedStateId.Modified:
                            action.pushCaption(Strings[StringId.Revert]);
                            action.pushValid();
                            break;
                        case ScanEditor.ModifiedStateId.Conflict:
                            action.pushCaption(Strings[StringId.Revert]);
                            action.pushValid();
                            break;
                        default:
                            throw new UnreachableCaseError('SENCUMBMD32221', editor.modifiedStateId);
                    }
                    break;
                case ScanEditor.LifeCycleStateId.Creating:
                case ScanEditor.LifeCycleStateId.initialDetailLoading:
                case ScanEditor.LifeCycleStateId.Updating:
                case ScanEditor.LifeCycleStateId.Deleting:
                case ScanEditor.LifeCycleStateId.Deleted:
                    action.pushDisabled();
                    break;
                default:
                    throw new UnreachableCaseError('SENCUABLD32221', editor.lifeCycleStateId);
            }
        }
    }

    private updateDeleteButton() {
        const editor = this._scanEditor;
        const action = this._deleteUiAction;
        if (editor === undefined) {
            action.pushDisabled();
        } else {
            switch (editor.lifeCycleStateId) {
                case ScanEditor.LifeCycleStateId.Exists:
                    action.pushValid();
                    break;
                case ScanEditor.LifeCycleStateId.NotYetCreated:
                case ScanEditor.LifeCycleStateId.Creating:
                case ScanEditor.LifeCycleStateId.initialDetailLoading:
                case ScanEditor.LifeCycleStateId.Updating:
                case ScanEditor.LifeCycleStateId.Deleting:
                case ScanEditor.LifeCycleStateId.Deleted:
                    action.pushDisabled();
                    break;
                default:
                    throw new UnreachableCaseError('SENCUABLD32221', editor.lifeCycleStateId);
            }
        }
    }

    private updateTestDisplayed() {
        if (this._testComponent.displayed) {
            this.testSize = null;
            this.splitterGutterSize = 3;
        } else {
            this.testSize = 0;
            this.splitterGutterSize = 0;
        }
    }

    private updateWidths() {
        const sectionsMinWidth = 15 * this._testComponent.emWidth;
        this.sectionsMinSize = sectionsMinWidth;

        if (!this._splitterDragged) {
            const totalWidth = this.rootHtmlElement.offsetWidth;
            const availableTotalWidth = totalWidth - this.splitterGutterSize;
            const testWidth = this._testComponent.approximateWidth;

            let calculatedSectionsWidth: Integer;
            if (availableTotalWidth >= (testWidth + this.sectionsMinSize)) {
                calculatedSectionsWidth = availableTotalWidth - testWidth;
            } else {
                calculatedSectionsWidth = sectionsMinWidth;
            }

            this.sectionsSize = calculatedSectionsWidth;
            this._cdr.markForCheck();
        }
    }
}
