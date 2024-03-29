/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { JsonElement } from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { FeedsNgComponent, MarketsNgComponent, StatusSummaryNgComponent, ZenithStatusNgComponent } from 'content-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { StatusDitemFrame } from '../status-ditem-frame';

@Component({
    selector: 'app-status-ditem',
    templateUrl: './status-ditem-ng.component.html',
    styleUrls: ['./status-ditem-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('statusContainer', { read: ViewContainerRef, static: true }) private _statusContainer: ViewContainerRef;

    public summaryActive = false;
    public marketsActive = false;
    public feedsActive = false;
    public zenithActive = false;

    private _frame: StatusDitemFrame;

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
        const settingsService = settingsNgService.service;
        super(
            elRef,
            ++StatusDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsService,
            commandRegisterNgService.service
        );
        this._frame = new StatusDitemFrame(
            this,
            settingsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service
        );
    }

    override get ditemFrame() { return this._frame; }
    protected override get stateSchemaVersion() { return StatusDitemNgComponent.stateSchemaVersion; }

    ngOnInit() {
        this.initialise();
    }

    ngOnDestroy() {
        this.finalise();
    }

    public handleSummaryClick() {
        if (!this.summaryActive) {
            this.showSummary();
        }
    }

    public handleMarketsClick() {
        if (!this.marketsActive) {
            this.showMarkets();
        }
    }

    public handleFeedsClick() {
        if (!this.feedsActive) {
            this.showFeeds();
        }
    }

    public handleZenithClick() {
        if (!this.zenithActive) {
            this.showZenith();
        }
    }

    // component access methods
    public loadConstructLayoutConfig(element: JsonElement | undefined) {
        if (element !== undefined) {
            // no code
        }
    }

    public createLayoutConfig() {
        const element = new JsonElement();
        return element;
    }

    protected override initialise() {
        this.showSummary();
        super.initialise();
    }

    protected override finalise() {
        this._statusContainer.clear();
        this._frame.finalise();
        super.finalise();
    }

    protected save(element: JsonElement) {
        // nothing to save
    }

    private showSummary() {
        this.summaryActive = true;
        this.marketsActive = false;
        this.feedsActive = false;
        this.zenithActive = false;
        StatusSummaryNgComponent.create(this._statusContainer);
        this.markForCheck();
    }

    private showMarkets() {
        this.summaryActive = false;
        this.marketsActive = true;
        this.feedsActive = false;
        this.zenithActive = false;
        MarketsNgComponent.create(this._statusContainer);
        this.markForCheck();
    }

    private showFeeds() {
        this.summaryActive = false;
        this.marketsActive = false;
        this.feedsActive = true;
        this.zenithActive = false;
        FeedsNgComponent.create(this._statusContainer, this._frame.opener);
        this.markForCheck();
    }

    private showZenith() {
        this.summaryActive = false;
        this.marketsActive = false;
        this.feedsActive = false;
        this.zenithActive = true;
        ZenithStatusNgComponent.create(this._statusContainer);
        this.markForCheck();
    }
}

export namespace StatusDitemNgComponent {
    export const stateSchemaVersion = '2';
}
