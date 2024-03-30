/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    ViewChild
} from '@angular/core';
import {
    CommandRegisterService,
    EditableGridLayoutDefinitionColumnList,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import {
    SvgButtonNgComponent
} from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../ng/content-component-base-ng.directive';
import { definitionColumnListInjectionToken } from '../../../ng/grid-layout-dialog-ng-injection-tokens';
import { GridLayoutEditorAllowedFieldsFrame } from '../../allowed-fields/internal-api';
import { GridLayoutEditorColumnsFrame } from '../../columns/internal-api';

@Component({
    selector: 'app-grid-layout-editor-field-controls',
    templateUrl: './grid-layout-editor-field-controls-ng.component.html',
    styleUrls: ['./grid-layout-editor-field-controls-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorFieldControlsNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('insertButton', { static: true }) private _insertButtonComponent: SvgButtonNgComponent;
    @ViewChild('removeButton', { static: true }) private _removeButtonComponent: SvgButtonNgComponent;
    @ViewChild('moveUpButton', { static: true }) private _moveUpButtonComponent: SvgButtonNgComponent;
    @ViewChild('moveTopButton', { static: true }) private _moveTopButtonComponent: SvgButtonNgComponent;
    @ViewChild('moveDownButton', { static: true }) private _moveDownButtonComponent: SvgButtonNgComponent;
    @ViewChild('moveBottomButton', { static: true }) private _moveBottomButtonComponent: SvgButtonNgComponent;

    private readonly _insertUiAction: IconButtonUiAction;
    private readonly _removeUiAction: IconButtonUiAction;
    private readonly _moveUpUiAction: IconButtonUiAction;
    private readonly _moveTopUiAction: IconButtonUiAction;
    private readonly _moveDownUiAction: IconButtonUiAction;
    private readonly _moveBottomUiAction: IconButtonUiAction;

    private _allowedFieldsFrame: GridLayoutEditorAllowedFieldsFrame;
    private _columnsFrame: GridLayoutEditorColumnsFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        commandRegisterNgService: CommandRegisterNgService,
        @Inject(definitionColumnListInjectionToken) private _columnList: EditableGridLayoutDefinitionColumnList,
    ) {
        super(elRef, ++GridLayoutEditorFieldControlsNgComponent.typeInstanceCreateCount);

        const commandRegisterService = commandRegisterNgService.service;

        this._insertUiAction = this.createInsertUiAction(commandRegisterService);
        this._removeUiAction = this.createRemoveUiAction(commandRegisterService);
        this._moveUpUiAction = this.createMoveUpUiAction(commandRegisterService);
        this._moveTopUiAction = this.createMoveTopUiAction(commandRegisterService);
        this._moveDownUiAction = this.createMoveDownUiAction(commandRegisterService);
        this._moveBottomUiAction = this.createMoveBottomUiAction(commandRegisterService);
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialiseComponentsAndMarkForCheck());
    }

    ngOnDestroy() {
        this._insertUiAction.finalise();
        this._removeUiAction.finalise();
        this._moveUpUiAction.finalise();
        this._moveTopUiAction.finalise();
        this._moveDownUiAction.finalise();
        this._moveBottomUiAction.finalise();
    }

    initialise(
        allowedFieldsFrame: GridLayoutEditorAllowedFieldsFrame,
        columnsFrame: GridLayoutEditorColumnsFrame,
    ) {
        this._allowedFieldsFrame = allowedFieldsFrame;
        this._columnsFrame = columnsFrame;

        this._allowedFieldsFrame.selectionChangedEventer = () => this.updateControlsDependentOnAllowedFieldsSelection();
        this._columnsFrame.selectionChangedEventer = () => this.updateControlsDependentOnColumnsSelection();

        this.updateControlsDependentOnAllowedFieldsSelection();
        this.updateControlsDependentOnColumnsSelection();
    }

    private createInsertUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_Insert;
        const displayId = StringId.GridLayoutEditor_InsertCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_InsertTitle]);
        action.pushIcon(IconButtonUiAction.IconId.InsertIntoListFromLeft);
        action.pushUnselected();
        action.signalEvent = () => {
            const selectedFields = this._allowedFieldsFrame.selectedFields;
            this._columnsFrame.appendFields(selectedFields)
        }
        return action;
    }

    private createRemoveUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_Remove;
        const displayId = StringId.GridLayoutEditor_RemoveCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_RemoveTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RemoveFromListToLeft);
        action.pushUnselected();
        action.signalEvent = () => this._columnsFrame.removeSelectedColumns();
        return action;
    }

    private createMoveUpUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_MoveUp;
        const displayId = StringId.GridLayoutEditor_MoveUpCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_MoveUpTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveUp);
        action.pushUnselected();
        action.signalEvent = () => this._columnsFrame.moveSelectedColumnsUp();
        return action;
    }

    private createMoveTopUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_MoveTop;
        const displayId = StringId.GridLayoutEditor_MoveTopCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_MoveTopTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveToTop);
        action.pushUnselected();
        action.signalEvent = () => this._columnsFrame.moveSelectedColumnsToTop();
        return action;
    }

    private createMoveDownUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_MoveDown;
        const displayId = StringId.GridLayoutEditor_MoveDownCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_MoveDownTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveDown);
        action.pushUnselected();
        action.signalEvent = () => this._columnsFrame.moveSelectedColumnsDown();
        return action;
    }

    private createMoveBottomUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_MoveBottom;
        const displayId = StringId.GridLayoutEditor_MoveBottomCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_MoveBottomTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveToBottom);
        action.pushUnselected();
        action.signalEvent = () => this._columnsFrame.moveSelectedColumnsToBottom();
        return action;
    }

    private initialiseComponentsAndMarkForCheck() {
        this._insertButtonComponent.initialise(this._insertUiAction);
        this._removeButtonComponent.initialise(this._removeUiAction);
        this._moveUpButtonComponent.initialise(this._moveUpUiAction);
        this._moveTopButtonComponent.initialise(this._moveTopUiAction);
        this._moveDownButtonComponent.initialise(this._moveDownUiAction);
        this._moveBottomButtonComponent.initialise(this._moveBottomUiAction);
    }

    private updateControlsDependentOnAllowedFieldsSelection() {
        const selectedCount = this._allowedFieldsFrame.selectedCount;
        this.setInsertEnabled(selectedCount > 0);
    }

    private updateControlsDependentOnColumnsSelection() {
        const selectedRecordIndices = this._columnsFrame.selectedRecordIndices;
        if (selectedRecordIndices.length === 0) {
            this.setRemoveEnabled(false);
            this.setMoveTopEnabled(false);
            this.setMoveUpEnabled(false);
            this.setMoveDownEnabled(false);
            this.setMoveBottomEnabled(false);
        } else {
            selectedRecordIndices.sort((left, right) => left - right);
            const allIndexedRecordsFixed = this._columnList.areAllIndexedRecordsAnchored(selectedRecordIndices);
            this.setRemoveEnabled(!allIndexedRecordsFixed);
            const allSelectedNotAtTop = !this._columnList.areSortedIndexedRecordsAllAtStart(selectedRecordIndices);
            this.setMoveTopEnabled(allSelectedNotAtTop);
            this.setMoveUpEnabled(allSelectedNotAtTop);
            const allSelectedNotAtBottom = !this._columnList.areSortedIndexedRecordsAllAtEnd(selectedRecordIndices);
            this.setMoveDownEnabled(allSelectedNotAtBottom);
            this.setMoveBottomEnabled(allSelectedNotAtBottom);
        }
    }

    private setInsertEnabled(value: boolean) {
        if (value) {
            if (!this._insertUiAction.enabled) {
                this._insertUiAction.pushAccepted();
            }
        } else {
            this._insertUiAction.pushDisabled();
        }
    }

    private setRemoveEnabled(value: boolean) {
        if (value) {
            if (!this._removeUiAction.enabled) {
                this._removeUiAction.pushAccepted();
            }
        } else {
            this._removeUiAction.pushDisabled();
        }
    }
    private setMoveTopEnabled(value: boolean) {
        if (value) {
            if (!this._moveTopUiAction.enabled) {
                this._moveTopUiAction.pushAccepted();
            }
        } else {
            this._moveTopUiAction.pushDisabled();
        }
    }

    private setMoveUpEnabled(value: boolean) {
        if (value) {
            if (!this._moveUpUiAction.enabled) {
                this._moveUpUiAction.pushAccepted();
            }
        } else {
            this._moveUpUiAction.pushDisabled();
        }
    }

    private setMoveDownEnabled(value: boolean) {
        if (value) {
            if (!this._moveDownUiAction.enabled) {
                this._moveDownUiAction.pushAccepted();
            }
        } else {
            this._moveDownUiAction.pushDisabled();
        }
    }

    private setMoveBottomEnabled(value: boolean) {
        if (value) {
            if (!this._moveBottomUiAction.enabled) {
                this._moveBottomUiAction.pushAccepted();
            }
        } else {
            this._moveBottomUiAction.pushDisabled();
        }
    }
}
