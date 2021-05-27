/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from 'src/sys/internal-api';

export class ZenithWebsocket {
    private static readonly _protocol = 'ZenithJson';

    openEvent: ZenithWebsocket.OpenEvent;
    messageEvent: ZenithWebsocket.MessageEvent;
    closeEvent: ZenithWebsocket.CloseEvent;
    errorEvent: ZenithWebsocket.ErrorEvent;

    private _lastOpenWaitId: Integer;
    private _lastAuthWaitId: Integer;
    private _lastAuthTransactionId: Integer;

    private _webSocket: WebSocket;

    get openWaitId() { return this._lastOpenWaitId; }
    get lastAuthWaitId() { return this._lastAuthWaitId; }
    get lastAuthTransactionId() { return this._lastAuthTransactionId; }
    get readyState() {
        if (this._webSocket === undefined) {
            return ZenithWebsocket.ReadyState.Closed;
        } else {
            return this._webSocket.readyState;
        }
    }

    open(endpoint: string, waitId: Integer) {
        this._lastOpenWaitId = waitId;
        this._webSocket = new WebSocket(endpoint, ZenithWebsocket._protocol);
        this._webSocket.addEventListener('open', (ev) => this.handleOpen(ev));
        this._webSocket.addEventListener('message', (ev) => this.handleMessage(ev));
        this._webSocket.addEventListener('close', (ev) => this.handleClose(ev));
        this._webSocket.addEventListener('error', (ev) => this.handleError(ev));
    }

    sendAuth(data: string, transactionId: Integer, waitId: Integer) {
        this._lastAuthTransactionId = transactionId;
        this._lastAuthWaitId = waitId;
        this.send(data);
    }

    send(data: string) {
        this._webSocket.send(data);
    }

    close(code: number, reason: string) {
        this._webSocket.close(code, reason);
    }

    private handleOpen(ev: Event) {
        this.openEvent();
    }

    private handleMessage(ev: Event) {
        if (ev instanceof MessageEvent) {
            this.messageEvent(ev.data);
        }
    }

    private handleClose(ev: Event) {
        if (ev instanceof CloseEvent) {
            this.closeEvent(ev.code, ev.reason, ev.wasClean);
        }
    }

    private handleError(ev: Event) {
        this.errorEvent(ev.type);
    }
}

export namespace ZenithWebsocket {
    export const enum ReadyState { // gives API values a name
        Connecting = 0,
        Open = 1,
        Closing = 2,
        Closed = 3
    }

    export type OpenEvent = (this: void) => void;
    export type MessageEvent = (message: unknown) => void;
    export type CloseEvent = (code: number, reason: string, wasClean: boolean) => void;
    export type ErrorEvent = (type: string) => void;
}
