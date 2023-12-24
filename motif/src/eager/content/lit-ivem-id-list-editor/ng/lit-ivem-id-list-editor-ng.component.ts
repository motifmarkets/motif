import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { AllowedFieldsGridLayoutDefinition, AssertInternalError, BadnessComparableList, CommandRegisterService, GridLayoutOrReferenceDefinition, IconButtonUiAction, Integer, InternalCommand, LitIvemId, LitIvemIdUiAction, LockOpenListItem, MultiEvent, StringId, StringUiAction, Strings, UsableListChangeTypeId, getErrorMessage } from '@motifmarkets/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { LitIvemIdSelectNgComponent, SvgButtonNgComponent, TextInputNgComponent } from 'controls-ng-api';
import { LitIvemIdListNgComponent } from '../../lit-ivem-id-list/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ContentNgService } from '../../ng/content-ng.service';

@Component({
    selector: 'app-lit-ivem-id-list-editor',
    templateUrl: './lit-ivem-id-list-editor-ng.component.html',
    styleUrls: ['./lit-ivem-id-list-editor-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LitIvemIdListEditorNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('addLitIvemIdControl', { static: true }) private _addLitIvemIdControlComponent: LitIvemIdSelectNgComponent;
    @ViewChild('selectAllControl', { static: true }) private _selectAllControlComponent: SvgButtonNgComponent;
    @ViewChild('deleteSelectedControl', { static: true }) private _deleteSelectedControlComponent: SvgButtonNgComponent;
    @ViewChild('columnsControl', { static: true }) private _columnsControlComponent: SvgButtonNgComponent;
    @ViewChild('filterControl', { static: true }) private _filterControlComponent: TextInputNgComponent;
    @ViewChild('grid', { static: true }) private _litIvemIdListComponent: LitIvemIdListNgComponent;

    editGridColumnsEventer: LitIvemIdListEditorNgComponent.EditGridColumnsEventer | undefined;

    readonly list = new BadnessComparableList<LitIvemId>();

    private readonly _addLitIvemIdUiAction: LitIvemIdUiAction;
    private readonly _selectAllUiAction: IconButtonUiAction;
    private readonly _deleteSelectedUiAction: IconButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _filterUiAction: StringUiAction;

    private _enabled = true;

    private _uiListChange = false;
    private _listChangeMultiEvent = new MultiEvent<LitIvemIdListEditorNgComponent.ListChangeEventHandler>();
    private _listChangeSubscriptionId: MultiEvent.SubscriptionId | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        contentNgService: ContentNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
    ) {
        super(elRef, ++LitIvemIdListEditorNgComponent.typeInstanceCreateCount);

        const commandRegisterService = commandRegisterNgService.service;

        this._addLitIvemIdUiAction = this.createAddLitIvemIdUiAction();
        this._selectAllUiAction = this.createSelectAllUiAction(commandRegisterService);
        this._deleteSelectedUiAction = this.createDeleteSelectedUiAction(commandRegisterService);
        this._columnsUiAction = this.createColumnsUiAction(commandRegisterService);
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
        this._deleteSelectedUiAction.pushValue(undefined);
        this._filterUiAction.pushValue(undefined);
        this.list.clear();
    }

    cancelAllControlsEdited() {
        this._addLitIvemIdUiAction.cancelEdit();
        this._selectAllUiAction.cancelEdit();
        this._deleteSelectedUiAction.cancelEdit();
        this._columnsUiAction.cancelEdit();
        this._filterUiAction.cancelEdit();
    }

    subscribeListChangeEvent(handler: LitIvemIdListEditorNgComponent.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    private finalise() {
        this.list.unsubscribeListChangeEvent(this._listChangeSubscriptionId);
        this._listChangeSubscriptionId = undefined;

        this._addLitIvemIdUiAction.finalise();
        this._selectAllUiAction.finalise();
        this._deleteSelectedUiAction.finalise();
        this._columnsUiAction.finalise();
        this._filterUiAction.finalise();
    }

    private initialiseComponents() {
        this._addLitIvemIdControlComponent.initialise(this._addLitIvemIdUiAction);
        this._selectAllControlComponent.initialise(this._selectAllUiAction);
        this._deleteSelectedControlComponent.initialise(this._deleteSelectedUiAction);
        this._columnsControlComponent.initialise(this._columnsUiAction);
        this._filterControlComponent.initialise(this._filterUiAction);

        this._listChangeSubscriptionId = this.list.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => {
                this.updateControlsEnabled();
                this.notifyListChange(listChangeTypeId, index, count);
            }
        );
        const initialisePromise = this._litIvemIdListComponent.initialise(this._opener, undefined, false, this.list);
        initialisePromise.then(
            (gridSourceOrReference) => {
                if (gridSourceOrReference === undefined) {
                    throw new AssertInternalError('LIILENCICU56569');
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'LIILENCICE56569') }
        );
    }

    private createAddLitIvemIdUiAction() {
        const action = new LitIvemIdUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SymbolInputTitle]);
        action.commitEvent = (typeId) => {
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
            this._litIvemIdListComponent.selectAll();
        };
        return action;
    }

    private createDeleteSelectedUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.Grid_Remove;
        const displayId = StringId.GridLayoutEditor_RemoveCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.GridLayoutEditor_RemoveTitle]);
        action.pushIcon(IconButtonUiAction.IconId.RemoveFromListToLeft);
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
        action.signalEvent = () => { this.editGridColumns(); };
        return action;
    }

    private createFilterUiAction() {
        const action = new StringUiAction();
        action.pushTitle(Strings[StringId.Filter]);
        action.pushPlaceholder(Strings[StringId.Filter]);
        action.commitEvent = () => {
            this._litIvemIdListComponent.filterText = action.definedValue;
        }
        return action;
    }

    private editGridColumns() {
        if (this.editGridColumnsEventer !== undefined) {
            const allowedFieldsAndLayoutDefinition = this._litIvemIdListComponent.createAllowedFieldsGridLayoutDefinition();
            const promise = this.editGridColumnsEventer(allowedFieldsAndLayoutDefinition);
            promise.then(
                (layoutOrReferenceDefinition) => {
                    if (layoutOrReferenceDefinition !== undefined) {
                        this._litIvemIdListComponent.openGridLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                    }
                },
                (reason) => {
                    throw new AssertInternalError('LIIENCHLGCUASEE56668', getErrorMessage(reason));
                }
            )
        }
    }

    private updateControlsEnabled() {
        if (this._enabled) {
            this._addLitIvemIdUiAction.pushValidOrMissing();
            this._deleteSelectedUiAction.pushValidOrMissing();
            this._filterUiAction.pushValidOrMissing();
            if (this.list.count > 0) {
                this._selectAllUiAction.pushValidOrMissing();
            } else {
                this._selectAllUiAction.pushDisabled();
            }
    } else {
            this._addLitIvemIdUiAction.pushDisabled();
            this._selectAllUiAction.pushDisabled();
            this._deleteSelectedUiAction.pushDisabled();
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

export namespace LitIvemIdListEditorNgComponent {
    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer, ui: boolean) => void;
    export type EditGridColumnsEventer = (this: void, allowedFieldsAndLayoutDefinition: AllowedFieldsGridLayoutDefinition) => Promise<GridLayoutOrReferenceDefinition | undefined>;
}
