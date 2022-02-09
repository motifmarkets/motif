import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { ButtonUiAction, CommandRegisterService, delay1Tick, InternalCommand, StringId, Strings } from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent } from 'controls-ng-api';

@Component({
    selector: 'app-advert-ticker',
    templateUrl: './advert-ticker-ng.component.html',
    styleUrls: ['./advert-ticker-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvertTickerNgComponent implements AfterViewInit, OnDestroy {
    @ViewChild('leftInterestedButton', { static: false }) private _leftInterestedButtonComponent: ButtonInputNgComponent;
    @ViewChild('rightInterestedButton', { static: false }) private _rightInterestedButtonComponent: ButtonInputNgComponent;

    private readonly _interestedUiAction: ButtonUiAction;

    private readonly _commandRegisterService: CommandRegisterService;

    constructor(commandRegisterNgService: CommandRegisterNgService) {
        this._commandRegisterService = commandRegisterNgService.service;

        this._interestedUiAction = this.createInterestedUiAction();
    }

    ngAfterViewInit() {
        delay1Tick(() => this.initialiseUiActions());
    }

    ngOnDestroy() {
        this.finalise();
    }

    private finalise() {
        this._interestedUiAction.finalise();
    }

    private createInterestedUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.RegisterInterestInFocusedAdvertisement;
        const displayId = StringId.Interested;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.AdvertTicker_InterestedTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private initialiseUiActions() {
        this._leftInterestedButtonComponent.initialise(this._interestedUiAction);
        this._rightInterestedButtonComponent.initialise(this._interestedUiAction);
    }
}
