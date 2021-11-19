import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ComponentContainer } from 'golden-layout';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'src/component-services/ng-api';
import { DesktopAccessNgService } from 'src/ditem/ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from 'src/ditem/ng/builtin-ditem-ng-component-base.directive';
import { JsonElement } from 'src/sys/internal-api';
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

    public url: SafeResourceUrl;

    private _frame: BrandingSplashWebPageDitemFrame;

    protected get stateSchemaVersion() { return BrandingSplashWebPageDitemNgComponent.stateSchemaVersion; }
    get ditemFrame() { return this._frame; }

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

    ngOnInit(): void {}

    loadPage(url: string) {
        this.url = this._sanitizer.bypassSecurityTrustResourceUrl(url);
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
