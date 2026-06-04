import { downloadBtn, gridSizeSelect, paperSizeSelect } from './dom.js';
import { enTranslations } from './translations/en.js';
import { esTranslations } from './translations/es.js';

const LANGUAGE_STORAGE_KEY = 'poster_language';

const translations = {
    es: esTranslations,
    en: enTranslations
};

let currentLanguage = 'es';
const LANGUAGE_ANIMATION_CLASS = 'lang-text-anim';
const LANGUAGE_ANIMATION_MS = 320;

function replaceVars(template, vars = {}) {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

export function t(key, vars = {}) {
    const dict = translations[currentLanguage] || translations.es;
    const fallback = translations.es[key] || key;
    const template = dict[key] || fallback;
    return replaceVars(template, vars);
}

export function getCurrentLanguage() {
    return currentLanguage;
}

export function getLocale() {
    return currentLanguage === 'en' ? 'en-US' : 'es-CL';
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function getAnimatableElements() {
    const ids = [
        'appTitle',
        'appSubtitle',
        'languageLabel',
        'uploadText',
        'uploadSubtext',
        'uploadCta',
        'hintPillOne',
        'hintPillTwo',
        'hintPillThree',
        'controlsEyebrow',
        'controlsTitle',
        'gridSizeLabel',
        'paperSizeLabel',
        'previewEyebrow',
        'previewTitle',
        'printNotice',
        'footerText',
        'downloadBtn',
        'loadingText',
        'infoText'
    ];

    return ids
        .map((id) => document.getElementById(id))
        .filter(Boolean);
}

function animateLanguageChange() {
    const elements = getAnimatableElements();
    elements.forEach((el) => el.classList.remove(LANGUAGE_ANIMATION_CLASS));

    void document.body.offsetWidth;

    elements.forEach((el) => el.classList.add(LANGUAGE_ANIMATION_CLASS));
    window.setTimeout(() => {
        elements.forEach((el) => el.classList.remove(LANGUAGE_ANIMATION_CLASS));
    }, LANGUAGE_ANIMATION_MS + 40);
}

function updateGridOptions() {
    Array.from(gridSizeSelect.options).forEach((option) => {
        const [cols, rows] = option.value.split('x').map(Number);
        const pages = cols * rows;
        const pageWord = pages === 1 ? t('pageCountSingle') : t('pageCountPlural');
        option.textContent = `${option.value} (${pages} ${pageWord})`;
    });
}

function updatePaperOptions() {
    Array.from(paperSizeSelect.options).forEach((option) => {
        if (option.value === 'a4') option.textContent = t('paperA4');
        if (option.value === 'letter') option.textContent = t('paperLetter');
        if (option.value === 'a3') option.textContent = t('paperA3');
    });
}

export function applyTranslations(shouldAnimate = false) {
    document.documentElement.lang = currentLanguage;
    document.title = t('appTitle');
    setText('appTitle', t('appTitle'));
    setText('appSubtitle', t('appSubtitle'));
    setText('languageLabel', t('languageLabel'));
    setText('uploadText', t('uploadText'));
    setText('uploadSubtext', t('uploadSubtext'));
    setText('uploadCta', t('uploadCta'));
    setText('hintPillOne', t('hintPillOne'));
    setText('hintPillTwo', t('hintPillTwo'));
    setText('hintPillThree', t('hintPillThree'));
    setText('controlsEyebrow', t('controlsEyebrow'));
    setText('controlsTitle', t('controlsTitle'));
    setText('gridSizeLabel', t('gridSizeLabel'));
    setText('paperSizeLabel', t('paperSizeLabel'));
    setText('previewEyebrow', t('previewEyebrow'));
    setText('previewTitle', t('previewTitle'));
    setText('printNotice', t('printNotice'));
    setText('footerText', t('footerText'));

    if (!downloadBtn.disabled) {
        downloadBtn.textContent = t('downloadPdf');
    }

    updateGridOptions();
    updatePaperOptions();

    if (shouldAnimate) {
        animateLanguageChange();
    }
}

function getInitialLanguage() {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
    const browserLanguage = navigator.language?.toLowerCase() || '';
    return browserLanguage.startsWith('en') ? 'en' : 'es';
}

export function setLanguage(language) {
    if (language !== 'es' && language !== 'en') return;
    currentLanguage = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    applyTranslations(true);
}

export function initI18n() {
    currentLanguage = getInitialLanguage();
    applyTranslations();
    return currentLanguage;
}
