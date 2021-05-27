/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CommaTextSvc, LitIvemId, StorageSvc } from 'motif';
import { StringId, strings } from '../i18n-strings';
import { Logger } from '../logger';
import { Template } from './template';

export class TemplateStorage {

    private _namedTemplateNames: string[] = [];
    private _unsynchronisedSetNamedTemplateNames: string[] = [];
    private _unsynchronisedRemoveNamedTemplateNames: string[] = [];
    private _storageSynchronised: boolean;

    constructor(private readonly _storageSvc: StorageSvc, private readonly _commaTextSvc: CommaTextSvc) { }

    async getNamedTemplate(name: string) {
        let templateAsStr: string | undefined;
        try {
            templateAsStr = await this._storageSvc.getSubNamedItem(TemplateStorage.KeyName.NamedTemplate, name);
        } catch (e) {
            const text = `${strings[StringId.Template_GetNamedStorageError]}: "${e.message}" [${name}]`;
            Logger.logWarning(text);
            templateAsStr = undefined;
        }

        if (templateAsStr === undefined) {
            return undefined;
        } else {
            let template: Template | undefined;
            try {
                template = JSON.parse(templateAsStr) as Template;
            } catch (e) {
                const text = `${strings[StringId.Template_GetNamedParseError]}: "${e.message}" [${name}]`;
                Logger.logWarning(text);
                template = undefined;
            }
            return template;
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    async setNamedTemplate(name: string, template: object) {
        const templateAsStr = JSON.stringify(template);
        let stored = false;
        try {
            await this._storageSvc.setSubNamedItem(TemplateStorage.KeyName.NamedTemplate, name, templateAsStr);
            stored = true;
        } catch (e) {
            const text = `${strings[StringId.Template_SetNamedStorageError]}: "${e.message}" [${name}]`;
            Logger.logWarning(text);
        }

        if (stored) {
            const synchronised = await this.updateNamedTemplateNamesFromStorage();
            if (!this._namedTemplateNames.includes(name)) {
                this._namedTemplateNames.push(name);
            }

            if (!synchronised) {
                if (!this._unsynchronisedSetNamedTemplateNames.includes(name)) {
                    this._unsynchronisedSetNamedTemplateNames.push(name);
                }
                const removeIdx = this._unsynchronisedRemoveNamedTemplateNames.indexOf(name);
                if (removeIdx >= 0) {
                    this._unsynchronisedRemoveNamedTemplateNames.splice(removeIdx);
                }
            } else {
                this.pushNamedTemplateNamesToStorage();
            }
        }
    }

    async deleteNamedTemplate(name: string) {
        let stored = false;
        try {
            await this._storageSvc.removeSubNamedItem(TemplateStorage.KeyName.NamedTemplate, name);
            stored = true;
        } catch (e) {
            const text = `${strings[StringId.Template_RemoveNamedStorageError]}: "${e.message}" [${name}]`;
            Logger.logWarning(text);
        }

        if (stored) {
            const synchronised = await this.updateNamedTemplateNamesFromStorage();
            const namedIdx = this._namedTemplateNames.indexOf(name);
            if (namedIdx >= 0) {
                this._namedTemplateNames.splice(namedIdx);
            }

            if (!synchronised) {
                if (!this._unsynchronisedRemoveNamedTemplateNames.includes(name)) {
                    this._unsynchronisedRemoveNamedTemplateNames.push(name);
                }
                const setIdx = this._unsynchronisedSetNamedTemplateNames.indexOf(name);
                if (setIdx >= 0) {
                    this._unsynchronisedSetNamedTemplateNames.splice(setIdx);
                }
            } else {
                this.pushNamedTemplateNamesToStorage();
            }
        }
    }

    async getNamedTemplateNames(fromStorage = false) {
        if (!fromStorage && this._storageSynchronised) {
            return this._namedTemplateNames;
        } else {
            await this.updateNamedTemplateNamesFromStorage();
            return this._namedTemplateNames;
        }
    }

    async getLitIvemIdRememberedTemplate(litIvemId: LitIvemId) {
        let templateAsStr: string | undefined;
        try {
            templateAsStr = await this._storageSvc.getSubNamedItem(TemplateStorage.KeyName.LitIvemIdRememberedTemplate,
                litIvemId.persistKey);
        } catch (e) {
            const text = `${strings[StringId.Template_GetRememberedStorageError]}: "${e.message}" [${litIvemId.name}]`;
            Logger.logWarning(text);
            templateAsStr = undefined;
        }

        // if (templateAsStr === undefined) {
            return undefined;
        // } else {
        //     let template: Template | undefined;
        //     try {
        //         template = JSON.parse(templateAsStr) as Template;
        //     } catch (e) {
        //         const text = `${strings[StringId.Template_GetRememberedParseError]}: "${e.message}" [${litIvemId.name}]`;
        //         Logger.logWarning(text);
        //         template = undefined;
        //     }
        //     return template;
        // }
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    async setLitIvemIdRememberedTemplate(litIvemId: LitIvemId, template: object) {
        const templateAsStr = JSON.stringify(template);
        try {
            await this._storageSvc.setSubNamedItem(TemplateStorage.KeyName.LitIvemIdRememberedTemplate, litIvemId.persistKey,
                templateAsStr);
        } catch (e) {
            const text = `${strings[StringId.Template_SetRememberedStorageError]}: "${e.message}" [${litIvemId.name}]`;
            Logger.logWarning(text);
        }
    }

    private async updateNamedTemplateNamesFromStorage() {
        let namesAsCommaText: string | undefined;
        let namesGotten = false;
        try {
            namesAsCommaText = await this._storageSvc.getItem(TemplateStorage.KeyName.NamedTemplateNames);
            namesGotten = true;
        } catch (e) {
            const text = `${strings[StringId.Template_GetNamedTemplateNamesStorageError]}: "${e.message}"`;
            Logger.logWarning(text);
            namesAsCommaText = undefined;
        }

        if (namesGotten) {
            if (namesAsCommaText === undefined) {
                this._namedTemplateNames.length = 0;
            } else {
                const commaTextResult = this._commaTextSvc.toStringArrayWithResult(namesAsCommaText, true);
                if (commaTextResult.success) {
                    this._namedTemplateNames = commaTextResult.array;
                } else {
                    const text = `${strings[StringId.Template_GetNamedTemplateNamesParseError]}: "${commaTextResult.errorText}"`;
                    this._namedTemplateNames.length = 0;
                }
            }
            this._storageSynchronised = true;
        } else {
            let pushRequired = this.mergeUnsynchronised();
            if (pushRequired) {
                pushRequired = !await this.pushNamedTemplateNamesToStorage();
            }
            if (!pushRequired) {
                this._unsynchronisedSetNamedTemplateNames.length = 0;
                this._unsynchronisedRemoveNamedTemplateNames.length = 0;
                this._storageSynchronised = false;
            }
        }

        return namesGotten;
    }

    private async pushNamedTemplateNamesToStorage() {
        let succeeded = false;
        const commaTextStr = this._commaTextSvc.fromStringArray(this._namedTemplateNames);
        try {
            await this._storageSvc.setItem(TemplateStorage.KeyName.NamedTemplateNames, commaTextStr);
            succeeded = true;
        } catch (e) {
            const text = `${strings[StringId.Template_SetNamedTemplateNamesStorageError]}: "${e.message}"`;
            Logger.logWarning(text);
        }

        return succeeded;
    }

    private mergeUnsynchronised() {
        let pushRequired = this.mergeUnsynchronisedSet();
        if (this.mergeUnsynchronisedRemove()) {
            pushRequired = true;
        }
        return pushRequired;
    }

    private mergeUnsynchronisedSet() {
        let pushRequired = false;
        for (const name in this._unsynchronisedSetNamedTemplateNames) {
            if (!this._namedTemplateNames.includes(name)) {
                this._namedTemplateNames.push(name);
                pushRequired = true;
            }
        }
        return pushRequired;
    }

    private mergeUnsynchronisedRemove() {
        let pushRequired = false;
        for (const name of this._unsynchronisedRemoveNamedTemplateNames) {
            const idx = this._namedTemplateNames.indexOf(name);
            if (idx >= 0) {
                this._namedTemplateNames.splice(idx);
                pushRequired = true;
            }
        }
        return pushRequired;
    }
}

export namespace TemplateStorage {
    export const enum KeyName {
        NamedTemplateNames = 'named-template-names',
        NamedTemplate = 'named-template',
        LitIvemIdRememberedTemplate = 'lit-ivem-id-remembered-template',
    }
}
