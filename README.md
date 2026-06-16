# Poster Generator

Web app that turns a single image into a large poster split across multiple printable PDF pages.

## Features

- Upload an image directly in the browser.
- Drag and drop or click to select a file.
- Split the poster into grids from `2x2` up to `10x10`.
- Export using `A4`, `Letter`, or `A3` paper sizes.
- Preview every generated page before exporting.
- Show technical information such as final poster size, scaling, and effective print DPI.
- Generate a printable PDF with a cover page that includes poster details.

## How To Use

1. Upload an image.
2. Choose a grid size.
3. Choose a paper size.
4. Review the preview and technical information.
5. Download the generated PDF.
6. Print the PDF at actual size and on the same paper format it was generated in.

## Supported Formats

- Input images: `JPG`, `PNG`, `GIF`, `WEBP`
- Paper sizes: `A4`, `Letter`, `A3`
- Output: `PDF`

## Image Validation

- Maximum file size: `50 MB`
- Minimum image dimensions: `100x100 px`
- Maximum image dimensions: `12000x12000 px`
- Maximum total pixels: `40,000,000`

These limits help keep the browser responsive while generating previews and PDFs.

## Privacy And Security

- The app runs entirely in the browser.
- No backend or remote image storage is used.
- Exported PDFs are generated locally with `jsPDF`.
- A restrictive Content Security Policy is included for safer static hosting.
- `jsPDF` is bundled locally, while Bootstrap CSS is loaded from `jsdelivr`.

## Credits

- Inspired by [Block Posters](http://blockposters.com/)
- PDF generation powered by [jsPDF](https://github.com/parallax/jsPDF)

## License

This project is licensed under the MIT License.
