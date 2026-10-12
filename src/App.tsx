import { useState } from 'react';
import { Header } from './components/Header';
import { CardSelector } from './components/CardSelector';
import { Dropzone } from './components/Dropzone';
import { CropCanvas } from './components/cropper/CropCanvas';
import { FilterControls } from './components/cropper/FilterControls';
import { PageManagerStrip } from './components/PageManagerStrip';
import { PrintPreviewModal } from './components/preview/PrintPreviewModal';
import { PasswordModal } from './components/PasswordModal';
import { InfoModal } from './components/InfoModal';
import { CARD_PRESETS } from './constants/cardPresets';
import { CardPreset, CropBox, FilterSettings, RenderedPage } from './types/card';
import { loadDocument, loadMultipleFiles, renderImageFile, isPdf } from './services/pdfService';
import { applyFiltersToCanvas } from './services/imageFilterService';
import { 
  Printer, 
  FileUp, 
  Sparkles, 
  Trash2 
} from 'lucide-react';

const DEFAULT_FILTERS: FilterSettings = {
  brightness: 0,
  contrast: 0,
  sharpness: 0,
  mode: 'color',
};

export function App() {
  const [selectedPreset, setSelectedPreset] = useState<CardPreset>(CARD_PRESETS[0]);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [activeDocName, setActiveDocName] = useState<string | null>(null);

  // Crop Boxes
  const [frontBox, setFrontBox] = useState<CropBox>(CARD_PRESETS[0].defaultFrontBox);
  const [backBox, setBackBox] = useState<CropBox>(CARD_PRESETS[0].defaultBackBox);
  const [hasBackSide, setHasBackSide] = useState<boolean>(true);

  // Filters
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);

  // Loading & Modals
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  const [passwordFile, setPasswordFile] = useState<File | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  // Extracted canvases for preview
  const [extractedFrontCanvas, setExtractedFrontCanvas] = useState<HTMLCanvasElement | null>(null);
  const [extractedBackCanvas, setExtractedBackCanvas] = useState<HTMLCanvasElement | null>(null);

  // When changing preset, update crop boxes to new defaults
  const handleSelectPreset = (preset: CardPreset) => {
    setSelectedPreset(preset);
    setFrontBox(preset.defaultFrontBox);
    setBackBox(preset.defaultBackBox);
    setHasBackSide(preset.hasDualSides);
  };

  const handleUpdateCustomPreset = (updated: CardPreset) => {
    setSelectedPreset(updated);
  };

  const handleUpdatePresetDimensions = (widthMm: number, heightMm: number) => {
    setSelectedPreset((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        widthMm,
        heightMm,
      },
    }));
  };

  const handleResetToPreset = () => {
    setFrontBox(selectedPreset.defaultFrontBox);
    setBackBox(selectedPreset.defaultBackBox);
  };

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      setIsLoading(true);
      setLoadingProgress(10);
      setLoadingMessage(`Loading ${files.length} ${files.length === 1 ? 'file' : 'files'}...`);

      const result = await loadMultipleFiles(files, (progress) => {
        setLoadingProgress(progress);
      });

      setPages(result.pages);
      setActiveDocName(result.name);
      setActivePageNum(1);

      // If document has 2 or more pages, default Front to Page 1 and Back to Page 2
      if (result.numPages > 1) {
        setFrontBox({ ...selectedPreset.defaultFrontBox, pageNumber: 1 });
        setBackBox({ ...selectedPreset.defaultBackBox, pageNumber: 2 });
      } else {
        setFrontBox({ ...selectedPreset.defaultFrontBox, pageNumber: 1 });
        setBackBox({ ...selectedPreset.defaultBackBox, pageNumber: 1 });
      }

      setHasBackSide(selectedPreset.hasDualSides);
    } catch (err: any) {
      if (err?.isPasswordRequired) {
        setPasswordFile(files[0]);
        setIsPasswordModalOpen(true);
        setPasswordError(undefined);
      } else {
        alert('Failed to load document: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!passwordFile) return;
    try {
      setIsLoading(true);
      setLoadingMessage('Decrypting PDF client-side...');
      const result = await loadDocument(passwordFile, passwordFile.name, password);
      setPages(result.pages);
      setActiveDocName(passwordFile.name);
      setActivePageNum(1);
      setIsPasswordModalOpen(false);
      setPasswordFile(null);
    } catch (err: any) {
      if (err?.isPasswordRequired) {
        setPasswordError('Incorrect password. Please try again.');
      } else {
        setPasswordError(err.message || 'Decryption failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSpecimen = async (sampleFileName: string, preset: CardPreset) => {
    try {
      setSelectedPreset(preset);
      setIsLoading(true);
      setLoadingProgress(20);
      setLoadingMessage(`Loading specimen ${preset.name}...`);

      const sampleUrl = `/samples/${sampleFileName}`;
      const result = await loadDocument(sampleUrl, sampleFileName);

      setPages(result.pages);
      setActiveDocName(`Specimen: ${preset.name}`);
      setActivePageNum(1);
      setFrontBox(preset.defaultFrontBox);
      setBackBox(preset.defaultBackBox);
      setHasBackSide(preset.hasDualSides);
    } catch (err: any) {
      console.error('Failed to load specimen:', err);
      alert('Failed to load specimen: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Replace / Update image for a specific page
  const handleReplacePageImage = async (pageNumber: number, file: File) => {
    try {
      setIsLoading(true);
      setLoadingMessage(`Updating Page ${pageNumber} with new image...`);

      let newPage: RenderedPage;
      if (isPdf(file)) {
        const pdfRes = await loadDocument(file, file.name);
        newPage = { ...pdfRes.pages[0], pageNumber };
      } else {
        newPage = await renderImageFile(file, pageNumber);
      }

      setPages((prev) =>
        prev.map((p) => (p.pageNumber === pageNumber ? newPage : p))
      );
    } catch (err: any) {
      alert('Failed to update page image: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Append a new page to the document
  const handleAddPage = async (file: File) => {
    try {
      setIsLoading(true);
      setLoadingMessage('Adding new page...');

      const nextPageNum = pages.length + 1;
      let newPagesToAdd: RenderedPage[] = [];

      if (isPdf(file)) {
        const pdfRes = await loadDocument(file, file.name);
        let counter = nextPageNum;
        newPagesToAdd = pdfRes.pages.map((p) => ({
          ...p,
          pageNumber: counter++,
        }));
      } else {
        const imgPage = await renderImageFile(file, nextPageNum);
        newPagesToAdd = [imgPage];
      }

      setPages((prev) => [...prev, ...newPagesToAdd]);
      setActivePageNum(nextPageNum);

      // If document previously had only 1 page, suggest setting new page as Back
      if (pages.length === 1 && hasBackSide) {
        setBackBox((prev) => ({ ...prev, pageNumber: nextPageNum }));
      }
    } catch (err: any) {
      alert('Failed to add page: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a page
  const handleDeletePage = (pageNumber: number) => {
    if (pages.length <= 1) return;

    const remaining = pages
      .filter((p) => p.pageNumber !== pageNumber)
      .map((p, idx) => ({ ...p, pageNumber: idx + 1 }));

    setPages(remaining);

    // Adjust crop box page numbers
    setFrontBox((prev) => ({
      ...prev,
      pageNumber: Math.min(prev.pageNumber, remaining.length),
    }));
    setBackBox((prev) => ({
      ...prev,
      pageNumber: Math.min(prev.pageNumber, remaining.length),
    }));

    setActivePageNum((prev) => Math.min(prev, remaining.length));
  };

  const handleResetDocument = () => {
    setPages([]);
    setActiveDocName(null);
    setFilters(DEFAULT_FILTERS);
    setActivePageNum(1);
  };

  const handleOpenPrintPreview = () => {
    if (pages.length === 0) return;

    // Crop Front Card
    const frontPage = pages.find((p) => p.pageNumber === frontBox.pageNumber) || pages[0];
    const frontPixelArea = {
      x: (frontBox.x / 100) * frontPage.width,
      y: (frontBox.y / 100) * frontPage.height,
      width: (frontBox.width / 100) * frontPage.width,
      height: (frontBox.height / 100) * frontPage.height,
    };
    const frontCropped = applyFiltersToCanvas(frontPage.canvas, frontPixelArea, filters);
    setExtractedFrontCanvas(frontCropped);

    // Crop Back Card (if enabled)
    if (hasBackSide) {
      const backPage = pages.find((p) => p.pageNumber === backBox.pageNumber) || pages[0];
      const backPixelArea = {
        x: (backBox.x / 100) * backPage.width,
        y: (backBox.y / 100) * backPage.height,
        width: (backBox.width / 100) * backPage.width,
        height: (backBox.height / 100) * backPage.height,
      };
      const backCropped = applyFiltersToCanvas(backPage.canvas, backPixelArea, filters);
      setExtractedBackCanvas(backCropped);
    } else {
      setExtractedBackCanvas(null);
    }

    setIsPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onOpenInfo={() => setIsInfoOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Top Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <CardSelector
              selectedPreset={selectedPreset}
              onSelectPreset={handleSelectPreset}
              onUpdateCustomPreset={handleUpdateCustomPreset}
            />
          </div>

          {pages.length > 0 && (
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={handleResetDocument}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/50 text-xs font-medium transition-colors flex items-center space-x-1.5"
                title="Remove current document"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Close File</span>
              </button>

              <button
                onClick={handleOpenPrintPreview}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-900/30 transition-all flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Studio & Export</span>
              </button>
            </div>
          )}
        </div>

        {/* Workspace Area: Dropzone vs Cropper */}
        {pages.length === 0 ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            onLoadSpecimen={handleLoadSpecimen}
            isLoading={isLoading}
            loadingProgress={loadingProgress}
            loadingMessage={loadingMessage}
            selectedPreset={selectedPreset}
          />
        ) : (
          <div className="space-y-6">
            {/* Active Document Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <FileUp className="w-4 h-4 text-teal-400" />
                <span className="font-semibold text-white">Document:</span>
                <span className="text-slate-300 font-mono truncate max-w-xs sm:max-w-md">
                  {activeDocName}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                  {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-slate-400">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>
                    {selectedPreset.isCustom
                      ? 'Custom Dimension Mode'
                      : 'CR80 Card Standard'}
                  </span>
                </span>
              </div>
            </div>

            {/* Document Pages & Image Manager Strip */}
            <PageManagerStrip
              pages={pages}
              activePageNum={activePageNum}
              onSelectPage={setActivePageNum}
              frontBox={frontBox}
              backBox={backBox}
              hasBackSide={hasBackSide}
              onSetFrontPage={(pNum) => setFrontBox((prev) => ({ ...prev, pageNumber: pNum }))}
              onSetBackPage={(pNum) => setBackBox((prev) => ({ ...prev, pageNumber: pNum }))}
              onReplacePageImage={handleReplacePageImage}
              onAddPage={handleAddPage}
              onDeletePage={handleDeletePage}
            />

            {/* Interactive Cropper */}
            <CropCanvas
              pages={pages}
              activePageNum={activePageNum}
              onSelectPage={setActivePageNum}
              frontBox={frontBox}
              backBox={backBox}
              hasBackSide={hasBackSide}
              onFrontBoxChange={setFrontBox}
              onBackBoxChange={setBackBox}
              onHasBackSideChange={setHasBackSide}
              selectedPreset={selectedPreset}
              onResetToPreset={handleResetToPreset}
              onUpdatePresetDimensions={handleUpdatePresetDimensions}
            />

            {/* Filter Adjustments */}
            <FilterControls
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(DEFAULT_FILTERS)}
            />

            {/* Bottom Floating Action Bar */}
            <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md flex items-center justify-between">
              <div className="text-xs text-slate-400 hidden sm:block">
                <span>
                  {selectedPreset.isCustom
                    ? 'Custom card boundaries configured. Ready to generate print output.'
                    : 'Front & Back regions selected. Ready to generate print-ready PDF.'}
                </span>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleResetToPreset}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Reset Crop
                </button>
                <button
                  onClick={handleOpenPrintPreview}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-900/40 flex items-center justify-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Preview & Export Print PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordFile(null);
        }}
        onSubmit={handlePasswordSubmit}
        errorMessage={passwordError}
      />

      {extractedFrontCanvas && (
        <PrintPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          frontCanvas={extractedFrontCanvas}
          backCanvas={extractedBackCanvas}
          selectedPreset={selectedPreset}
        />
      )}

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>
          CardPrint Studio - 100% Client-Side Indian Identity Document Card Cropper.
        </p>
        <p className="text-[11px] text-slate-600">
          Compliant with ISO/IEC 7810 ID-1 (CR80 Standard). Zero data retention.
        </p>
      </footer>
    </div>
  );
}

export default App;
