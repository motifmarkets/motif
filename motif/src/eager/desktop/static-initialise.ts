import { DitemComponentFactoryNgServiceModule } from './ng/ditem-component-factory-ng.service';

export namespace StaticInitialise {
    export function initialise() {
        DitemComponentFactoryNgServiceModule.initialiseStatic();
    }
}
