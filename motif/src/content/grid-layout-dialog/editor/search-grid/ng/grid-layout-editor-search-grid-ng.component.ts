/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
    CommandRegisterService,
    IconButtonUiAction,
    InternalCommand,
    ModifierKey,
    StringId,
    StringUiAction,
    Strings,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from '../../../../../component-services/ng-api';
import { SvgButtonNgComponent, TextInputNgComponent } from '../../../../../controls/ng-api';
import { ContentComponentBaseNgDirective } from '../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-grid-layout-editor-search-grid',
    templateUrl: './grid-layout-editor-search-grid-ng.component.html',
    styleUrls: ['./grid-layout-editor-search-grid-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorSearchGridNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('searchInput', { static: true }) private _searchInputComponent: TextInputNgComponent;
    @ViewChild('searchNextButton', { static: true }) private _searchNextButtonComponent: SvgButtonNgComponent;
    @ViewChild('selectAllButton', { static: true }) private _selectAllButtonComponent: SvgButtonNgComponent;

    searchTextChangedEventer: GridLayoutEditorSearchGridNgComponent.SearchTextChangedEventer | undefined;
    searchNextEventer: GridLayoutEditorSearchGridNgComponent.SearchNextEventer | undefined;
    selectAllEventer: GridLayoutEditorSearchGridNgComponent.SelectAllEventer | undefined;

    private readonly _commandRegisterService: CommandRegisterService;

    private readonly _searchEditUiAction: StringUiAction;
    private readonly _searchNextUiAction: IconButtonUiAction;
    private readonly _selectAllUiAction: IconButtonUiAction;

    private _searchEnabled = true;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
    ) {
        super(elRef, ++GridLayoutEditorSearchGridNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._selectAllUiAction = this.createSelectAllUiAction();
        this._searchNextUiAction = this.createSearchNextUiAction();
        this._searchEditUiAction = this.createSearchEditUiAction();
    }

    get searchEnabled() { return this._searchEnabled; }
    set searchEnabled(value: boolean) {
        if (value !== this._searchEnabled) {
            this._searchEnabled = value;
            this.resolveSearchEnabled();
        }
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    ngOnDestroy() {
        this._searchEditUiAction.finalise();
        this._searchNextUiAction.finalise();
        this._selectAllUiAction.finalise();
    }

    private createSearchEditUiAction() {
        const action = new StringUiAction(false);
        action.pushPlaceholder(Strings[StringId.Search]);
        action.pushTitle(Strings[StringId.Grid_SearchInputTitle]);
        action.inputEvent = () => {
            this.resolveSearchEnabled();
            if (this.searchTextChangedEventer !== undefined) {
                this.searchTextChangedEventer(this._searchEditUiAction.inputtedText);
            }
        };
        return action;
    }

    private createSearchNextUiAction() {
        const commandName = InternalCommand.Id.Grid_SearchNext;
        const displayId = StringId.Grid_SearchNextCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Grid_SearchNextTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SearchNext);
        action.signalEvent = (_signalTypeId, downKeys) => {
            const searchText = this._searchEditUiAction.inputtedText;
            if (this.searchNextEventer !== undefined && searchText.length > 0) {
                this.searchNextEventer(searchText, downKeys);
            }
        };
        return action;
    }

    private createSelectAllUiAction() {
        const commandName = InternalCommand.Id.Grid_SelectAll;
        const displayId = StringId.Grid_SelectAllCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.Grid_SelectAllTitle]);
        action.pushIcon(IconButtonUiAction.IconId.MarkAll);
        action.signalEvent = (downKeys) => {
            if (this.selectAllEventer !== undefined) {
                this.selectAllEventer(downKeys);
            }
        };
        return action;
    }

    private initialise() {
        this._searchNextButtonComponent.initialise(this._searchNextUiAction);
        this._searchInputComponent.initialise(this._searchEditUiAction);
        this._selectAllButtonComponent.initialise(this._selectAllUiAction);

        this._cdr.markForCheck();
    }

    private resolveSearchEnabled() {
        if (!this._searchEnabled || this._searchEditUiAction.inputtedText === '') {
            this._searchNextUiAction.pushDisabled();
        } else {
            this._searchNextUiAction.pushUnselected();
        }
    }
}

export namespace GridLayoutEditorSearchGridNgComponent {
    export type SearchTextChangedEventer = (searchText: string) => void;
    export type SearchNextEventer = (searchText: string, downKeys: ModifierKey.IdSet) => void;
    export type SelectAllEventer = (downKeys: ModifierKey.IdSet) => void;
}
