import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EagerControlsNgModule } from 'controls-ng-api';
import { DebugDiagnosticsNgComponent } from '../debug/ng-api';

@NgModule({
    declarations: [
        DebugDiagnosticsNgComponent,
    ],
    exports: [
        DebugDiagnosticsNgComponent,
    ],
    imports: [
        CommonModule,
        EagerControlsNgModule,
    ]
})

export class DiagnosticsNgModule {
    get debugComponentType() { return DebugDiagnosticsNgComponent; }
}
