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
    Injector,
    OnDestroy,
    ValueProvider,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    CommandRegisterService,
    EditableGridLayoutDefinitionColumnList,
    GridField,
    GridLayoutDefinition,
    IconButtonUiAction,
    Integer,
    InternalCommand,
    StringId,
    Strings,
    assigned,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import {
    SvgButtonNgComponent
} from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { columnListInjectionToken } from '../../ng/grid-layout-dialog-ng-injection-tokens';
import { GridLayoutEditorFrame } from '../grid-layout-editor-frame';

@Component({
    selector: 'app-grid-layout-editor',
    templateUrl: './grid-layout-editor-ng.component.html',
    styleUrls: ['./grid-layout-editor-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit, GridLayoutEditorFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    @ViewChild('insertButton', { static: true }) private _insertButtonComponent: SvgButtonNgComponent;
    @ViewChild('removeButton', { static: true }) private _removeButtonComponent: SvgButtonNgComponent;
    @ViewChild('moveUpButton', { static: true }) private _moveUpButtonComponent: SvgButtonNgComponent;
    @ViewChild('moveTopButton', { static: true }) private _moveTopButtonComponent: SvgButtonNgComponent;
    @ViewChild('moveDownButton', { static: true }) private _moveDownButtonComponent: SvgButtonNgComponent;
    @ViewChild('moveBottomButton', { static: true }) private _moveBottomButtonComponent: SvgButtonNgComponent;

    private readonly _commandRegisterService: CommandRegisterService;
    private readonly _frame: GridLayoutEditorFrame;

    private readonly _insertUiAction: IconButtonUiAction;
    private readonly _removeUiAction: IconButtonUiAction;
    private readonly _moveUpUiAction: IconButtonUiAction;
    private readonly _moveTopUiAction: IconButtonUiAction;
    private readonly _moveDownUiAction: IconButtonUiAction;
    private readonly _moveBottomUiAction: IconButtonUiAction;

    private _currentRecordIndex: Integer | undefined = undefined;
    // private _layoutWithHeadings: MotifGrid.LayoutWithHeadersMap;

    constructor(elRef: ElementRef<HTMLElement>, commandRegisterNgService: CommandRegisterNgService) {
        super(elRef, ++GridLayoutEditorNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._insertUiAction = this.createInsertUiAction();
        this._removeUiAction = this.createRemoveUiAction();
        this._moveUpUiAction = this.createMoveUpUiAction();
        this._moveTopUiAction = this.createMoveTopUiAction();
        this._moveDownUiAction = this.createMoveDownUiAction();
        this._moveBottomUiAction = this.createMoveBottomUiAction();

        this._frame = new GridLayoutEditorFrame(
            this,
        );
    }

    get insertEnabled() { return this._insertUiAction.enabled; }
    set insertEnabled(value: boolean) {
        if (value) {
            if (!this._insertUiAction.enabled) {
                this._insertUiAction.pushAccepted();
            }
        } else {
            this._insertUiAction.pushDisabled();
        }
    }

    get removeEnabled() { return this._removeUiAction.enabled; }
    set removeEnabled(value: boolean) {
        if (value) {
            if (!this._removeUiAction.enabled) {
                this._removeUiAction.pushAccepted();
            }
        } else {
            this._removeUiAction.pushDisabled();
        }
    }
    get moveTopEnabled() { return this._moveTopUiAction.enabled; }
    set moveTopEnabled(value: boolean) {
        if (value) {
            if (!this._moveTopUiAction.enabled) {
                this._moveTopUiAction.pushAccepted();
            }
        } else {
            this._moveTopUiAction.pushDisabled();
        }
    }

    get moveUpEnabled() { return this._moveUpUiAction.enabled; }
    set moveUpEnabled(value: boolean) {
        if (value) {
            if (!this._moveUpUiAction.enabled) {
                this._moveUpUiAction.pushAccepted();
            }
        } else {
            this._moveUpUiAction.pushDisabled();
        }
    }

    get moveDownEnabled() { return this._moveDownUiAction.enabled; }
    set moveDownEnabled(value: boolean) {
        if (value) {
            if (!this._moveDownUiAction.enabled) {
                this._moveDownUiAction.pushAccepted();
            }
        } else {
            this._moveDownUiAction.pushDisabled();
        }
    }

    get moveBottomEnabled() { return this._moveBottomUiAction.enabled; }
    set moveBottomEnabled(value: boolean) {
        if (value) {
            if (!this._moveBottomUiAction.enabled) {
                this._moveBottomUiAction.pushAccepted();
            }
        } else {
            this._moveBottomUiAction.pushDisabled();
        }
    }

    setAllowedFieldsAndLayoutDefinition(allowedFields: readonly GridField[], layoutDefinition: GridLayoutDefinition) {
        // remove
    }


    getGridLayoutDefinition(): GridLayoutDefinition {
        // return this._gridComponent.gridLayoutDefinition;
        return new GridLayoutDefinition([]);
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

    private createInsertUiAction() {
        const commandName = InternalCommand.Id.Grid_Insert;
        const displayId = StringId.GridLayoutEditor_InsertCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_InsertTitle]);
        action.pushIcon(IconButtonUiAction.IconId.InsertIntoListFromLeft);
        action.pushUnselected();
        action.signalEvent = () => this._frame.insertSelectedFields();
        return action;
    }

    private createRemoveUiAction() {
        const commandName = InternalCommand.Id.Grid_Remove;
        const displayId = StringId.GridLayoutEditor_RemoveCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_RemoveTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RemoveFromListToLeft);
        action.pushUnselected();
        action.signalEvent = () => this._frame.removeSelectedColumns();
        return action;
    }

    private createMoveUpUiAction() {
        const commandName = InternalCommand.Id.Grid_MoveUp;
        const displayId = StringId.GridLayoutEditor_MoveUpCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_MoveUpTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveUp);
        action.pushUnselected();
        action.signalEvent = () => this._frame.moveSelectedColumnsUp();
        return action;
    }

    private createMoveTopUiAction() {
        const commandName = InternalCommand.Id.Grid_MoveTop;
        const displayId = StringId.GridLayoutEditor_MoveTopCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_MoveTopTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveToTop);
        action.pushUnselected();
        action.signalEvent = () => this._frame.moveSelectedColumnsToTop();
        return action;
    }

    private createMoveDownUiAction() {
        const commandName = InternalCommand.Id.Grid_MoveDown;
        const displayId = StringId.GridLayoutEditor_MoveDownCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_MoveDownTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveDown);
        action.pushUnselected();
        action.signalEvent = () => this._frame.moveSelectedColumnsDown();
        return action;
    }

    private createMoveBottomUiAction() {
        const commandName = InternalCommand.Id.Grid_MoveBottom;
        const displayId = StringId.GridLayoutEditor_MoveBottomCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_MoveBottomTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveToBottom);
        action.pushUnselected();
        action.signalEvent = () => this._frame.moveSelectedColumnsToBottom();
        return action;
    }

    private updateCurrentRecordIndex(index: Integer | undefined): void {
        if (index !== this._currentRecordIndex) {
            this._currentRecordIndex = index;
            this.updateFieldProperties();
        }
    }

    private updateFieldProperties(): void {
        // if (assigned(this._currentRecordIndex)) {
        //     const column = this._gridComponent.getColumn(this._currentRecordIndex);
        //     this._fieldVisibleUiAction.pushValue(column.visible);
        //     this.fieldName = this._gridComponent.getColumnHeading(this._currentRecordIndex);
        //     if (this._currentRecordIndex === 0) {
        //         this._moveUpUiAction.pushDisabled();
        //     } else {
        //         this._moveUpUiAction.pushUnselected();
        //     }

        // } else {
        //     this.fieldName = undefined;
        // }
        // this._cdr.markForCheck();
    }

    private updateColumnFilterRadioInput(): void {
        // this._filterUiAction.pushValue(this._gridComponent.columnFilterId);
    }

    /*private handleGetSearchButtonStateEvent() {
        if (this._searchInputElement.inputtedValue === '') {
            return ButtonInputElement.ButtonState.Disabled;
        } else {
            return ButtonInputElement.ButtonState.Unselected;
        }
    }*/

    private initialiseComponentsAndMarkForCheck() {
        this._insertButtonComponent.initialise(this._insertUiAction);
        this._removeButtonComponent.initialise(this._removeUiAction);
        this._moveUpButtonComponent.initialise(this._moveUpUiAction);
        this._moveTopButtonComponent.initialise(this._moveTopUiAction);
        this._moveDownButtonComponent.initialise(this._moveDownUiAction);
        this._moveBottomButtonComponent.initialise(this._moveBottomUiAction);
    }

    private handleMoveUpButtonClickEvent() {
        if (assigned(this._currentRecordIndex)) {
            // const focusedIndex = this._gridComponent.applyGridLayoutChangeAction({
            //     id: GridLayoutChange.ActionId.MoveUp,
            //     columnIndex: this._currentRecordIndex,
            // });
            // if (defined(focusedIndex)) {
            //     this.updateCurrentRecordIndex(focusedIndex);
            // }
        }
    }

    private handleMoveTopButtonClickEvent() {
        if (assigned(this._currentRecordIndex)) {
            // const focusedIndex = this._gridComponent.applyGridLayoutChangeAction({
            //     id: GridLayoutChange.ActionId.MoveTop,
            //     columnIndex: this._currentRecordIndex,
            // });
            // if (defined(focusedIndex)) {
            //     this.updateCurrentRecordIndex(focusedIndex);
            // }
        }
    }

    private handleMoveDownButtonClickEvent() {
        if (assigned(this._currentRecordIndex)) {
            // const focusedIndex = this._gridComponent.applyGridLayoutChangeAction({
            //     id: GridLayoutChange.ActionId.MoveDown,
            //     columnIndex: this._currentRecordIndex,
            // });
            // if (defined(focusedIndex)) {
            //     this.updateCurrentRecordIndex(focusedIndex);
            // }
        }
    }

    private handleMoveBottomButtonClickEvent() {
        if (assigned(this._currentRecordIndex)) {
            // const focusedIndex = this._gridComponent.applyGridLayoutChangeAction({
            //     id: GridLayoutChange.ActionId.MoveBottom,
            //     columnIndex: this._currentRecordIndex,
            // });
            // if (defined(focusedIndex)) {
            //     this.updateCurrentRecordIndex(focusedIndex);
            // }
        }
    }

    private handleGridRecordFocusEvent(recordIndex: Integer | undefined) {
        this.updateCurrentRecordIndex(recordIndex);
    }
}

export namespace GridLayoutEditorNgComponent {
    export function create(
        container: ViewContainerRef,
        columnList: EditableGridLayoutDefinitionColumnList,
    ) {
        container.clear();

        const columnListProvider: ValueProvider = {
            provide: columnListInjectionToken,
            useValue: columnList,
        };
        const injector = Injector.create({
            providers: [columnListProvider],
        });

        container.createComponent(GridLayoutEditorNgComponent, { injector });
    }
}
