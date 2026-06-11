import { setCurrentImage } from './state.js';
import { showControls, updatePreview } from './preview.js';
import { t } from './i18n.js';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const MIN_IMAGE_DIMENSION_PX = 100;
const MAX_IMAGE_DIMENSION_PX = 12000;
const MAX_IMAGE_PIXELS = 40000000;
const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
]);

export function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        alert(t('alertInvalidType'));
        return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(t('alertTooLarge'));
        return;
    }

    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
        if (img.width < MIN_IMAGE_DIMENSION_PX || img.height < MIN_IMAGE_DIMENSION_PX) {
            URL.revokeObjectURL(imageUrl);
            alert(t('alertTooSmall'));
            return;
        }

        if (
            img.width > MAX_IMAGE_DIMENSION_PX ||
            img.height > MAX_IMAGE_DIMENSION_PX ||
            img.width * img.height > MAX_IMAGE_PIXELS
        ) {
            URL.revokeObjectURL(imageUrl);
            alert(t('alertTooManyPixels'));
            return;
        }

        setCurrentImage(img);
        showControls();
        updatePreview();
        URL.revokeObjectURL(imageUrl);
    };

    img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        alert(t('alertInvalidImage'));
    };

    img.src = imageUrl;
}
