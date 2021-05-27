/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from 'src/sys/internal-api';

export class TableFieldCustomHeadings {
    // private cachedHeadingIniFile: TMemIniFile;
    // private headingIniFileCachingEnabled: boolean;
    private saveRequired = false;
    // a map within a map.  Map of Sources where each source contains a map of fields
    private sourceMap = new Map<string, Map<string, string>>();

    constructor(private storageKeyName: string) { }

    tryGetFieldHeading(sourceName: string, fieldName: string): string | undefined {
        const source = this.sourceMap.get(sourceName);
        return source === undefined ? undefined : source.get(fieldName);
    }

    setFieldHeading(sourceName: string, fieldName: string, text: string) {
        let source = this.sourceMap.get(sourceName);
        if (source === undefined) {
            source = new Map<string, string>();
        }
        source.set(fieldName, text);
        this.saveRequired = true;
    }

    load() {
        const rootElement = new JsonElement();

        // load rootElement from storage
        // todo

        this.sourceMap.clear();
        rootElement.forEachElement((sourceName: string, sourceElement: JsonElement) => {
            const fieldMap = new Map<string, string>();
            this.loadSource(sourceElement, fieldMap);
            this.sourceMap.set(sourceName, fieldMap);
        });

        this.saveRequired = false;
    }

    checkSave() {
        if (this.saveRequired) {
            this.save();
        }
    }

    save() {
        const rootElement = new JsonElement();

        this.sourceMap.forEach((value: Map<string, string>, key: string) => this.saveSource(rootElement, key, value));

        // save to storage
        // todo

        this.saveRequired = false;
    }

    private loadSource(sourceElement: JsonElement, fieldMap: Map<string, string>) {
        sourceElement.forEachString((fieldName: string, heading: string) => {
            fieldMap.set(fieldName, heading);
        });
    }

    private saveSource(rootElement: JsonElement, sourceName: string, fieldMap: Map<string, string>) {
        const sourceElement = new JsonElement();
        fieldMap.forEach((heading: string, fieldName: string) => sourceElement.setString(fieldName, heading)); // field name and heading
        rootElement.setElement(sourceName, sourceElement);
    }
}
