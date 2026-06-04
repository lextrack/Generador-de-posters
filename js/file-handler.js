import { setCurrentImage } from './state.js';
import { showControls, updatePreview } from './preview.js';
import { t } from './i18n.js';

export function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        alert(t('alertTooLarge'));
        return;
    }

    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
        if (img.width < 100 || img.height < 100) {
            URL.revokeObjectURL(imageUrl);
            alert(t('alertTooSmall'));
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
