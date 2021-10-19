import { Frame, FrameSvc, Json } from 'motif';
import './web-page-frame.css';

export class WebPageFrame implements Frame {
    static get frameTypeName() { return 'webPage'; }

    private readonly _rootHtmlElement: HTMLElement;

    get rootHtmlElement() { return this._rootHtmlElement; }
    get svc() { return this._svc; }

    constructor(private readonly _svc: FrameSvc, config: WebPageFrame.FrameConfig) {
        this._rootHtmlElement = document.createElement('div');
        this._rootHtmlElement.classList.add('root');
        this._rootHtmlElement.style.position = 'absolute';
        this._rootHtmlElement.style.overflow = 'hidden';

        const iframeElement = document.createElement('iframe') as HTMLIFrameElement;
        iframeElement.height = '100%';
        iframeElement.width = '100%';
        iframeElement.setAttribute('sandbox', '');
        iframeElement.src = config.url;

        this._rootHtmlElement.appendChild(iframeElement);
    }

    async initialise() {
    }
}

export namespace WebPageFrame {
    export interface FrameConfig extends Json {
        url: string;
    }
}