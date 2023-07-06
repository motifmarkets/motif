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
    OnDestroy
} from '@angular/core';
import { ColorScheme, JsonElement, StringId, Strings, delay1Tick } from '@motifmarkets/motif-core';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from 'component-services-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { PlaceholderDitemFrame } from '../placeholder-ditem-frame';

@Component({
    selector: 'app-placeholder-ditem',
    templateUrl: './placeholder-ditem-ng.component.html',
    styleUrls: ['./placeholder-ditem-ng.component.scss'],

    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceholderDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    public readonly componentIsNotAvailable = Strings[StringId.PlaceholderDitem_ComponentIsNotAvailable];
    public readonly placeheldExtensionPublisherCaption = Strings[StringId.PlaceholderDitem_PlaceheldExtensionPublisherCaption];
    public readonly placeheldExtensionNameCaption = Strings[StringId.PlaceholderDitem_PlaceheldExtensionNameCaption];
    public readonly placeheldConstructionMethodCaption = Strings[StringId.PlaceholderDitem_PlaceheldConstructionMethodCaption];
    public readonly placeheldComponentTypeNameCaption = Strings[StringId.PlaceholderDitem_PlaceheldComponentTypeNameCaption];
    public readonly placeheldComponentStateCaption = Strings[StringId.PlaceholderDitem_PlaceheldComponentStateCaption];
    public readonly placeheldReasonCaption = Strings[StringId.PlaceholderDitem_PlaceheldReasonCaption];
    public readonly invalidCaption = Strings[StringId.PlaceholderDitem_InvalidCaption];

    public invalidColor: string;

    private _frame: PlaceholderDitemFrame;

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
        super(cdr, container, elRef, settingsNgService.service, commandRegisterNgService.service);
        this._frame = new PlaceholderDitemFrame(this, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service);

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }

    public get placeheldExtensionPublisherType() { return this._frame.placeheldExtensionPublisherType; }
    public get placeheldExtensionPublisher() { return this._frame.placeheldExtensionPublisher; }
    public get placeheldExtensionName() { return this._frame.placeheldExtensionName; }
    public get placeheldConstructionMethod() { return this._frame.placeheldConstructionMethod; }
    public get placeheldComponentTypeName() { return this._frame.placeheldComponentTypeName; }
    public get placeheldComponentState() { return this._frame.placeheldComponentState; }
    public get placeheldReason() { return this._frame.placeheldReason; }

    public get invalid() { return this._frame.invalid; }
    public get invalidReason() { return this._frame.invalidReason; }

    protected get stateSchemaVersion() { return PlaceholderDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    protected override finalise() {
        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        // Use element directly (not a 'frame' element) as state is initially defined externally
        this._frame.constructLoad(element);
    }

    protected save(element: JsonElement) {
        // Use element directly (not a 'frame' element) as state is initially defined externally
        this._frame.save(element);
    }

    protected override applySettings() {
        this.invalidColor = this.settingsService.color.getFore(ColorScheme.ItemId.Caution_Error);
        this.markForCheck();
    }
}

export namespace PlaceholderDitemNgComponent {
    export const stateSchemaVersion = '2';

    const placeheldTokenName = 'Placeheld';
    export const placeheldInjectionToken = new InjectionToken<ComponentContainer>(placeheldTokenName);
}
