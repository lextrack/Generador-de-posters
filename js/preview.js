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
    calculatePageBounds,
    computePageSlice,
    createRenderJob,
    drawPageSlice,
    getBatchSize
} from './render-utils.js';
import { createInfoPanelModel } from './info-panel.js';
import {
    getCurrentImage,
    getCurrentJob,
    getCanvasCells,
    setCanvasCells,
    setCurrentJob
} from './state.js';
import { t } from './i18n.js';

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
    const loadingLabel = loading.querySelector('div:last-child');
    loadingLabel.textContent = t('loadingImage', { progress: 0 });

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
        loadingLabel.textContent = t('loadingImage', { progress });

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

    const model = createInfoPanelModel(job);
    const qualityLabel = t(model.quality.labelKey);
    const gridValue = t('infoGridValue', model.grid);

    const lowDpiWarning = model.quality.showWarning
        ? `
            <div class="metric-card warning-card">
                <span class="metric-label">${t('infoAttention')}</span>
                <div class="metric-value">${t('infoLowDpiWarning')}</div>
            </div>
        `
        : '';

    infoText.innerHTML = `
        <div class="metric-card">
            <span class="metric-label">${t('infoTotalPages')}</span>
            <div class="metric-value">${model.totalPages} ${t('infoPages')}</div>
            <div class="metric-subvalue">${gridValue}</div>
        </div>
        <div class="metric-card">
            <span class="metric-label">${t('infoPosterSize')}</span>
            <div class="metric-value">${model.finalSize.width.toFixed(1)} x ${model.finalSize.height.toFixed(1)} cm</div>
            <div class="metric-subvalue">${t('infoPageSize')} ${model.pageSizeCm.width} x ${model.pageSizeCm.height} cm</div>
        </div>
        <div class="metric-card">
            <span class="metric-label">${t('infoPrintDpi')}</span>
            <div class="metric-value">${model.printDpi} DPI</div>
            <div class="metric-subvalue"><span class="quality-badge ${model.quality.className}">${qualityLabel}</span></div>
        </div>
        <div class="metric-card">
            <span class="metric-label">${t('infoOriginalResolution')}</span>
            <div class="metric-value">${model.originalResolution.width} x ${model.originalResolution.height} px</div>
            <div class="metric-subvalue">${t('infoScaledImage')} ${model.scaledImageCm.width} x ${model.scaledImageCm.height} cm</div>
        </div>
        <div class="metric-card">
            <span class="metric-label">${t('infoScaleFactor')}</span>
            <div class="metric-value">${model.scalePercent}%</div>
            <div class="metric-subvalue">${t('infoGrid')} ${gridValue}</div>
        </div>
        ${lowDpiWarning}
    `;
}
