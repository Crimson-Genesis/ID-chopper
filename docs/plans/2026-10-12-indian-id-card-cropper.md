# Indian ID Card Cropper & Print-Ready PDF Generator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 100% client-side, zero-telemetry web application that enables users to upload multi-page or A4 Indian ID sheets (Aadhaar, PAN, Voter, Ayushman, etc.), accurately extract Front and Back card regions via intelligent presets or interactive crop handles, enhance image quality, and export high-resolution (300 DPI), print-ready PDFs (CR80 PVC, 4×6" photo paper, and A4 5-card sheets).

**Architecture:** A modern single-page application built with Vite, React, and TypeScript. In-browser PDF rasterization and password handling are powered by `pdfjs-dist`, while dual-box card cropping and pixel manipulation run on high-performance HTML5 Canvas 2D. Final print-ready document synthesis is generated entirely in-memory using `pdf-lib` to guarantee precise physical millimeter dimensions and zero server interaction.

**Tech Stack:** 
- Frontend: Vite, React 19, TypeScript
- Styling: Tailwind CSS (Modern dark/light glassmorphic UI, Lucide icons)
- PDF Engine: `pdfjs-dist` (client-side rendering & password decryption), `pdf-lib` (print sheet composition)
- Canvas/Graphics: HTML5 Canvas 2D API (multi-box crop, unsharp mask, contrast/brightness adjustments)
- Test Framework: Vitest + React Testing Library

---

### Task 1: Project Scaffolding & NixOS Dev Shell Verification

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`
- Modify: `AGENTS.md`
- Test: `tests/setup.test.ts`

**Step 1: Write setup test**
Create a test ensuring environment configurations and test runners function correctly.
```typescript
import { describe, it, expect } from 'vitest';

