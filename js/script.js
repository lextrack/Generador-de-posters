let currentImage = null;
let canvasCells = [];

const paperSizes = {
a4: { width: 210, height: 297 },
letter: { width: 215.9, height: 279.4 },
a3: { width: 297, height: 420 }
};

const fileInput = document.getElementById('fileInput');
const uploadArea = document.querySelector('.upload-area');
const controls = document.getElementById('controls');
const previewSection = document.getElementById('previewSection');
const downloadSection = document.getElementById('downloadSection');
const previewGrid = document.getElementById('previewGrid');
const loading = document.getElementById('loading');
const gridSizeSelect = document.getElementById('gridSize');
const paperSizeSelect = document.getElementById('paperSize');
const infoText = document.getElementById('infoText');
const downloadBtn = document.getElementById('downloadBtn');

fileInput.addEventListener('change', handleFileSelect);
gridSizeSelect.addEventListener('change', updatePreview);
paperSizeSelect.addEventListener('change', updatePreview);
downloadBtn.addEventListener('click', generatePDF);

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
    handleFileSelect({ target: { files: files } });
}
});

function handleFileSelect(event) {
const file = event.target.files[0];
if (!file) return;

const reader = new FileReader();
reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
        currentImage = img;
        showControls();
        updatePreview();
    };
    img.src = e.target.result;
};
reader.readAsDataURL(file);
}

function showControls() {
controls.style.display = 'block';
previewSection.style.display = 'block';
downloadSection.style.display = 'block';
}

function updatePreview() {
if (!currentImage) return;

loading.style.display = 'block';
previewGrid.innerHTML = '';
canvasCells = [];

setTimeout(() => {
    const [cols, rows] = gridSizeSelect.value.split('x').map(Number);
    const paperSize = paperSizes[paperSizeSelect.value];
    
    previewGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    const totalPosterWidth = paperSize.width * cols;
    const totalPosterHeight = paperSize.height * rows;
    const scaleX = totalPosterWidth / currentImage.width;
    const scaleY = totalPosterHeight / currentImage.height;
    const scale = Math.min(scaleX, scaleY);
    const scaledImageWidth = currentImage.width * scale;
    const scaledImageHeight = currentImage.height * scale;
    const offsetX = (totalPosterWidth - scaledImageWidth) / 2;
    const offsetY = (totalPosterHeight - scaledImageHeight) / 2;
    
    let cellIndex = 0;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'preview-cell';
            cell.style.aspectRatio = `${paperSize.width}/${paperSize.height}`;
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const canvasWidth = 200;
            const canvasHeight = Math.round(canvasWidth * (paperSize.height / paperSize.width));
            
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            const pageLeft = col * paperSize.width;
            const pageTop = row * paperSize.height;
            const pageRight = pageLeft + paperSize.width;
            const pageBottom = pageTop + paperSize.height;
            const srcLeft = (pageLeft - offsetX) / scale;
            const srcTop = (pageTop - offsetY) / scale;
            const srcRight = (pageRight - offsetX) / scale;
            const srcBottom = (pageBottom - offsetY) / scale;
            const intersectLeft = Math.max(0, srcLeft);
            const intersectTop = Math.max(0, srcTop);
            const intersectRight = Math.min(currentImage.width, srcRight);
            const intersectBottom = Math.min(currentImage.height, srcBottom);
            
            if (intersectLeft < intersectRight && intersectTop < intersectBottom) {
                const sourceWidth = intersectRight - intersectLeft;
                const sourceHeight = intersectBottom - intersectTop;
                
                // Calcular dónde dibujar en el canvas
                const drawLeft = Math.max(0, (offsetX + intersectLeft * scale - pageLeft));
                const drawTop = Math.max(0, (offsetY + intersectTop * scale - pageTop));
                const drawWidth = sourceWidth * scale;
                const drawHeight = sourceHeight * scale;
                
                // Escalar para el canvas de preview
                const canvasScale = canvasWidth / paperSize.width;
                
                ctx.drawImage(
                    currentImage,
                    intersectLeft, intersectTop, sourceWidth, sourceHeight,
                    drawLeft * canvasScale, drawTop * canvasScale,
                    drawWidth * canvasScale, drawHeight * canvasScale
                );
            }
            
            // Número de celda
            const numberDiv = document.createElement('div');
            numberDiv.className = 'cell-number';
            numberDiv.textContent = cellIndex + 1;
            
            cell.appendChild(canvas);
            cell.appendChild(numberDiv);
            previewGrid.appendChild(cell);
            
            // Guardar datos para PDF
            canvasCells.push({
                pageLeft, pageTop, pageRight, pageBottom,
                scale, offsetX, offsetY,
                number: cellIndex + 1
            });
            
            cellIndex++;
        }
    }
    
    // Actualizar información
    const totalPages = rows * cols;
    const finalSize = calculateFinalSize();
    infoText.innerHTML = `
        <strong>Total de páginas:</strong> ${totalPages}<br>
        <strong>Tamaño final del póster:</strong> ${finalSize.width}cm × ${finalSize.height}cm<br>
        <strong>Tamaño de la imagen en el póster:</strong> ${(scaledImageWidth/10).toFixed(1)}cm × ${(scaledImageHeight/10).toFixed(1)}cm<br>
        <strong>Resolución original:</strong> ${currentImage.width} × ${currentImage.height}px<br>
        <strong>Factor de escala:</strong> ${(scale * 100).toFixed(1)}%
    `;
    
    loading.style.display = 'none';
}, 100);
}

