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
    InjectionToken,
    Injector,
    OnDestroy,
    Self,
    ValueProvider,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    AllowedFieldsGridLayoutDefinition,
    CommandRegisterService,
    EditableGridLayoutDefinitionColumnList,
    GridField,
    GridLayoutOrNamedReferenceDefinition,
    IconButtonUiAction,
    InternalCommand,
    LockOpenListItem,
    StringId,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { GridLayoutEditorNgComponent, allowedFieldsInjectionToken, definitionColumnListInjectionToken, oldLayoutDefinitionInjectionToken } from '../../grid-layout-dialog/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-nameable-grid-layout-editor-dialog',
    templateUrl: './nameable-grid-layout-editor-dialog-ng.component.html',
    styleUrls: ['./nameable-grid-layout-editor-dialog-ng.component.scss'],
    providers: [ { provide: definitionColumnListInjectionToken, useClass: EditableGridLayoutDefinitionColumnList}],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NameableGridLayoutEditorDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('editor', { static: true }) private _editorComponent: GridLayoutEditorNgComponent;
    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;

    private _commandRegisterService: CommandRegisterService;

    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _closeResolve: (value: GridLayoutOrNamedReferenceDefinition | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor(
        elRef: ElementRef<HTMLElement>,
        commandRegisterNgService: CommandRegisterNgService,
        @Inject(NameableGridLayoutEditorDialogNgComponent.captionInjectionToken) public readonly caption: string,
        @Inject(allowedFieldsInjectionToken) _allowedFields: readonly GridField[],
        @Inject(oldLayoutDefinitionInjectionToken) _oldLayoutDefinition: AllowedFieldsGridLayoutDefinition,
        @Self() @Inject(definitionColumnListInjectionToken) private readonly _definitionColumnList: EditableGridLayoutDefinitionColumnList,
    ) {
        super(elRef, ++NameableGridLayoutEditorDialogNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;
        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();

        this._definitionColumnList.load(_allowedFields, _oldLayoutDefinition, _oldLayoutDefinition.fixedColumnCount);
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialiseComponents());
    }

    ngOnDestroy() {
        this._okUiAction.finalise();
        this._cancelUiAction.finalise();
    }

    open(): NameableGridLayoutEditorDialogNgComponent.ClosePromise {
        return new Promise<GridLayoutOrNamedReferenceDefinition | undefined>((resolve) => {
            this._closeResolve = resolve;
        });
    }

    private handleOkSignal() {
        this.close(true);
    }

    private handleCancelSignal() {
        this.close(false);
    }

    private createOkUiAction() {
        const commandName = InternalCommand.Id.GridLayoutDialog_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = () => this.handleOkSignal();
        return action;
    }

    private createCancelUiAction() {
        const commandName = InternalCommand.Id.GridLayoutDialog_Cancel;
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
            const gridLayoutDefinition = this._editorComponent.getGridLayoutDefinition();
            const gridLayoutOrNamedReferenceDefinition = new GridLayoutOrNamedReferenceDefinition(gridLayoutDefinition);
            this._closeResolve(gridLayoutOrNamedReferenceDefinition);
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace NameableGridLayoutEditorDialogNgComponent {
    export type ClosePromise = Promise<GridLayoutOrNamedReferenceDefinition | undefined>;
    export const captionInjectionToken = new InjectionToken<string>('NameableGridLayoutEditorDialogNgComponent.Caption');

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
        allowedFieldsGridLayoutDefinition: AllowedFieldsGridLayoutDefinition,
    ): ClosePromise {
        container.clear();

        const openerProvider: ValueProvider = {
            provide: CoreInjectionTokens.lockOpenListItemOpener,
            useValue: opener,
        };
        const captionProvider: ValueProvider = {
            provide: captionInjectionToken,
            useValue: caption,
        }
        const allowedFieldsProvider: ValueProvider = {
            provide: allowedFieldsInjectionToken,
            useValue: allowedFieldsGridLayoutDefinition.allowedFields,
        };
        const oldLayoutDefinitionProvider: ValueProvider = {
            provide: oldLayoutDefinitionInjectionToken,
            useValue: allowedFieldsGridLayoutDefinition,
        };
        const injector = Injector.create({
            providers: [openerProvider, captionProvider, allowedFieldsProvider, oldLayoutDefinitionProvider],
        });

        const componentRef = container.createComponent(NameableGridLayoutEditorDialogNgComponent, { injector });
        const component = componentRef.instance;

        return component.open();
    }
}