describe('Project Setup Verification', () => {
  it('should run tests in NixOS environment', () => {
    expect(true).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails (before setup)**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npx vitest run tests/setup.test.ts"`
Expected: FAIL (No vitest or package.json found)

**Step 3: Initialize Vite React TypeScript project with required dependencies**
Run within the Nix dev shell:
- `npm create vite@latest . -- --template react-ts`
- Install dependencies: `pdfjs-dist`, `pdf-lib`, `lucide-react`, `clsx`, `tailwind-merge`
- Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `tailwindcss`, `@tailwindcss/vite`

**Step 4: Run test to verify it passes**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm run test"`
Expected: PASS

**Step 5: Commit**
```bash
git add package.json tsconfig.json vite.config.ts index.html tests/
git commit -m "feat: scaffold vite react typescript project with nix dev shell"
```

---

### Task 2: Core Data Types & Card Registry Definition

**Files:**
- Create: `src/types/card.ts`
- Create: `src/constants/cardPresets.ts`
- Test: `tests/cardPresets.test.ts`

**Step 1: Write failing test for card registry**
```typescript
import { describe, it, expect } from 'vitest';
import { CARD_PRESETS, getPresetById } from '../src/constants/cardPresets';

describe('Card Presets Registry', () => {
  it('contains all 12 official Indian identity card presets', () => {
    expect(CARD_PRESETS).toHaveLength(12);
    expect(getPresetById('aadhaar')).toBeDefined();
    expect(getPresetById('pan')).toBeDefined();
    expect(getPresetById('voter_epic')).toBeDefined();
    expect(getPresetById('ayushman')).toBeDefined();
  });

  it('defines standard CR80 physical dimensions and ratios', () => {
    const aadhaar = getPresetById('aadhaar');
    expect(aadhaar?.dimensions.widthMm).toBeCloseTo(85.6, 1);
    expect(aadhaar?.dimensions.heightMm).toBeCloseTo(53.98, 1);
  });
});
```

**Step 2: Run test to verify failure**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm test tests/cardPresets.test.ts"`
Expected: FAIL (File not found)

**Step 3: Implement `src/types/card.ts` and `src/constants/cardPresets.ts`**
- Define `CardPreset` interface: ID, name, localized name, issuing authority, official portal URL, default page numbers, default crop bounding boxes for Front and Back (percentage-based coordinates for resolution independence), and description.
- Implement registry covering: Aadhaar, APAAR, ABC, Ayushman, Driving Licence, e-Shram, Family ID, Farmer ID, Health ID (ABHA), Ration Card, PAN Card, Voter ID (e-EPIC).

**Step 4: Run test to verify it passes**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm test tests/cardPresets.test.ts"`
Expected: PASS

**Step 5: Commit**
```bash
git add src/types/card.ts src/constants/cardPresets.ts tests/cardPresets.test.ts
git commit -m "feat: define card types and 12 indian id presets"
```

---

### Task 3: Client-Side Document Loader & PDF.js Parser Engine

**Files:**
- Create: `src/services/pdfService.ts`
- Create: `src/types/document.ts`
- Test: `tests/pdfService.test.ts`

**Step 1: Write test for PDF renderer and password challenge handling**
```typescript
import { describe, it, expect } from 'vitest';
import { isPdfFile, parseDocumentFile } from '../src/services/pdfService';

describe('PDF Service', () => {
  it('correctly identifies PDF vs Image files', () => {
    const pdfFile = new File(['%PDF-1.4'], 'specimen.pdf', { type: 'application/pdf' });
    const imgFile = new File(['data'], 'specimen.png', { type: 'image/png' });
    expect(isPdfFile(pdfFile)).toBe(true);
    expect(isPdfFile(imgFile)).toBe(false);
  });
});
```

**Step 2: Run test to verify failure**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm test tests/pdfService.test.ts"`
Expected: FAIL

**Step 3: Implement `pdfService.ts`**
- Set up `pdfjs-dist` worker via local Vite bundle URL.
- Support multi-page PDF rendering: render page to offscreen HTML5 `<canvas>` at high DPI (scale = 2.0 to 3.0 for crisp 300 DPI text).
- Support password-protected e-Aadhaar PDFs with error catching (`PasswordException`) and client-side password challenge callback.
- Support standard image file inputs (PNG, JPG, WebP) with EXIF orientation correction.

**Step 4: Run test to verify it passes**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm test tests/pdfService.test.ts"`
Expected: PASS

**Step 5: Commit**
```bash
git add src/services/pdfService.ts src/types/document.ts tests/pdfService.test.ts
git commit -m "feat: implement client-side pdf rendering and password handling"
```

---

### Task 4: Interactive Dual-Box Crop & Canvas Coordinate System

**Files:**
- Create: `src/components/cropper/CropCanvas.tsx`
- Create: `src/components/cropper/CropBoxOverlay.tsx`
- Create: `src/hooks/useCropBox.ts`
- Test: `tests/cropGeometry.test.ts`

**Step 1: Write geometry calculation tests**
```typescript
import { describe, it, expect } from 'vitest';
import { enforceAspectRatio, clampCropBox, normalizeCoordinates } from '../src/utils/cropGeometry';

describe('Crop Geometry Engine', () => {
  it('enforces ISO CR80 aspect ratio (1.586)', () => {
    const cr80Ratio = 85.60 / 53.98;
    const box = { x: 50, y: 50, width: 300, height: 150 };
    const adjusted = enforceAspectRatio(box, cr80Ratio);
    expect(adjusted.width / adjusted.height).toBeCloseTo(cr80Ratio, 2);
  });

  it('clamps crop box within document boundaries', () => {
    const box = { x: 950, y: 1200, width: 400, height: 250 };
    const clamped = clampCropBox(box, 1000, 1400);
    expect(clamped.x + clamped.width).toBeLessThanOrEqual(1000);
    expect(clamped.y + clamped.height).toBeLessThanOrEqual(1400);
  });
});
```

**Step 2: Run test to verify failure**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm test tests/cropGeometry.test.ts"`
Expected: FAIL

**Step 3: Implement geometry utilities & interactive UI**
- Implement `cropGeometry.ts` with aspect-ratio locking, coordinate normalization, and zoom/pan transformations.
- Build `CropCanvas.tsx` and `CropBoxOverlay.tsx`:
  - Visual distinction: **Blue box for Front side**, **Emerald box for Back side**.
  - 8-point resize handles, dragging, and keyboard nudge adjustments (arrow keys for 1px, Shift+arrows for 10px).
  - One-click swap (Front ⇄ Back).
  - Aspect ratio toggle: Locked CR80 (Default 85.6 × 54mm) vs. Freeform crop.

**Step 4: Run test to verify it passes**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm test tests/cropGeometry.test.ts"`
Expected: PASS

**Step 5: Commit**
```bash
git add src/utils/cropGeometry.ts src/components/cropper/ tests/cropGeometry.test.ts
git commit -m "feat: implement dual-box crop canvas with CR80 aspect locking"
```

---

### Task 5: Image Enhancement & Filtering Engine

**Files:**
- Create: `src/services/imageFilterService.ts`
- Create: `src/components/cropper/FilterControls.tsx`
- Test: `tests/imageFilters.test.ts`

**Step 1: Write test for canvas pixel manipulation**
```typescript
import { describe, it, expect } from 'vitest';
import { applyFiltersToImageData } from '../src/services/imageFilterService';

describe('Image Filter Service', () => {
  it('applies brightness and contrast adjustments accurately', () => {
    const buffer = new Uint8ClampedArray([100, 100, 100, 255]);
    const adjusted = applyFiltersToImageData(buffer, { brightness: 20, contrast: 10, sharpen: 0 });
    expect(adjusted[0]).toBeGreaterThan(100);
  });
});
```

**Step 2: Run test to verify failure**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm test tests/imageFilters.test.ts"`
Expected: FAIL

**Step 3: Implement filter pipeline**
- Brightness adjustment (-100 to +100).
- Contrast adjustment (-100 to +100) to improve legibility of faded scanned IDs.
- Unsharp mask / edge sharpening filter (3x3 convolution matrix) to crisp up small text (Aadhaar numbers, address text, and QR codes).
- Color modes: Natural Color, Document Scan Clean (auto-threshold white background), Black & White.

**Step 4: Run test to verify it passes**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm test tests/imageFilters.test.ts"`
Expected: PASS

**Step 5: Commit**
```bash
git add src/services/imageFilterService.ts src/components/cropper/FilterControls.tsx tests/imageFilters.test.ts
git commit -m "feat: implement image enhancement filters for scanned id clarity"
```

---

### Task 6: Print Sheet Formats & PDF Generation Engine

**Files:**
- Create: `src/services/printLayoutService.ts`
- Create: `src/types/printLayout.ts`
- Create: `src/components/preview/PrintPreviewModal.tsx`
- Test: `tests/printLayoutService.test.ts`

**Step 1: Write test for layout calculations and PDF millimeter measurements**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateLayoutPositions, PRINT_FORMATS } from '../src/services/printLayoutService';

describe('Print Layout Service', () => {
  it('calculates exact millimeter margins for A4 5-Card grid', () => {
    const positions = calculateLayoutPositions('A4_5_CARD', { cardWidthMm: 85.6, cardHeightMm: 53.98 });
    expect(positions.cards).toHaveLength(5);
    expect(positions.pageWidthMm).toBeCloseTo(210, 1);
    expect(positions.pageHeightMm).toBeCloseTo(297, 1);
  });

  it('provides CR80 PVC single page format', () => {
    const pvc = PRINT_FORMATS['PVC_CR80'];
    expect(pvc.widthMm).toBeCloseTo(85.6, 1);
    expect(pvc.heightMm).toBeCloseTo(53.98, 1);
  });
});
```

**Step 2: Run test to verify failure**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm test tests/printLayoutService.test.ts"`
Expected: FAIL

**Step 3: Implement `printLayoutService.ts` using `pdf-lib`**
- Layout Options:
  1. **Lamination Pouch Mode (Side-by-Side)**: Front and Back cards side-by-side with 2mm scissor line and 3.18mm rounded corner guide.
  2. **4×6 Inch Photo Paper**: 1 or 2 cards centered with crop corner marks.
  3. **A4 Cyber Cafe Sheet (5 Cards)**: Standard 5-slot grid for bulk PVC card printing used in CSC centers across India.
  4. **Direct PVC Card**: 85.6mm × 53.98mm borderless 2-page PDF (Page 1 Front, Page 2 Back).
- Embed high-res (300 DPI) JPEG/PNG into the generated PDF via `pdf-lib`.
- Add optional scissors guide marks, fold lines, and alignment crosses.

**Step 4: Run test to verify it passes**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm test tests/printLayoutService.test.ts"`
Expected: PASS

**Step 5: Commit**
```bash
git add src/services/printLayoutService.ts src/types/printLayout.ts tests/printLayoutService.test.ts
git commit -m "feat: implement pdf-lib print layout generation for pvc, 4x6, and a4"
```

---

### Task 7: UI Assembly, Preset Selector & End-to-End Specimen Verification

**Files:**
- Create: `src/components/Header.tsx`, `src/components/CardSelector.tsx`, `src/components/Dropzone.tsx`
- Modify: `src/App.tsx`
- Test: `tests/e2eSpecimens.test.ts`

**Step 1: Write E2E test verifying crop pipeline against `ex/` specimens**
```typescript
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Specimen Card Verification', () => {
  it('verifies all 12 specimen files exist in ex/', () => {
    const exDir = path.resolve(__dirname, '../ex');
    const files = fs.readdirSync(exDir);
    expect(files.filter(f => f.endsWith('.pdf'))).toHaveLength(12);
    expect(files.filter(f => f.endsWith('.png'))).toHaveLength(12);
  });
});
```

**Step 2: Run test to verify failure / setup**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm test tests/e2eSpecimens.test.ts"`

**Step 3: Assemble complete responsive application**
- Design sleek, modern dark/light UI with Indian tricolor subtle badge accent.
- Searchable ID selector dropdown with icons and quick tags (Aadhaar, PAN, Voter ID, Ayushman, APAAR, etc.).
- Drag & Drop file uploader supporting multi-page PDFs and images.
- Page thumbnail drawer for multi-page documents (e.g. Page 1 Front, Page 2 Back).
- Live crop preview with Front/Back side tabs, live dimension indicators, and instant print/download buttons.
- Password modal for encrypted e-Aadhaar PDFs.

**Step 4: Run tests & verify production build**
Run: `nix develop /etc/nixos#all-linux --command bash -c "npm test && npm run build"`
Expected: Clean build with 0 errors.

**Step 5: Commit**
```bash
git add src/ tests/
git commit -m "feat: complete client-side id cropper web application"
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-10-12-indian-id-card-cropper.md`. Two execution options:

1. **Subagent-Driven (this session)** - I dispatch fresh subagents per task, review between tasks, fast iteration.
2. **Parallel Session (separate)** - Open new session with `executing-plans`, batch execution with checkpoints.

**Which approach would you prefer?**
