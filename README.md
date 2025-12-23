# Generador de Pósters

Una aplicación web gratuita para convertir cualquier imagen en un póster gigante dividido en páginas imprimibles, similar a BlockPoster pero con interfaz más simple y gratutito.

## Características

- **Interfaz moderna y responsive** - Diseño elegante que funciona en desktop y móviles
- **Múltiples formatos de papel** - A4, Carta y A3
- **Tamaños de cuadrícula flexibles** - Desde 2x2 hasta 6x6
- **Vista previa interactiva** - Ve exactamente cómo quedará cada página antes de imprimir
- **Procesamiento asíncrono** - Interfaz fluida con indicador de progreso en tiempo real
- **Información técnica detallada** - Dimensiones finales, resolución efectiva, factor de escala
- **Página de portada** - PDF incluye información completa del proyecto para referencia
- **Drag & Drop** - Arrastra y suelta imágenes directamente
- **Alta calidad** - Generación de PDF a 300 DPI para impresión profesional

## Uso

1. **Subir imagen:** Haz clic o arrastra tu imagen (JPG, PNG, WEBP, entre otros)
2. **Configurar:** Selecciona el tamaño de cuadrícula y formato de papel
3. **Previsualizar:** Revisa cómo quedará dividido tu póster
4. **Descargar:** Obtén tu PDF listo para imprimir

### Formatos Soportados
- **Imágenes:** JPG, PNG, WEBP
- **Papel:** A4 (210×297mm), Carta (216×279mm), A3 (297×420mm)
- **Salida:** PDF de alta resolución


## Características Técnicas

### Algoritmo de División
- Cálculo automático de escala para ajustar imagen al área total
- Centrado inteligente de la imagen en el póster
- Procesamiento por intersecciones para optimizar calidad
- Numeración automática de páginas para facilitar el ensamblaje

### Procesamiento Asíncrono
- División en batches de 2 celdas para mantener UI fluida
- Indicador de progreso en tiempo real
- Pausas de 10ms entre batches para responsividad
- Compatible con imágenes grandes y grillas extensas

### Optimizaciones
- Canvas de alta resolución para impresión
- Compresión JPEG optimizada para PDF
- Gestión eficiente de memoria
- Responsive design para todas las pantallas

## Licencia

Este proyecto está bajo la Licencia MIT.

##  Reconocimientos

- Inspirado en [BlockPoster](http://blockposters.com/)

- Librería [jsPDF](https://github.com/parallax/jsPDF) para generación de PDFs

