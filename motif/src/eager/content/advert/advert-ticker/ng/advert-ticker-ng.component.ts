import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ButtonUiAction, CommandRegisterService, InternalCommand, StringId, Strings, delay1Tick } from '@motifmarkets/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent } from 'controls-ng-api';

@Component({
    selector: 'app-advert-ticker',
    templateUrl: './advert-ticker-ng.component.html',
    styleUrls: ['./advert-ticker-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvertTickerNgComponent extends ComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    @ViewChild('leftInterestedButton', { static: false }) private _leftInterestedButtonComponent: ButtonInputNgComponent;
    @ViewChild('rightInterestedButton', { static: false }) private _rightInterestedButtonComponent: ButtonInputNgComponent;

    private readonly _interestedUiAction: ButtonUiAction;

    private readonly _commandRegisterService: CommandRegisterService;

    constructor(elRef: ElementRef<HTMLElement>, commandRegisterNgService: CommandRegisterNgService) {
        super(elRef, ++AdvertTickerNgComponent.typeInstanceCreateCount);

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
