/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { CommandRegisterNgService } from 'src/component-services/ng-api';
import { GridLayout, MotifGrid } from 'src/content/internal-api';
import {
    CaptionedCheckboxNgComponent,
    EnumElementCaptionNgComponent,
    RadioInputNgComponent,
    SvgButtonNgComponent,
    TextInputNgComponent
} from 'src/controls/ng-api';
import {
    BooleanUiAction,
    CommandRegisterService,
    EnumUiAction,
    ExplicitElementsEnumUiAction,
    GridLayoutChange, IconButtonUiAction,
    InternalCommand,
    StringUiAction
} from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';
import { assigned, defined, delay1Tick, Integer } from 'src/sys/internal-api';
import { GridLayoutEditorGridNgComponent } from '../../grid-layout-editor-grid/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-grid-layout-editor',
    templateUrl: './grid-layout-editor-ng.component.html',
    styleUrls: ['./grid-layout-editor-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('cancelSearchButton', { static: true }) private _cancelSearchButtonComponent: SvgButtonNgComponent;
    @ViewChild('searchNextButton', { static: true }) private _searchNextButtonComponent: SvgButtonNgComponent;
    @ViewChild('searchInput', { static: true }) private _searchInputComponent: TextInputNgComponent;
    @ViewChild('moveUpButton', { static: true }) private _moveUpButtonComponent: SvgButtonNgComponent;
    @ViewChild('moveTopButton', { static: true }) private _moveTopButtonComponent: SvgButtonNgComponent;
    @ViewChild('moveDownButton', { static: true }) private _moveDownButtonComponent: SvgButtonNgComponent;
    @ViewChild('moveBottomButton', { static: true }) private _moveBottomButtonComponent: SvgButtonNgComponent;
    @ViewChild('showAllRadio', { static: true }) private _showAllRadioComponent: RadioInputNgComponent;
    @ViewChild('showAllLabel', { static: true }) private _showAllLabelComponent: EnumElementCaptionNgComponent;
    @ViewChild('showVisibleRadio', { static: true }) private _showVisibleRadioComponent: RadioInputNgComponent;
    @ViewChild('showVisibleLabel', { static: true }) private _showVisibleLabelComponent: EnumElementCaptionNgComponent;
    @ViewChild('showHiddenRadio', { static: true }) private _showHiddenRadioComponent: RadioInputNgComponent;
    @ViewChild('showHiddenLabel', { static: true }) private _showHiddenLabelComponent: EnumElementCaptionNgComponent;
    @ViewChild('fieldVisibleCheckbox', { static: true }) private _fieldVisibleCheckboxComponent: CaptionedCheckboxNgComponent;
    @ViewChild('grid', { static: true }) private _gridComponent: GridLayoutEditorGridNgComponent;

    public readonly showRadioName: string;
    public readonly showLegend: string;
    public fieldName: string | undefined = undefined;

    private _commandRegisterService: CommandRegisterService;

    private _cancelSearchUiAction: IconButtonUiAction;
    private _searchNextUiAction: IconButtonUiAction;
    private _searchEditUiAction: StringUiAction;
    private _moveUpUiAction: IconButtonUiAction;
    private _moveTopUiAction: IconButtonUiAction;
    private _moveDownUiAction: IconButtonUiAction;
    private _moveBottomUiAction: IconButtonUiAction;
    private _filterUiAction: ExplicitElementsEnumUiAction;
    private _fieldVisibleUiAction: BooleanUiAction;

    private _currentRecordIndex: Integer | undefined = undefined;
    // private _layoutWithHeadings: MotifGrid.LayoutWithHeadersMap;

    constructor(private _cdr: ChangeDetectorRef, commandRegisterNgService: CommandRegisterNgService) {
        super();

        this._commandRegisterService = commandRegisterNgService.service;

        this.showRadioName = this.generateInstancedRadioName('show');
        const showText = Strings[StringId.Show];
        this.showLegend = showText.charAt(0).toUpperCase() + showText.slice(1);

        this._cancelSearchUiAction = this.createCancelSearchUiAction();
        this._searchNextUiAction = this.createSearchNextUiAction();
        this._searchEditUiAction = this.createSearchEditUiAction();
        this._moveUpUiAction = this.createMoveUpUiAction();
        this._moveTopUiAction = this.createMoveTopUiAction();
        this._moveDownUiAction = this.createMoveDownUiAction();
        this._moveBottomUiAction = this.createMoveBottomUiAction();

        this._filterUiAction = new ExplicitElementsEnumUiAction();
        const filterIds = [GridLayoutEditorGridNgComponent.ColumnFilterId.ShowAll,
            GridLayoutEditorGridNgComponent.ColumnFilterId.ShowVisible,
            GridLayoutEditorGridNgComponent.ColumnFilterId.ShowHidden,
        ];
        const elementPropertiesArray = filterIds.map<EnumUiAction.ElementProperties>(
            (filterId) => GridLayoutEditorGridNgComponent.ColumnFilter.getEnumUiActionElementProperties(filterId)
        );
        this._filterUiAction.pushElements(elementPropertiesArray);
        this._filterUiAction.commitEvent = () => this.handleShowCommitEvent();

        this._fieldVisibleUiAction = new BooleanUiAction();
        this._fieldVisibleUiAction.pushCaption(Strings[StringId.Visible]);
        this._fieldVisibleUiAction.pushValue(false);
        this._fieldVisibleUiAction.commitEvent = () => this.handleFieldVisibleCommitEvent();
    }

    getGridLayout(): GridLayout {
        return this._gridComponent.gridLayout;
    }

    setGridLayout(layoutWithHeadings: MotifGrid.LayoutWithHeadersMap) {
        this._gridComponent.setLayoutWithHeadersMap(layoutWithHeadings);
    }

    ngAfterViewInit() {
        this._gridComponent.recordFocusEventer = (recordIndex) => this.handleGridRecordFocusEvent(recordIndex);
        this.updateColumnFilterRadioInput();

        delay1Tick(() => this.initialiseComponentsAndMarkForCheck());
    }

    ngOnDestroy() {
        this._cancelSearchUiAction.finalise();
        this._searchNextUiAction.finalise();
        this._searchEditUiAction.finalise();
        this._moveUpUiAction.finalise();
        this._moveTopUiAction.finalise();
        this._moveDownUiAction.finalise();
        this._moveBottomUiAction.finalise();
        this._filterUiAction.finalise();
        this._fieldVisibleUiAction.finalise();
    }

    private createCancelSearchUiAction() {
        const commandName = InternalCommand.Name.GridLayoutEditor_CancelSearch;
        const displayId = StringId.GridLayoutEditorCancelSearchCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditorCancelSearchTitle]);
        action.pushIcon(IconButtonUiAction.IconId.CancelSearch);
        action.signalEvent = () => this.handleCancelSearchButtonClickEvent();
        return action;
    }

    private createSearchNextUiAction() {
        const commandName = InternalCommand.Name.GridLayoutEditor_SearchNext;
        const displayId = StringId.GridLayoutEditorSearchNextCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditorSearchNextTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SearchNext);
        action.signalEvent = () => this.handleSearchNextButtonClickEvent();
        return action;
    }

    private createSearchEditUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.GridLayoutEditorSearchInputTitle]);
        action.inputEvent = () => this.handleSearchInputInputEvent();
        return action;
    }

    private createMoveUpUiAction() {
        const commandName = InternalCommand.Name.GridLayoutEditor_MoveUp;
        const displayId = StringId.GridLayoutEditorMoveUpCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditorMoveUpTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveUp);
        action.pushUnselected();
        action.signalEvent = () => this.handleMoveUpButtonClickEvent();
        return action;
    }

    private createMoveTopUiAction() {
        const commandName = InternalCommand.Name.GridLayoutEditor_MoveTop;
        const displayId = StringId.GridLayoutEditorMoveTopCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditorMoveTopTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveToTop);
        action.pushUnselected();
        action.signalEvent = () => this.handleMoveTopButtonClickEvent();
        return action;
    }

    private createMoveDownUiAction() {
        const commandName = InternalCommand.Name.GridLayoutEditor_MoveDown;
        const displayId = StringId.GridLayoutEditorMoveDownCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditorMoveDownTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveDown);
        action.pushUnselected();
        action.signalEvent = () => this.handleMoveDownButtonClickEvent();
        return action;
    }

    private createMoveBottomUiAction() {
        const commandName = InternalCommand.Name.GridLayoutEditor_MoveBottom;
        const displayId = StringId.GridLayoutEditorMoveBottomCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditorMoveBottomTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MoveToBottom);
        action.pushUnselected();
        action.signalEvent = () => this.handleMoveBottomButtonClickEvent();
        return action;
    }

    private updateCurrentRecordIndex(index: Integer | undefined): void {
        if (index !== this._currentRecordIndex) {
            this._currentRecordIndex = index;
            this.updateFieldProperties();
        }
    }

    private updateFieldProperties(): void {
        if (assigned(this._currentRecordIndex)) {
            const column = this._gridComponent.getColumn(this._currentRecordIndex);
            this._fieldVisibleUiAction.pushValue(column.visible);
            this.fieldName = this._gridComponent.getColumnHeading(this._currentRecordIndex);
            if (this._currentRecordIndex === 0) {
                this._moveUpUiAction.pushDisabled();
            } else {
                this._moveUpUiAction.pushUnselected();
            }

        } else {
            this.fieldName = undefined;
        }
        this._cdr.markForCheck();
    }

    private updateColumnFilterRadioInput(): void {
        this._filterUiAction.pushValue(this._gridComponent.columnFilterId);
    }

    /*private handleGetSearchButtonStateEvent() {
        if (this._searchInputElement.inputtedValue === '') {
            return ButtonInputElement.ButtonState.Disabled;
        } else {
            return ButtonInputElement.ButtonState.Unselected;
        }
    }*/

    private initialiseComponentsAndMarkForCheck() {
        this._cancelSearchButtonComponent.initialise(this._cancelSearchUiAction);
        this._searchNextButtonComponent.initialise(this._searchNextUiAction);
        this._searchInputComponent.initialise(this._searchEditUiAction);
        this._moveUpButtonComponent.initialise(this._moveUpUiAction);
        this._moveTopButtonComponent.initialise(this._moveTopUiAction);
        this._moveDownButtonComponent.initialise(this._moveDownUiAction);
        this._moveBottomButtonComponent.initialise(this._moveBottomUiAction);
        this._showAllRadioComponent.initialiseEnum(this._filterUiAction, GridLayoutEditorGridNgComponent.ColumnFilterId.ShowAll);
        this._showAllLabelComponent.initialiseEnum(this._filterUiAction, GridLayoutEditorGridNgComponent.ColumnFilterId.ShowAll);
        this._showVisibleRadioComponent.initialiseEnum(this._filterUiAction, GridLayoutEditorGridNgComponent.ColumnFilterId.ShowVisible);
        this._showVisibleLabelComponent.initialiseEnum(this._filterUiAction, GridLayoutEditorGridNgComponent.ColumnFilterId.ShowVisible);
        this._showHiddenRadioComponent.initialiseEnum(this._filterUiAction, GridLayoutEditorGridNgComponent.ColumnFilterId.ShowHidden);
        this._showHiddenLabelComponent.initialiseEnum(this._filterUiAction, GridLayoutEditorGridNgComponent.ColumnFilterId.ShowHidden);
        this._fieldVisibleCheckboxComponent.initialise(this._fieldVisibleUiAction);

        this._cdr.markForCheck();
    }

    private handleCancelSearchButtonClickEvent() {

    }

    private handleSearchNextButtonClickEvent() {
        this.searchNext();
    }

    private handleSearchInputInputEvent() {
        if (this._searchEditUiAction.inputtedText === '') {
            this._cancelSearchUiAction.pushDisabled();
            this._searchNextUiAction.pushDisabled();
        } else {
            this._cancelSearchUiAction.pushUnselected();
            this._searchNextUiAction.pushUnselected();
        }
    }

    private handleMoveUpButtonClickEvent() {
        if (assigned(this._currentRecordIndex)) {
            const focusedIndex = this._gridComponent.applyGridLayoutChangeAction({
                id: GridLayoutChange.ActionId.MoveUp,
                columnIndex: this._currentRecordIndex,
            });
            if (defined(focusedIndex)) {
                this.updateCurrentRecordIndex(focusedIndex);
            }
        }
    }

    private handleMoveTopButtonClickEvent() {
        if (assigned(this._currentRecordIndex)) {
            const focusedIndex = this._gridComponent.applyGridLayoutChangeAction({
                id: GridLayoutChange.ActionId.MoveTop,
                columnIndex: this._currentRecordIndex,
            });
            if (defined(focusedIndex)) {
                this.updateCurrentRecordIndex(focusedIndex);
            }
        }
    }

    private handleMoveDownButtonClickEvent() {
        if (assigned(this._currentRecordIndex)) {
            const focusedIndex = this._gridComponent.applyGridLayoutChangeAction({
                id: GridLayoutChange.ActionId.MoveDown,
                columnIndex: this._currentRecordIndex,
            });
            if (defined(focusedIndex)) {
                this.updateCurrentRecordIndex(focusedIndex);
            }
        }
    }

    private handleMoveBottomButtonClickEvent() {
        if (assigned(this._currentRecordIndex)) {
            const focusedIndex = this._gridComponent.applyGridLayoutChangeAction({
                id: GridLayoutChange.ActionId.MoveBottom,
                columnIndex: this._currentRecordIndex,
            });
            if (defined(focusedIndex)) {
                this.updateCurrentRecordIndex(focusedIndex);
            }
        }
    }

    private handleShowCommitEvent() {
        this._gridComponent.columnFilterId = this._filterUiAction.definedValue;
    }

    private handleFieldVisibleCommitEvent() {
        if (assigned(this._currentRecordIndex)) {
            const column = this._gridComponent.getColumn(this._currentRecordIndex);
            column.visible = this._fieldVisibleUiAction.definedValue;
            this._gridComponent.invalidateVisibleValue(this._currentRecordIndex);
        } else {
            this.fieldName = undefined;
        }
        this.updateFieldProperties();
    }

    private handleGridRecordFocusEvent(recordIndex: Integer | undefined) {
        this.updateCurrentRecordIndex(recordIndex);
    }

    private handleColumnChangeEvent(column: GridLayout.Column) {

    }

    private handleColumnPositionChangeEvent(column: GridLayout.Column, position: Integer) {

    }

    private searchNext() {
        this._gridComponent.focusNextSearchMatch(this._searchEditUiAction.definedValue);

    }
}
