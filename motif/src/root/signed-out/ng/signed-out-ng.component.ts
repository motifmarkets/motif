/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AssertInternalError, ButtonUiAction, CommandRegisterService, InternalCommand, StringId, Strings } from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent } from 'controls-ng-api';

// NOT USED.  Probably best to delete

@Component({
    selector: 'app-signed-out',
    templateUrl: './signed-out-ng.component.html',
    styleUrls: ['./signed-out-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignedOutNgComponent extends ComponentBaseNgDirective implements OnInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('signInAgainButton', { static: true }) _signInAgainButtonComponent: ButtonInputNgComponent;

    public signedOutText = Strings[StringId.SignedOut];

    private _commandRegisterService: CommandRegisterService;
    private _signInAgainUiAction: ButtonUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private _router: Router,
        commandRegisterNgService: CommandRegisterNgService
    ) {
        super(elRef, ++SignedOutNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;
        this._signInAgainUiAction = this.createSignInAgainUiAction();
    }

    ngOnInit() {
        this.initialise();
    }

    ngOnDestroy() {
        this.finalise();
    }

    private handleSignInAgainSignal() {
        const promise = this._router.navigate(['/startup']);
        promise.then(
            () => {/**/},
            (error) => { throw AssertInternalError.createIfNotError(error, 'SINGHSIAS'); }
        )
    }

    private createSignInAgainUiAction() {
        const commandName = InternalCommand.Id.SignInAgain;
        const displayId = StringId.SignInAgain;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.signalEvent = () => this.handleSignInAgainSignal();
        return action;
    }

    private initialise() {
        this._signInAgainButtonComponent.initialise(this._signInAgainUiAction);
    }

    private finalise() {
        this._signInAgainUiAction.finalise();
    }
}
