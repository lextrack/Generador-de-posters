import { setCurrentImage } from './state.js';
import { showControls, updatePreview } from './preview.js';

export function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('El archivo es demasiado grande. Por favor, selecciona una imagen menor a 50MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            if (img.width < 100 || img.height < 100) {
                alert('La imagen es demasiado pequeña. Por favor, selecciona una imagen de al menos 100×100 píxeles.');
                return;
            }

            setCurrentImage(img);
            showControls();
            updatePreview();
        };
        img.onerror = () => {
            alert('Error al cargar la imagen. Por favor, selecciona un archivo de imagen válido.');
        };
        img.src = e.target.result;
    };
    reader.onerror = () => {
        alert('Error al leer el archivo. Por favor, inténtalo de nuevo.');
    };
    reader.readAsDataURL(file);
}
