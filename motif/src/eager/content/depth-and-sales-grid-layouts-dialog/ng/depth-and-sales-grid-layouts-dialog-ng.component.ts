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
    StringId,
    Strings,
    UiAction,
    UnreachableCaseError,
    assert,
    delay1Tick
} from '@motifmarkets/motif-core';
import { RevGridLayoutDefinition } from '@xilytix/rev-data-source';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { SvgButtonNgComponent, TabListNgComponent } from 'controls-ng-api';
import { DepthAndSalesDitemFrame } from 'ditem-internal-api';
import { GridLayoutEditorNgComponent, allowedFieldsInjectionToken, definitionColumnListInjectionToken } from '../../grid-layout-dialog/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-depth-and-sales-grid-layouts-dialog',
    templateUrl: './depth-and-sales-grid-layouts-dialog-ng.component.html',
    styleUrls: ['./depth-and-sales-grid-layouts-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepthAndSalesGridLayoutsDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;
    @ViewChild('tabList', { static: true }) private _tabListComponent: TabListNgComponent;
    @ViewChild('editorContainer', { read: ViewContainerRef, static: true }) private _editorContainer: ViewContainerRef;

    private _commandRegisterService: CommandRegisterService;

    private _depthBidAllowedFields: readonly GridField[];
    private _depthAskAllowedFields: readonly GridField[];
    private _watchlistAllowedFields: readonly GridField[];
    private _tradesAllowedFields: readonly GridField[];

    private _depthBidLayoutDefinition: RevGridLayoutDefinition;
    private _depthAskLayoutDefinition: RevGridLayoutDefinition;
    private _watchlistLayoutDefinition: RevGridLayoutDefinition;
    private _tradesLayoutDefinition: RevGridLayoutDefinition;

    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _activeSubFrameId: DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId | undefined;
    private _editorComponent: GridLayoutEditorNgComponent | undefined;

    private _closeResolve: (value: DepthAndSalesDitemFrame.GridLayoutDefinitions | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
        @Inject(DepthAndSalesGridLayoutsDialogNgComponent.captionInjectionToken) public readonly caption: string,
        @Inject(DepthAndSalesGridLayoutsDialogNgComponent.depthAndSalesAllowedFieldsInjectionToken) allowedFields: DepthAndSalesDitemFrame.AllowedGridFields,
        @Inject(DepthAndSalesGridLayoutsDialogNgComponent.oldDepthAndSalesGridLayoutDefinitionsInjectionToken) oldLayoutDefinitions: DepthAndSalesDitemFrame.GridLayoutDefinitions,
    ) {
        super(elRef, ++DepthAndSalesGridLayoutsDialogNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();

        this._depthBidAllowedFields = allowedFields.depth.bid;
        this._depthAskAllowedFields = allowedFields.depth.ask;
        this._watchlistAllowedFields = allowedFields.watchlist;
        this._tradesAllowedFields = allowedFields.trades;

        this._depthBidLayoutDefinition = oldLayoutDefinitions.depth.bid.createCopy();
        this._depthAskLayoutDefinition = oldLayoutDefinitions.depth.ask.createCopy();
        this._watchlistLayoutDefinition = oldLayoutDefinitions.watchlist.createCopy();
        this._tradesLayoutDefinition = oldLayoutDefinitions.trades.createCopy();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialiseComponents());
    }

    ngOnDestroy() {
        this._okUiAction.finalise();
        this._cancelUiAction.finalise();
    }

    open() {
        return new Promise<DepthAndSalesDitemFrame.GridLayoutDefinitions | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    setSubFrameId(value: DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId) {
        this.checkLoadLayoutFromEditor();

        if (value !== this._activeSubFrameId) {
            switch (value) {
                case DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.BidDepth:
                    this._editorComponent = this.recreateEditor(this._depthBidAllowedFields, this._depthBidLayoutDefinition);
                    break;

                case DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.AskDepth:
                    this._editorComponent = this.recreateEditor(this._depthAskAllowedFields, this._depthAskLayoutDefinition);
                    break;

                case DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.Watchlist:
                    this._editorComponent = this.recreateEditor(this._watchlistAllowedFields, this._watchlistLayoutDefinition);
                    break;

                case DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.Trades:
                    this._editorComponent = this.recreateEditor(this._tradesAllowedFields, this._tradesLayoutDefinition);
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

    private handleActiveTabChangedEvent(tab: TabListNgComponent.Tab, subFrameId: DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId) {
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
                caption: Strings[StringId.Watchlist],
                initialActive: true,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.Watchlist),
            },
            {
                caption: Strings[StringId.BidDepth],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.BidDepth),
            },
            {
                caption: Strings[StringId.AskDepth],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.AskDepth),
            },
            {
                caption: Strings[StringId.Trades],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.Trades),
            },
        ];
        this._tabListComponent.setTabs(tabDefinitions);

        this.setSubFrameId(DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.Watchlist);
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
                    case DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.BidDepth:
                        this._depthBidLayoutDefinition = editorComponent.getGridLayoutDefinition();
                        break;

                    case DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.AskDepth:
                        this._depthAskLayoutDefinition = editorComponent.getGridLayoutDefinition();
                        break;

                    case DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.Watchlist:
                        this._watchlistLayoutDefinition = editorComponent.getGridLayoutDefinition();
                        break;

                    case DepthAndSalesGridLayoutsDialogNgComponent.SubFrameId.Trades:
                        this._tradesLayoutDefinition = editorComponent.getGridLayoutDefinition();
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
            const layouts: DepthAndSalesDitemFrame.GridLayoutDefinitions = {
                watchlist: this._watchlistLayoutDefinition,
                depth: {
                    bid: this._depthBidLayoutDefinition,
                    ask: this._depthAskLayoutDefinition,
                },
                trades: this._tradesLayoutDefinition,
            };
            this._closeResolve(layouts);
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace DepthAndSalesGridLayoutsDialogNgComponent {
    export const enum SubFrameId {
        BidDepth,
        AskDepth,
        Watchlist,
        Trades,
    }

    export type ClosePromise = Promise<DepthAndSalesDitemFrame.GridLayoutDefinitions | undefined>;

    export const captionInjectionToken = new InjectionToken<string>('DepthAndSalesGridLayoutsDialogNgComponent.caption');
    export const depthAndSalesAllowedFieldsInjectionToken = new InjectionToken<DepthAndSalesDitemFrame.AllowedGridFields>('DepthAndSalesGridLayoutsDialogNgComponent.allowedFields');
    export const oldDepthAndSalesGridLayoutDefinitionsInjectionToken = new InjectionToken<DepthAndSalesDitemFrame.GridLayoutDefinitions>('DepthAndSalesGridLayoutsDialogNgComponent.allowedFields');

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
        allowedFieldsAndLayoutDefinition: DepthAndSalesDitemFrame.AllowedFieldsAndLayoutDefinitions
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
        const allowedFields: DepthAndSalesDitemFrame.AllowedGridFields = {
            watchlist: allowedFieldsAndLayoutDefinition.watchlist.allowedFields,
            depth: {
                bid: allowedFieldsAndLayoutDefinition.depth.bid.allowedFields,
                ask: allowedFieldsAndLayoutDefinition.depth.ask.allowedFields,
            },
            trades: allowedFieldsAndLayoutDefinition.trades.allowedFields,
        };

        const gridLayoutDefinitions: DepthAndSalesDitemFrame.GridLayoutDefinitions = {
            watchlist: allowedFieldsAndLayoutDefinition.watchlist,
            depth: {
                bid: allowedFieldsAndLayoutDefinition.depth.bid,
                ask: allowedFieldsAndLayoutDefinition.depth.ask,
            },
            trades: allowedFieldsAndLayoutDefinition.trades,
        };

        const allowedFieldsProvider: ValueProvider = {
            provide: depthAndSalesAllowedFieldsInjectionToken,
            useValue: allowedFields,
        };
        const oldBidAskLayoutDefinitionProvider: ValueProvider = {
            provide: oldDepthAndSalesGridLayoutDefinitionsInjectionToken,
            useValue: gridLayoutDefinitions,
        };
        const injector = Injector.create({
            providers: [openerProvider, captionProvider, allowedFieldsProvider, oldBidAskLayoutDefinitionProvider],
        });

        const componentRef = container.createComponent(DepthAndSalesGridLayoutsDialogNgComponent, { injector });
        assert(componentRef.instance instanceof DepthAndSalesGridLayoutsDialogNgComponent, 'ID:157271511202');

        const component = componentRef.instance;

        return component.open();
    }
}
