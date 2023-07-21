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
    OrderPadSettingsNgComponent,
    SettingsComponentBaseNgDirective
} from 'content-ng-api';
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

    @ViewChild('groupContainer', { read: ViewContainerRef, static: true }) private _groupContainer: ViewContainerRef;

    public generalGroupActive: boolean;
    public gridGroupActive: boolean;
    public orderPadGroupActive: boolean;
    public exchangesGroupActive: boolean;
    public colorGroupActive: boolean;

    private _frame: SettingsDitemFrame;
    private _settingsGroupId: SettingsDitemFrame.SettingsGroupId;

    private _groupComponent: SettingsComponentBaseNgDirective | undefined;

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

    handleGeneralSettingsClick() {
        this.setGroupId(SettingsDitemFrame.SettingsGroupId.General);
    }

    handleColorSettingsClick() {
        this.setGroupId(SettingsDitemFrame.SettingsGroupId.Color);
    }

    handleExchangesSettingsClick() {
        this.setGroupId(SettingsDitemFrame.SettingsGroupId.Exchanges);
    }

    handleGridSettingsClick() {
        this.setGroupId(SettingsDitemFrame.SettingsGroupId.Grid);
    }

    handleOrderPadSettingsClick() {
        this.setGroupId(SettingsDitemFrame.SettingsGroupId.OrderPad);
    }

    protected override initialise() {
        this.setGroupId(SettingsDitemFrame.SettingsGroupId.General);
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

    private clearAllGroupContainers() {
        this._groupContainer.clear();
        this._groupComponent = undefined;
    }

    private setGroupId(value: SettingsDitemFrame.SettingsGroupId) {
        if (value !== this._settingsGroupId) {
            this.clearAllGroupContainers();

            this.generalGroupActive = false;
            this.gridGroupActive = false;
            this.orderPadGroupActive = false;
            this.exchangesGroupActive = false;
            this.colorGroupActive = false;

            switch (value) {
                case SettingsDitemFrame.SettingsGroupId.General:
                    this.generalGroupActive = true;
                    this._groupComponent = GeneralSettingsNgComponent.create(this._groupContainer);
                    break;
                case SettingsDitemFrame.SettingsGroupId.Grid:
                    this.gridGroupActive = true;
                    this._groupComponent = GridSettingsNgComponent.create(this._groupContainer);
                    break;
                case SettingsDitemFrame.SettingsGroupId.OrderPad:
                    this.orderPadGroupActive = true;
                    this._groupComponent = OrderPadSettingsNgComponent.create(this._groupContainer);
                    break;
                case SettingsDitemFrame.SettingsGroupId.Exchanges:
                    this.exchangesGroupActive = true;
                    this._groupComponent = ExchangesSettingsNgComponent.create(this._groupContainer);
                    break;
                case SettingsDitemFrame.SettingsGroupId.Color:
                    this.colorGroupActive = true;
                    this._groupComponent = ColorSettingsNgComponent.create(this._groupContainer);
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
