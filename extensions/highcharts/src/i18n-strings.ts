/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtensionSvc } from 'motif';

export const enum StringId {
    ChartFrameMenuCaption,
    OpenSecurity,
    AddSecurity,
    HistoryWarnings,
    HistoryErrors,
    SeriesTypeDisplay_Line,
    SeriesTypeDisplay_Bar,
    SeriesTypeDisplay_Candlestick,
    SeriesTypeDisplay_Column,
    Template_GetNamedStorageError,
    Template_GetNamedParseError,
    Template_SetNamedStorageError,
    Template_RemoveNamedStorageError,
    Template_GetRememberedStorageError,
    Template_GetRememberedParseError,
    Template_SetRememberedStorageError,
    Template_GetNamedTemplateNamesStorageError,
    Template_GetNamedTemplateNamesParseError,
    Template_SetNamedTemplateNamesStorageError,
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
        ChartFrameMenuCaption: {
            id: StringId.ChartFrameMenuCaption, translations: {
                en: 'Chart',
            }
        },
        OpenSecurity: {
            id: StringId.OpenSecurity, translations: {
                en: 'Open security',
            }
        },
        AddSecurity: {
            id: StringId.AddSecurity, translations: {
                en: 'Add security',
            }
        },
        HistoryWarnings: {
            id: StringId.HistoryWarnings, translations: {
                en: 'History warning(s)',
            }
        },
        HistoryErrors: {
            id: StringId.HistoryErrors, translations: {
                en: 'History error(s)',
            }
        },
        SeriesTypeDisplay_Line: {
            id: StringId.SeriesTypeDisplay_Line, translations: {
                en: 'Line',
            }
        },
        SeriesTypeDisplay_Bar: {
            id: StringId.SeriesTypeDisplay_Bar, translations: {
                en: 'Bar',
            }
        },
        SeriesTypeDisplay_Candlestick: {
            id: StringId.SeriesTypeDisplay_Candlestick, translations: {
                en: 'Candlestick',
            }
        },
        SeriesTypeDisplay_Column: {
            id: StringId.SeriesTypeDisplay_Column, translations: {
                en: 'Column',
            }
        },
        Template_GetNamedStorageError: {
            id: StringId.Template_GetNamedStorageError, translations: {
                en: 'Highstock chart: GetNamedTemplateStorageError',
            }
        },
        Template_GetNamedParseError: {
            id: StringId.Template_GetNamedParseError, translations: {
                en: 'Highstock chart: GetNamedTemplateParseError',
            }
        },
        Template_SetNamedStorageError: {
            id: StringId.Template_SetNamedStorageError, translations: {
                en: 'Highstock chart: SetNamedTemplateStorageError',
            }
        },
        Template_RemoveNamedStorageError: {
            id: StringId.Template_RemoveNamedStorageError, translations: {
                en: 'Highstock chart: RemoveNamedTemplateStorageError',
            }
        },
        Template_GetRememberedStorageError: {
            id: StringId.Template_GetRememberedStorageError, translations: {
                en: 'Highstock chart: GetRememberedTemplateStorageError',
            }
        },
        Template_GetRememberedParseError: {
            id: StringId.Template_GetRememberedParseError, translations: {
                en: 'Highstock chart: GetRememberedTemplateParseError',
            }
        },
        Template_SetRememberedStorageError: {
            id: StringId.Template_SetRememberedStorageError, translations: {
                en: 'Highstock chart: SetRememberedTemplateStorageError',
            }
        },
        Template_GetNamedTemplateNamesStorageError: {
            id: StringId.Template_GetNamedTemplateNamesStorageError, translations: {
                en: 'Highstock chart: GetNamedTemplateNamesStorageError',
            }
        },
        Template_GetNamedTemplateNamesParseError: {
            id: StringId.Template_GetNamedTemplateNamesParseError, translations: {
                en: 'Highstock chart: GetNamedTemplateNamesParseError',
            }
        },
        Template_SetNamedTemplateNamesStorageError: {
            id: StringId.Template_SetNamedTemplateNamesStorageError, translations: {
                en: 'Highstock chart: SetNamedTemplateNamesStorageError',
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
