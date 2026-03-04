import { FINISH_DELAY_MS, PDF_DPI } from './config.js';
import { downloadBtn } from './dom.js';
import { calculateFinalSize, calculatePageBounds, computePageSlice, drawPageSlice } from './render-utils.js';
import { getCanvasCells, getCurrentJob } from './state.js';

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

    const title = 'Generador de posters';
    const titleWidth = pdf.getTextWidth(title);
    const centerX = job.paperSize.width / 2;
    pdf.text(title, centerX - titleWidth / 2, 40);

    pdf.setFontSize(16);
    pdf.setTextColor(100, 100, 100);
    const subtitle = 'Información técnica del póster';
    const subtitleWidth = pdf.getTextWidth(subtitle);
    pdf.text(subtitle, centerX - subtitleWidth / 2, 55);

    pdf.setLineWidth(0.5);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 70, job.paperSize.width - 20, 70);

    pdf.setFontSize(12);
    pdf.setTextColor(60, 60, 60);

    const startY = 90;
    const lineHeight = 8;
    let currentY = startY;

    const info = [
        `Fecha de creación: ${new Date().toLocaleDateString('es-ES')}`,
        `Hora de creación: ${new Date().toLocaleTimeString('es-ES')}`,
        '',
        'CONFIGURACIÓN DEL PÓSTER:',
        `• Cuadrícula: ${job.cols} columnas × ${job.rows} filas`,
        `• Total de páginas: ${totalPages} páginas`,
        `• Formato de papel: ${job.paperLabel}`,
        `• Tamaño de cada página: ${(job.paperSize.width / 10).toFixed(1)} × ${(job.paperSize.height / 10).toFixed(1)} cm`,
        '',
        'DIMENSIONES FINALES DEL PÓSTER:',
        `• Tamaño total del póster: ${finalSize.width.toFixed(1)} × ${finalSize.height.toFixed(1)} cm`,
        `• Tamaño total en milímetros: ${job.metrics.totalPosterWidth} × ${job.metrics.totalPosterHeight} mm`,
        '',
        'IMAGEN ORIGINAL:',
        `• Resolución: ${job.image.width} × ${job.image.height} píxeles`,
        `• Relación de aspecto: ${(job.image.width / job.image.height).toFixed(2)}:1`,
        '',
        'IMAGEN EN EL PÓSTER:',
        `• Tamaño escalado: ${(job.metrics.scaledImageWidth / 10).toFixed(1)} × ${(job.metrics.scaledImageHeight / 10).toFixed(1)} cm`,
        `• Factor de escala aplicado: ${(job.metrics.scale * 100).toFixed(1)}%`,
        `• Resolución de impresión: ${job.metrics.printDpi.toFixed(0)} DPI`
    ];

    info.forEach((line) => {
        if (line === '') {
            currentY += lineHeight * 0.5;
        } else if (line.includes(':') && !line.startsWith('•')) {
            pdf.setFont('helvetica', 'bold');
            pdf.text(line, 20, currentY);
            pdf.setFont('helvetica', 'normal');
            currentY += lineHeight;
        } else {
            pdf.text(line, 20, currentY);
            currentY += lineHeight;
        }
    });

    if (currentY < job.paperSize.height - 80) {
        const previewSize = 60;
        const previewX = centerX - previewSize / 2;
        const previewY = job.paperSize.height - 70;

        pdf.setDrawColor(150, 150, 150);
        pdf.setLineWidth(0.5);
        pdf.rect(previewX, previewY, previewSize, previewSize);

        const thumbCanvas = document.createElement('canvas');
        const thumbCtx = thumbCanvas.getContext('2d');
        const thumbSize = 200;

        thumbCanvas.width = thumbSize;
        thumbCanvas.height = thumbSize;

        thumbCtx.fillStyle = 'white';
        thumbCtx.fillRect(0, 0, thumbSize, thumbSize);

        const thumbScale = Math.min(thumbSize / job.image.width, thumbSize / job.image.height);
        const thumbWidth = job.image.width * thumbScale;
        const thumbHeight = job.image.height * thumbScale;
        const thumbOffsetX = (thumbSize - thumbWidth) / 2;
        const thumbOffsetY = (thumbSize - thumbHeight) / 2;

        thumbCtx.drawImage(job.image, thumbOffsetX, thumbOffsetY, thumbWidth, thumbHeight);

        const thumbData = thumbCanvas.toDataURL('image/jpeg', 0.8);
        pdf.addImage(thumbData, 'JPEG', previewX, previewY, previewSize, previewSize);

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        const previewLabel = 'Vista previa de la imagen';
        const previewLabelWidth = pdf.getTextWidth(previewLabel);
        pdf.text(previewLabel, centerX - previewLabelWidth / 2, previewY + previewSize + 10);
    }

    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    const footer = 'Generado con Generador de Posters';
    const footerWidth = pdf.getTextWidth(footer);
    pdf.text(footer, centerX - footerWidth / 2, job.paperSize.height - 10);
}

export function generatePDF() {
    const job = getCurrentJob();
    const cells = [...getCanvasCells()];

    if (!job || !job.image || cells.length === 0) return;
    const totalPages = cells.length;

    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Generando PDF...';

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
        downloadBtn.textContent = 'Descargar PDF';
    }, FINISH_DELAY_MS);
}
