
import { BuiltinDitemFrameModule } from './builtin-ditem-frame';
import { DitemComponentModule } from './ditem-component';
import { SettingsDitemFrameModule } from './settings-ditem/internal-api';

export namespace StaticInitialise {
    export function initialise() {
        DitemComponentModule.initialiseStatic();
        BuiltinDitemFrameModule.initialiseStatic();
        SettingsDitemFrameModule.initialiseStatic();
    }
}
