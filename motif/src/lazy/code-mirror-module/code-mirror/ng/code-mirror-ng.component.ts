/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { lintGutter, lintKeymap, linter } from '@codemirror/lint';
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import {
    EditorView,
    ViewUpdate,
    crosshairCursor,
    drawSelection,
    dropCursor,
    highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars,
    keymap,
    lineNumbers,
    rectangularSelection,
} from '@codemirror/view';

@Component({
    selector: 'app-code-mirror-ng',
    templateUrl: './code-mirror-ng.component.html',
    styleUrls: ['./code-mirror-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeMirrorNgComponent implements OnDestroy {
    docChangedEventer: CodeMirrorNgComponent.DocChangedEventer;

    private _editor: EditorView;
    private _textSetting = false;
    constructor(private _ngZone: NgZone, private readonly _elRef: ElementRef<HTMLElement>) {
    }

    get textSetting() { return this._textSetting; }

    get text() {
        return this._editor.state.doc.sliceString(0);
    }

    set text(value: string) {
        this._textSetting = true;
        const editor = this._editor;
        editor.dispatch({
            changes: { from: 0, to: editor.state.doc.length, insert: value }
        });
        this._textSetting = false;
    }

    ngOnDestroy(): void {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
                [
                    // basicSetup
                    lineNumbers(),
                    highlightActiveLineGutter(),
                    highlightSpecialChars(),
                    history(),
                    foldGutter(),
                    drawSelection(),
                    dropCursor(),
                    // EditorState.allowMultipleSelections.of(true),
                    indentOnInput(),
                    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                    bracketMatching(),
                    closeBrackets(),
                    autocompletion(),
                    rectangularSelection(),
                    crosshairCursor(),
                    highlightActiveLine(),
                    highlightSelectionMatches(),
                    keymap.of([
                        ...closeBracketsKeymap,
                        ...defaultKeymap,
                        ...searchKeymap,
                        ...historyKeymap,
                        ...foldKeymap,
                        ...completionKeymap,
                        ...lintKeymap
                    ])
                ],
                json(),
                lintGutter(),
                linter(jsonParseLinter()),
                oneDark,
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
