import { Frame, FrameSvc, Json } from 'motif';
import './non-web-page-frame.css';

export class NonWebPageFrame implements Frame {
    static get frameTypeName() { return 'NonWebPageFrame'; }

    private readonly _rootHtmlElement: HTMLElement;

    get rootHtmlElement() { return this._rootHtmlElement; }
    get svc() { return this._svc; }

    constructor(private readonly _svc: FrameSvc) {
        this._rootHtmlElement = document.createElement('div');
        this._rootHtmlElement.classList.add('root');
        this._rootHtmlElement.style.position = 'absolute';
        this._rootHtmlElement.style.overflow = 'hidden';

        const h1Element = document.createElement('h1');
        h1Element.classList.add('heading');
        h1Element.textContent = 'Non Web Page Frame';
        const paraElement = document.createElement('p');
        paraElement.textContent = 'This is not a web page.  However it is included to demonstrate how other Frame types can be included';
        this._rootHtmlElement.appendChild(h1Element);
        this._rootHtmlElement.appendChild(paraElement);
    }
}

export namespace WebPageFrame {
    export interface FrameConfig extends Json {
        url: string;
    }
}