function calculateFinalSize() {
const [cols, rows] = gridSizeSelect.value.split('x').map(Number);
const paperSize = paperSizes[paperSizeSelect.value];

const finalWidth = (paperSize.width * cols) / 10; // convertir a cm
const finalHeight = (paperSize.height * rows) / 10;

return {
    width: Math.round(finalWidth),
    height: Math.round(finalHeight)
};
}

function generatePDF() {
if (!currentImage || canvasCells.length === 0) return;

downloadBtn.disabled = true;
downloadBtn.textContent = 'Generando PDF...';

setTimeout(() => {
    const { jsPDF } = window.jspdf;
    const [cols, rows] = gridSizeSelect.value.split('x').map(Number);
    const paperSize = paperSizes[paperSizeSelect.value];
    
    // Crear PDF con orientación portrait
    const pdf = new jsPDF('portrait', 'mm', [paperSize.width, paperSize.height]);
    
    // Crear portada
    createCoverPage(pdf, paperSize, cols, rows);
    
    canvasCells.forEach((cellData, index) => {
        pdf.addPage();
        
        // Crear canvas de alta resolución para PDF
        const pdfCanvas = document.createElement('canvas');
        const pdfCtx = pdfCanvas.getContext('2d');
        
        // Tamaño de alta resolución para mejor calidad
        const dpi = 300;
        const mmToPx = dpi / 25.4;
        const canvasWidth = Math.round(paperSize.width * mmToPx);
        const canvasHeight = Math.round(paperSize.height * mmToPx);
        
        pdfCanvas.width = canvasWidth;
        pdfCanvas.height = canvasHeight;
        
        // Fondo blanco
        pdfCtx.fillStyle = 'white';
        pdfCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Calcular qué parte de la imagen original corresponde a esta página
        const srcLeft = (cellData.pageLeft - cellData.offsetX) / cellData.scale;
        const srcTop = (cellData.pageTop - cellData.offsetY) / cellData.scale;
        const srcRight = (cellData.pageRight - cellData.offsetX) / cellData.scale;
        const srcBottom = (cellData.pageBottom - cellData.offsetY) / cellData.scale;
        
        // Encontrar la intersección entre la página y la imagen
        const intersectLeft = Math.max(0, srcLeft);
        const intersectTop = Math.max(0, srcTop);
        const intersectRight = Math.min(currentImage.width, srcRight);
        const intersectBottom = Math.min(currentImage.height, srcBottom);
        
        // Solo dibujar si hay intersección
        if (intersectLeft < intersectRight && intersectTop < intersectBottom) {
            const sourceWidth = intersectRight - intersectLeft;
            const sourceHeight = intersectBottom - intersectTop;
            
            // Calcular dónde dibujar en el canvas del PDF
            const drawLeft = Math.max(0, (cellData.offsetX + intersectLeft * cellData.scale - cellData.pageLeft));
            const drawTop = Math.max(0, (cellData.offsetY + intersectTop * cellData.scale - cellData.pageTop));
            const drawWidth = sourceWidth * cellData.scale;
            const drawHeight = sourceHeight * cellData.scale;
            
            // Escalar para el PDF
            const pdfScale = mmToPx;
            
            pdfCtx.drawImage(
                currentImage,
                intersectLeft, intersectTop, sourceWidth, sourceHeight,
                drawLeft * pdfScale, drawTop * pdfScale,
                drawWidth * pdfScale, drawHeight * pdfScale
            );
        }
        
        // Añadir número de página
        pdfCtx.fillStyle = 'rgba(0,0,0,0.7)';
        pdfCtx.font = `${Math.round(12 * mmToPx / 25.4)}px Arial`;
        pdfCtx.fillText(`${cellData.number}/${canvasCells.length}`, 5 * mmToPx, 15 * mmToPx);
        
        // Convertir canvas a imagen y añadir al PDF
        const imgData = pdfCanvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, paperSize.width, paperSize.height);
    });
    
    // Descargar PDF
    const filename = `poster_${gridSizeSelect.value}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
    
    downloadBtn.disabled = false;
    downloadBtn.textContent = '📥 Descargar PDF';
}, 100);
}

function createCoverPage(pdf, paperSize, cols, rows) {
const totalPages = cols * rows;
const finalSize = calculateFinalSize();
const totalPosterWidth = paperSize.width * cols;
const totalPosterHeight = paperSize.height * rows;
const scaleX = totalPosterWidth / currentImage.width;
const scaleY = totalPosterHeight / currentImage.height;
const scale = Math.min(scaleX, scaleY);
const scaledImageWidth = currentImage.width * scale;
const scaledImageHeight = currentImage.height * scale;

pdf.setFontSize(24);
pdf.setTextColor(40, 40, 40);

const title = "Generador de posters";
const titleWidth = pdf.getTextWidth(title);
const centerX = paperSize.width / 2;
pdf.text(title, centerX - titleWidth / 2, 40);

pdf.setFontSize(16);
pdf.setTextColor(100, 100, 100);
const subtitle = "Información técnica del póster";
const subtitleWidth = pdf.getTextWidth(subtitle);
pdf.text(subtitle, centerX - subtitleWidth / 2, 55);

pdf.setLineWidth(0.5);
pdf.setDrawColor(200, 200, 200);
pdf.line(20, 70, paperSize.width - 20, 70);

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
    `• Cuadrícula seleccionada: ${cols} × ${rows}`,
    `• Total de páginas: ${totalPages}`,
    `• Formato de papel: ${paperSizeSelect.options[paperSizeSelect.selectedIndex].text}`,
    `• Tamaño de papel: ${paperSize.width} × ${paperSize.height} mm`,
    '',
    'DIMENSIONES FINALES:',
    `• Tamaño total del póster: ${finalSize.width} × ${finalSize.height} cm`,
    `• Área de impresión total: ${(totalPosterWidth/10).toFixed(1)} × ${(totalPosterHeight/10).toFixed(1)} cm`,
    '',
    'IMAGEN ORIGINAL:',
    `• Resolución: ${currentImage.width} × ${currentImage.height} píxeles`,
    `• Proporción: ${(currentImage.width/currentImage.height).toFixed(2)}:1`,
    '',
    'IMAGEN EN EL PÓSTER:',
    `• Tamaño escalado: ${(scaledImageWidth/10).toFixed(1)} × ${(scaledImageHeight/10).toFixed(1)} cm`,
    `• Factor de escala aplicado: ${(scale * 100).toFixed(1)}%`,
    `• Resolución efectiva: ${(scale * 300).toFixed(0)} DPI`,
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
        // Texto normal
        pdf.text(line, 20, currentY);
        currentY += lineHeight;
    }
});

if (currentY < paperSize.height - 80) {
    const previewSize = 60; // mm
    const previewX = centerX - previewSize / 2;
    const previewY = paperSize.height - 70;
    
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.5);
    pdf.rect(previewX, previewY, previewSize, previewSize);
    
    const thumbCanvas = document.createElement('canvas');
    const thumbCtx = thumbCanvas.getContext('2d');
    const thumbSize = 200; // px
    
    thumbCanvas.width = thumbSize;
    thumbCanvas.height = thumbSize;
    
    thumbCtx.fillStyle = 'white';
    thumbCtx.fillRect(0, 0, thumbSize, thumbSize);
    
    const thumbScale = Math.min(thumbSize / currentImage.width, thumbSize / currentImage.height);
    const thumbWidth = currentImage.width * thumbScale;
    const thumbHeight = currentImage.height * thumbScale;
    const thumbOffsetX = (thumbSize - thumbWidth) / 2;
    const thumbOffsetY = (thumbSize - thumbHeight) / 2;
    
    thumbCtx.drawImage(
        currentImage,
        thumbOffsetX, thumbOffsetY, thumbWidth, thumbHeight
    );
    
    const thumbData = thumbCanvas.toDataURL('image/jpeg', 0.8);
    pdf.addImage(thumbData, 'JPEG', previewX, previewY, previewSize, previewSize);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const previewLabel = "Vista previa de la imagen";
    const previewLabelWidth = pdf.getTextWidth(previewLabel);
    pdf.text(previewLabel, centerX - previewLabelWidth / 2, previewY + previewSize + 10);
}

pdf.setFontSize(8);
pdf.setTextColor(150, 150, 150);
const footer = "...";
const footerWidth = pdf.getTextWidth(footer);
pdf.text(footer, centerX - footerWidth / 2, paperSize.height - 10);
}