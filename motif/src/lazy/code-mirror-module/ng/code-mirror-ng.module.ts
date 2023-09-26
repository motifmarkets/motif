import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CodeMirrorNgComponent } from '../code-mirror/ng/code-mirror-ng.component';

@NgModule({
    declarations: [CodeMirrorNgComponent],
    imports: [CommonModule],
    bootstrap: [CodeMirrorNgComponent],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CodeMirrorNgModule {
    get codeMirrorComponentType() { return CodeMirrorNgComponent; }
}
