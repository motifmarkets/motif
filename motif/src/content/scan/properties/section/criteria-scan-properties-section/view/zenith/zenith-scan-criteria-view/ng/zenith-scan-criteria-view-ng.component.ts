/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { delay1Tick } from '@motifmarkets/motif-core';
import { CodeMirrorNgComponent } from 'third-party-ng-api';

@Component({
    selector: 'app-zenith-scan-criteria-view-ng',
    templateUrl: './zenith-scan-criteria-view-ng.component.html',
    styleUrls: ['./zenith-scan-criteria-view-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZenithScanCriteriaViewNgComponent implements AfterViewInit {
    @ViewChild('editorContainer', { read: ViewContainerRef, static: true })
    private _editorContainer: ViewContainerRef;
    private _editorComponent: CodeMirrorNgComponent;

    constructor() {}

    ngAfterViewInit(): void {
        delay1Tick(() => this.loadEditorComponent());
    }

    async loadEditorComponent() {
        const { CodeMirrorNgComponent: componentType } =
            await import('src/third-party/code-mirror-module/code-mirror/ng/code-mirror-ng.component');
        this._editorContainer.clear();
        const editorComponentRef = this._editorContainer.createComponent(componentType);
        this._editorComponent = editorComponentRef.instance;
        this._editorComponent.docChangedEventer = () => this.processDocChanged();
        delay1Tick(() => this._editorComponent.initialise());
    }

    processDocChanged() {
        const doc = this._editorComponent.doc;

    }
}

export namespace ZenithScanCriteriaViewNgComponent {
}
