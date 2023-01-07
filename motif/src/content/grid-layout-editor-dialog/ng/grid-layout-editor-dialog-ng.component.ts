/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    assert,
    CommandRegisterService,
    delay1Tick, GridLayoutDefinition, IconButtonUiAction,
    InternalCommand,
    StringId
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { RecordGrid } from '../../adapted-revgrid/internal-api';
import { GridLayoutEditorNgComponent } from '../../grid-layout-editor/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-grid-layout-editor-dialog',
    templateUrl: './grid-layout-editor-dialog-ng.component.html',
    styleUrls: ['./grid-layout-editor-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutEditorDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @ViewChild('editor', { static: true }) private _editorComponent: GridLayoutEditorNgComponent;
    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;

    public caption = 'Grid Columns';

    private _commandRegisterService: CommandRegisterService;

    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _closeResolve: (value: GridLayoutDefinition | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor(
        private _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
    ) {
        super();

        this._commandRegisterService = commandRegisterNgService.service;
        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialiseComponents());
    }

    ngOnDestroy() {
        this._okUiAction.finalise();
        this._cancelUiAction.finalise();
    }

    open(allowedFieldsAndLayoutDefinition: RecordGrid.AllowedFieldsAndLayoutDefinition): GridLayoutEditorDialogNgComponent.ClosePromise {
        this._editorComponent.setAllowedFieldsAndLayoutDefinition(allowedFieldsAndLayoutDefinition);

        return new Promise<GridLayoutDefinition | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    private handleOkSignal() {
        this.close(true);
    }

    private handleCancelSignal() {
        this.close(false);
    }

    private createOkUiAction() {
        const commandName = InternalCommand.Id.ContentGridLayoutEditor_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = () => this.handleOkSignal();
        return action;
    }

    private createCancelUiAction() {
        const commandName = InternalCommand.Id.ContentGridLayoutEditor_Cancel;
        const displayId = StringId.Cancel;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnCancel);
        action.signalEvent = () => this.handleCancelSignal();
        return action;
    }

    private initialiseComponents() {
        this._okButtonComponent.initialise(this._okUiAction);
        this._cancelButtonComponent.initialise(this._cancelUiAction);
    }

    private close(ok: boolean) {
        if (ok) {
            this._closeResolve(this._editorComponent.getGridLayoutDefinition());
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace GridLayoutEditorDialogNgComponent {
    export type ClosePromise = Promise<GridLayoutDefinition | undefined>;

    export function open(
        container: ViewContainerRef,
        allowedFieldsAndLayoutDefinition: RecordGrid.AllowedFieldsAndLayoutDefinition,
    ): ClosePromise {
        container.clear();
        const componentRef = container.createComponent(GridLayoutEditorDialogNgComponent);
        assert(componentRef.instance instanceof GridLayoutEditorDialogNgComponent, 'ID:157271511202');

        const component = componentRef.instance as GridLayoutEditorDialogNgComponent;

        return component.open(allowedFieldsAndLayoutDefinition);
    }
}
