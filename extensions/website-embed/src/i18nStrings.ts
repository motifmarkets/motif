import { ExtensionSvc } from 'motif';

export const enum StringId {
    MotioniteWebsiteMenuCaption,
    HomePageFrameMenuCaption,
    AdvantagesPageFrameMenuCaption,
    FeaturesPageFrameMenuCaption,
    DocumentationFrameMenuCaption,
    ContactPageFrameMenuCaption,
    NonWebPageFrameMenuCaption,
}

export namespace I18nStrings {
    // Languages
    const enum LanguageId {
        English
    }

    const DefaultLanguageId = LanguageId.English;

    interface Language {
        readonly id: LanguageId 
        readonly code: string;
    }

    const englishCode = 'en';

    const Languages: Language[] = [
        { id: LanguageId.English, code: englishCode },
    ];

    interface Translations {
        en: string;
    }

    interface Rec {
        readonly id: StringId;
        readonly translations: Translations;
    }

    type recsObject = { [id in keyof typeof StringId]: Rec };

    // tslint:disable:max-line-length
    const recsObject: recsObject = {
        MotioniteWebsiteMenuCaption: {
            id: StringId.MotioniteWebsiteMenuCaption, translations: {
                en: 'Motionite Website',
            }
        },
        HomePageFrameMenuCaption: {
            id: StringId.HomePageFrameMenuCaption, translations: {
                en: 'Home',
            }
        },
        AdvantagesPageFrameMenuCaption: {
            id: StringId.AdvantagesPageFrameMenuCaption, translations: {
                en: 'Advantages'
            }
        },
        FeaturesPageFrameMenuCaption: {
            id: StringId.FeaturesPageFrameMenuCaption, translations: {
                en: 'Features'
            }
        },
        DocumentationFrameMenuCaption: {
            id: StringId.DocumentationFrameMenuCaption, translations: {
                en: 'Documentation'
            }
        },
        ContactPageFrameMenuCaption: {
            id: StringId.ContactPageFrameMenuCaption, translations: {
                en: 'Contact'
            }
        },
        NonWebPageFrameMenuCaption: {
            id: StringId.NonWebPageFrameMenuCaption, translations: {
                en: 'Not a web page'
            }
        },
    
    } as const;

    // tslint:enable:max-line-length


    const recs: readonly Rec[] = Object.values(recsObject);
    export const recCount = recs.length;

    export function initialise(extensionSvc: ExtensionSvc) {
        const outOfOrderIdx = recs.findIndex((rec: Rec, index: number) => rec.id !== index);
        if (outOfOrderIdx >= 0) {
            // do not use EnumInfoOutOfOrderError as causes circular error
            throw new Error(`I18nStrings out of order: StringId: ${outOfOrderIdx}, ${recs[outOfOrderIdx].translations.en}`);
        } else {
            // get the current language from cookie, browser locale
            const langCode = getBrowserLanguage();
            const langId = findBestLanguageId(langCode);
            prepareStrings(langId);
            extensionSvc.resourcesSvc.setI18nStrings(strings);
        }
    }

    function getBrowserLanguage(): string {
        return navigator.language; // || (navigator as any).userLanguage; // fallback for IE
    }

    function findBestLanguageId(language: string): LanguageId {
        let idx = Languages.findIndex((lang: Language) => lang.code === language);
        if (idx >= 0) {
            return Languages[idx].id;
        } else {
            const langPrefix = language.split('-')[0];
            idx = Languages.findIndex((lang: Language) => lang.code === langPrefix);
            if (idx >= 0) {
                return Languages[idx].id;
            } else {
                return DefaultLanguageId;
            }
        }
    }

    function prepareStrings(langId: LanguageId) {
        for (let i = 0; i < recs.length; i++) {
            strings[i] = calculateString(i, langId);
        }
    }

    function calculateString(idx: number, langId: LanguageId): string {
        switch (langId) {
            case LanguageId.English: return recs[idx].translations.en;
            default: return '?';
        }
    }
}

export const strings: string[] = new Array<string>(I18nStrings.recCount);
