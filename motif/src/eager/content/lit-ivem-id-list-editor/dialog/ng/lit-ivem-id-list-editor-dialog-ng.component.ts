import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, InjectionToken, Injector, Optional, ValueProvider, ViewChild, ViewContainerRef } from '@angular/core';
import { AllowedFieldsGridLayoutDefinition, AssertInternalError, BadnessComparableList, CommandRegisterService, GridLayoutOrReferenceDefinition, IconButtonUiAction, InternalCommand, LitIvemId, LockOpenListItem, StringId, getErrorMessage } from '@motifmarkets/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { NameableGridLayoutEditorDialogNgComponent } from '../../../nameable-grid-layout-editor-dialog/ng-api';
import { LitIvemIdListEditorNgDirective } from '../../ng/lit-ivem-id-list-editor-ng.directive';

@Component({
    selector: 'app-lit-ivem-id-list-editor-dialog',
    templateUrl: './lit-ivem-id-list-editor-dialog-ng.component.html',
    styleUrls: ['./lit-ivem-id-list-editor-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LitIvemIdListEditorDialogNgComponent extends LitIvemIdListEditorNgDirective {
    private static typeInstanceCreateCount = 0;

    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('dialogContainer', { read: ViewContainerRef, static: true }) private _dialogContainer: ViewContainerRef;

    public dialogActive = false;

    private readonly _okUiAction: IconButtonUiAction;

    private _columnsEditCaption: string;
    private _closeResolve: LitIvemIdListEditorDialogNgComponent.CloseResolve;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) opener: LockOpenListItem.Opener,
        @Inject(LitIvemIdListEditorDialogNgComponent.captionInjectionToken) public readonly caption: string,
        @Optional() @Inject(LitIvemIdListEditorNgDirective.listInjectionToken) list: BadnessComparableList<LitIvemId> | null,
    ) {
        super(elRef, cdr, commandRegisterNgService, ++LitIvemIdListEditorDialogNgComponent.typeInstanceCreateCount, opener, list);

        const commandRegisterService = commandRegisterNgService.service;
        this._okUiAction = this.createOkUiAction(commandRegisterService);
    }

    open(columnsEditCaption: string): LitIvemIdListEditorDialogNgComponent.ClosePromise {
        this._columnsEditCaption = columnsEditCaption;
        return new Promise<void>((resolve) => {
            this._closeResolve = resolve;
        });
    }

    protected override initialiseComponents() {
        super.initialiseComponents();
        this._okButtonComponent.initialise(this._okUiAction);
    }

    protected override finalise() {
        this._okUiAction.finalise();
        super.finalise();
    }

    protected override editGridColumns(allowedFieldsAndLayoutDefinition: AllowedFieldsGridLayoutDefinition) {
        this.dialogActive = true;

        // We cannot just return the promise from the dialog as we need to close the dialog as well.
        // So return a separate promise which is resolved when dialog is closed.
        let definitonResolveFtn: (this: void, definition: GridLayoutOrReferenceDefinition | undefined) => void;

        const definitionPromise = new Promise<GridLayoutOrReferenceDefinition | undefined>(
            (resolve) => {
                definitonResolveFtn = resolve;
            }
        )

        this.enabled = false;

        const closePromise = NameableGridLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this.opener,
            this._columnsEditCaption,
            allowedFieldsAndLayoutDefinition,
        );
        closePromise.then(
            (definition) => {
                definitonResolveFtn(definition);
                this.closeDialog();
                this.enabled = true;
            },
            (reason) => {
                throw new AssertInternalError('LIILEDNCEGC50987', getErrorMessage(reason));
            }
        );

        this._cdr.markForCheck();

        return definitionPromise;
    }

    private createOkUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.GridLayoutDialog_Ok;
        const displayId = StringId.Ok;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = () => {
            this.close(true);
        }
        return action;
    }

    private close(ok: boolean) {
        if (ok) {
            this._closeResolve();
        } else {
            this._closeResolve();
        }
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this.dialogActive = false;
        this._cdr.markForCheck();
    }
}

export namespace LitIvemIdListEditorDialogNgComponent {
    export type ClosePromise = Promise<void>;
    export type CloseResolve = (this: void) => void;
    export const captionInjectionToken = new InjectionToken<string>('LitIvemIdListEditorDialogNgComponent.Caption');

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
        list: BadnessComparableList<LitIvemId>,
        columnsEditCaption: string,
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
        const listProvider: ValueProvider = {
            provide: LitIvemIdListEditorNgDirective.listInjectionToken,
            useValue: list,
        }
        const injector = Injector.create({
            providers: [openerProvider, captionProvider, listProvider],
        });

        const componentRef = container.createComponent(LitIvemIdListEditorDialogNgComponent, { injector });
        const component = componentRef.instance;

        return component.open(columnsEditCaption);
    }
}
