import { downloadBtn, gridSizeSelect, paperSizeSelect } from './dom.js';

const LANGUAGE_STORAGE_KEY = 'poster_language';

const translations = {
    es: {
        appTitle: 'Generador de pósters',
        appSubtitle: 'Convierte cualquier imagen en un póster gigante dividido en páginas imprimibles',
        languageLabel: 'Idioma:',
        uploadText: 'Haz clic o arrastra tu imagen aquí',
        uploadSubtext: 'Formatos soportados: JPG, PNG, GIF, WEBP',
        gridSizeLabel: 'Tamaño de cuadrícula:',
        paperSizeLabel: 'Tamaño de papel:',
        previewTitle: 'Vista previa del póster',
        downloadPdf: 'Descargar PDF',
        generatingPdf: 'Generando PDF...',
        footerText: 'Generador de Pósters',
        loadingImage: 'Procesando imagen... {progress}%',
        infoTotalPages: 'Total de páginas:',
        infoPages: 'páginas',
        infoGrid: 'Cuadrícula:',
        infoGridValue: '{cols} columnas x {rows} filas',
        infoPosterSize: 'Tamaño del póster completo:',
        infoPageSize: 'Tamaño de cada página:',
        infoScaledImage: 'Imagen escalada en el póster:',
        infoOriginalResolution: 'Resolución original:',
        infoScaleFactor: 'Factor de escala:',
        infoPrintDpi: 'Resolución efectiva de impresión:',
        alertTooLarge: 'El archivo es demasiado grande. Selecciona una imagen menor a 50MB.',
        alertTooSmall: 'La imagen es demasiado pequeña. Selecciona una imagen de al menos 100x100 píxeles.',
        alertInvalidImage: 'Error al cargar la imagen. Selecciona un archivo de imagen válido.',
        alertReadError: 'Error al leer el archivo. Inténtalo de nuevo.',
        paperA4: 'A4',
        paperLetter: 'Carta (Letter)',
        paperA3: 'A3',
        pageCountSingle: 'página',
        pageCountPlural: 'páginas',
        pdfTitle: 'Generador de pósters',
        pdfSubtitle: 'Información técnica del póster',
        pdfDate: 'Fecha de creación: {value}',
        pdfTime: 'Hora de creación: {value}',
        pdfConfigSection: 'CONFIGURACIÓN DEL PÓSTER:',
        pdfGrid: '- Cuadrícula: {cols} columnas x {rows} filas',
        pdfTotalPages: '- Total de páginas: {totalPages} páginas',
        pdfPaperFormat: '- Formato de papel: {paperLabel}',
        pdfPageSize: '- Tamaño de cada página: {width} x {height} cm',
        pdfFinalSection: 'DIMENSIONES FINALES DEL PÓSTER:',
        pdfPosterSize: '- Tamaño total del póster: {width} x {height} cm',
        pdfPosterSizeMm: '- Tamaño total en milímetros: {width} x {height} mm',
        pdfOriginalSection: 'IMAGEN ORIGINAL:',
        pdfResolution: '- Resolución: {width} x {height} píxeles',
        pdfAspectRatio: '- Relación de aspecto: {value}:1',
        pdfPosterImageSection: 'IMAGEN EN EL PÓSTER:',
        pdfScaledSize: '- Tamaño escalado: {width} x {height} cm',
        pdfScaleFactor: '- Factor de escala aplicado: {value}%',
        pdfDpi: '- Resolución de impresión: {value} DPI',
        pdfFooter: 'Generado con Generador de Pósters'
    },
    en: {
        appTitle: 'Poster Generator',
        appSubtitle: 'Turn any image into a giant poster split into printable pages',
        languageLabel: 'Language:',
        uploadText: 'Click or drag your image here',
        uploadSubtext: 'Supported formats: JPG, PNG, GIF, WEBP',
        gridSizeLabel: 'Grid size:',
        paperSizeLabel: 'Paper size:',
        previewTitle: 'Poster preview',
        downloadPdf: 'Download PDF',
        generatingPdf: 'Generating PDF...',
        footerText: 'Poster Generator',
        loadingImage: 'Processing image... {progress}%',
        infoTotalPages: 'Total pages:',
        infoPages: 'pages',
        infoGrid: 'Grid:',
        infoGridValue: '{cols} columns x {rows} rows',
        infoPosterSize: 'Full poster size:',
        infoPageSize: 'Each page size:',
        infoScaledImage: 'Scaled image on poster:',
        infoOriginalResolution: 'Original resolution:',
        infoScaleFactor: 'Scale factor:',
        infoPrintDpi: 'Effective print resolution:',
        alertTooLarge: 'The file is too large. Please choose an image smaller than 50MB.',
        alertTooSmall: 'The image is too small. Please choose an image of at least 100x100 pixels.',
        alertInvalidImage: 'Image loading error. Please choose a valid image file.',
        alertReadError: 'File read error. Please try again.',
        paperA4: 'A4',
        paperLetter: 'Letter',
        paperA3: 'A3',
        pageCountSingle: 'page',
        pageCountPlural: 'pages',
        pdfTitle: 'Poster Generator',
        pdfSubtitle: 'Poster technical information',
        pdfDate: 'Creation date: {value}',
        pdfTime: 'Creation time: {value}',
        pdfConfigSection: 'POSTER SETTINGS:',
        pdfGrid: '- Grid: {cols} columns x {rows} rows',
        pdfTotalPages: '- Total pages: {totalPages} pages',
        pdfPaperFormat: '- Paper format: {paperLabel}',
        pdfPageSize: '- Each page size: {width} x {height} cm',
        pdfFinalSection: 'FINAL POSTER SIZE:',
        pdfPosterSize: '- Full poster size: {width} x {height} cm',
        pdfPosterSizeMm: '- Full size in millimeters: {width} x {height} mm',
        pdfOriginalSection: 'ORIGINAL IMAGE:',
        pdfResolution: '- Resolution: {width} x {height} pixels',
        pdfAspectRatio: '- Aspect ratio: {value}:1',
        pdfPosterImageSection: 'IMAGE ON POSTER:',
        pdfScaledSize: '- Scaled size: {width} x {height} cm',
        pdfScaleFactor: '- Applied scale factor: {value}%',
        pdfDpi: '- Print resolution: {value} DPI',
        pdfFooter: 'Generated with Poster Generator'
    }
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
    return currentLanguage === 'en' ? 'en-US' : 'es-ES';
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
        'gridSizeLabel',
        'paperSizeLabel',
        'previewTitle',
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

    // Force reflow so the animation can restart on repeated changes.
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
    setText('gridSizeLabel', t('gridSizeLabel'));
    setText('paperSizeLabel', t('paperSizeLabel'));
    setText('previewTitle', t('previewTitle'));
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
