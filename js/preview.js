import { FINISH_DELAY_MS, PROCESS_DELAY_MS } from './config.js';
import {
    controls,
    downloadSection,
    gridSizeSelect,
    infoText,
    loading,
    paperSizeSelect,
    previewGrid,
    previewSection
} from './dom.js';
import {
    calculateFinalSize,
    calculatePageBounds,
    computePageSlice,
    createRenderJob,
    drawPageSlice,
    getBatchSize
} from './render-utils.js';
import {
    getCurrentImage,
    getCurrentJob,
    getCanvasCells,
    setCanvasCells,
    setCurrentJob
} from './state.js';

export function showControls() {
    controls.style.display = 'block';
    previewSection.style.display = 'block';
    downloadSection.style.display = 'block';
}

function createPreviewCell(job, row, col, number) {
    const cell = document.createElement('div');
    cell.className = 'preview-cell';
    cell.style.aspectRatio = `${job.paperSize.width}/${job.paperSize.height}`;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const canvasWidth = 200;
    const canvasHeight = Math.round(canvasWidth * (job.paperSize.height / job.paperSize.width));

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const pageBounds = calculatePageBounds(row, col, job.paperSize);
    const pageSlice = computePageSlice(job.image, pageBounds, job.metrics);
    const canvasScale = canvasWidth / job.paperSize.width;
    drawPageSlice(ctx, job.image, pageSlice, canvasScale);

    const numberDiv = document.createElement('div');
    numberDiv.className = 'cell-number';
    numberDiv.textContent = number;

    cell.appendChild(canvas);
    cell.appendChild(numberDiv);

    return cell;
}

export function updatePreview() {
    const currentImage = getCurrentImage();
    if (!currentImage) return;

    const job = createRenderJob(
        currentImage,
        gridSizeSelect.value,
        paperSizeSelect.value,
        paperSizeSelect.options[paperSizeSelect.selectedIndex].text
    );
    setCurrentJob(job);

    loading.style.display = 'block';
    const loadingText = loading.querySelector('div:last-child');
    loadingText.textContent = 'Procesando imagen... 0%';

    previewGrid.innerHTML = '';
    setCanvasCells([]);
    previewGrid.style.gridTemplateColumns = `repeat(${job.cols}, 1fr)`;

    const totalCells = job.rows * job.cols;

    const processNextBatch = (startIndex) => {
        if (getCurrentJob() !== job) return;

        const batchSize = getBatchSize(totalCells);
        const endIndex = Math.min(startIndex + batchSize, totalCells);
        const cells = getCanvasCells();

        for (let i = startIndex; i < endIndex; i++) {
            const row = Math.floor(i / job.cols);
            const col = i % job.cols;
            const number = i + 1;

            previewGrid.appendChild(createPreviewCell(job, row, col, number));
            cells.push({ row, col, number });
        }

        const progress = Math.round((endIndex / totalCells) * 100);
        loadingText.textContent = `Procesando imagen... ${progress}%`;

        if (endIndex < totalCells) {
            setTimeout(() => processNextBatch(endIndex), PROCESS_DELAY_MS);
            return;
        }

        setTimeout(() => {
            if (getCurrentJob() !== job) return;
            updateInfoPanel(job);
            loading.style.display = 'none';
        }, FINISH_DELAY_MS);
    };

    setTimeout(() => processNextBatch(0), PROCESS_DELAY_MS);
}

export function updateInfoPanel(job = getCurrentJob()) {
    if (!job) return;

    const totalPages = job.rows * job.cols;
    const finalSize = calculateFinalSize(job);

    infoText.innerHTML = `
        <strong>Total de páginas:</strong> ${totalPages} páginas<br>
        <strong>Cuadrícula:</strong> ${job.cols} columnas × ${job.rows} filas<br>
        <strong>Tamaño del póster completo:</strong> ${finalSize.width.toFixed(1)} × ${finalSize.height.toFixed(1)} cm<br>
        <strong>Tamaño de cada página:</strong> ${(job.paperSize.width / 10).toFixed(1)} × ${(job.paperSize.height / 10).toFixed(1)} cm<br>
        <strong>Imagen escalada en el póster:</strong> ${(job.metrics.scaledImageWidth / 10).toFixed(1)} × ${(job.metrics.scaledImageHeight / 10).toFixed(1)} cm<br>
        <strong>Resolución original:</strong> ${job.image.width} × ${job.image.height} px<br>
        <strong>Factor de escala:</strong> ${(job.metrics.scale * 100).toFixed(1)}%<br>
        <strong>Resolución efectiva de impresión:</strong> ${job.metrics.printDpi.toFixed(0)} DPI
    `;
}
