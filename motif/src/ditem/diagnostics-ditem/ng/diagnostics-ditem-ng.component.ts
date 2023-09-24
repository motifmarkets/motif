/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Injector, OnDestroy, ViewChild, ViewContainerRef, createNgModule } from '@angular/core';
import { AssertInternalError, JsonElement, delay1Tick } from '@motifmarkets/motif-core';
import { ComponentContainer } from 'golden-layout';
import { AdiNgService, CommandRegisterNgService, SettingsNgService, SymbolsNgService } from '../../../component-services/ng-api';
import { EagerControlsNgModule, TabListNgComponent } from '../../../controls/ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { DiagnosticsDitemFrame } from '../diagnostics-ditem-frame';

@Component({
    selector: 'app-diagnostics-ditem',
    standalone: true,
    imports: [
        CommonModule,
        EagerControlsNgModule,
    ],
    templateUrl: './diagnostics-ditem-ng.component.html',
    styleUrls: ['./diagnostics-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticsDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('tabList', { static: true }) private _tabListComponent: TabListNgComponent;
    @ViewChild('groupContainer', { read: ViewContainerRef, static: true }) private _groupContainer: ViewContainerRef;

    private _frame: DiagnosticsDitemFrame;
    private _diagnosticsGroupId: DiagnosticsDitemFrame.GroupId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        private readonly _injector: Injector,
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
            ++DiagnosticsDitemNgComponent.typeInstanceCreateCount,
            cdr,
            container,
            settingsService,
            commandRegisterNgService.service
        );

        this._frame = new DiagnosticsDitemFrame(
            this,
            settingsService,
            this.commandRegisterService,
            desktopAccessNgService.service,
            symbolsNgService.service,
            adiNgService.service
        );
    }

    override get ditemFrame() { return this._frame; }
    protected override get stateSchemaVersion() { return DiagnosticsDitemNgComponent.stateSchemaVersion; }

    ngAfterViewInit() {
        delay1Tick(() => this.initialise());
    }

    ngOnDestroy() {
        this.finalise();
    }

    protected override initialise() {
        this.initialiseTabs();
        this.setGroupId(DiagnosticsDitemFrame.GroupId.Debug);
        super.initialise();
    }

    protected override finalise() {
        this._frame.finalise();
        super.finalise();
    }

    protected save(element: JsonElement) {
        // nothing to save
    }

    private handleActiveTabChangedEvent(groupId: DiagnosticsDitemFrame.GroupId, tab: TabListNgComponent.Tab) {
        if (tab.active) {
            this.setGroupId(groupId);
        }
    }

    private initialiseTabs() {
        const tabDefinitions: TabListNgComponent.TabDefinition[] = [
            {
                caption: DiagnosticsDitemFrame.Group.idToCaption(DiagnosticsDitemFrame.GroupId.Debug),
                initialActive: true,
                initialDisabled: false,
                activeChangedEventer: (tab) => this.handleActiveTabChangedEvent(DiagnosticsDitemFrame.GroupId.Debug, tab),
            },
        ];
        this._tabListComponent.setTabs(tabDefinitions);
    }

    private setGroupId(groupId: DiagnosticsDitemFrame.GroupId) {
        const promise = this.asyncSetGroupId(groupId);
        promise.then(
            () => {/**/},
            (reason) => {
                throw AssertInternalError.createIfNotError(
                    reason,
                    'DDNCHATCE41499',
                    DiagnosticsDitemFrame.Group.idToCaption(groupId),
                    AssertInternalError.ExtraFormatting.PrependWithColonSpace
                );
            }
        );
    }

    private async asyncSetGroupId(value: DiagnosticsDitemFrame.GroupId) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (value !== this._diagnosticsGroupId) {
            this._groupContainer.clear();

            switch (value) {
                case DiagnosticsDitemFrame.GroupId.Debug: {
                    // https://stackoverflow.com/questions/75883330/how-to-load-lazy-modules-programmatically-in-angular-app
                    const { DiagnosticsContentNgModule } = await import ("../../../content/ng/diagnostics-content-ng.module")
                    const diagnosticsModuleInstance = createNgModule(DiagnosticsContentNgModule, this._injector).instance;
                    const componentType = diagnosticsModuleInstance.debugComponentType;
                    this._groupContainer.createComponent(componentType);
                    break;
                }
            }

            this._diagnosticsGroupId = value;
            this.markForCheck();
        }
    }
}


export namespace DiagnosticsDitemNgComponent {
    export const stateSchemaVersion = '2';
}
