/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
    ComponentFactoryResolver, OnDestroy, ViewChild,
    ViewContainerRef
} from '@angular/core';
import { CommandRegisterNgService } from 'src/component-services/ng-api';
import { GridLayout, MotifGrid } from 'src/content/internal-api';
import { SvgButtonNgComponent } from 'src/controls/ng-api';
import { CommandRegisterService, IconButtonUiAction, InternalCommand } from 'src/core/internal-api';
import { StringId } from 'src/res/internal-api';
import { assert, delay1Tick } from 'src/sys/internal-api';
import { GridLayoutEditorNgComponent } from '../../grid-layout-editor/ng-api';

@Component({
    selector: 'app-content-grid-layout-editor',
    templateUrl: './content-grid-layout-editor-ng.component.html',
    styleUrls: ['./content-grid-layout-editor-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentGridLayoutEditorNgComponent implements AfterViewInit, OnDestroy {
    @ViewChild('editor', { static: true }) private _editorComponent: GridLayoutEditorNgComponent;
    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;

    public caption = 'Grid Columns';

    private _commandRegisterService: CommandRegisterService;

    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _closeResolve: (value: GridLayout | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor(
        private _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
    ) {
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

    open(layoutWithHeadersMap: MotifGrid.LayoutWithHeadersMap): ContentGridLayoutEditorNgComponent.ClosePromise {
        this._editorComponent.setGridLayout(layoutWithHeadersMap);

        return new Promise<GridLayout | undefined>((resolve, reject) => {
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
        const commandName = InternalCommand.Name.ContentGridLayoutEditor_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = () => this.handleOkSignal();
        return action;
    }

    private createCancelUiAction() {
        const commandName = InternalCommand.Name.ContentGridLayoutEditor_Cancel;
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
            this._closeResolve(this._editorComponent.getGridLayout());
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace ContentGridLayoutEditorNgComponent {
    export type ClosePromise = Promise<GridLayout | undefined>;

    export function open(
        container: ViewContainerRef,
        resolver: ComponentFactoryResolver,
        layoutWithHeadersMap: MotifGrid.LayoutWithHeadersMap,
    ): ClosePromise {
        container.clear();
        const factory = resolver.resolveComponentFactory(ContentGridLayoutEditorNgComponent);
        const componentRef = container.createComponent(factory);
        assert(componentRef.instance instanceof ContentGridLayoutEditorNgComponent, 'ID:157271511202');

        const component = componentRef.instance as ContentGridLayoutEditorNgComponent;

        return component.open(layoutWithHeadersMap);
    }
}
