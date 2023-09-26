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
    OnDestroy,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { JsonElement, delay1Tick } from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import {
    ColorSettingsNgComponent,
    ExchangesSettingsNgComponent,
    GeneralSettingsNgComponent,
    GridSettingsNgComponent,
    OrderPadSettingsNgComponent
} from 'content-ng-api';
import { TabListNgComponent } from 'controls-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { SettingsDitemFrame } from '../settings-ditem-frame';

@Component({
    selector: 'app-settings-ditem',
    templateUrl: './settings-ditem-ng.component.html',
    styleUrls: ['./settings-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('tabList', { static: true }) private _tabListComponent: TabListNgComponent;
    @ViewChild('groupContainer', { read: ViewContainerRef, static: true }) private _groupContainer: ViewContainerRef;

    private _frame: SettingsDitemFrame;
    private _settingsGroupId: SettingsDitemFrame.GroupId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
    ) {
        super(
            elRef,
            ++SettingsDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsNgService.service,
            commandRegisterNgService.service
        );

        this._frame = new SettingsDitemFrame(this, this.settingsService, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return SettingsDitemNgComponent.stateSchemaVersion; }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    ngOnDestroy() {
        this.finalise();
    }

    protected override initialise() {
        this.initialiseTabs();
        this.setGroupId(SettingsDitemFrame.GroupId.General);
        super.initialise();
    }

    protected override finalise() {
        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        const frameElement = this.tryGetChildFrameJsonElement(element);
        this._frame.constructLoad(frameElement);
    }

    protected save(element: JsonElement) {
        const frameElement = this.createChildFrameJsonElement(element);
        this._frame.save(frameElement);
    }

    private initialiseTabs() {
        const tabDefinitions: TabListNgComponent.TabDefinition[] = [
            {
                caption: SettingsDitemFrame.Group.idToCaption(SettingsDitemFrame.GroupId.General),
                initialActive: true,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(SettingsDitemFrame.GroupId.General, tab),
            },
            {
                caption: SettingsDitemFrame.Group.idToCaption(SettingsDitemFrame.GroupId.Grid),
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(SettingsDitemFrame.GroupId.Grid, tab),
            },
            {
                caption: SettingsDitemFrame.Group.idToCaption(SettingsDitemFrame.GroupId.OrderPad),
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(SettingsDitemFrame.GroupId.OrderPad, tab),
            },
            {
                caption: SettingsDitemFrame.Group.idToCaption(SettingsDitemFrame.GroupId.Exchanges),
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(SettingsDitemFrame.GroupId.Exchanges, tab),
            },
            {
                caption: SettingsDitemFrame.Group.idToCaption(SettingsDitemFrame.GroupId.Colors),
                initialActive: false,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(SettingsDitemFrame.GroupId.Colors, tab),
            },
        ];
        this._tabListComponent.setTabs(tabDefinitions);
    }

    private handleActiveTabChangedEvent(groupId: SettingsDitemFrame.GroupId, tab: TabListNgComponent.Tab) {
        if (tab.active) {
            this.setGroupId(groupId);
        }
    }

    private setGroupId(value: SettingsDitemFrame.GroupId) {
        if (value !== this._settingsGroupId) {
            this._groupContainer.clear();

            switch (value) {
                case SettingsDitemFrame.GroupId.General:
                    GeneralSettingsNgComponent.create(this._groupContainer);
                    break;
                case SettingsDitemFrame.GroupId.Grid:
                    GridSettingsNgComponent.create(this._groupContainer);
                    break;
                case SettingsDitemFrame.GroupId.OrderPad:
                    OrderPadSettingsNgComponent.create(this._groupContainer);
                    break;
                case SettingsDitemFrame.GroupId.Exchanges:
                    ExchangesSettingsNgComponent.create(this._groupContainer);
                    break;
                case SettingsDitemFrame.GroupId.Colors:
                    ColorSettingsNgComponent.create(this._groupContainer);
                    break;
            }

            this._settingsGroupId = value;
            this.markForCheck();
        }
    }
}

export namespace SettingsDitemNgComponent {
    export const stateSchemaVersion = '2';
}
