import { FilterSettings } from '../types/card';

export function applyFiltersToCanvas(
  sourceCanvas: HTMLCanvasElement,
  cropArea: { x: number; y: number; width: number; height: number },
  filters: FilterSettings
): HTMLCanvasElement {
  const output = document.createElement('canvas');
  output.width = Math.max(1, Math.round(cropArea.width));
  output.height = Math.max(1, Math.round(cropArea.height));

  const ctx = output.getContext('2d', { willReadFrequently: true });
  if (!ctx) return output;

  // 1. Draw cropped region
  ctx.drawImage(
    sourceCanvas,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    output.width,
    output.height
  );

  // If no adjustments and color mode, return early
  if (
    filters.brightness === 0 &&
    filters.contrast === 0 &&
    filters.sharpness === 0 &&
    filters.mode === 'color'
  ) {
    return output;
  }

  const imgData = ctx.getImageData(0, 0, output.width, output.height);
  const data = imgData.data;
  const len = data.length;

  // Pre-calculate contrast factor
  // contrast factor: (259 * (contrast + 255)) / (255 * (259 - contrast))
  const cVal = Math.min(99, Math.max(-99, filters.contrast));
  const contrastFactor = (259 * (cVal + 255)) / (255 * (259 - cVal));
  const bVal = (filters.brightness / 100) * 128;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Mode: Grayscale or Clean-scan
    if (filters.mode === 'grayscale' || filters.mode === 'clean-scan') {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray;
      g = gray;
      b = gray;
    }

    // Apply brightness
    r += bVal;
    g += bVal;
    b += bVal;

    // Apply contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // Clean-scan thresholding: boost background whites while keeping text dark
    if (filters.mode === 'clean-scan') {
      if (r > 200 && g > 200 && b > 200) {
        r = 255;
        g = 255;
        b = 255;
      }
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // Apply Sharpening if requested (via 3x3 unsharp convolution kernel)
  if (filters.sharpness > 0) {
    const sharpenedCanvas = applySharpenKernel(output, filters.sharpness / 100);
    return sharpenedCanvas;
  }

  return output;
}

function applySharpenKernel(canvas: HTMLCanvasElement, strength: number): HTMLCanvasElement {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const srcData = ctx.getImageData(0, 0, w, h);
  const src = srcData.data;

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = w;
  outputCanvas.height = h;
  const outCtx = outputCanvas.getContext('2d');
  if (!outCtx) return canvas;

  const dstData = outCtx.createImageData(w, h);
  const dst = dstData.data;

  // 3x3 sharpening kernel:
  // [ 0,  -s,  0 ]
  // [ -s, 1+4s,-s]
  // [ 0,  -s,  0 ]
  const s = strength * 0.8;
  const centerWeight = 1 + 4 * s;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;

      for (let c = 0; c < 3; c++) {
        const top = ((y - 1) * w + x) * 4 + c;
        const bottom = ((y + 1) * w + x) * 4 + c;
        const left = (y * w + (x - 1)) * 4 + c;
        const right = (y * w + (x + 1)) * 4 + c;
        const center = idx + c;

        const val =
          src[center] * centerWeight -
          (src[top] + src[bottom] + src[left] + src[right]) * s;

        dst[idx + c] = Math.min(255, Math.max(0, val));
      }
      dst[idx + 3] = src[idx + 3]; // Alpha
    }
  }

  outCtx.putImageData(dstData, 0, 0);
  return outputCanvas;
}
