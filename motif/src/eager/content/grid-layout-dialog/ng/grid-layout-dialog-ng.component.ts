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
    IconButtonUiAction,
    InternalCommand,
    LockOpenListItem,
    StringId,
    delay1Tick
} from '@motifmarkets/motif-core';
import { RevGridLayoutDefinition } from '@xilytix/rev-data-source';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { GridLayoutEditorNgComponent } from '../editor/ng-api';
import { allowedFieldsInjectionToken, definitionColumnListInjectionToken, oldLayoutDefinitionInjectionToken } from './grid-layout-dialog-ng-injection-tokens';

@Component({
    selector: 'app-grid-layout-dialog',
    templateUrl: './grid-layout-dialog-ng.component.html',
    styleUrls: ['./grid-layout-dialog-ng.component.scss'],
    providers: [ { provide: definitionColumnListInjectionToken, useClass: EditableGridLayoutDefinitionColumnList}],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridLayoutDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('subDialog', { static: true, read: ViewContainerRef }) private _subDialogContainer: ViewContainerRef;
    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;

    private _commandRegisterService: CommandRegisterService;

    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _editor: GridLayoutEditorNgComponent;

    private _closeResolve: (value: RevGridLayoutDefinition | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
        @Inject(allowedFieldsInjectionToken) allowedFields: readonly GridField[],
        @Inject(GridLayoutDialogNgComponent.captionInjectionToken) public readonly caption: string,
        @Inject(oldLayoutDefinitionInjectionToken) private readonly _oldLayoutDefinition: AllowedFieldsGridLayoutDefinition,
        @Self() @Inject(definitionColumnListInjectionToken) private readonly _definitionColumnList: EditableGridLayoutDefinitionColumnList,
    ) {
        super(elRef, ++GridLayoutDialogNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;
        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();

        this._definitionColumnList.load(allowedFields, this._oldLayoutDefinition, this._oldLayoutDefinition.fixedColumnCount);
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    ngOnDestroy() {
        this._okUiAction.finalise();
        this._cancelUiAction.finalise();
    }

    waitClose(): GridLayoutDialogNgComponent.ClosePromise {
        return new Promise<RevGridLayoutDefinition | undefined>((resolve, reject) => {
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

    private initialise() {
        this._okButtonComponent.initialise(this._okUiAction);
        this._cancelButtonComponent.initialise(this._cancelUiAction);
        this.showEditor();
    }

    private close(ok: boolean) {
        if (ok) {
            this._closeResolve(this._editor.getGridLayoutDefinition());
        } else {
            this._closeResolve(undefined);
        }
    }

    private showEditor() {
        this._subDialogContainer.clear();
        this._editor = GridLayoutEditorNgComponent.create(this._subDialogContainer);
    }
}

export namespace GridLayoutDialogNgComponent {
    export type ClosePromise = Promise<RevGridLayoutDefinition | undefined>;
    export const captionInjectionToken = new InjectionToken<string>('GridLayoutDialogNgComponent.Caption');

    export function create(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
        allowedFieldsGridLayoutDefinition: AllowedFieldsGridLayoutDefinition,
    ): GridLayoutDialogNgComponent {
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

        const componentRef = container.createComponent(GridLayoutDialogNgComponent, { injector });
        const component = componentRef.instance;

        return component;
    }
}
