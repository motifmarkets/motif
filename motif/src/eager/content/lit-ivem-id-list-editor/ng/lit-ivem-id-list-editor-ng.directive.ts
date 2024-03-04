import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, InjectionToken, OnDestroy, ViewChild } from '@angular/core';
import {
    AllowedFieldsGridLayoutDefinition,
    AssertInternalError,
    CommandRegisterService,
    GridLayoutOrReferenceDefinition,
    IconButtonUiAction,
    Integer,
    InternalCommand,
    LitIvemBaseDetail,
    LitIvemBaseDetailTableFieldSourceDefinition,
    LitIvemId,
    LitIvemIdComparableListTableRecordSourceDefinition,
    LitIvemIdTableFieldSourceDefinition,
    LitIvemIdUiAction,
    LockOpenListItem,
    MultiEvent,
    StringId,
    StringUiAction,
    Strings,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachedFactoryService,
    UiComparableList
} from '@motifmarkets/motif-core';
import {
    CommandRegisterNgService, ToastNgService,
} from 'component-services-ng-api';
import { LitIvemIdSelectNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { LitIvemIdListNgComponent } from '../../lit-ivem-id-list/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { TableFieldSourceDefinitionCachedFactoryNgService } from '../../ng/table-field-source-definition-cached-factory-ng.service';

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

    readonly list: UiComparableList<LitIvemId>;

    private readonly _fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionCachedFactoryService;

    private readonly _addLitIvemIdUiAction: LitIvemIdUiAction;
    private readonly _selectAllUiAction: IconButtonUiAction;
    private readonly _removeSelectedUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _popoutUiAction: IconButtonUiAction;
    private readonly _filterUiAction: StringUiAction;

    private _enabled = true;

    private _afterListChangedMultiEvent = new MultiEvent<LitIvemIdListEditorNgDirective.AfterListChangedEventHandler>();
    private _listChangeSubscriptionId: MultiEvent.SubscriptionId | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        protected readonly _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        fieldSourceDefinitionCachedFactoryNgService: TableFieldSourceDefinitionCachedFactoryNgService,
        private readonly _toastNgService: ToastNgService,
        typeInstanceCreateCount: Integer,
        protected readonly opener: LockOpenListItem.Opener,
        list: UiComparableList<LitIvemId> | null,
    ) {
        super(elRef, typeInstanceCreateCount);

        if (list === null) {
            this.list = new UiComparableList<LitIvemId>();
        } else {
            this.list = list;
        }

        this._fieldSourceDefinitionRegistryService = fieldSourceDefinitionCachedFactoryNgService.service;

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

    subscribeAfterListChangedEvent(handler: LitIvemIdListEditorNgDirective.AfterListChangedEventHandler) {
        return this._afterListChangedMultiEvent.subscribe(handler);
    }

    unsubscribeAfterListChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._afterListChangedMultiEvent.unsubscribe(subscriptionId);
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

        this._listChangeSubscriptionId = this.list.subscribeAfterListChangedEvent(
            (ui) => {
                this.updateControlsEnabled();
                this.notifyListChange(ui);
            }
        );

        this._litIvemIdListComponent.selectionChangedEventer = () => {
            this.updateControlsEnabled();
            this.updateCounts();
        }

        const layoutDefinition = this.createDefaultLayoutDefinition();
        const gridLayoutOrReferenceDefinition = new GridLayoutOrReferenceDefinition(layoutDefinition);

        this._litIvemIdListComponent.initialise(this.opener, gridLayoutOrReferenceDefinition, undefined, true);

        const openPromise = this._litIvemIdListComponent.tryOpenList(this.list, true);
        openPromise.then(
            (openResult) => {
                if (openResult.isErr()) {
                    this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.LitIvemIdListEditor]}: ${openResult.error}`);
                } else {
                    this._litIvemIdListComponent.frame.grid.dataServersRowListChangedEventer = () => this.updateCounts();
                    this.updateControlsEnabled();
                    this.updateCounts();
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'LIILENCICE56569') }
        );
    }

    protected finalise() {
        this._litIvemIdListComponent.frame.grid.dataServersRowListChangedEventer = undefined;

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
            return Promise.resolve(undefined);
        } else {
            return this.editGridColumnsEventer(allowedFieldsAndLayoutDefinition);
        }
    }

    private createAddLitIvemIdUiAction() {
        const action = new LitIvemIdUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SymbolInputTitle]);
        action.commitEvent = () => {
            this.list.uiAdd(action.definedValue);
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
            const selectedIndices = this._litIvemIdListComponent.getSelectedRecordIndices();
            this.list.uiRemoveAtIndices(selectedIndices);
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

    private createDefaultLayoutDefinition() {
        const litIvemIdFieldId: LitIvemIdTableFieldSourceDefinition.FieldId = {
            sourceTypeId: TableFieldSourceDefinition.TypeId.LitIvemId,
            id: LitIvemId.FieldId.LitIvemId,
        };
        const nameFieldId: LitIvemBaseDetailTableFieldSourceDefinition.FieldId = {
            sourceTypeId: TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
            id: LitIvemBaseDetail.Field.Id.Name,
        };

        return LitIvemIdComparableListTableRecordSourceDefinition.createLayoutDefinition(
            this._fieldSourceDefinitionRegistryService,
            [litIvemIdFieldId, nameFieldId],
        );
    }

    private handleColumnsSignalEvent() {
        const allowedFieldsAndLayoutDefinition = this._litIvemIdListComponent.createAllowedFieldsGridLayoutDefinition();
        const editFinishPromise = this.editGridColumns(allowedFieldsAndLayoutDefinition);
        editFinishPromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    const openPromise = this._litIvemIdListComponent.tryOpenGridLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                    openPromise.then(
                        (openResult) => {
                            if (openResult.isErr()) {
                                this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.LitIvemIdListEditor]} ${Strings[StringId.GridLayout]}: ${openResult.error}`);
                            }
                        },
                        (reason) => { throw AssertInternalError.createIfNotError(reason, 'LIILENDHCSEOP56668'); }
                    );
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'LIILENDHCSEEFP56668'); }
        );
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

    private notifyListChange(ui: boolean) {
        const handlers = this._afterListChangedMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](ui);
        }
    }
}

export namespace LitIvemIdListEditorNgDirective {
    export type AfterListChangedEventHandler = (this: void, ui: boolean) => void;
    export type EditGridColumnsEventer = (this: void, allowedFieldsAndLayoutDefinition: AllowedFieldsGridLayoutDefinition) => Promise<GridLayoutOrReferenceDefinition | undefined>;
    export type PopoutEventer = (this: void, list: UiComparableList<LitIvemId>) => void;

    export const listInjectionToken = new InjectionToken<UiComparableList<LitIvemId>>('LitIvemIdListEditorNgDirective.list');

    export const initialCustomGridSettingsProvider: LitIvemIdListNgComponent.InitialCustomGridSettingsProvider = {
        provide: LitIvemIdListNgComponent.initialCustomGridSettingsInjectionToken,
        useValue: {
            fixedColumnCount: 1,
            switchNewRectangleSelectionToRowOrColumn: 'row',
        }
    }
}
