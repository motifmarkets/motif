import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { ButtonUiAction, CommandRegisterService, delay1Tick, InternalCommand, StringId, Strings } from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { ButtonInputNgComponent } from 'controls-ng-api';

@Component({
    selector: 'app-banner-advert',
    templateUrl: './banner-advert-ng.component.html',
    styleUrls: ['./banner-advert-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerAdvertNgComponent implements AfterViewInit, OnDestroy {
    @ViewChild('leftContactMeButton', { static: true }) private _leftContactMeButtonComponent: ButtonInputNgComponent;
    @ViewChild('leftInterestedButton', { static: false }) private _leftInterestedButtonComponent: ButtonInputNgComponent;
    @ViewChild('leftSimilarButton', { static: true }) private _leftSimilarButtonComponent: ButtonInputNgComponent;
    @ViewChild('leftNotInterestedButton', { static: true }) private _leftNotInterestedButtonComponent: ButtonInputNgComponent;
    @ViewChild('rightContactMeButton', { static: true }) private _rightContactMeButtonComponent: ButtonInputNgComponent;
    @ViewChild('rightInterestedButton', { static: false }) private _rightInterestedButtonComponent: ButtonInputNgComponent;
    @ViewChild('rightSimilarButton', { static: true }) private _rightSimilarButtonComponent: ButtonInputNgComponent;
    @ViewChild('rightNotInterestedButton', { static: true }) private _rightNotInterestedButtonComponent: ButtonInputNgComponent;

    private readonly _contactMeUiAction: ButtonUiAction;
    private readonly _interestedUiAction: ButtonUiAction;
    private readonly _similarUiAction: ButtonUiAction;
    private readonly _notInterestedUiAction: ButtonUiAction;

    private readonly _commandRegisterService: CommandRegisterService;

    constructor(commandRegisterNgService: CommandRegisterNgService) {
        this._commandRegisterService = commandRegisterNgService.service;

        this._contactMeUiAction = this.createContactMeUiAction();
        this._interestedUiAction = this.createInterestedUiAction();
        this._similarUiAction = this.createSimilarUiAction();
        this._notInterestedUiAction = this.createNotInterestedUiAction();
    }

    ngAfterViewInit(): void {
        delay1Tick(() => this.initialise());
    }

    ngOnDestroy(): void {
        this.finalise();
    }

    private initialise() {
        this._leftContactMeButtonComponent.initialise(this._contactMeUiAction);
        this._leftInterestedButtonComponent.initialise(this._interestedUiAction);
        this._leftSimilarButtonComponent.initialise(this._similarUiAction);
        this._leftNotInterestedButtonComponent.initialise(this._notInterestedUiAction);
        this._rightContactMeButtonComponent.initialise(this._contactMeUiAction);
        this._rightInterestedButtonComponent.initialise(this._interestedUiAction);
        this._rightSimilarButtonComponent.initialise(this._similarUiAction);
        this._rightNotInterestedButtonComponent.initialise(this._notInterestedUiAction);
        }

    private finalise() {
        this._contactMeUiAction.finalise();
        this._interestedUiAction.finalise();
        this._similarUiAction.finalise();
        this._notInterestedUiAction.finalise();
    }

    private createContactMeUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.RegisterContactRequestRegardingFocusedAdvertisement;
        const displayId = StringId.ContactMe;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.BannerAdvert_ContactMeTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createInterestedUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.RegisterInterestInFocusedAdvertisement;
        const displayId = StringId.Interested;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.BannerAdvert_InterestedTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createSimilarUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.RegisterInterestInSimilarToFocusedAdvertisement;
        const displayId = StringId.Similar;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.BannerAdvert_SimilarTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createNotInterestedUiAction(): ButtonUiAction {
        const commandName = InternalCommand.Id.RegisterNotInterestedInFocusedAdvertisement;
        const displayId = StringId.NotInterested;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.BannerAdvert_NotInterestedTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }
}
