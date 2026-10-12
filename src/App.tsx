import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SidebarControls } from './components/SidebarControls';
import { CropCanvas } from './components/cropper/CropCanvas';
import { SideBySideCropPreview } from './components/cropper/SideBySideCropPreview';
import { PasswordModal } from './components/PasswordModal';
import { InfoModal } from './components/InfoModal';
import { CARD_PRESETS } from './constants/cardPresets';
import { 
  AppFile, 
  CardPreset, 
  CropBox, 
  FilterSettings, 
  PrintLayoutFormat, 
  RenderedPage,
  CachedCropItem
} from './types/card';
import { loadSingleAppFile, loadAppFiles } from './services/pdfService';
import { applyFiltersToCanvas } from './services/imageFilterService';
import { generatePrintPdf, promptAndSavePdf } from './services/printLayoutService';
import { FileUp } from 'lucide-react';

const DEFAULT_FILTERS: FilterSettings = {
  brightness: 0,
  contrast: 0,
  sharpness: 0,
  mode: 'color',
};

const extractCanvasCrop = (
  page: RenderedPage,
  box: CropBox,
  filters: FilterSettings
): HTMLCanvasElement => {
  const area = {
    x: (box.x / 100) * page.width,
    y: (box.y / 100) * page.height,
    width: (box.width / 100) * page.width,
    height: (box.height / 100) * page.height,
  };
  return applyFiltersToCanvas(page.canvas, area, filters);
};

