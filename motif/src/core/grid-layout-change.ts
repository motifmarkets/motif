/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from 'src/sys/internal-api';

export namespace GridLayoutChange {

    export enum ActionId {
        MoveUp,
        MoveTop,
        MoveDown,
        MoveBottom,
        SetVisible,
        SetWidth,
    }

    export interface ActionBase {
        id: ActionId;
    }

    export interface MoveUp extends ActionBase {
        id: ActionId.MoveUp;
        columnIndex: Integer;
    }

    export interface MoveTop extends ActionBase {
        id: ActionId.MoveTop;
        columnIndex: Integer;
    }

    export interface MoveDown extends ActionBase {
        id: ActionId.MoveDown;
        columnIndex: Integer;
    }

    export interface MoveBottom extends ActionBase {
        id: ActionId.MoveBottom;
        columnIndex: Integer;
    }

    export interface SetVisible extends ActionBase {
        id: ActionId.SetVisible;
        visible: boolean;
        columnIndex: Integer;
    }

    export interface SetWidth extends ActionBase {
        id: ActionId.SetWidth;
        width: Integer;
        columnIndex: Integer;
    }

    export type Action =
        | MoveUp
        | MoveTop
        | MoveDown
        | MoveBottom
        | SetVisible
        | SetWidth;
}




