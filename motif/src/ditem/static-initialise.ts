
import { BuiltinDitemFrameModule } from './builtin-ditem-frame';
import { DitemComponentModule } from './ditem-component';
import { SymbolsDitemNgComponentModule } from './symbols-ditem/ng-api';

export namespace StaticInitialise {
    export function initialise() {
        DitemComponentModule.initialiseStatic();
        BuiltinDitemFrameModule.initialiseStatic();
        SymbolsDitemNgComponentModule.initialiseStatic();
    }
}
