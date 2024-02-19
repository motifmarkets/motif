/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { AssertInternalError, CommandRegisterService, IconButtonUiAction, InternalCommand, StringId, Strings } from '@motifmarkets/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-delete-scan-field-condition',
    templateUrl: './delete-scan-field-condition-ng.component.html',
    styleUrls: ['./delete-scan-field-condition-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteScanFieldConditionNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    @ViewChild('deleteControl', { static: true }) private _deleteControlComponent: SvgButtonNgComponent;

    deleteEventer: DeleteScanFieldConditionNgComponent.DeleteEventer | undefined;

    private readonly _deleteMeUiAction: IconButtonUiAction;

    constructor(
        elRef: ElementRef<HTMLElement>,
        commandRegisterNgService: CommandRegisterNgService,
    ) {
        super(elRef, ++DeleteScanFieldConditionNgComponent.typeInstanceCreateCount);

        const commandRegisterService = commandRegisterNgService.service;
        this._deleteMeUiAction = this.createDeleteMeUiAction(commandRegisterService);
    }

    ngAfterViewInit(): void {
        this._deleteControlComponent.initialise(this._deleteMeUiAction);
    }

    ngOnDestroy(): void {
        this._deleteMeUiAction.finalise();
    }

    private createDeleteMeUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanFieldCondition_DeleteMe;
        const displayId = StringId.ScanFieldConditionOperandsEditorCaption_DeleteMe;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditorTitle_DeleteMe]);
        action.pushIcon(IconButtonUiAction.IconId.Delete);
        action.pushUnselected();
        action.signalEvent = () => {
            if (this.deleteEventer === undefined) {
                throw new AssertInternalError('DSFCNCCDMUIA60912');
            } else {
                this.deleteEventer();
            }
        }

        return action;
    }
}

export namespace DeleteScanFieldConditionNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type DeleteEventer = (this: void) => void;
}
