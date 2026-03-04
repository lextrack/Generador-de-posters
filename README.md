# Generador de Pósters

Una aplicación web gratuita para convertir cualquier imagen en un póster gigante dividido en páginas imprimibles, similar a BlockPoster pero con una interfaz más simple y gratuita.

## Características

- **Interfaz moderna y responsive** - Diseño elegante que funciona en desktop y móviles.
- **Múltiples formatos de papel** - A4, Carta (Letter) y A3.
- **Tamaños de cuadrícula flexibles** - Desde 2x2 hasta 10x10.
- **Vista previa interactiva** - Ve exactamente cómo quedará cada página antes de imprimir.
- **Procesamiento asíncrono** - Interfaz fluida con indicador de progreso en tiempo real.
- **Información técnica detallada** - Dimensiones finales, resolución efectiva y factor de escala.
- **Página de portada** - El PDF incluye información completa del proyecto para referencia.
- **Drag & Drop** - Arrastra y suelta imágenes directamente.
- **Alta calidad** - Generación de PDF a 300 DPI para impresión profesional.

## Uso

1. **Subir imagen:** Haz clic o arrastra tu imagen (JPG, PNG, GIF, WEBP, entre otros).
2. **Configurar:** Selecciona el tamaño de cuadrícula y formato de papel.
3. **Previsualizar:** Revisa cómo quedará dividido tu póster.
4. **Descargar:** Obtén tu PDF listo para imprimir.

### Formatos soportados
- **Imágenes:** JPG, PNG, GIF, WEBP.
- **Papel:** A4 (210×297 mm), Carta/Letter (215.9×279.4 mm), A3 (297×420 mm).
- **Salida:** PDF de alta resolución.

## Características técnicas

### Algoritmo de división
- Cálculo automático de escala para ajustar la imagen al área total.
- Centrado inteligente de la imagen en el póster.
- Procesamiento por intersecciones para optimizar calidad.
- Numeración automática de páginas para facilitar el ensamblaje.

### Procesamiento asíncrono
- División en batches de 2 a 5 celdas para mantener la UI fluida.
- Indicador de progreso en tiempo real.
- Pausas de 10 ms entre batches para mejorar la responsividad.
- Compatible con imágenes grandes y grillas extensas.

### Optimizaciones
- Canvas de alta resolución para impresión.
- Compresión JPEG optimizada para PDF.
- Gestión eficiente de memoria.
- Responsive design para todas las pantallas.

## Licencia

Este proyecto está bajo la licencia MIT.

## Reconocimientos

- Inspirado en [BlockPoster](http://blockposters.com/).
- Librería [jsPDF](https://github.com/parallax/jsPDF) para generación de PDFs.
