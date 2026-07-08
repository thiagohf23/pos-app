import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';

export type Locale = 'en' | 'pt' | 'es';

export const locales: Record<Locale, { label: string; flag: string }> = {
    en: { label: 'English', flag: '🇺🇸' },
    pt: { label: 'Português', flag: '🇧🇷' },
    es: { label: 'Español', flag: '🇪🇸' },
};

export const defaultNS = 'translation';
export const namespaces = ['translation'];

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        pt: { translation: pt },
        es: { translation: es },
    },
    lng: 'en',
    fallbackLng: 'en',
    ns: namespaces,
    defaultNS,
    interpolation: {
        escapeValue: false,
    },
});

/**
 * Change language and persist to cookie via server route.
 */
export function changeLocale(locale: Locale): void {
    i18n.changeLanguage(locale);

    document.cookie = `locale=${locale};path=/;max-age=${60 * 24 * 365};SameSite=Strict`;
}

/**
 * Initialize i18n with the locale from Laravel Inertia shared props.
 */
export function initializeI18n(locale?: string): void {
    if (locale && ['en', 'pt', 'es'].includes(locale)) {
        i18n.changeLanguage(locale);
    }
}

export default i18n;
