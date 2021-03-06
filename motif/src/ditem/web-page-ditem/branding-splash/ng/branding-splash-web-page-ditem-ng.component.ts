import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { JsonElement } from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { DesktopAccessNgService } from 'ditem-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from 'src/ditem/ng/builtin-ditem-ng-component-base.directive';
import { WebPageDitemNgComponentBaseNgDirective } from '../../ng/web-page-ditem-ng-component-base-ng.directive';
import { BrandingSplashWebPageDitemFrame } from '../branding-splash-web-page-ditem-frame';

@Component({
    selector: 'app-branding-splash-web-page-ditem',
    templateUrl: './branding-splash-web-page-ditem-ng.component.html',
    styleUrls: ['./branding-splash-web-page-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandingSplashWebPageDitemNgComponent extends WebPageDitemNgComponentBaseNgDirective
    implements OnInit, BrandingSplashWebPageDitemFrame.ComponentAccess {

    public safeResourceUrl: SafeResourceUrl;

    private _frame: BrandingSplashWebPageDitemFrame;

    constructor(
        cdr: ChangeDetectorRef,
        private readonly _sanitizer: DomSanitizer,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
    ) {
        super(cdr, container, elRef, settingsNgService.settingsService, commandRegisterNgService.service);
        this._frame = new BrandingSplashWebPageDitemFrame(this, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.symbolsManager, adiNgService.adiService);

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return BrandingSplashWebPageDitemNgComponent.stateSchemaVersion; }

    ngOnInit(): void {}

    loadPage(safeResourceUrl: SafeResourceUrl) {
        this.safeResourceUrl = safeResourceUrl;
        this.markForCheck();
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
}

export namespace BrandingSplashWebPageDitemNgComponent {
    export const stateSchemaVersion = '2';
}
