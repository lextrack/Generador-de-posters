import { paperSizes } from './config.js';

export function parseGridSize(value) {
    const [cols, rows] = value.split('x').map(Number);
    return { cols, rows };
}

export function getSelectedPaperSize(paperSizeKey) {
    return paperSizes[paperSizeKey];
}

export function getPrintableArea(paperSize) {
    const margin = paperSize.printMargin || {};
    const left = margin.left || 0;
    const top = margin.top || 0;
    const right = margin.right || 0;
    const bottom = margin.bottom || 0;

    return {
        left,
        top,
        right,
        bottom,
        width: paperSize.width - left - right,
        height: paperSize.height - top - bottom
    };
}

export function calculateRenderMetrics(image, cols, rows, paperSize) {
    const printableArea = getPrintableArea(paperSize);
    const totalPosterWidth = printableArea.width * cols;
    const totalPosterHeight = printableArea.height * rows;
    const scaleX = totalPosterWidth / image.width;
    const scaleY = totalPosterHeight / image.height;
    const scale = Math.min(scaleX, scaleY);
    const scaledImageWidth = image.width * scale;
    const scaledImageHeight = image.height * scale;
    const offsetX = (totalPosterWidth - scaledImageWidth) / 2;
    const offsetY = (totalPosterHeight - scaledImageHeight) / 2;
    const printDpi = scale > 0 ? 25.4 / scale : 0;

    return {
        totalPosterWidth,
        totalPosterHeight,
        scale,
        scaledImageWidth,
        scaledImageHeight,
        offsetX,
        offsetY,
        printDpi,
        printableArea
    };
}

export function createRenderJob(image, gridSizeValue, paperSizeKey, paperLabel) {
    const { cols, rows } = parseGridSize(gridSizeValue);
    const paperSize = getSelectedPaperSize(paperSizeKey);
    const metrics = calculateRenderMetrics(image, cols, rows, paperSize);

    return {
        image,
        cols,
        rows,
        gridSize: gridSizeValue,
        paperSize,
        paperLabel,
        metrics
    };
}

export function getBatchSize(totalCells) {
    if (totalCells > 64) return 5;
    if (totalCells > 36) return 4;
    if (totalCells > 16) return 3;
    return 2;
}

export function calculatePageBounds(row, col, paperSize) {
    const printableArea = getPrintableArea(paperSize);
    const pageLeft = col * paperSize.width;
    const pageTop = row * paperSize.height;
    const contentLeft = col * printableArea.width;
    const contentTop = row * printableArea.height;

    return {
        pageLeft,
        pageTop,
        pageRight: pageLeft + paperSize.width,
        pageBottom: pageTop + paperSize.height,
        contentLeft,
        contentTop,
        contentRight: contentLeft + printableArea.width,
        contentBottom: contentTop + printableArea.height,
        drawOffsetX: printableArea.left,
        drawOffsetY: printableArea.top
    };
}

export function computePageSlice(image, pageBounds, metrics) {
    const srcLeft = (pageBounds.contentLeft - metrics.offsetX) / metrics.scale;
    const srcTop = (pageBounds.contentTop - metrics.offsetY) / metrics.scale;
    const srcRight = (pageBounds.contentRight - metrics.offsetX) / metrics.scale;
    const srcBottom = (pageBounds.contentBottom - metrics.offsetY) / metrics.scale;

    const intersectLeft = Math.max(0, srcLeft);
    const intersectTop = Math.max(0, srcTop);
    const intersectRight = Math.min(image.width, srcRight);
    const intersectBottom = Math.min(image.height, srcBottom);

    if (intersectLeft >= intersectRight || intersectTop >= intersectBottom) {
        return null;
    }

    const sourceWidth = intersectRight - intersectLeft;
    const sourceHeight = intersectBottom - intersectTop;
    const drawLeft = pageBounds.drawOffsetX + Math.max(0, metrics.offsetX + intersectLeft * metrics.scale - pageBounds.contentLeft);
    const drawTop = pageBounds.drawOffsetY + Math.max(0, metrics.offsetY + intersectTop * metrics.scale - pageBounds.contentTop);
    const drawWidth = sourceWidth * metrics.scale;
    const drawHeight = sourceHeight * metrics.scale;

    return {
        sourceX: intersectLeft,
        sourceY: intersectTop,
        sourceWidth,
        sourceHeight,
        drawLeft,
        drawTop,
        drawWidth,
        drawHeight
    };
}

export function drawPageSlice(ctx, image, slice, targetScale) {
    if (!slice) return;

    ctx.drawImage(
        image,
        slice.sourceX, slice.sourceY, slice.sourceWidth, slice.sourceHeight,
        slice.drawLeft * targetScale, slice.drawTop * targetScale,
        slice.drawWidth * targetScale, slice.drawHeight * targetScale
    );
}

export function calculateFinalSize(job) {
    return {
        width: job.metrics.totalPosterWidth / 10,
        height: job.metrics.totalPosterHeight / 10
    };
}
