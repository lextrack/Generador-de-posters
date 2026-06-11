import { FINISH_DELAY_MS, PDF_JPEG_QUALITY, PDF_MAX_DPI, PDF_MIN_DPI } from './config.js';
import { downloadBtn, loading, loadingText } from './dom.js';
import { createPdfCoverModel } from './pdf-metadata.js';
import { calculatePageBounds, computePageSlice, drawPageSlice } from './render-utils.js';
import { getCanvasCells, getCurrentJob } from './state.js';
import { getLocale, t } from './i18n.js';

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function getTargetPdfDpi(job) {
    const sourceLimitedDpi = Math.round(job.metrics.printDpi);
    return clamp(sourceLimitedDpi, PDF_MIN_DPI, PDF_MAX_DPI);
}

function createPdfCanvas(job) {
    const targetDpi = getTargetPdfDpi(job);
    const mmToPx = targetDpi / 25.4;
    const canvasWidth = Math.round(job.paperSize.width * mmToPx);
    const canvasHeight = Math.round(job.paperSize.height * mmToPx);
    const pdfCanvas = document.createElement('canvas');
    const pdfCtx = pdfCanvas.getContext('2d', { alpha: false });

    pdfCanvas.width = canvasWidth;
    pdfCanvas.height = canvasHeight;

    return { pdfCanvas, pdfCtx, mmToPx };
}

function drawMultilineText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    const hasWhitespace = words.length > 1;
    const segments = hasWhitespace ? words : Array.from(text);
    const separator = hasWhitespace ? ' ' : '';
    const lines = [];
    let currentLine = '';

    segments.forEach((segment) => {
        const testLine = currentLine ? `${currentLine}${separator}${segment}` : segment;
        if (ctx.measureText(testLine).width <= maxWidth || !currentLine) {
            currentLine = testLine;
            return;
        }

        lines.push(currentLine);
        currentLine = segment;
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    lines.forEach((line, index) => {
        ctx.fillText(line, x, y + index * lineHeight);
    });

    return lines.length * lineHeight;
}

function createCoverPage(pdf, job) {
    const locale = getLocale();
    const coverModel = createPdfCoverModel(job, locale, t);
    const coverCanvas = document.createElement('canvas');
    const scale = 4;
    const pxPerMm = scale * 3.7795275591;
    const width = Math.round(job.paperSize.width * pxPerMm);
    const height = Math.round(job.paperSize.height * pxPerMm);
    const ctx = coverCanvas.getContext('2d', { alpha: false });

    coverCanvas.width = width;
    coverCanvas.height = height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const sidePadding = 20 * pxPerMm;
    const maxTextWidth = width - sidePadding * 2;
    const bodyLineHeight = 8 * pxPerMm;
    let currentY = 40 * pxPerMm;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgb(40, 40, 40)';
    ctx.font = `700 ${Math.round(24 * pxPerMm / 3.7795275591)}px "Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif`;
    currentY += drawMultilineText(ctx, coverModel.title, centerX, currentY, maxTextWidth, 11 * pxPerMm);

    currentY += 4 * pxPerMm;
    ctx.fillStyle = 'rgb(100, 100, 100)';
    ctx.font = `${Math.round(16 * pxPerMm / 3.7795275591)}px "Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif`;
    currentY += drawMultilineText(ctx, coverModel.subtitle, centerX, currentY, maxTextWidth, 8 * pxPerMm);

    currentY += 10 * pxPerMm;
    ctx.strokeStyle = 'rgb(200, 200, 200)';
    ctx.lineWidth = 0.5 * pxPerMm;
    ctx.beginPath();
    ctx.moveTo(sidePadding, currentY);
    ctx.lineTo(width - sidePadding, currentY);
    ctx.stroke();

    currentY += 20 * pxPerMm;
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgb(60, 60, 60)';
    ctx.font = `${Math.round(12 * pxPerMm / 3.7795275591)}px "Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif`;

    coverModel.sections.forEach((line) => {
        if (line === '') {
            currentY += bodyLineHeight * 0.6;
            return;
        }

        const isSectionTitle = (line.endsWith(':') || line.endsWith('：')) && !line.startsWith('-');
        ctx.font = `${isSectionTitle ? '700' : '400'} ${Math.round(12 * pxPerMm / 3.7795275591)}px "Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif`;
        currentY += drawMultilineText(ctx, line, sidePadding, currentY, maxTextWidth, bodyLineHeight);
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgb(150, 150, 150)';
    ctx.font = `${Math.round(8 * pxPerMm / 3.7795275591)}px "Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif`;
    ctx.fillText(coverModel.footer, centerX, height - 14 * pxPerMm);

    const coverImage = coverCanvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(coverImage, 'JPEG', 0, 0, job.paperSize.width, job.paperSize.height, undefined, 'FAST');
}

function drawPdfPage(pdf, job, cellData, totalPages, pdfCanvas, pdfCtx, mmToPx) {
    pdfCtx.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height);
    pdfCtx.fillStyle = 'white';
    pdfCtx.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);

    const pageBounds = calculatePageBounds(cellData.row, cellData.col, job.paperSize);
    const pageSlice = computePageSlice(job.image, pageBounds, job.metrics);
    drawPageSlice(pdfCtx, job.image, pageSlice, mmToPx);

    pdfCtx.fillStyle = 'rgba(0,0,0,0.7)';
    pdfCtx.font = `${Math.round(12 * mmToPx / 25.4)}px Arial`;
    pdfCtx.fillText(`${cellData.number}/${totalPages}`, 5 * mmToPx, 15 * mmToPx);

    const jpegData = pdfCanvas.toDataURL('image/jpeg', PDF_JPEG_QUALITY);
    pdf.addImage(jpegData, 'JPEG', 0, 0, job.paperSize.width, job.paperSize.height, undefined, 'FAST');
}

function updateExportProgress(progress) {
    loading.style.display = 'block';
    loadingText.textContent = t('generatingPdfProgress', { progress });
}

function resetExportState() {
    loading.style.display = 'none';
    downloadBtn.disabled = false;
    downloadBtn.classList.remove('is-generating');
    downloadBtn.textContent = t('downloadPdf');
}

function waitForNextFrame() {
    return new Promise((resolve) => {
        window.setTimeout(resolve, 0);
    });
}

export async function generatePDF() {
    const job = getCurrentJob();
    const cells = [...getCanvasCells()];

    if (!job || !job.image || cells.length === 0) return;
    const totalPages = cells.length;

    downloadBtn.disabled = true;
    downloadBtn.classList.add('is-generating');
    downloadBtn.textContent = t('generatingPdf');
    updateExportProgress(0);

    try {
        await new Promise((resolve) => window.setTimeout(resolve, FINISH_DELAY_MS));

        if (!window.jspdf?.jsPDF) {
            throw new Error('missing-jspdf');
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('portrait', 'mm', [job.paperSize.width, job.paperSize.height]);
        const { pdfCanvas, pdfCtx, mmToPx } = createPdfCanvas(job);

        createCoverPage(pdf, job);

        for (let index = 0; index < cells.length; index++) {
            const cellData = cells[index];
            pdf.addPage();
            drawPdfPage(pdf, job, cellData, totalPages, pdfCanvas, pdfCtx, mmToPx);

            const progress = Math.round(((index + 1) / totalPages) * 100);
            updateExportProgress(progress);

            if ((index + 1) % 2 === 0) {
                await waitForNextFrame();
            }
        }

        const filename = `poster_${job.gridSize}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);
    } catch (error) {
        console.error(error);
        alert(t('alertPdfError'));
    } finally {
        resetExportState();
    }
}
