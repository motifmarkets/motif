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
    HostBinding,
    Inject,
    OnDestroy,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { AssertInternalError, ColorScheme, delay1Tick, ExtensionId, ExtensionInfo, JsonElement } from '@motifmarkets/motif-core';
import { SplitComponent } from 'angular-split';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ExtensionsSidebarNgComponent } from 'content-ng-api';
import { AngularSplitTypes } from 'controls-internal-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { ExtensionsDitemFrame } from '../extensions-ditem-frame';

@Component({
    selector: 'app-extensions-ditem',
    templateUrl: './extensions-ditem-ng.component.html',
    styleUrls: ['./extensions-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ExtensionsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @HostBinding('style.--splitter-background-color') splitterBackgroundColor: string;

    @ViewChild('splitter') private _splitterComponent: SplitComponent;
    @ViewChild('sidebar') private _sideBarComponent: ExtensionsSidebarNgComponent;

    public splitterGutterSize = 3;
    public initialSidebarSplitAreaSize: AngularSplitTypes.AreaSize.Html = 20;
    public initialDetailSplitAreaSize: AngularSplitTypes.AreaSize.Html = 80;

    public focusedInfo: ExtensionInfo;

    private _frame: ExtensionsDitemFrame;
    private _listTransitioningInfo: ExtensionInfo | undefined;

    constructor(
        cdr: ChangeDetectorRef,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef<HTMLElement>,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
    ) {
        super(cdr, container, elRef, settingsNgService.settingsService, commandRegisterNgService.service);

        this._frame = new ExtensionsDitemFrame(this, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        elRef.nativeElement.style.position = 'absolute';
        elRef.nativeElement.style.overflow = 'hidden';

        this.constructLoad(this.getInitialComponentStateJsonElement());

        this.applySettings();
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return ExtensionsDitemNgComponent.stateSchemaVersion; }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    ngOnDestroy() {
        this.finalise();
    }

    public handleInfoFocus(info: ExtensionInfo): void {
        this.focusedInfo = info;
        this.markForCheck();
    }

    public handleListTransitionStart(info: ExtensionInfo) {
        this._listTransitioningInfo = info;
    }

    public handleListTransitionFinish(info: ExtensionInfo) {
        if (this._listTransitioningInfo === undefined) {
            throw new AssertInternalError('EDCHLTFU755433424');
        } else {
            if (!ExtensionId.isEqual(this._listTransitioningInfo, info)) {
                throw new AssertInternalError('EDCHLTFM755433424');
            } else {
                this.focusedInfo = info;
                this._listTransitioningInfo = undefined;
            }
        }
    }

    protected override initialise() {
        this.checkSetSidebarPixelWidth();

        // this._detailSplitAreaDirective.size = null;
        // this._sidebarSplitAreaDirective.size = width;
        super.initialise();
    }

    protected override finalise() {
        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        // nothing to load yet
    }

    protected save(element: JsonElement) {
        // nothing to save yet
    }

    protected override applySettings() {
        this.splitterBackgroundColor = this.settingsService.color.getBkgd(ColorScheme.ItemId.Panel_Hoisted);
        super.applySettings();
        this.markForCheck();
    }

    protected override processShown() {
        if (this._splitterComponent !== undefined) {
            this.checkSetSidebarPixelWidth();
        }
    }

    private checkSetSidebarPixelWidth() {
        if (this._splitterComponent.unit !== AngularSplitTypes.Unit.pixel) {
            const width = this._sideBarComponent.width;
            if (width > 0) {
                this._splitterComponent.unit = AngularSplitTypes.Unit.pixel;
                this._splitterComponent.setVisibleAreaSizes([width, '*']);
            }
        }
    }
}

export namespace ExtensionsDitemNgComponent {
    export const stateSchemaVersion = '2';
}
