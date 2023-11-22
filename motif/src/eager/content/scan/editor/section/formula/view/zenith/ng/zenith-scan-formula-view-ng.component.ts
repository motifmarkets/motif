/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EnvironmentInjector, Injector, ViewChild, ViewContainerRef, createNgModule } from '@angular/core';
import { AssertInternalError, delay1Tick } from '@motifmarkets/motif-core';
import { CodeMirrorNgComponent } from 'code-mirror-ng-api';
import { ScanFormulaViewNgDirective } from '../../scan-formula-view-ng.directive';

@Component({
    selector: 'app-zenith-scan-formula-view',
    templateUrl: './zenith-scan-formula-view-ng.component.html',
    styleUrls: ['./zenith-scan-formula-view-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZenithScanFormulaViewNgComponent extends ScanFormulaViewNgDirective implements AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @ViewChild('editorContainer', { read: ViewContainerRef, static: true })
    private _editorContainer: ViewContainerRef;
    private _editorComponent: CodeMirrorNgComponent;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _environmentInjector: EnvironmentInjector,
        private readonly _injector: Injector,
    ) {
        super(elRef, ++ZenithScanFormulaViewNgComponent.typeInstanceCreateCount);
    }

    ngAfterViewInit(): void {
        delay1Tick(() => {
            const loadPromise = this.loadEditorComponent();
            AssertInternalError.throwErrorIfVoidPromiseRejected(loadPromise, 'ZSCVNCNAVID1T29871');
        });
    }

    async loadEditorComponent() {
        const moduleRef = await this.getCodeMirrorModuleInstance();
        const componentType = moduleRef.instance.codeMirrorComponentType;
        // const { CodeMirrorNgComponent: componentType } = await import('code-mirror-component');
        this._editorContainer.clear();
        const editorComponentRef = this._editorContainer.createComponent(componentType, {
            ngModuleRef: moduleRef,
            // environmentInjector: this._environmentInjector,
            injector: this._injector,
        });
        this._editorComponent = editorComponentRef.instance;
        this._editorComponent.docChangedEventer = () => this.processDocChanged();
        delay1Tick(() => this._editorComponent.initialise());
    }

    processDocChanged() {
        const doc = this._editorComponent.doc;

    }

    private async getCodeMirrorModuleInstance() {
        // https://stackoverflow.com/questions/75883330/how-to-load-lazy-modules-programmatically-in-angular-app
        const { CodeMirrorNgModule } = await import('code-mirror-ng-api')
        return createNgModule(CodeMirrorNgModule, this._injector);
    }
}

export namespace ZenithScanFormulaViewNgComponent {
}
