/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ComponentFactoryResolver,
    OnDestroy,
    Type,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    AssertInternalError, Command,
    CommandContext,
    CommandProcessor,
    CommandRegisterService, delay1Tick, ProcessorCommandUiAction
} from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { CommandParametersComponentRegister } from '../../command-parameters-component-register';
import { CommandSelectNgComponent } from '../../command-select/ng-api';
import { CommandParametersComponentNgDirective } from '../../ng/ng-api';

@Component({
    selector: 'app-command-bar',
    templateUrl: './command-bar-ng.component.html',
    styleUrls: ['./command-bar-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandBarNgComponent implements OnDestroy, AfterViewInit {
    @ViewChild('commandSelect', { static: true })
    private _commandSelectComponent: CommandSelectNgComponent;
    @ViewChild('parametersContainer', { read: ViewContainerRef, static: true })
    private _parametersContainer: ViewContainerRef;

    private _commandUiAction: ProcessorCommandUiAction;
    private _processors: CommandProcessor[] = [];

    private _activeProcessor: CommandProcessor | undefined;
    private _activeCommand: Command | undefined;

    constructor(
        private _resolver: ComponentFactoryResolver,
        commandRegisterNgService: CommandRegisterNgService
    ) {
        this._commandUiAction = this.createCommandUiAction(
            commandRegisterNgService.service
        );
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this._commandUiAction.latestItemsWantedEvent = () =>
            this.handleCommandUiActionLatestItemsWantedEvent();
        delay1Tick(() => this.initialiseComponents());
    }

    addCommandProcessor(processor: CommandProcessor) {
        this._processors.push(processor);
    }

    protected finalise() {
        this._commandUiAction.finalise();
    }

    private handleCommandCommitEvent() {
        const item = this._commandUiAction.value;
        if (item === undefined) {
            this.closeParametersComponent();
        } else {
            const processor = item.processor;
            const command = item.command;
            const context = processor.createCommandContext(command);
            const componentType = CommandParametersComponentRegister.getComponentType(
                command
            );
            if (componentType === undefined) {
                throw new AssertInternalError('CBCHS945773810909');
            } else {
                this._activeProcessor = processor;
                this._activeCommand = command;
                this.openParametersComponent(componentType, context);
            }
        }
    }

    private handleCommandUiActionLatestItemsWantedEvent() {
        const maxCommandCount = this._processors.reduce(
            (commandCount, processor) =>
                (commandCount += processor.commandCount),
            0
        );
        const items = new Array<ProcessorCommandUiAction.Item>(maxCommandCount);
        let itemCount = 0;
        const processorCount = this._processors.length;
        for (let i = 0; i < processorCount; i++) {
            const processor = this._processors[i];
            const commands = processor.getBarExecutableCommands();
            commands.forEach(
                (command) => (items[itemCount++] = { command, processor })
            );
        }
        items.length = itemCount;
        this._commandUiAction.pushItems(items);
    }

    private handleParameterComponentsExecuteEvent(
        sender: CommandParametersComponentNgDirective
    ) {
        const processor = this._activeProcessor;
        const command = this._activeCommand;
        if (processor === undefined || command === undefined) {
            throw new AssertInternalError('CBCHPCEE67778490993');
        } else {
            processor.executeCommand(command.name, sender.parameters);
        }
    }

    private initialiseComponents() {
        this._commandSelectComponent.initialise(this._commandUiAction);
    }

    private createCommandUiAction(
        commandRegisterService: CommandRegisterService
    ) {
        const action = new ProcessorCommandUiAction(commandRegisterService);
        action.commitEvent = () => this.handleCommandCommitEvent();
        return action;
    }

    private openParametersComponent(
        parametersComponentType: Type<CommandParametersComponentNgDirective>,
        context: CommandContext
    ) {
        this.closeParametersComponent();
        const factory = this._resolver.resolveComponentFactory(
            parametersComponentType
        );
        const componentRef = this._parametersContainer.createComponent(factory);

        const component = componentRef.instance as CommandParametersComponentNgDirective;

        component.setContext(context);

        component.executeEvent = (sender) =>
            this.handleParameterComponentsExecuteEvent(sender);
    }

    private closeParametersComponent() {
        this._parametersContainer.clear();
        this._activeProcessor = undefined;
        this._activeCommand = undefined;
    }
}
