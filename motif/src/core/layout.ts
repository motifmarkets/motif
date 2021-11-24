import { LayoutConfig } from 'golden-layout';
import { nanoid } from 'nanoid';
import { StringId, Strings } from 'res-internal-api';
import { Json, JsonElement } from 'sys-internal-api';
import { MotifServicesInstanceItem } from './motif-services-instance-item';

export interface Layout {
    readonly name: string;
    readonly description: string;
    readonly instanceId: string;
    readonly golden: LayoutConfig;
    // readonly serialisationHash: number;
}

export interface SerialisedLayout extends MotifServicesInstanceItem {
    readonly description: string;
    readonly golden: Json;

    readonly serialisationFormat: string;
}

export interface BackwardsCompatibleSerialisedLayout extends SerialisedLayout {
    readonly schemaVersion: string; // '2'
}

export namespace Layout {
    export namespace JsonName {
        export const name = 'name';
        export const description = 'description';
        export const instanceId = 'instanceId';
        export const golden = 'golden';
        export const serialisationFormat = 'serialisationFormat';
        export const schemaVersion = 'schemaVersion'; // backwards compatiblitiy
    }

    export const enum SerialisationFormatEnum {
        v2, // uninstanced
        v3, // instanced
    }

    export namespace SerialisationFormat {
        export const v2 = '2';
        export const v3 = '3';
        export const current = v3;

        export function parse(value: string) {
            switch (value) {
                case v2: return SerialisationFormatEnum.v2;
                case v3: return SerialisationFormatEnum.v3;
                default: return undefined;
            }
        }
    }

    export function serialise(layout: Layout): MotifServicesInstanceItem {
        const layoutElement = new JsonElement();
        layoutElement.setString(JsonName.name, layout.name);
        layoutElement.setString(JsonName.description, layout.description);
        layoutElement.setString(JsonName.instanceId, layout.instanceId);
        layoutElement.setJson(JsonName.golden, layout.golden as Json);
        layoutElement.setString(JsonName.serialisationFormat, SerialisationFormat.current);

        return layoutElement.json as MotifServicesInstanceItem;
    }

    export function deserialise(stringfiedLayout: string): Layout | string {
        let layoutJson: Json | undefined;
        try {
            layoutJson = JSON.parse(stringfiedLayout);
        } catch (e) {
            return `${Strings[StringId.Layout_InvalidJson]}: "${e}": ${stringfiedLayout}`;
        }

        const layoutElement = new JsonElement(layoutJson);
        let name = layoutElement.tryGetString(JsonName.name);
        if (name === undefined) {
            name = 'Unnamed';
        }
        const serialisationFormatOrError = tryGetSerialisationFormat(layoutElement);
        if (typeof serialisationFormatOrError === 'string') {
            return `${serialisationFormatOrError}: ${name}`;
        } else {
            const goldenJson = layoutElement.tryGetJsonObject(JsonName.golden);
            if (goldenJson === undefined) {
                return `${Strings[StringId.Layout_GoldenNotDefinedLoadingDefault]}: ${name}`;
            } else {
                const golden = goldenJson as LayoutConfig;

                let instanceId = layoutElement.tryGetString(JsonName.instanceId);
                if (instanceId === undefined) {
                    instanceId = newInstanceId();
                }

                let description = layoutElement.tryGetString(JsonName.description);
                if (description === undefined) {
                    description = name;
                }

                const layout: Layout = {
                    name,
                    description,
                    instanceId,
                    golden,
                };

                return layout;
            }
        }
    }

    function tryGetSerialisationFormat(layoutElement: JsonElement) {
        let serialisationFormat = layoutElement.tryGetString(JsonName.serialisationFormat);
        if (serialisationFormat === undefined) {
            serialisationFormat = layoutElement.tryGetString(JsonName.schemaVersion);
        }

        if (serialisationFormat === undefined) {
            return Strings[StringId.Layout_SerialisationFormatNotDefinedLoadingDefault];
        } else {
            const result = SerialisationFormat.parse(serialisationFormat);
            if (result !== undefined) {
                return result;
            } else {
                return Strings[StringId.Layout_SerialisationFormatIncompatibleLoadingDefault];
            }
        }
    }

    function newInstanceId() {
        return nanoid();
    }
}
