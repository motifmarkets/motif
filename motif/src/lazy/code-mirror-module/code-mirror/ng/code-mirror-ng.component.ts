/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { lintGutter, linter } from '@codemirror/lint';
import { EditorState } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { basicSetup } from 'codemirror';

@Component({
    selector: 'app-code-mirror-ng',
    templateUrl: './code-mirror-ng.component.html',
    styleUrls: ['./code-mirror-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeMirrorNgComponent implements OnDestroy {
    docChangedEventer: CodeMirrorNgComponent.DocChangedEventer;

    private _editor: EditorView;
    constructor(private _ngZone: NgZone, private readonly _elRef: ElementRef<HTMLElement>) {
    }

    get doc() {
        return this._editor.state.doc;
    }

    ngOnDestroy(): void {
        if (this._editor !== undefined) {
            this._editor.destroy();
        }
    }

    initialise() {
        this._ngZone.runOutsideAngular(() => this.createCodeMirror());
    }

    private createCodeMirror() {
        const state = EditorState.create({
            extensions: [
                basicSetup,
                json(),
                lintGutter(),
                linter(jsonParseLinter()),
                EditorView.updateListener.of(
                    (v: ViewUpdate) => {
                        if (v.docChanged) {
                            this._ngZone.run(() => this.docChangedEventer());
                        }
                    }
                )
            ]
        });
        this._editor = new EditorView({
            state,
            parent: this._elRef.nativeElement,
        });
    }
}

export namespace CodeMirrorNgComponent {
    export type DocChangedEventer = (this: void) => void;
}
