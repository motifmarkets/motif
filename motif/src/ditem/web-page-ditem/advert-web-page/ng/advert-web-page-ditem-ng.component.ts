import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { JsonElement, delay1Tick } from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ComponentContainer } from 'golden-layout';
import { AdvertWebPageNgComponent } from 'src/content/advert/ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from 'src/ditem/ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../../ng/desktop-access-ng.service';
import { WebPageDitemNgComponentBaseNgDirective } from '../../ng/web-page-ditem-ng-component-base-ng.directive';
import { AdvertWebPageDitemFrame } from '../advert-web-page-ditem-frame';

@Component({
    selector: 'app-advert-web-page-ditem',
    templateUrl: './advert-web-page-ditem-ng.component.html',
    styleUrls: ['./advert-web-page-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvertWebPageDitemNgComponent extends WebPageDitemNgComponentBaseNgDirective
    implements AfterViewInit, AdvertWebPageDitemFrame.ComponentAccess {

    @ViewChild('page', { static: true }) private _pageComponent: AdvertWebPageNgComponent;

    private _frame: AdvertWebPageDitemFrame;

    constructor(
        cdr: ChangeDetectorRef,
        private readonly _sanitizer: DomSanitizer,
        @Inject(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken) container: ComponentContainer,
        elRef: ElementRef<HTMLElement>,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService,
        desktopAccessNgService: DesktopAccessNgService,
        symbolsNgService: SymbolsNgService,
        adiNgService: AdiNgService,
    ) {
        const settingsService = settingsNgService.service;
        super(cdr, container, elRef, settingsService, commandRegisterNgService.service);
        this._frame = new AdvertWebPageDitemFrame(this, settingsService, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return AdvertWebPageDitemNgComponent.stateSchemaVersion; }

    ngAfterViewInit(): void {
        delay1Tick(() => this.initialise());
    }

    loadPage(safeResourceUrl: SafeResourceUrl) {
        this._pageComponent.loadPage(safeResourceUrl);
    }

    protected override initialise() {
        super.initialise();
        const safeResourceUrl = this._sanitizer.bypassSecurityTrustResourceUrl('https://spectaculix.com');
        this.loadPage(safeResourceUrl);
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

export namespace AdvertWebPageDitemNgComponent {
    export const stateSchemaVersion = '2';
}
