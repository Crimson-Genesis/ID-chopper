export interface CropBox {
  x: number; // percentage 0 to 100
  y: number; // percentage 0 to 100
  width: number; // percentage 0 to 100
  height: number; // percentage 0 to 100
  pageNumber: number; // 1-indexed page
}

export type CardCategory = 
  | 'identity'
  | 'tax'
  | 'health'
  | 'education'
  | 'welfare'
  | 'transport'
  | 'custom';

export interface CardPreset {
  id: string;
  name: string;
  shortName: string;
  category: CardCategory;
  authority: string;
  portalUrl: string;
  description: string;
  sampleFileName: string;
  hasDualSides: boolean;
  isCustom?: boolean;
  defaultFrontBox: CropBox;
  defaultBackBox: CropBox;
  dimensions: {
    widthMm: number;
    heightMm: number;
    cornerRadiusMm: number;
  };
}

export interface FilterSettings {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  sharpness: number; // 0 to 100
  mode: 'color' | 'grayscale' | 'clean-scan';
}

export type PrintLayoutFormat = 
  | 'pvc_cr80'          // 85.6mm x 53.98mm 2-page direct thermal print
  | 'lamination_pouch'  // Side-by-side with 2mm cut-fold line
  | 'photo_4x6'         // 102mm x 152mm with alignment crop marks
  | 'a4_5card';         // A4 grid for 5 cards / 10 card faces

export interface RenderedPage {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  dataUrl?: string;
}
