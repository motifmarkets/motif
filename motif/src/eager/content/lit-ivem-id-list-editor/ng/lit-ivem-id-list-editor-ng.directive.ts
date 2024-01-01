import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, InjectionToken, OnDestroy, ViewChild } from '@angular/core';
import { AllowedFieldsGridLayoutDefinition, AssertInternalError, BadnessComparableList, CommandRegisterService, GridLayoutOrReferenceDefinition, IconButtonUiAction, Integer, InternalCommand, LitIvemId, LitIvemIdUiAction, LockOpenListItem, MultiEvent, StringId, StringUiAction, Strings, UsableListChangeTypeId, getErrorMessage } from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { LitIvemIdSelectNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { LitIvemIdListNgComponent } from '../../lit-ivem-id-list/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Directive()
export abstract class LitIvemIdListEditorNgDirective extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    @ViewChild('addLitIvemIdControl') private _addLitIvemIdControlComponent: LitIvemIdSelectNgComponent;
    @ViewChild('selectAllControl') private _selectAllControlComponent: SvgButtonNgComponent;
    @ViewChild('removeSelectedControl') private _removeSelectedControlComponent: SvgButtonNgComponent;
    @ViewChild('columnsControl') private _columnsControlComponent: SvgButtonNgComponent;
    @ViewChild('popoutControl') private _popoutControlComponent: SvgButtonNgComponent | undefined;
    @ViewChild('filterControl') private _filterControlComponent: TextInputNgComponent;
    @ViewChild('grid') private _litIvemIdListComponent: LitIvemIdListNgComponent;

    public counts = '0';

    editGridColumnsEventer: LitIvemIdListEditorNgDirective.EditGridColumnsEventer | undefined;
    popoutEventer: LitIvemIdListEditorNgDirective.PopoutEventer | undefined;

    readonly list: BadnessComparableList<LitIvemId>;

    private readonly _addLitIvemIdUiAction: LitIvemIdUiAction;
    private readonly _selectAllUiAction: IconButtonUiAction;
    private readonly _removeSelectedUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _popoutUiAction: IconButtonUiAction;
    private readonly _filterUiAction: StringUiAction;

    private _enabled = true;

    private _uiListChange = false;
    private _listChangeMultiEvent = new MultiEvent<LitIvemIdListEditorNgDirective.ListChangeEventHandler>();
    private _listChangeSubscriptionId: MultiEvent.SubscriptionId | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        protected readonly _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        typeInstanceCreateCount: Integer,
        protected readonly opener: LockOpenListItem.Opener,
        list: BadnessComparableList<LitIvemId> | null,
    ) {
        super(elRef, typeInstanceCreateCount);

        if (list === null) {
            this.list = new BadnessComparableList<LitIvemId>();
        } else {
            this.list = list;
        }

        const commandRegisterService = commandRegisterNgService.service;

        this._addLitIvemIdUiAction = this.createAddLitIvemIdUiAction();
        this._selectAllUiAction = this.createSelectAllUiAction(commandRegisterService);
        this._removeSelectedUiAction = this.createRemoveSelectedUiAction(commandRegisterService);
        this._columnsUiAction = this.createColumnsUiAction(commandRegisterService);
        this._popoutUiAction = this.createPopoutUiAction(commandRegisterService);
        this._filterUiAction = this.createFilterUiAction();
    }

    get enabled() { return this._enabled; }
    set enabled(value: boolean) {
        if (value !== this._enabled) {
            this._enabled = value;
            this.updateControlsEnabled();
        }
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();
    }

    clearAllControls() {
        this._addLitIvemIdUiAction.pushValue(undefined);
        this._selectAllUiAction.pushValue(undefined);
        this._removeSelectedUiAction.pushValue(undefined);
        this._filterUiAction.pushValue(undefined);
        this.list.clear();
    }

    cancelAllControlsEdited() {
        this._addLitIvemIdUiAction.cancelEdit();
        this._selectAllUiAction.cancelEdit();
        this._removeSelectedUiAction.cancelEdit();
        this._columnsUiAction.cancelEdit();
        this._popoutUiAction.cancelEdit();
        this._filterUiAction.cancelEdit();
    }

    subscribeListChangeEvent(handler: LitIvemIdListEditorNgDirective.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected initialiseComponents() {
        this._addLitIvemIdControlComponent.initialise(this._addLitIvemIdUiAction);
        this._selectAllControlComponent.initialise(this._selectAllUiAction);
        this._removeSelectedControlComponent.initialise(this._removeSelectedUiAction);
        this._columnsControlComponent.initialise(this._columnsUiAction);
        if (this._popoutControlComponent !== undefined) {
            this._popoutControlComponent.initialise(this._popoutUiAction);
        }
        this._filterControlComponent.initialise(this._filterUiAction);

        this._listChangeSubscriptionId = this.list.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => {
                this.updateCounts();
                this.updateControlsEnabled();
                this.notifyListChange(listChangeTypeId, index, count);
            }
        );

        this._litIvemIdListComponent.selectionChangedEventer = () => {
            this.updateControlsEnabled();
            this.updateCounts();
        }

        const initialisePromise = this._litIvemIdListComponent.initialise(this.opener, undefined, false, this.list);
        initialisePromise.then(
            (gridSourceOrReference) => {
                if (gridSourceOrReference === undefined) {
                    throw new AssertInternalError('LIILENCICU56569');
                } else {
                    this.updateCounts();
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'LIILENCICE56569') }
        );
    }

    protected finalise() {
        this.list.unsubscribeListChangeEvent(this._listChangeSubscriptionId);
        this._listChangeSubscriptionId = undefined;

        this._addLitIvemIdUiAction.finalise();
        this._selectAllUiAction.finalise();
        this._removeSelectedUiAction.finalise();
        this._columnsUiAction.finalise();
        this._popoutUiAction.finalise();
        this._filterUiAction.finalise();
    }

    protected editGridColumns(allowedFieldsAndLayoutDefinition: AllowedFieldsGridLayoutDefinition) {
        if (this.editGridColumnsEventer === undefined) {
            return undefined;
        } else {
            return this.editGridColumnsEventer(allowedFieldsAndLayoutDefinition);
        }

    }

    private createAddLitIvemIdUiAction() {
        const action = new LitIvemIdUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SymbolInputTitle]);
        action.commitEvent = () => {
            this._uiListChange = true;
            this.list.add(action.definedValue);
            this._uiListChange = false;
        }
        return action;
    }

    private createSelectAllUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_SelectAll;
        const displayId = StringId.Grid_SelectAllCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Grid_SelectAllTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MarkAll);
        action.pushUnselected();
        action.signalEvent = () => {
            this._litIvemIdListComponent.selectAllRows();
        };
        return action;
    }

    private createRemoveSelectedUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_RemoveSelected;
        const displayId = StringId.LitIvemIdListEditor_RemoveSelectedCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.LitIvemIdListEditor_RemoveSelectedTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RemoveSelectedFromList);
        action.pushUnselected();
        action.signalEvent = () => {
            this._uiListChange = true;
            const selectedIndices = this._litIvemIdListComponent.getSelectedRecordIndices();
            this.list.removeAtIndices(selectedIndices);
            this._uiListChange = false;
        };
        return action;
    }

    private createColumnsUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = () => { this.handleColumnsSignalEvent(); };
        return action;
    }

    private createPopoutUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Popout;
        const displayId = StringId.LitIvemIdListEditor_PopoutCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.LitIvemIdListEditor_PopoutTitle]);
        action.pushIcon(IconButtonUiAction.IconId.EnlargeToTopLeft);
        action.pushUnselected();
        action.signalEvent = () => {
            if (this.popoutEventer !== undefined) {
                this.popoutEventer(this.list);
            }
        };
        return action;
    }

    private createFilterUiAction() {
        const action = new StringUiAction(false);
        action.pushTitle(Strings[StringId.Filter]);
        action.pushPlaceholder(Strings[StringId.Filter]);
        action.commitEvent = () => {
            this._litIvemIdListComponent.filterText = action.definedValue;
            this.updateCounts();
        }
        return action;
    }

    private handleColumnsSignalEvent() {
        const allowedFieldsAndLayoutDefinition = this._litIvemIdListComponent.createAllowedFieldsGridLayoutDefinition();
        const promise = this.editGridColumns(allowedFieldsAndLayoutDefinition);
        if (promise !== undefined) {
            promise.then(
                (layoutOrReferenceDefinition) => {
                    if (layoutOrReferenceDefinition !== undefined) {
                        this._litIvemIdListComponent.openGridLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                    }
                },
                (reason) => {
                    throw new AssertInternalError('LIIENCHLGCUASEE56668', getErrorMessage(reason));
                }
            );
        }
    }

    private updateCounts() {
        const recordCount = this.list.count;
        const counts = `(${this._litIvemIdListComponent.mainRowCount}/${recordCount})`;

        if (counts !== this.counts) {
            this.counts = counts;
            this._cdr.markForCheck();
        }
    }

    private updateControlsEnabled() {
        if (this._enabled) {
            this._addLitIvemIdUiAction.pushValidOrMissing();
            if (this._litIvemIdListComponent.areRowsSelected(true)) {
                this._removeSelectedUiAction.pushValidOrMissing();
            } else {
                this._removeSelectedUiAction.pushDisabled();
            }
            this._filterUiAction.pushValidOrMissing();
            if (this.list.count > 0) {
                this._selectAllUiAction.pushValidOrMissing();
            } else {
                this._selectAllUiAction.pushDisabled();
            }
        } else {
            this._addLitIvemIdUiAction.pushDisabled();
            this._selectAllUiAction.pushDisabled();
            this._removeSelectedUiAction.pushDisabled();
            this._filterUiAction.pushDisabled();
        }
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count, this._uiListChange);
        }
    }
}

export namespace LitIvemIdListEditorNgDirective {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer, ui: boolean) => void;
    export type EditGridColumnsEventer = (this: void, allowedFieldsAndLayoutDefinition: AllowedFieldsGridLayoutDefinition) => Promise<GridLayoutOrReferenceDefinition | undefined>;
    export type PopoutEventer = (this: void, list: BadnessComparableList<LitIvemId>) => void;

    export const listInjectionToken = new InjectionToken<BadnessComparableList<LitIvemId>>('LitIvemIdListEditorNgDirective.list');
}
