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

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            if (img.width < 100 || img.height < 100) {
                alert(t('alertTooSmall'));
                return;
            }

            setCurrentImage(img);
            showControls();
            updatePreview();
        };
        img.onerror = () => {
            alert(t('alertInvalidImage'));
        };
        img.src = e.target.result;
    };
    reader.onerror = () => {
        alert(t('alertReadError'));
    };
    reader.readAsDataURL(file);
}