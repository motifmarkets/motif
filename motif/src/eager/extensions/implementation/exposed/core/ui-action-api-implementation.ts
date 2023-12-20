/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ModifierKey, UiAction, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ApiError as ApiErrorApi, UiAction as UiActionApi } from '../../../api/extension-api';
import { UnreachableCaseApiErrorImplementation } from '../sys/api-error-api-implementation';
import { ModifierKeyImplementation } from '../sys/modifier-key-implementation';

export class UiActionImplementation implements UiActionApi {
    commitEventer: UiActionApi.CommitEventHandler | undefined;
    inputEventer: UiActionApi.InputEventHandler | undefined;
    signalEventer: UiActionApi.SignalEventHandler | undefined;
    editedChangeEventer: UiActionApi.EditedChangeEventHandler | undefined;

    constructor(private readonly _actual: UiAction) {
        this._actual.commitEvent = (typeId) => this.handleCommitEvent(typeId);
        this._actual.inputEvent = () => this.handleInputEvent();
        this._actual.signalEvent = (signalTypeId, downKeys) => this.handleSignalEvent(signalTypeId, downKeys);
        this._actual.editedChangeEvent = () => this.handleEditedChangeEvent();
    }

    get state() { return UiActionImplementation.StateId.toApi(this._actual.stateId); }
    get enabled() { return this._actual.enabled; }
    get edited() { return this._actual.edited; }
    get editedValid() { return this._actual.editedValid; }
    get editedInvalidErrorText() { return this._actual.editedInvalidErrorText; }
    get inputtedText() { return this._actual.inputtedText; }
    get caption() { return this._actual.caption; }
    get title() { return this._actual.title; }
    get placeholder() { return this._actual.placeholder; }

