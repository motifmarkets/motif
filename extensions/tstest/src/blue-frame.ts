import { Frame, FrameSvc } from 'motif';
import './blue-frame.css';

export class BlueFrame implements Frame {
    static get frameTypeName() { return 'blue'; }

    private readonly _rootHtmlElement: HTMLElement;

    get rootHtmlElement() { return this._rootHtmlElement; }
    get svc() { return this._svc; }

    constructor(private readonly _svc: FrameSvc) {
        this._rootHtmlElement = document.createElement('div');
        this._rootHtmlElement.classList.add('root');
    }

    async initialise() {
        const paraElement = document.createElement('p');
        paraElement.classList.add('main-para');
        paraElement.textContent = 'Hello';
        this._rootHtmlElement.appendChild(paraElement);
        const symbolSelectControl = await this.svc.controlsSvc.createLitIvemIdSelect();
        const symbolSelectElement = symbolSelectControl.rootHtmlElement;
        symbolSelectElement.classList.add('symbol-select');
        this._rootHtmlElement.appendChild(symbolSelectElement);
    }
}