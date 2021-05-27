/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommandRegisterNgService } from 'src/component-services/ng-api';
import { ButtonInputNgComponent } from 'src/controls/ng-api';
import { ButtonUiAction, CommandRegisterService, InternalCommand } from 'src/core/internal-api';
import { StringId, Strings } from 'src/res/internal-api';

// NOT USED.  Probably best to delete

@Component({
    selector: 'app-signed-out',
    templateUrl: './signed-out-ng.component.html',
    styleUrls: ['./signed-out-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignedOutNgComponent implements OnInit, OnDestroy {
    @ViewChild('signInAgainButton', { static: true }) _signInAgainButtonComponent: ButtonInputNgComponent;

    public signedOutText = Strings[StringId.SignedOut];

    private _commandRegisterService: CommandRegisterService;
    private _signInAgainUiAction: ButtonUiAction;

    constructor(private _router: Router,
        commandRegisterNgService: CommandRegisterNgService
    ) {
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
        this._router.navigate(['/startup']);
    }

    private createSignInAgainUiAction() {
        const commandName = InternalCommand.Name.SignInAgain;
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
