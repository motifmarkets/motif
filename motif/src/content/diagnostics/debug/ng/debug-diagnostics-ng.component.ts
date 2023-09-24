/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ButtonUiAction, CommandRegisterService, InternalCommand, StringId } from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent } from 'controls-ng-api';
import { DiagnosticsComponentBaseNgDirective } from '../../ng/diagnostics-component-base-ng.directive';

@Component({
    selector: 'app-debug-diagnostics-ng',
    templateUrl: './debug-diagnostics-ng.component.html',
    styleUrls: ['./debug-diagnostics-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DebugDiagnosticsNgComponent extends DiagnosticsComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('closeSocketConnectionButton', { static: true }) private _closeSocketConnectionButtonComponent: ButtonInputNgComponent;

    private readonly _closeSocketConnectionUiAction: ButtonUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
    ) {
        super(elRef, ++DebugDiagnosticsNgComponent.typeInstanceCreateCount, cdr);

        const commandRegisterService = commandRegisterNgService.service;
        this._closeSocketConnectionUiAction = this.createCloseSocketConnectionUiAction(commandRegisterService);
    }

    public ngAfterViewInit() {
        this.initialiseComponents();
    }

    ngOnDestroy() {
        this.finalise();
    }

    protected override finalise() {
        this._closeSocketConnectionUiAction.finalise();

        super.finalise();
    }

    private handleCreateCloseSocketConnectionSignalEvent() {

    }

    private createCloseSocketConnectionUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.SignInAgain;
        const displayId = StringId.SignInAgain;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = () => this.handleCreateCloseSocketConnectionSignalEvent();
        return action;

    }

    private initialiseComponents() {
        this._closeSocketConnectionButtonComponent.initialise(this._closeSocketConnectionUiAction);
    }
}
