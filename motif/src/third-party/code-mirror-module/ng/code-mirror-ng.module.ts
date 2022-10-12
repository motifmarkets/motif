import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CodeMirrorNgComponent } from '../code-mirror/ng/code-mirror-ng.component';

@NgModule({
    declarations: [CodeMirrorNgComponent],
    imports: [CommonModule],
    bootstrap: [CodeMirrorNgComponent],
})
export class CodeMirrorNgModule {

}
