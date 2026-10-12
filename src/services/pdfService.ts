import * as pdfjsLib from 'pdfjs-dist';
import { RenderedPage } from '../types/card';

// Configure local pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface LoadDocumentResult {
  numPages: number;
  pages: RenderedPage[];
  isPdf: boolean;
  name: string;
}

export interface PasswordChallenge {
  isPasswordRequired: boolean;
  message: string;
}

export function isPdf(file: File | Blob | string): boolean {
  if (typeof file === 'string') {
    return file.toLowerCase().endsWith('.pdf');
  }
  const fileName = 'name' in file ? (file as File).name : '';
  return file.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
}

export async function renderImageFile(
  file: File | Blob,
  pageNumber: number
): Promise<RenderedPage> {
  const imgUrl = URL.createObjectURL(file);
  try {
    const page = await renderImageToPage(imgUrl, pageNumber);
    return page;
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}

export async function loadDocument(
  source: File | ArrayBuffer | string,
  fileName: string,
  password?: string,
  onProgress?: (progress: number) => void
): Promise<LoadDocumentResult> {
  let arrayBuffer: ArrayBuffer;

  if (source instanceof File) {
    arrayBuffer = await source.arrayBuffer();
  } else if (typeof source === 'string') {
    const response = await fetch(source);
    arrayBuffer = await response.arrayBuffer();
  } else {
    arrayBuffer = source;
  }

  const isPdfDoc = isPdf(fileName);

  if (!isPdfDoc) {
    const blob = new Blob([arrayBuffer]);
    const page = await renderImageFile(blob, 1);
    return {
      numPages: 1,
      pages: [page],
      isPdf: false,
      name: fileName,
    };
  }

  // Process PDF
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      password: password || undefined,
    });

    const doc = await loadingTask.promise;
    const numPages = doc.numPages;
    const pages: RenderedPage[] = [];

    // Render each page at 2.0x scale (gives ~150-300 DPI high clarity)
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (onProgress) {
        onProgress((pageNum / numPages) * 100);
      }
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        throw new Error('Failed to create canvas 2D context');
      }

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      pages.push({
        pageNumber: pageNum,
        canvas,
        width: viewport.width,
        height: viewport.height,
        dataUrl: canvas.toDataURL('image/png'),
      });
    }

    return {
      numPages,
      pages,
      isPdf: true,
      name: fileName,
    };
  } catch (error: any) {
    if (error?.name === 'PasswordException' || error?.code === 1) {
      const challenge: PasswordChallenge = {
        isPasswordRequired: true,
        message: 'This PDF is password protected. Enter password to unlock.',
      };
      throw challenge;
    }
    throw error;
  }
}

export async function loadMultipleFiles(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<LoadDocumentResult> {
  if (files.length === 1 && isPdf(files[0])) {
    return loadDocument(files[0], files[0].name, undefined, onProgress);
  }

  const allPages: RenderedPage[] = [];
  let pageCounter = 1;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) {
      onProgress(((i + 1) / files.length) * 100);
    }

    if (isPdf(file)) {
      const pdfRes = await loadDocument(file, file.name);
      for (const p of pdfRes.pages) {
        allPages.push({
          ...p,
          pageNumber: pageCounter++,
        });
      }
    } else {
      const imgPage = await renderImageFile(file, pageCounter++);
      allPages.push(imgPage);
    }
  }

  const combinedName = files.length === 1 
    ? files[0].name 
    : `${files[0].name} + ${files.length - 1} more (${allPages.length} Pages)`;

  return {
    numPages: allPages.length,
    pages: allPages,
    isPdf: files.some(isPdf),
    name: combinedName,
  };
}

async function renderImageToPage(imgSrc: string, pageNumber: number): Promise<RenderedPage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve({
        pageNumber,
        canvas,
        width: canvas.width,
        height: canvas.height,
        dataUrl: canvas.toDataURL('image/png'),
      });
    };
    img.onerror = (err) => reject(err);
    img.src = imgSrc;
  });
}
