import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AssertInternalError, JsonElement } from '@motifmarkets/motif-core';
import { AdiNgService, BrandingNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../../ng/desktop-access-ng.service';
import { WebPageDitemNgComponentBaseNgDirective } from '../../ng/web-page-ditem-ng-component-base-ng.directive';
import { BrandingSplashWebPageDitemFrame } from '../branding-splash-web-page-ditem-frame';

@Component({
    selector: 'app-branding-splash-web-page-ditem',
    templateUrl: './branding-splash-web-page-ditem-ng.component.html',
    styleUrls: ['./branding-splash-web-page-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandingSplashWebPageDitemNgComponent extends WebPageDitemNgComponentBaseNgDirective {

    private static typeInstanceCreateCount = 0;

    public safeResourceUrl: SafeResourceUrl;

    private _frame: BrandingSplashWebPageDitemFrame;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        private readonly _sanitizer: DomSanitizer,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        @Inject(BrandingNgService.injectionToken) brandingNgService: BrandingNgService,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
    ) {
        const settingsService = settingsNgService.service;
        super(
            elRef,
            ++BrandingSplashWebPageDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsService,
            commandRegisterNgService.service
        );

        this._frame = new BrandingSplashWebPageDitemFrame(this, settingsService, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        const startupSplashWebPageSafeResourceUrl = brandingNgService.startupSplashWebPageSafeResourceUrl;
        if (startupSplashWebPageSafeResourceUrl === undefined) {
            throw new AssertInternalError('BSWPDNCC30309');
        } else {
            this.safeResourceUrl = startupSplashWebPageSafeResourceUrl;
        }
        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return BrandingSplashWebPageDitemNgComponent.stateSchemaVersion; }

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
