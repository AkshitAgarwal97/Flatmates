import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
import enTranslation from './locales/en.json';
import hiEnTranslation from './locales/hi-en.json';

i18n
    // .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslation
            },
            'hi-en': {
                translation: hiEnTranslation
            }
        },
        lng: 'en', // Force English to prevent detection issues
        fallbackLng: 'en',
        debug: true, // Enable debug to see language resolution in console
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
