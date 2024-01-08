export const enum ModifierKeyEnum {
    Alt = 'Alt',
    Ctrl = 'Ctrl',
    Meta = 'Meta',
    Shift = 'Shift',
}
export type ModifierKey = keyof typeof ModifierKeyEnum;

export type ModifierKeys = ModifierKey[];
