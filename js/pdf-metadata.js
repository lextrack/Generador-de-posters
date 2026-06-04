import { calculateFinalSize } from './render-utils.js';

export function createPdfCoverModel(job, locale, translate) {
    const totalPages = job.cols * job.rows;
    const finalSize = calculateFinalSize(job);
    const now = new Date();

    return {
        title: translate('pdfTitle'),
        subtitle: translate('pdfSubtitle'),
        footer: translate('pdfFooter'),
        sections: [
            translate('pdfDate', { value: now.toLocaleDateString(locale) }),
            translate('pdfTime', { value: now.toLocaleTimeString(locale) }),
            '',
            translate('pdfConfigSection'),
            translate('pdfGrid', { cols: job.cols, rows: job.rows }),
            translate('pdfTotalPages', { totalPages }),
            translate('pdfPaperFormat', { paperLabel: job.paperLabel }),
            translate('pdfPageSize', {
                width: (job.paperSize.width / 10).toFixed(1),
                height: (job.paperSize.height / 10).toFixed(1)
            }),
            '',
            translate('pdfFinalSection'),
            translate('pdfPosterSize', {
                width: finalSize.width.toFixed(1),
                height: finalSize.height.toFixed(1)
            }),
            translate('pdfPosterSizeMm', {
                width: job.metrics.totalPosterWidth,
                height: job.metrics.totalPosterHeight
            }),
            '',
            translate('pdfOriginalSection'),
            translate('pdfResolution', { width: job.image.width, height: job.image.height }),
            translate('pdfAspectRatio', { value: (job.image.width / job.image.height).toFixed(2) }),
            '',
            translate('pdfPosterImageSection'),
            translate('pdfScaledSize', {
                width: (job.metrics.scaledImageWidth / 10).toFixed(1),
                height: (job.metrics.scaledImageHeight / 10).toFixed(1)
            }),
            translate('pdfScaleFactor', { value: (job.metrics.scale * 100).toFixed(1) }),
            translate('pdfDpi', { value: job.metrics.printDpi.toFixed(0) })
        ]
    };
}
