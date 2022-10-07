/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import {
    CommandRegisterService,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings,
    UnreachableCaseError
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-expandable-collapsible-lined-heading-ng',
    templateUrl: './expandable-collapsible-lined-heading-ng.component.html',
    styleUrls: ['./expandable-collapsible-lined-heading-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpandableCollapsibleLinedHeadingNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @Input() public headingText: string;
    @ViewChild('expandButton', { static: true }) private _expandButtonComponent: SvgButtonNgComponent;
    @ViewChild('restoreButton', { static: true }) private _restoreButtonComponent: SvgButtonNgComponent;
    @ViewChild('collapseButton', { static: true }) private _collapseButtonComponent: SvgButtonNgComponent;

    expandEventer: ExpandableCollapsibleLinedHeadingNgComponent.ExpandEventer;
    restoreEventer: ExpandableCollapsibleLinedHeadingNgComponent.RestoreEventer;
    collapseEventer: ExpandableCollapsibleLinedHeadingNgComponent.CollapseEventer;

    private readonly _commandRegisterService: CommandRegisterService;

    private readonly _expandUiAction: IconButtonUiAction;
    private readonly _restoreUiAction: IconButtonUiAction;
    private readonly _collapseUiAction: IconButtonUiAction;

    private _stateId: ExpandableCollapsibleLinedHeadingNgComponent.StateId;

    constructor(commandRegisterNgService: CommandRegisterNgService) {
        super();

        this._commandRegisterService = commandRegisterNgService.service;

        this._expandUiAction = this.createExpandUiAction();
        this._restoreUiAction = this.createRestoreUiAction();
        this._collapseUiAction = this.createCollapseUiAction();
    }

    get stateId() { return this._stateId; }
    set stateId(value: ExpandableCollapsibleLinedHeadingNgComponent.StateId) {
        this._stateId = value;
        switch (value) {
            case ExpandableCollapsibleLinedHeadingNgComponent.StateId.Expanded: {
                this._expandUiAction.pushDisabled();
                this._restoreUiAction.pushValid();
                this._collapseUiAction.pushValid();
                break;
            }
            case ExpandableCollapsibleLinedHeadingNgComponent.StateId.Restored: {
                this._expandUiAction.pushValid();
                this._restoreUiAction.pushDisabled();
                this._collapseUiAction.pushValid();
                break;
            }
            case ExpandableCollapsibleLinedHeadingNgComponent.StateId.Collapsed: {
                this._expandUiAction.pushValid();
                this._restoreUiAction.pushValid();
                this._collapseUiAction.pushDisabled();
                break;
            }
            default:
                throw new UnreachableCaseError('ECLHNCSSID11109', value);
        }
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this.initialiseComponents();
    }

    private createExpandUiAction() {
        const commandName = InternalCommand.Id.ExpandSection;
        const displayId = StringId.Expand;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ExpandSection]);
        action.pushIcon(IconButtonUiAction.IconId.ExpandVertically);
        action.pushUnselected();
        action.signalEvent = () => this.expandEventer();
        return action;
    }

    private createRestoreUiAction() {
        const commandName = InternalCommand.Id.RestoreSection;
        const displayId = StringId.Restore;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.RestoreSection]);
        action.pushIcon(IconButtonUiAction.IconId.RestoreVertically);
        action.pushUnselected();
        action.signalEvent = () => this.restoreEventer();
        return action;
    }

    private createCollapseUiAction() {
        const commandName = InternalCommand.Id.CollapseSection;
        const displayId = StringId.Collapse;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.CollapseSection]);
        action.pushIcon(IconButtonUiAction.IconId.CollapseVertically);
        action.pushUnselected();
        action.signalEvent = () => this.collapseEventer();
        return action;
    }

    private initialiseComponents() {
        this._expandButtonComponent.initialise(this._expandUiAction);
        this._restoreButtonComponent.initialise(this._restoreUiAction);
        this._collapseButtonComponent.initialise(this._collapseUiAction);
    }

    private finalise() {
        this._expandUiAction.finalise();
        this._restoreUiAction.finalise();
        this._collapseUiAction.finalise();
    }
}

export namespace ExpandableCollapsibleLinedHeadingNgComponent {
    export const enum StateId {
        Expanded,
        Restored,
        Collapsed,
    }

    export type ExpandEventer = (this: void) => void;
    export type RestoreEventer = (this: void) => void;
    export type CollapseEventer = (this: void) => void;
}
