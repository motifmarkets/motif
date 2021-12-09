/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Directive, ViewChild } from '@angular/core';
import {
    CommandContext,
    CommandParameters,
    CommandRegisterService,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings,
} from '@motifmarkets/motif-core';
import { SvgButtonNgComponent } from 'controls-ng-api';

@Directive()
export abstract class CommandParametersComponentNgDirective {
    @ViewChild('executeButton', { static: true }) private _executeButtonComponent: SvgButtonNgComponent;

    executeEvent: CommandParametersComponentDirective.ExecuteEvent;

    private _commandParameters: CommandParameters;
    private _executeUiAction: IconButtonUiAction;

    constructor(private _commandRegisterService: CommandRegisterService) {
        this._executeUiAction = this.createExecuteUiAction();
    }

    get parameters() { return this._commandParameters; }

    setContext(context: CommandContext) {
        this._commandParameters = this.createParameters(context);
    }

    protected initialise() {
        this._executeButtonComponent.initialise(this._executeUiAction);
    }

    protected finalise() {
        this._executeUiAction.finalise();
    }

    protected notifyExecute() {
        this.executeEvent(this);
    }

    private handleExecuteSignalEvent() {
        this.notifyExecute();
    }

    private createExecuteUiAction() {
        const commandName = InternalCommand.Name.ApplySymbol;
        const displayId = StringId.ApplySymbolCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ExecuteCommandTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Execute);
        action.signalEvent = () => this.handleExecuteSignalEvent();
        return action;
    }

    protected abstract createParameters(context: CommandContext): CommandParameters;
}

export namespace CommandParametersComponentDirective {
    export type ExecuteEvent = (this: void, sender: CommandParametersComponentNgDirective) => void;
}
