import { calculateFinalSize } from './render-utils.js';

export function getPrintQuality(printDpi) {
    if (printDpi < 150) {
        return { className: 'quality-low', labelKey: 'infoQualityLow', showWarning: true };
    }

    if (printDpi < 220) {
        return { className: 'quality-medium', labelKey: 'infoQualityMedium', showWarning: false };
    }

    return { className: 'quality-good', labelKey: 'infoQualityHigh', showWarning: false };
}

export function createInfoPanelModel(job) {
    const totalPages = job.rows * job.cols;
    const finalSize = calculateFinalSize(job);
    const pageWidthCm = (job.paperSize.width / 10).toFixed(1);
    const pageHeightCm = (job.paperSize.height / 10).toFixed(1);
    const scaledWidthCm = (job.metrics.scaledImageWidth / 10).toFixed(1);
    const scaledHeightCm = (job.metrics.scaledImageHeight / 10).toFixed(1);
    const quality = getPrintQuality(job.metrics.printDpi);

    return {
        totalPages,
        finalSize,
        pageSizeCm: {
            width: pageWidthCm,
            height: pageHeightCm
        },
        scaledImageCm: {
            width: scaledWidthCm,
            height: scaledHeightCm
        },
        originalResolution: {
            width: job.image.width,
            height: job.image.height
        },
        scalePercent: (job.metrics.scale * 100).toFixed(1),
        printDpi: job.metrics.printDpi.toFixed(0),
        grid: {
            cols: job.cols,
            rows: job.rows
        },
        quality
    };
}
