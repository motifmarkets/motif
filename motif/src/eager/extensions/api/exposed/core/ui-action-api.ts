import { ModifierKeys } from '../sys/modifier-key-api';

/** @public */
export interface UiAction {
    readonly state: UiAction.State;
    readonly enabled: boolean;
    readonly edited: boolean;
    readonly editedValid: boolean;
    readonly editedInvalidErrorText: string | undefined;
    readonly inputtedText: string;
    readonly caption: string;
    readonly title: string;
    readonly placeholder: string;

    required: boolean;
    commitOnAnyValidInput: boolean;
    autoAcceptanceType: UiAction.AutoAcceptanceType;
    autoEchoCommit: boolean;
    autoInvalid: boolean;

    commitEventer: UiAction.CommitEventHandler | undefined;
    inputEventer: UiAction.InputEventHandler | undefined;
    signalEventer: UiAction.SignalEventHandler | undefined;
    editedChangeEventer: UiAction.EditedChangeEventHandler | undefined;

    pushState(newState: UiAction.State, stateTitleText?: string): void;
    pushDisabled(disabledTitleText?: string): void;
    pushReadonly(): void;
    pushInvalid(invalidTitleText?: string): void;
    pushValid(titleText?: string): void;
    pushAccepted(value?: boolean): void;
    pushWaiting(waitingTitleText?: string): void;
    pushWarning(warningTitleText?: string): void;
    pushError(errorTitleText?: string): void;
    pushCaption(value: string): void;
    pushTitle(value: string): void;
    pushPlaceholder(value: string): void;
    cancelEdit(): void;
    isValueOk(): boolean;
}

/** @public */
export namespace UiAction {
    export type CommitEventHandler = (this: void, type: UiAction.CommitType) => void;
    export type InputEventHandler = (this: void) => void;
    export type SignalEventHandler = (this: void, signalType: SignalType, downKeys: ModifierKeys) => void;
    export type EditedChangeEventHandler = (this: void) => void;

    export const enum StateEnum {
        Disabled = 'Disabled', // value cannot be used
        Readonly = 'Readonly', // value is acceptable but but cannot changed
        Missing = 'Missing', // value is committed but undefined and required
        Invalid = 'Invalid', // value is not committed (edited) but not valid
        Valid = 'Valid', // value is committed, present and valid but not accepted by application
        Accepted = 'Accepted', // value is committed, present, valid and accepted by application
        Waiting = 'Waiting', // value is committed, present, valid and accepted by application but resulted to waiting
        Warning = 'Warning', // value is committed, present, valid and accepted by application but resulted in Warning
        Error = 'Error', // value is committed, present, valid and accepted by application but resulted in Error
    }
    export type State = keyof typeof StateEnum;

    export const enum CommitTypeEnum {
        Implicit = 'Implicit',
        Explicit = 'Explicit',
        Input = 'Input',
    }
    export type CommitType = keyof typeof CommitTypeEnum;

    export const enum SignalTypeEnum {
        MouseClick = 'MouseClick',
        EnterKeyPress = 'EnterKeyPress',
        SpacebarKeyPress = 'SpacebarKeyPress',
        KeyboardShortcut = 'KeyboardShortcut',
    }
    export type SignalType = keyof typeof SignalTypeEnum;

    export const enum AutoAcceptanceTypeEnum {
        None = 'None',
        Valid = 'Valid',
        Accepted = 'Accepted',
    }
    export type AutoAcceptanceType = keyof typeof AutoAcceptanceTypeEnum;
}