    get required() { return this._actual.valueRequired; }
    set required(value: boolean) { this._actual.valueRequired = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get commitOnAnyValidInput() { return this._actual.commitOnAnyValidInput; }
    set commitOnAnyValidInput(value: boolean) { this._actual.commitOnAnyValidInput = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get autoAcceptanceType() { return UiActionImplementation.AutoAcceptanceTypeId.toApi(this._actual.autoAcceptanceTypeId); }
    set autoAcceptanceType(value: UiActionApi.AutoAcceptanceType) {
        this._actual.autoAcceptanceTypeId = UiActionImplementation.AutoAcceptanceTypeId.fromApi(value);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get autoEchoCommit() { return this._actual.autoEchoCommit; }
    set autoEchoCommit(value: boolean) { this._actual.autoEchoCommit = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get autoInvalid() { return this._actual.autoInvalid; }
    set autoInvalid(value: boolean) { this._actual.autoInvalid = value; }

    destroy() {
        this._actual.finalise();
    }

    pushState(newStateId: UiActionApi.State, stateTitleText?: string) {
        this._actual.pushState(UiActionImplementation.StateId.fromApi(newStateId), stateTitleText);
    }

    pushDisabled(disabledTitleText?: string) {
        this._actual.pushDisabled(disabledTitleText);
    }

    pushReadonly() {
        this._actual.pushReadonly();
    }

    pushInvalid(invalidTitleText?: string) {
        this._actual.pushInvalid(invalidTitleText);
    }

    pushValid(titleText?: string) {
        this._actual.pushValidOrMissing(titleText);
    }

    pushAccepted(value?: boolean) {
        this._actual.pushAccepted(value);
    }

    pushWaiting(waitingTitleText?: string) {
        this._actual.pushWaiting(waitingTitleText);
    }

    pushWarning(warningTitleText?: string) {
        this._actual.pushWarning(warningTitleText);
    }

    pushError(errorTitleText?: string) {
        this._actual.pushError(errorTitleText);
    }

    pushCaption(value: string) {
        this._actual.pushCaption(value);
    }

    pushTitle(value: string) {
        this._actual.pushTitle(value);
    }

    pushPlaceholder(value: string) {
        this._actual.pushPlaceholder(value);
    }

    cancelEdit() {
        this._actual.cancelEdit();
    }

    isValueOk() {
        return this._actual.isValueOk();
    }

    private handleCommitEvent(typeId: UiAction.CommitTypeId) {
        if (this.commitEventer !== undefined) {
            const apiCommitTypeId = UiActionImplementation.CommitTypeId.toApi(typeId);
            this.commitEventer(apiCommitTypeId);
        }
    }

    private handleInputEvent() {
        if (this.inputEventer !== undefined) {
            this.inputEventer();
        }
    }

    private handleSignalEvent(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        if (this.signalEventer !== undefined) {
            const apiSignalTypeId = UiActionImplementation.SignalTypeId.toApi(signalTypeId);
            const apiDownKeys = ModifierKeyImplementation.setToApi(downKeys);
            this.signalEventer(apiSignalTypeId, apiDownKeys);
        }
    }

    private handleEditedChangeEvent() {
        if (this.editedChangeEventer !== undefined) {
            this.editedChangeEventer();
        }
    }
}

export namespace UiActionImplementation {
    export namespace StateId {
        export function toApi(value: UiAction.StateId): UiActionApi.State {
            switch (value) {
                case UiAction.StateId.Disabled: return UiActionApi.StateEnum.Disabled;
                case UiAction.StateId.Readonly: return UiActionApi.StateEnum.Readonly;
                case UiAction.StateId.Missing: return UiActionApi.StateEnum.Missing;
                case UiAction.StateId.Invalid: return UiActionApi.StateEnum.Invalid;
                case UiAction.StateId.Valid: return UiActionApi.StateEnum.Valid;
                case UiAction.StateId.Accepted: return UiActionApi.StateEnum.Accepted;
                case UiAction.StateId.Waiting: return UiActionApi.StateEnum.Waiting;
                case UiAction.StateId.Warning: return UiActionApi.StateEnum.Warning;
                case UiAction.StateId.Error: return UiActionApi.StateEnum.Error;
                default: throw new UnreachableCaseError('UAAIRSITA88842222', value);
            }
        }

        export function fromApi(value: UiActionApi.State): UiAction.StateId {
            const enumValue = value as UiActionApi.StateEnum;
            switch (enumValue) {
                case UiActionApi.StateEnum.Disabled: return UiAction.StateId.Disabled;
                case UiActionApi.StateEnum.Readonly: return UiAction.StateId.Readonly;
                case UiActionApi.StateEnum.Missing: return UiAction.StateId.Missing;
                case UiActionApi.StateEnum.Invalid: return UiAction.StateId.Invalid;
                case UiActionApi.StateEnum.Valid: return UiAction.StateId.Valid;
                case UiActionApi.StateEnum.Accepted: return UiAction.StateId.Accepted;
                case UiActionApi.StateEnum.Waiting: return UiAction.StateId.Waiting;
                case UiActionApi.StateEnum.Warning: return UiAction.StateId.Warning;
                case UiActionApi.StateEnum.Error: return UiAction.StateId.Error;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidUiActionState, enumValue);
            }
        }
    }

    export namespace CommitTypeId {
        export function toApi(value: UiAction.CommitTypeId): UiActionApi.CommitType {
            switch (value) {
                case UiAction.CommitTypeId.Implicit: return UiActionApi.CommitTypeEnum.Implicit;
                case UiAction.CommitTypeId.Explicit: return UiActionApi.CommitTypeEnum.Explicit;
                case UiAction.CommitTypeId.Input: return UiActionApi.CommitTypeEnum.Input;
                default: throw new UnreachableCaseError('UAAIRCTITA98842222', value);
            }
        }

        export function fromApi(value: UiActionApi.CommitType): UiAction.CommitTypeId {
            const enumValue = value as UiActionApi.CommitTypeEnum;
            switch (enumValue) {
                case UiActionApi.CommitTypeEnum.Implicit: return UiAction.CommitTypeId.Implicit;
                case UiActionApi.CommitTypeEnum.Explicit: return UiAction.CommitTypeId.Explicit;
                case UiActionApi.CommitTypeEnum.Input: return UiAction.CommitTypeId.Input;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidUiActionCommitType, enumValue);
            }
        }
    }

    export namespace AutoAcceptanceTypeId {
        export function toApi(value: UiAction.AutoAcceptanceTypeId): UiActionApi.AutoAcceptanceType {
            switch (value) {
                case UiAction.AutoAcceptanceTypeId.None: return UiActionApi.AutoAcceptanceTypeEnum.None;
                case UiAction.AutoAcceptanceTypeId.Valid: return UiActionApi.AutoAcceptanceTypeEnum.Valid;
                case UiAction.AutoAcceptanceTypeId.Accepted: return UiActionApi.AutoAcceptanceTypeEnum.Accepted;
                default: throw new UnreachableCaseError('UAAIRAATITA98843322', value);
            }
        }

        export function fromApi(value: UiActionApi.AutoAcceptanceType): UiAction.AutoAcceptanceTypeId {
            const enumValue = value as UiActionApi.AutoAcceptanceTypeEnum;
            switch (enumValue) {
                case UiActionApi.AutoAcceptanceTypeEnum.None: return UiAction.AutoAcceptanceTypeId.None;
                case UiActionApi.AutoAcceptanceTypeEnum.Valid: return UiAction.AutoAcceptanceTypeId.Valid;
                case UiActionApi.AutoAcceptanceTypeEnum.Accepted: return UiAction.AutoAcceptanceTypeId.Accepted;
                default: throw new UnreachableCaseApiErrorImplementation(ApiErrorApi.CodeEnum.InvalidUiActionAutoAcceptanceType, enumValue);
            }
        }
    }

    export namespace SignalTypeId {
        export function toApi(value: UiAction.SignalTypeId): UiActionApi.SignalType {
            switch (value) {
                case UiAction.SignalTypeId.MouseClick: return UiActionApi.SignalTypeEnum.MouseClick;
                case UiAction.SignalTypeId.EnterKeyPress: return UiActionApi.SignalTypeEnum.EnterKeyPress;
                case UiAction.SignalTypeId.SpacebarKeyPress: return UiActionApi.SignalTypeEnum.SpacebarKeyPress;
                case UiAction.SignalTypeId.KeyboardShortcut: return UiActionApi.SignalTypeEnum.KeyboardShortcut;
                default: throw new UnreachableCaseError('UAAIRSTITA58843322', value);
            }
        }
    }
}
