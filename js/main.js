import { fileInput, uploadArea, gridSizeSelect, paperSizeSelect, downloadBtn, languageSelect } from './dom.js';
import { handleFileSelect } from './file-handler.js';
import { updateInfoPanel, updatePreview } from './preview.js';
import { generatePDF } from './pdf.js';
import { initI18n, setLanguage } from './i18n.js';
import { getCurrentJob } from './state.js';

const initialLanguage = initI18n();
languageSelect.value = initialLanguage;

fileInput.addEventListener('change', handleFileSelect);
gridSizeSelect.addEventListener('change', updatePreview);
paperSizeSelect.addEventListener('change', updatePreview);
downloadBtn.addEventListener('click', generatePDF);
languageSelect.addEventListener('change', (e) => {
    setLanguage(e.target.value);
    const currentJob = getCurrentJob();
    if (currentJob) {
        currentJob.paperLabel = paperSizeSelect.options[paperSizeSelect.selectedIndex].text;
        updateInfoPanel();
    }
});

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
