
import { BuiltinDitemFrameModule } from './builtin-ditem-frame';
import { DitemComponentModule } from './ditem-component';

export namespace StaticInitialise {
    export function initialise() {
        DitemComponentModule.initialiseStatic();
        BuiltinDitemFrameModule.initialiseStatic();
    }
}
