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
    ValueProvider,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    AllowedGridField,
    AssertInternalError,
    CommandRegisterService,
    EditableGridLayoutDefinitionColumnList,
    GridField,
    IconButtonUiAction,
    InternalCommand,
    LockOpenListItem,
    ModifierKey,
    RevGridLayoutDefinition,
    StringId,
    Strings,
    UiAction,
    UnreachableCaseError,
    delay1Tick
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { SvgButtonNgComponent, TabListNgComponent } from 'controls-ng-api';
import { HoldingsDitemFrame } from 'ditem-internal-api';
import { GridLayoutEditorNgComponent, allowedFieldsInjectionToken, definitionColumnListInjectionToken } from '../../grid-layout-dialog/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-holdings-grid-layouts-dialog',
    templateUrl: './holdings-grid-layouts-dialog-ng.component.html',
    styleUrls: ['./holdings-grid-layouts-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingsGridLayoutsDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;
    @ViewChild('tabList', { static: true }) private _tabListComponent: TabListNgComponent;
    @ViewChild('editorContainer', { read: ViewContainerRef, static: true }) private _editorContainer: ViewContainerRef;

    private _commandRegisterService: CommandRegisterService;

    private _depthBidAllowedFields: readonly GridField[];
    private _depthAskAllowedFields: readonly GridField[];
    private _holdingsAllowedFields: readonly GridField[];
    private _balancesAllowedFields: readonly GridField[];

    private _depthBidLayoutDefinition: RevGridLayoutDefinition;
    private _depthAskLayoutDefinition: RevGridLayoutDefinition;
    private _holdingsLayoutDefinition: RevGridLayoutDefinition;
    private _balancesLayoutDefinition: RevGridLayoutDefinition;

    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _activeSubFrameId: HoldingsGridLayoutsDialogNgComponent.SubFrameId | undefined;
    private _editorComponent: GridLayoutEditorNgComponent | undefined;

    private _closeResolve: (value: HoldingsDitemFrame.GridLayoutDefinitions | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
        @Inject(HoldingsGridLayoutsDialogNgComponent.captionInjectionToken) public readonly caption: string,
        @Inject(HoldingsGridLayoutsDialogNgComponent.holdingsAllowedFieldsInjectionToken) allowedFields: HoldingsDitemFrame.AllowedGridFields,
        @Inject(HoldingsGridLayoutsDialogNgComponent.oldHoldingsGridLayoutDefinitionsInjectionToken) oldLayoutDefinitions: HoldingsDitemFrame.GridLayoutDefinitions,
    ) {
        super(elRef, ++HoldingsGridLayoutsDialogNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();

        this._holdingsAllowedFields = allowedFields.holdings;
        this._balancesAllowedFields = allowedFields.balances;

        this._holdingsLayoutDefinition = oldLayoutDefinitions.holdings.createCopy();
        this._balancesLayoutDefinition = oldLayoutDefinitions.balances.createCopy();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialiseComponents());
    }

    ngOnDestroy() {
        this._okUiAction.finalise();
        this._cancelUiAction.finalise();
    }

    open() {
        return new Promise<HoldingsDitemFrame.GridLayoutDefinitions | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    setSubFrameId(value: HoldingsGridLayoutsDialogNgComponent.SubFrameId) {
        this.checkLoadLayoutFromEditor();

        if (value !== this._activeSubFrameId) {
            switch (value) {
                case HoldingsGridLayoutsDialogNgComponent.SubFrameId.Holdings:
                    this._editorComponent = this.recreateEditor(this._holdingsAllowedFields, this._holdingsLayoutDefinition);
                    break;

                case HoldingsGridLayoutsDialogNgComponent.SubFrameId.Balances:
                    this._editorComponent = this.recreateEditor(this._balancesAllowedFields, this._balancesLayoutDefinition);
                    break;

                case undefined:
                    throw new AssertInternalError('PGLECCULFEU33333');

                default:
                    throw new UnreachableCaseError('PGLECCULFED33333', value);
            }

            this._activeSubFrameId = value;
            this._cdr.markForCheck();
        }
    }

    private handleOkSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.close(true);
    }

    private handleCancelSignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.close(false);
    }

    private handleActiveTabChangedEvent(tab: TabListNgComponent.Tab, subFrameId: HoldingsGridLayoutsDialogNgComponent.SubFrameId) {
        if (tab.active) {
            this.setSubFrameId(subFrameId);
        }
    }

    private createOkUiAction() {
        const commandName = InternalCommand.Id.PariDepthGridsLayoutEditor_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = (signalTypeId, downKeys) => this.handleOkSignal(signalTypeId, downKeys);
        return action;
    }

    private createCancelUiAction() {
        const commandName = InternalCommand.Id.PariDepthGridsLayoutEditor_Cancel;
        const displayId = StringId.Cancel;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnCancel);
        action.signalEvent = (signalTypeId, downKeys) => this.handleCancelSignal(signalTypeId, downKeys);
        return action;
    }

    private initialiseComponents() {
        this._okButtonComponent.initialise(this._okUiAction);
        this._cancelButtonComponent.initialise(this._cancelUiAction);

        const tabDefinitions: TabListNgComponent.TabDefinition[] = [
            {
                caption: Strings[StringId.Holdings],
                initialActive: true,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, HoldingsGridLayoutsDialogNgComponent.SubFrameId.Holdings),
            },
            {
                caption: Strings[StringId.Balances],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, HoldingsGridLayoutsDialogNgComponent.SubFrameId.Balances),
            },
        ];
        this._tabListComponent.setTabs(tabDefinitions);

        this.setSubFrameId(HoldingsGridLayoutsDialogNgComponent.SubFrameId.Holdings);
    }

    private recreateEditor(allowedFields: readonly AllowedGridField[], layoutDefinition: RevGridLayoutDefinition) {
        this.checkLoadLayoutFromEditor();

        if (this._editorComponent !== undefined) {
            this._editorContainer.clear();
        }

        const openerProvider: ValueProvider = {
            provide: CoreInjectionTokens.lockOpenListItemOpener,
            useValue: this._opener,
        };
        const allowedFieldsProvider: ValueProvider = {
            provide: allowedFieldsInjectionToken,
            useValue: allowedFields,
        };

        const definitionColumnList = new EditableGridLayoutDefinitionColumnList();
        definitionColumnList.load(allowedFields, layoutDefinition, 0);
        const columnListProvider: ValueProvider = {
            provide: definitionColumnListInjectionToken,
            useValue: definitionColumnList,
        };

        const injector = Injector.create({
            providers: [openerProvider, allowedFieldsProvider, columnListProvider],
        });

        const componentRef = this._editorContainer.createComponent(GridLayoutEditorNgComponent, { injector });
        const component = componentRef.instance;

        return component;
    }

    private checkLoadLayoutFromEditor() {
        const activeSubFrameId = this._activeSubFrameId;
        if (activeSubFrameId !== undefined) {
            const editorComponent = this._editorComponent;
            if (editorComponent === undefined) {
                throw new AssertInternalError('PGLEDNCCLLFEE33333');
            } else {
                switch (activeSubFrameId) {
                    case HoldingsGridLayoutsDialogNgComponent.SubFrameId.Holdings:
                        this._holdingsLayoutDefinition = editorComponent.getGridLayoutDefinition();
                        break;

                    case HoldingsGridLayoutsDialogNgComponent.SubFrameId.Balances:
                        this._balancesLayoutDefinition = editorComponent.getGridLayoutDefinition();
                        break;

                    default:
                        throw new UnreachableCaseError('PGLECCULFEU33333', activeSubFrameId);
                }
            }
        }
    }

    private close(ok: boolean) {
        if (ok) {
            this.checkLoadLayoutFromEditor();
            const layouts: HoldingsDitemFrame.GridLayoutDefinitions = {
                holdings: this._holdingsLayoutDefinition,
                balances: this._balancesLayoutDefinition,
            };
            this._closeResolve(layouts);
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace HoldingsGridLayoutsDialogNgComponent {
    export const enum SubFrameId {
        Holdings,
        Balances,
    }

    export type ClosePromise = Promise<HoldingsDitemFrame.GridLayoutDefinitions | undefined>;

    export const captionInjectionToken = new InjectionToken<string>('HoldingsGridLayoutsDialogNgComponent.caption');
    export const holdingsAllowedFieldsInjectionToken = new InjectionToken<HoldingsDitemFrame.AllowedGridFields>('HoldingsGridLayoutsDialogNgComponent.allowedFields');
    export const oldHoldingsGridLayoutDefinitionsInjectionToken = new InjectionToken<HoldingsDitemFrame.GridLayoutDefinitions>('HoldingsGridLayoutsDialogNgComponent.allowedFields');

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
        allowedFieldsAndLayoutDefinition: HoldingsDitemFrame.AllowedFieldsAndLayoutDefinitions
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
        const allowedFields: HoldingsDitemFrame.AllowedGridFields = {
            holdings: allowedFieldsAndLayoutDefinition.holdings.allowedFields,
            balances: allowedFieldsAndLayoutDefinition.balances.allowedFields,
        };

        const gridLayoutDefinitions: HoldingsDitemFrame.GridLayoutDefinitions = {
            holdings: allowedFieldsAndLayoutDefinition.holdings,
            balances: allowedFieldsAndLayoutDefinition.balances,
        };

        const allowedFieldsProvider: ValueProvider = {
            provide: holdingsAllowedFieldsInjectionToken,
            useValue: allowedFields,
        };
        const oldBidAskLayoutDefinitionProvider: ValueProvider = {
            provide: oldHoldingsGridLayoutDefinitionsInjectionToken,
            useValue: gridLayoutDefinitions,
        };
        const injector = Injector.create({
            providers: [openerProvider, captionProvider, allowedFieldsProvider, oldBidAskLayoutDefinitionProvider],
        });

        const componentRef = container.createComponent(HoldingsGridLayoutsDialogNgComponent, { injector });
        const component = componentRef.instance;

        return component.open();
    }
}
