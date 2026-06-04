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

function createCoverPage(pdf, job) {
    pdf.setFontSize(24);
    pdf.setTextColor(40, 40, 40);

    const locale = getLocale();
    const coverModel = createPdfCoverModel(job, locale, t);
    const titleWidth = pdf.getTextWidth(coverModel.title);
    const centerX = job.paperSize.width / 2;
    pdf.text(coverModel.title, centerX - titleWidth / 2, 40);

    pdf.setFontSize(16);
    pdf.setTextColor(100, 100, 100);
    const subtitleWidth = pdf.getTextWidth(coverModel.subtitle);
    pdf.text(coverModel.subtitle, centerX - subtitleWidth / 2, 55);

    pdf.setLineWidth(0.5);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 70, job.paperSize.width - 20, 70);

    pdf.setFontSize(12);
    pdf.setTextColor(60, 60, 60);

    const startY = 90;
    const lineHeight = 8;
    let currentY = startY;

    coverModel.sections.forEach((line) => {
        if (line === '') {
            currentY += lineHeight * 0.5;
        } else if (line.endsWith(':') && !line.startsWith('-')) {
            pdf.setFont('helvetica', 'bold');
            pdf.text(line, 20, currentY);
            pdf.setFont('helvetica', 'normal');
            currentY += lineHeight;
        } else {
            pdf.text(line, 20, currentY);
            currentY += lineHeight;
        }
    });

    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    const footerWidth = pdf.getTextWidth(coverModel.footer);
    pdf.text(coverModel.footer, centerX - footerWidth / 2, job.paperSize.height - 10);
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
