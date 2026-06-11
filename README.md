# Generador de Pósters

Aplicación web para convertir una imagen en un póster dividido en varias páginas imprimibles.

## Qué hace

- Permite subir una imagen desde el navegador.
- Divide el póster en cuadrículas desde `2x2` hasta `10x10`.
- Soporta papel `A4`, `Carta (Letter)` y `A3`.
- Muestra una vista previa y datos técnicos antes de exportar.
- Genera un PDF listo para imprimir.

## Cómo usarlo

1. Sube una imagen.
2. Elige el tamaño de cuadrícula.
3. Selecciona el tamaño de papel.
4. Revisa la vista previa y la información técnica.
5. Descarga el PDF.

## Formatos soportados

- Imágenes: `JPG`, `PNG`, `GIF`, `WEBP`
- Papel: `A4`, `Carta (Letter)` y `A3`
- Salida: `PDF`

## Nota de impresión

Para mantener las medidas correctas del póster, imprime el PDF a tamaño real o `100%`.

## Seguridad y despliegue

- La aplicación funciona completamente en el navegador, sin backend ni almacenamiento remoto de imágenes.
- `jsPDF` se sirve localmente para no depender de un CDN al exportar el PDF.
- Se aplica una Content Security Policy básica compatible con GitHub Pages.
- Se validan tamaño, formato y dimensiones de imagen para reducir bloqueos del navegador.

## Licencia

Este proyecto está bajo la licencia MIT.

## Créditos

- Inspirado en [BlockPoster](http://blockposters.com/)
- Generación de PDF con [jsPDF](https://github.com/parallax/jsPDF)
