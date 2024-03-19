/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, InjectionToken, Injector, OnDestroy, ValueProvider, ViewChild, ViewContainerRef } from '@angular/core';
import { CommandRegisterService, Err, IconButtonUiAction, InternalCommand, LockOpenListItem, Ok, Result, ScanList, StringId, Strings, UnreachableCaseError, delay1Tick } from '@motifmarkets/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens, ScansNgService } from 'component-services-ng-api';
import { SvgButtonNgComponent, TabListNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-open-watchlist-dialog',
    templateUrl: './open-watchlist-dialog-ng.component.html',
    styleUrls: ['./open-watchlist-dialog-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenWatchlistDialogNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('okButton', { static: true }) private _okButtonComponent: SvgButtonNgComponent;
    @ViewChild('cancelButton', { static: true }) private _cancelButtonComponent: SvgButtonNgComponent;
    @ViewChild('tabList', { static: true }) private _tabListComponent: TabListNgComponent;
    @ViewChild('rankedLitIvemIdListContainer', { read: ViewContainerRef, static: true }) private _rankedLitIvemIdListContainer: ViewContainerRef;

    public symbolListVisible = false;
    public watchlistVisible = false;

    private readonly _scanList: ScanList;

    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _visibleExistingListsTypeId: OpenWatchlistDialogNgComponent.ExistingListsTypeId;

    private _closeResolve: ((this: void, scanId: Result<string>) => void);

    constructor(
        elRef: ElementRef<HTMLElement>,
        private _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        scansNgService: ScansNgService,
        @Inject(OpenWatchlistDialogNgComponent.captionInjectionToken) public readonly caption: string,
    ) {
        super(elRef, ++OpenWatchlistDialogNgComponent.typeInstanceCreateCount);

        this._scanList = scansNgService.service.scanList;

        const commandRegisterService = commandRegisterNgService.service;

        this._okUiAction = this.createOkUiAction(commandRegisterService);
        this._cancelUiAction = this.createCancelUiAction(commandRegisterService);
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialiseComponents());
    }

    ngOnDestroy() {
        this._okUiAction.finalise();
        this._cancelUiAction.finalise();
    }

    open(): OpenWatchlistDialogNgComponent.ClosePromise {
        return new Promise((resolve) => {
            this._closeResolve = resolve;
        });
    }

    handleFirstAvailableSymbolListScanButtonClick() {
        const list = this._scanList;
        const count = list.count;
        let found = false;
        for (let i = 0; i < count; i++) {
            const scan = list.getAt(i);
            if (scan.id === '1OYjBz') {
                found = true;
                this._closeResolve(new Ok(scan.id));
                break;
            }
        }
        if (!found) {
            this._closeResolve(new Err('No symbol list enabled scan'));
        }
    }

    private handleOkSignal() {
        this.close(true);
    }

    private handleCancelSignal() {
        this.close(false);
    }

    private handleActiveTabChangedEvent(tab: TabListNgComponent.Tab, existingListsTypeId: OpenWatchlistDialogNgComponent.ExistingListsTypeId) {
        if (tab.active) {
            this.showExistingListsTypeId(existingListsTypeId);
        }
    }

    private createOkUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.OpenWatchlistDialog_Ok;
        const displayId = StringId.Ok;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = () => this.handleOkSignal();
        return action;
    }

    private createCancelUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.OpenWatchlistDialog_Cancel;
        const displayId = StringId.Cancel;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnCancel);
        action.signalEvent = () => this.handleCancelSignal();
        return action;
    }

    private initialiseComponents() {
        this._okButtonComponent.initialise(this._okUiAction);
        this._cancelButtonComponent.initialise(this._cancelUiAction);

        const tabDefinitions: TabListNgComponent.TabDefinition[] = [
            {
                caption: Strings[StringId.SymbolList],
                initialActive: true,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, OpenWatchlistDialogNgComponent.ExistingListsTypeId.SymbolList),
            },
            {
                caption: Strings[StringId.Watchlist],
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(tab, OpenWatchlistDialogNgComponent.ExistingListsTypeId.Watchlist),
            },
        ];
        this._tabListComponent.setTabs(tabDefinitions);

        this.showExistingListsTypeId(OpenWatchlistDialogNgComponent.ExistingListsTypeId.SymbolList);
    }

    private showExistingListsTypeId(value: OpenWatchlistDialogNgComponent.ExistingListsTypeId) {
        if (value !== this._visibleExistingListsTypeId) {
            // let selectedListName: string;
            switch (value) {
                case OpenWatchlistDialogNgComponent.ExistingListsTypeId.SymbolList:
                    // selectedListName = this._symbolListDirectoryComponent.selectedListName
                    break;

                case OpenWatchlistDialogNgComponent.ExistingListsTypeId.Watchlist:
                    // selectedListName = this._symbolListDirectoryComponent.selectedListName
                    break;

                default:
                    throw new UnreachableCaseError('OWDNCSELTI74773', value);
            }

            this._visibleExistingListsTypeId = value;
            this._cdr.markForCheck();
        }
    }

    private close(ok: boolean) {
        if (ok) {
            // this.checkLoadLayoutFromEditor();
            // const layouts: HoldingsDitemFrame.GridLayoutDefinitions = {
            //     holdings: this._holdingsLayoutDefinition,
            //     balances: this._balancesLayoutDefinition,
            // };
        }
        this._closeResolve(new Ok(''));
    }
}

export namespace OpenWatchlistDialogNgComponent {
    export const enum ExistingListsTypeId {
        SymbolList,
        Watchlist,
    }

    export type ClosePromise = Promise<Result<string>>;
    export const captionInjectionToken = new InjectionToken<string>('OpenWatchlistDialogNgComponent.Caption');

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
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
        const injector = Injector.create({
            providers: [openerProvider, captionProvider],
        });

        const componentRef = container.createComponent(OpenWatchlistDialogNgComponent, { injector });

        const component = componentRef.instance;

        return component.open();
    }
}
