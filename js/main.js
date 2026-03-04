import { fileInput, uploadArea, gridSizeSelect, paperSizeSelect, downloadBtn } from './dom.js';
import { handleFileSelect } from './file-handler.js';
import { updatePreview } from './preview.js';
import { generatePDF } from './pdf.js';

fileInput.addEventListener('change', handleFileSelect);
gridSizeSelect.addEventListener('change', updatePreview);
paperSizeSelect.addEventListener('change', updatePreview);
downloadBtn.addEventListener('click', generatePDF);

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        fileInput.files = files;
        handleFileSelect({ target: { files } });
    }
});
