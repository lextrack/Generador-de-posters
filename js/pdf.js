import { FINISH_DELAY_MS, PDF_DPI } from './config.js';
import { downloadBtn } from './dom.js';
import { calculateFinalSize, calculatePageBounds, computePageSlice, drawPageSlice } from './render-utils.js';
import { getCanvasCells, getCurrentJob } from './state.js';
import { getLocale, t } from './i18n.js';

function drawPdfPage(pdf, job, cellData, totalPages) {
    const pdfCanvas = document.createElement('canvas');
    const pdfCtx = pdfCanvas.getContext('2d');

    const mmToPx = PDF_DPI / 25.4;
    const canvasWidth = Math.round(job.paperSize.width * mmToPx);
    const canvasHeight = Math.round(job.paperSize.height * mmToPx);

    pdfCanvas.width = canvasWidth;
    pdfCanvas.height = canvasHeight;

    pdfCtx.fillStyle = 'white';
    pdfCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    const pageBounds = calculatePageBounds(cellData.row, cellData.col, job.paperSize);
    const pageSlice = computePageSlice(job.image, pageBounds, job.metrics);
    drawPageSlice(pdfCtx, job.image, pageSlice, mmToPx);

    pdfCtx.fillStyle = 'rgba(0,0,0,0.7)';
    pdfCtx.font = `${Math.round(12 * mmToPx / 25.4)}px Arial`;
    pdfCtx.fillText(`${cellData.number}/${totalPages}`, 5 * mmToPx, 15 * mmToPx);

    const imgData = pdfCanvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, job.paperSize.width, job.paperSize.height);
}

function createCoverPage(pdf, job) {
    const totalPages = job.cols * job.rows;
    const finalSize = calculateFinalSize(job);

    pdf.setFontSize(24);
    pdf.setTextColor(40, 40, 40);

    const title = t('pdfTitle');
    const titleWidth = pdf.getTextWidth(title);
    const centerX = job.paperSize.width / 2;
    pdf.text(title, centerX - titleWidth / 2, 40);

    pdf.setFontSize(16);
    pdf.setTextColor(100, 100, 100);
    const subtitle = t('pdfSubtitle');
    const subtitleWidth = pdf.getTextWidth(subtitle);
    pdf.text(subtitle, centerX - subtitleWidth / 2, 55);

    pdf.setLineWidth(0.5);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 70, job.paperSize.width - 20, 70);

    pdf.setFontSize(12);
    pdf.setTextColor(60, 60, 60);

    const now = new Date();
    const locale = getLocale();
    const startY = 90;
    const lineHeight = 8;
    let currentY = startY;

    const info = [
        t('pdfDate', { value: now.toLocaleDateString(locale) }),
        t('pdfTime', { value: now.toLocaleTimeString(locale) }),
        '',
        t('pdfConfigSection'),
        t('pdfGrid', { cols: job.cols, rows: job.rows }),
        t('pdfTotalPages', { totalPages }),
        t('pdfPaperFormat', { paperLabel: job.paperLabel }),
        t('pdfPageSize', {
            width: (job.paperSize.width / 10).toFixed(1),
            height: (job.paperSize.height / 10).toFixed(1)
        }),
        '',
        t('pdfFinalSection'),
        t('pdfPosterSize', {
            width: finalSize.width.toFixed(1),
            height: finalSize.height.toFixed(1)
        }),
        t('pdfPosterSizeMm', {
            width: job.metrics.totalPosterWidth,
            height: job.metrics.totalPosterHeight
        }),
        '',
        t('pdfOriginalSection'),
        t('pdfResolution', { width: job.image.width, height: job.image.height }),
        t('pdfAspectRatio', { value: (job.image.width / job.image.height).toFixed(2) }),
        '',
        t('pdfPosterImageSection'),
        t('pdfScaledSize', {
            width: (job.metrics.scaledImageWidth / 10).toFixed(1),
            height: (job.metrics.scaledImageHeight / 10).toFixed(1)
        }),
        t('pdfScaleFactor', { value: (job.metrics.scale * 100).toFixed(1) }),
        t('pdfDpi', { value: job.metrics.printDpi.toFixed(0) })
    ];

    info.forEach((line) => {
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
    const footer = t('pdfFooter');
    const footerWidth = pdf.getTextWidth(footer);
    pdf.text(footer, centerX - footerWidth / 2, job.paperSize.height - 10);
}

export function generatePDF() {
    const job = getCurrentJob();
    const cells = [...getCanvasCells()];

    if (!job || !job.image || cells.length === 0) return;
    const totalPages = cells.length;

    downloadBtn.disabled = true;
    downloadBtn.textContent = t('generatingPdf');

    setTimeout(() => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('portrait', 'mm', [job.paperSize.width, job.paperSize.height]);

        createCoverPage(pdf, job);

        cells.forEach((cellData) => {
            pdf.addPage();
            drawPdfPage(pdf, job, cellData, totalPages);
        });

        const filename = `poster_${job.gridSize}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);

        downloadBtn.disabled = false;
        downloadBtn.textContent = t('downloadPdf');
    }, FINISH_DELAY_MS);
}