export function App() {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [selectedPreset, setSelectedPreset] = useState<CardPreset>(CARD_PRESETS[1]); // Aadhaar default

  // Cached Crop Items (preserved across file switching)
  const [frontCrop, setFrontCrop] = useState<CachedCropItem | null>(null);
  const [backCrop, setBackCrop] = useState<CachedCropItem | null>(null);

  const [hasBackSide, setHasBackSide] = useState<boolean>(true);
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [selectedFormat, setSelectedFormat] = useState<PrintLayoutFormat>('lamination_pouch');

  // Loading & Modals
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [passwordFile, setPasswordFile] = useState<File | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  const activeFile = files.find((f) => f.id === activeFileId) || null;

  // Re-extract cached crops when filter settings change
  useEffect(() => {
    if (frontCrop) {
      const srcFile = files.find((f) => f.id === frontCrop.fileId);
      if (srcFile) {
        const page = srcFile.pages.find((p) => p.pageNumber === frontCrop.pageNumber) || srcFile.pages[0];
        const canvas = extractCanvasCrop(page, frontCrop.box, filters);
        setFrontCrop((prev) => prev ? { ...prev, canvas, dataUrl: canvas.toDataURL('image/png') } : null);
      }
    }
    if (backCrop) {
      const srcFile = files.find((f) => f.id === backCrop.fileId);
      if (srcFile) {
        const page = srcFile.pages.find((p) => p.pageNumber === backCrop.pageNumber) || srcFile.pages[0];
        const canvas = extractCanvasCrop(page, backCrop.box, filters);
        setBackCrop((prev) => prev ? { ...prev, canvas, dataUrl: canvas.toDataURL('image/png') } : null);
      }
    }
  }, [filters]);

  // File Operations
  const handleAddFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    try {
      setIsLoadingFile(true);
      const loaded = await loadAppFiles(newFiles);
      setFiles((prev) => [...prev, ...loaded]);

      // If no file was active, activate the first new one
      if (!activeFileId && loaded.length > 0) {
        setActiveFileId(loaded[0].id);
        setActivePageNum(1);
      }
    } catch (err: any) {
      if (err?.isPasswordRequired) {
        setPasswordFile(newFiles[0]);
        setIsPasswordModalOpen(true);
        setPasswordError(undefined);
      } else {
        alert('Failed to load file: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleSelectFile = (fileId: string) => {
    setActiveFileId(fileId);
    setActivePageNum(1);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(filtered.length > 0 ? filtered[0].id : null);
        setActivePageNum(1);
      }
      return filtered;
    });

    if (frontCrop?.fileId === fileId) {
      setFrontCrop(null);
    }
    if (backCrop?.fileId === fileId) {
      setBackCrop(null);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!passwordFile) return;
    try {
      setIsLoadingFile(true);
      const item = await loadSingleAppFile(passwordFile, passwordFile.name, password);
      setFiles((prev) => [...prev, item]);
      setActiveFileId(item.id);
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
      setIsLoadingFile(false);
    }
  };

  // Crop Box Actions
  const handleSelectFront = () => {
    if (!activeFile) return;
    const page = activeFile.pages.find((p) => p.pageNumber === activePageNum) || activeFile.pages[0];
    const box: CropBox = {
      ...selectedPreset.defaultFrontBox,
      pageNumber: activePageNum,
    };
    const canvas = extractCanvasCrop(page, box, filters);
    setFrontCrop({
      fileId: activeFile.id,
      fileName: activeFile.name,
      pageNumber: activePageNum,
      box,
      canvas,
      dataUrl: canvas.toDataURL('image/png'),
    });
  };

  const handleSelectBack = () => {
    if (!activeFile) return;
    const page = activeFile.pages.find((p) => p.pageNumber === activePageNum) || activeFile.pages[0];
    const box: CropBox = {
      ...selectedPreset.defaultBackBox,
      pageNumber: activePageNum,
    };
    const canvas = extractCanvasCrop(page, box, filters);
    setBackCrop({
      fileId: activeFile.id,
      fileName: activeFile.name,
      pageNumber: activePageNum,
      box,
      canvas,
      dataUrl: canvas.toDataURL('image/png'),
    });
  };

  const handleFrontBoxChange = (newBox: CropBox) => {
    if (!activeFile) return;
    const page = activeFile.pages.find((p) => p.pageNumber === activePageNum) || activeFile.pages[0];
    const canvas = extractCanvasCrop(page, newBox, filters);
    setFrontCrop({
      fileId: activeFile.id,
      fileName: activeFile.name,
      pageNumber: activePageNum,
      box: newBox,
      canvas,
      dataUrl: canvas.toDataURL('image/png'),
    });
  };

  const handleBackBoxChange = (newBox: CropBox) => {
    if (!activeFile) return;
    const page = activeFile.pages.find((p) => p.pageNumber === activePageNum) || activeFile.pages[0];
    const canvas = extractCanvasCrop(page, newBox, filters);
    setBackCrop({
      fileId: activeFile.id,
      fileName: activeFile.name,
      pageNumber: activePageNum,
      box: newBox,
      canvas,
      dataUrl: canvas.toDataURL('image/png'),
    });
  };

  const handleClearCrops = () => {
    setFrontCrop(null);
    setBackCrop(null);
  };

  // Export PDF with Location Picker Prompt
  const handleExportPdf = async () => {
    if (!frontCrop) {
      alert('Please select at least a Front crop box before exporting.');
      return;
    }
    try {
      setIsGeneratingPdf(true);
      const cleanTitle = selectedPreset.shortName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const defaultFilename = `${cleanTitle}_print_ready_${selectedFormat}.pdf`;

      await promptAndSavePdf(
        () =>
          generatePrintPdf(
            frontCrop.canvas,
            hasBackSide && backCrop ? backCrop.canvas : null,
            selectedFormat,
            selectedPreset.shortName,
            selectedPreset.dimensions
          ),
        defaultFilename
      );
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('PDF generation error: ' + (err as Error).message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Browser Print Directly
  const handleBrowserPrint = async () => {
    if (!frontCrop) return;
    try {
      setIsGeneratingPdf(true);
      const doc = await generatePrintPdf(
        frontCrop.canvas,
        hasBackSide && backCrop ? backCrop.canvas : null,
        selectedFormat,
        selectedPreset.shortName,
        selectedPreset.dimensions
      );
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = doc.blobUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
      };
    } catch (err) {
      console.error('Failed to print document:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download Individual PNGs
  const handleDownloadPng = (target: 'front' | 'back') => {
    if (target === 'front' && frontCrop) {
      const link = document.createElement('a');
      link.href = frontCrop.dataUrl;
      link.download = `${selectedPreset.shortName}_Front_Card_300DPI.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    if (target === 'back' && backCrop) {
      const link = document.createElement('a');
      link.href = backCrop.dataUrl;
      link.download = `${selectedPreset.shortName}_Back_Card_300DPI.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Header onOpenInfo={() => setIsInfoOpen(true)} />

      {/* Main 2-Way Left and Right Layout */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1700px] mx-auto overflow-hidden">
        {/* LEFT SIDEBAR: Unified Files Section + Controls */}
        <SidebarControls
          files={files}
          activeFileId={activeFileId}
          onSelectFile={handleSelectFile}
          onRemoveFile={handleRemoveFile}
          onAddFiles={handleAddFiles}
          isLoadingFile={isLoadingFile}
          selectedPreset={selectedPreset}
          onSelectPreset={setSelectedPreset}
          onUpdateCustomPreset={setSelectedPreset}
          hasBackSide={hasBackSide}
          onHasBackSideChange={setHasBackSide}
          lockRatio={lockRatio}
          onToggleLockRatio={() => setLockRatio(!lockRatio)}
          filters={filters}
          onFiltersChange={setFilters}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          onExportPdf={handleExportPdf}
          onBrowserPrint={handleBrowserPrint}
          isGeneratingPdf={isGeneratingPdf}
          frontCrop={frontCrop}
          backCrop={backCrop}
        />

        {/* RIGHT MAIN WORKSPACE: Viewport with Gravity Single-Scroll + Live Side-by-Side Crop Previews */}
        <main className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto bg-black flex flex-col">
          {!activeFile ? (
            /* Empty State */
            <div className="flex-1 rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/60 p-8 sm:p-16 flex flex-col items-center justify-center text-center space-y-4 min-h-[480px]">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white">
                <FileUp className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  No Document Selected
                </h3>
                <p className="text-xs text-zinc-400">
                  Click "Add Files" in the left sidebar to upload an official Indian ID card PDF document or scan images.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* TOP SECTION: Document Viewport with Single-Scroll Gravity Lock */}
              <div className="space-y-2">
                <CropCanvas
                  activeFile={activeFile}
                  activePageNum={activePageNum}
                  onSelectPage={setActivePageNum}
                  frontCrop={frontCrop}
                  backCrop={backCrop}
                  hasBackSide={hasBackSide}
                  onFrontBoxChange={handleFrontBoxChange}
                  onBackBoxChange={handleBackBoxChange}
                  onSelectFront={handleSelectFront}
                  onSelectBack={handleSelectBack}
                  onClearCrops={handleClearCrops}
                  selectedPreset={selectedPreset}
                  lockRatio={lockRatio}
                />
              </div>

              {/* BOTTOM SECTION: Live Side-by-Side Front and Back Crop Preview */}
              <div className="pt-2">
                <SideBySideCropPreview
                  frontCrop={frontCrop}
                  backCrop={backCrop}
                  hasBackSide={hasBackSide}
                  selectedPreset={selectedPreset}
                  onDownloadPng={handleDownloadPng}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Password Modal for e-Aadhaar Encrypted PDFs */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordFile(null);
        }}
        onSubmit={handlePasswordSubmit}
        errorMessage={passwordError}
      />

      {/* Supported IDs Directory Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-3 text-center text-[11px] text-zinc-600 bg-black">
        CardPrint Studio - 100% Client-Side Indian Identity Document Cropper. Zero Server Uploads.
      </footer>
    </div>
  );
}

export default App;
